<template>
  <q-dialog ref="dialog" v-model="showDialog" @hide="closeDialog">
    <q-card class="q-pa-lg q-pt-xl lnbits__dialog-card">
      <invoice-details
        v-if="showInvoiceDetails"
        v-bind:invoice="parse.invoice"
        v-bind:requestedBy="requestedBy"
        v-bind:paymentRequest="parse.data.request"
      >
      </invoice-details>
      <lnurl-pay
        v-else-if="showLnurlPayDetails"
        :lnurlpay="parse.lnurlpay"
        :amount="parse.data.amount"
        :comment="parse.data.comment"
      >
      </lnurl-pay>
      <lnurl-withdraw v-else-if="showLnurlWithdrawDetails" :receive="receive"> </lnurl-withdraw>
      <div v-else-if="showLnurlAuthDetails">
        <q-form @submit="authLnurl" class="q-gutter-md">
          <p class="q-my-none text-h6">
            Authenticate with <b>{{ parse.lnurlauth.domain }}</b
            >?
          </p>
          <q-separator class="q-my-sm"></q-separator>
          <p>
            For every website and for every LNbits wallet, a new keypair will be deterministically
            generated so your identity can't be tied to your LNbits wallet or linked across
            websites. No other data will be shared with {{ parse.lnurlauth.domain }}.
          </p>
          <p>
            Your public key for <b>{{ parse.lnurlauth.domain }}</b> is:
          </p>
          <p class="q-mx-xl">
            <code class="text-wrap"> {{ parse.lnurlauth.pubkey }} </code>
          </p>
          <div class="row q-mt-lg">
            <q-btn unelevated color="deep-purple" type="submit">Login</q-btn>
            <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
          </div>
        </q-form>
      </div>
      <div v-else-if="showPaymentStatus">
        <q-card-section dark bordered>
          <p class="text-center">
            <q-icon v-if="paymentDetails.isPayed" name="check_circle" size="5.5em" color="green" />
            <q-spinner-bars v-else color="purple" size="5.5em" />
          </p>
          <p class="q-my-none text-h6 text-center">{{ paymentDetails.message }}</p>
          <q-expansion-item
            v-if="paymentDetails.details && paymentDetails.details.length"
            group="extras"
            icon="info"
            class="bg-yellow-1"
            label="Details"
          >
            <span v-html="paymentDetails.details"></span>
          </q-expansion-item>
        </q-card-section>

        <div class="row q-mt-lg">
          <q-space />
          <q-btn v-close-popup flat color="grey" class="q-ml-auto cursor-pointer">Close</q-btn>
          <q-space />
        </div>
      </div>
      <div v-else-if="showErrorDetais">
        <q-card-section dark bordered class="bg-red-5">
          <div class="text-h6">{{ error.title }}</div>
          <div class="text-subtitle2">{{ error.message }}</div>
        </q-card-section>
        <q-expansion-item group="extras" class="bg-yellow-2" icon="error" label="Details">
          <p class="text-wrap">
            {{ parse.data.request }}
          </p>
        </q-expansion-item>
        <div class="row q-mt-lg">
          <q-space />
          <q-btn v-close-popup flat color="grey" class="q-ml-auto cursor-pointer">Close</q-btn>
          <q-space />
        </div>
      </div>
      <div v-else>
        <p class="text-center">
          <q-spinner-puff color="purple" size="5.5em" />
        </p>
        <p class="q-my-none text-h6 text-center">LNbits browser extension</p>
        <div class="row q-mt-lg">
          <q-space />
          <q-btn v-close-popup flat color="grey" class="q-ml-auto cursor-pointer">Close</q-btn>
          <q-space />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import bolt11 from 'bolt11'
import _ from 'lodash'
import lnbitsApi from '../services/lnbits-api.svc'
import uiUtils from '../utils/ui-utils'
import configSvc from '../services/config.svc'

export default {
  name: 'pay-invoice',
  data() {
    return {
      // TODO: allow user to switch between wallets
      activeWallet: {},
      serverUrl: '',
      showDialog: true,
      currentView: '',
      error: {
        title: '',
        message: '',
      },
      parse: {
        invoice: null,
        lnurlpay: null,
        lnurlauth: null,
        data: {
          request: '',
          amount: 0,
          comment: '',
        },
        paymentChecker: null,
      },
      paymentDetails: {
        isPayed: false,
        message: '...',
        details: '',
      },
      receive: {
        show: false,
        status: 'pending',
        paymentReq: null,
        paymentHash: null,
        minMax: [0, 2100000000000000],
        lnurl: null,
        data: {
          amount: null,
          memo: '',
        },
      },
      requestedBy: '',
    }
  },
  computed: {
    showInvoiceDetails: function () {
      return this.currentView === 'invoice'
    },
    showLnurlPayDetails: function () {
      return this.currentView === 'lnurlPay'
    },
    showLnurlWithdrawDetails: function () {
      return this.currentView === 'lnurlWithdraw'
    },
    showLnurlAuthDetails: function () {
      return this.currentView === 'lnurlAuth'
    },
    showErrorDetais: function () {
      return this.currentView === 'error'
    },
    showPaymentStatus: function () {
      return this.currentView === 'paymentStatus'
    },
  },

  methods: {
    decodeRequest: async function () {
      const paymentRequest = (this.parse.data.request || '').toLowerCase()
      if (paymentRequest.startsWith('lightning:')) {
        this.parse.data.request = this.parse.data.request.slice(10)
      } else if (paymentRequest.startsWith('lnurl:')) {
        this.parse.data.request = this.parse.data.request.slice(6)
      } else if (paymentRequest.indexOf('lightning=lnurl1') !== -1) {
        this.parse.data.request = this.parse.data.request.split('lightning=')[1].split('&')[0]
      }

      if (this.parse.data.request.toLowerCase().startsWith('lnurl1')) {
        this.handleLnurlRequest()
        return
      }

      const invoice = this.extractBolt11Invoice()
      if (!invoice) {
        return
      }

      const cleanInvoice = this.enrichInvoiceDataFromTags(invoice)
      this.parse.invoice = Object.freeze(cleanInvoice)
    },
    handleLnurlRequest: async function () {
      try {
        const response = await lnbitsApi(this.serverUrl).request(
          'GET',
          '/api/v1/lnurlscan/' + this.parse.data.request,
          this.activeWallet.adminkey
        )
        let data = response.data
        if (data.status === 'ERROR') {
          this.showErrorCard(data.reason, 'Cannot decode request!')
          return
        }

        if (data.kind === 'pay') {
          this.currentView = 'lnurlPay'
          this.parse.lnurlpay = Object.freeze(data)
          this.parse.data.amount = data.minSendable / 1000
        } else if (data.kind === 'auth') {
          this.currentView = 'lnurlAuth'
          this.parse.lnurlauth = Object.freeze(data)
        } else if (data.kind === 'withdraw') {
          this.currentView = 'lnurlWithdraw'
          this.receive.status = 'pending'
          this.receive.paymentReq = null
          this.receive.paymentHash = null
          this.receive.data.amount = data.maxWithdrawable / 1000
          this.receive.data.memo = data.defaultDescription
          this.receive.minMax = [data.minWithdrawable / 1000, data.maxWithdrawable / 1000]
          this.receive.lnurl = {
            domain: data.domain,
            callback: data.callback,
            fixed: data.fixed,
          }
        }
      } catch (err) {
        this.showErrorCard(err)
      }
    },
    extractBolt11Invoice: function () {
      try {
        this.currentView = 'invoice'
        return bolt11.decode(this.parse.data.request)
      } catch (err) {
        this.showErrorCard(err, 'Cannot decode BOLT11 invoice!')
      }
    },
    enrichInvoiceDataFromTags: function (invoice) {
      const cleanInvoice = {
        msat: invoice.millisatoshis,
        sat: invoice.millisatoshis / 1000,
        fsat: uiUtils.formatSat(invoice.millisatoshis / 1000),
        expireDate: invoice.timeExpireDateString,
      }

      _.each(invoice.tags, (tag) => {
        if (_.isObject(tag) && _.has(tag, 'tagName')) {
          if (tag.tagName === 'payment_hash') {
            cleanInvoice.hash = tag.data
          } else if (tag.tagName === 'description') {
            cleanInvoice.description = tag.data
          } else if (tag.tagName === 'expire_time') {
            var expireDate = new Date((invoice.timeExpireDate + tag.data) * 1000)
            cleanInvoice.expireDate = expireDate.toISOString()
            cleanInvoice.expired = false // TODO
          }
        }
      })

      return cleanInvoice
    },
    authLnurl: async function () {
      try {
        this.showPaymentInProgressCard('Performing authentication...')
        await lnbitsApi(this.serverUrl).authLnurl(this.activeWallet, this.parse.lnurlauth.callback)
        this.showPaymentCompentedCard('Authentication successful!')
      } catch (err) {
        if (err.response && err.response.data && err.response.data.reason) {
          this.showErrorCard(
            err,
            `Authentication failed! ${this.parse.lnurlauth.domain} says: ${err.response.data.reason}`
          )
        } else {
          this.showErrorCard(err, 'Cannot authenticate!')
        }
      }
    },

    closeDialog() {
      this.$browser.runtime.sendMessage('hide_iframe')
    },
    showErrorCard(err, title = 'Error') {
      this.currentView = 'error'
      this.error.title = title
      this.error.message = (err.message || err) + '.'
    },
    showPaymentInProgressCard(message = 'Processing payment...') {
      this.currentView = 'paymentStatus'
      this.paymentDetails.isPayed = false
      this.paymentDetails.message = message
      this.paymentDetails.details = ''
    },
    showPaymentCompentedCard(details = '') {
      this.currentView = 'paymentStatus'
      this.paymentDetails.isPayed = true
      this.paymentDetails.message = 'Success!'
      this.paymentDetails.details = details
    },
  },
  mounted: async function () {
    this.showDialog = true
    try {
      this.parse.data.request = this.$route.query.paymentRequest || ''
      this.requestedBy = this.$route.query.requestedBy || ''

      this.serverUrl = await configSvc.getServerUrl()
      const isConfigValid = await configSvc.isConfigValid()

      if (isConfigValid) {
        this.activeWallet = await configSvc.getActiveWallet()
        this.decodeRequest()
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'No user or wallet found!',
          caption: `Please check that you are connected to a LNbits server.`,
        })
      }
    } catch (err) {
      console.error(err)
      this.showErrorCard(err, 'Please Refresh Page! LNbits browser extension context invalidated.')
    }
  },
}
</script>
