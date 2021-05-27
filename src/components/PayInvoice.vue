<template>
  <q-dialog ref="dialog" v-model="showDialog" @hide="closeDialog">
    <q-card class="q-pa-lg q-pt-xl lnbits__dialog-card">
      <div v-if="parse.invoice">
        <h6 class="q-my-none">{{ parse.invoice.fsat }} sat</h6>
        <q-separator class="q-my-sm"></q-separator>
        <p class="text-wrap">
          <strong>Requested By:</strong> {{ requestedBy }}<br />
          <strong>Description:</strong> {{ parse.invoice.description }}<br />
          <strong>Expire date:</strong> {{ parse.invoice.expireDate }}<br />
          <strong>Hash:</strong> {{ parse.invoice.hash }}
        </p>
        <q-expansion-item group="extras" icon="crop_free" label="QR Code">
          <qrcode :value="parse.data.request" class="rounded-borders"></qrcode>
        </q-expansion-item>

        <div v-if="!hasAccount" class="row q-mt-lg">
          <q-btn unelevated color="yellow" text-color="black" @click="gotoOptionsPage"
            >No Account Found!</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
        </div>
        <div v-else-if="canPay" class="row q-mt-lg">
          <q-btn unelevated color="deep-purple" @click="payInvoice">Pay</q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
        </div>
        <div v-else class="row q-mt-lg">
          <q-btn unelevated disabled color="yellow" text-color="black">Not enough funds!</q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
        </div>
      </div>
      <div v-else-if="parse.lnurlpay">
        <p v-if="parse.lnurlpay.fixed" class="q-my-none text-h6">
          <b>{{ parse.lnurlpay.domain }}</b> is requesting
          {{ parse.lnurlpay.maxSendable | msatoshiFormat }} sat
          <span v-if="parse.lnurlpay.commentAllowed > 0">
            <br />
            and a {{ parse.lnurlpay.commentAllowed }}-char comment
          </span>
        </p>
        <p v-else class="q-my-none text-h6 text-center">
          <b>{{ parse.lnurlpay.domain }}</b> is requesting <br />
          between <b>{{ parse.lnurlpay.minSendable | msatoshiFormat }}</b> and
          <b>{{ parse.lnurlpay.maxSendable | msatoshiFormat }}</b> sat
          <span v-if="parse.lnurlpay.commentAllowed > 0">
            <br />
            and a {{ parse.lnurlpay.commentAllowed }}-char comment
          </span>
        </p>
        <q-separator class="q-my-sm"></q-separator>
        <div class="row">
          <p class="col text-justify text-italic">
            {{ parse.lnurlpay.description }}
          </p>
          <p class="col-4 q-pl-md" v-if="parse.lnurlpay.image">
            <q-img :src="parse.lnurlpay.image" />
          </p>
        </div>
        <div class="row">
          <div class="col">
            <q-input
              filled
              dense
              v-model.number="parse.data.amount"
              type="number"
              label="Amount (sat) *"
              :min="parse.lnurlpay.minSendable / 1000"
              :max="parse.lnurlpay.maxSendable / 1000"
              :readonly="parse.lnurlpay.fixed"
            ></q-input>
          </div>
          <div class="col-8 q-pl-md" v-if="parse.lnurlpay.commentAllowed > 0">
            <q-input
              filled
              dense
              v-model="parse.data.comment"
              :type="parse.lnurlpay.commentAllowed > 64 ? 'textarea' : 'text'"
              label="Comment (optional)"
              :maxlength="parse.lnurlpay.commentAllowed"
            ></q-input>
          </div>
        </div>
        <div class="row q-mt-lg">
          <q-btn unelevated color="deep-purple" @click="payLnurl">Send satoshis</q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
        </div>
      </div>
      <div v-else>
        <h5>Cannot read request!</h5>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import bolt11 from 'bolt11'
import _ from 'lodash'
import lnbitsApi from '../services/lnbits-api.svc'
import uiUtils from '../utils/ui-utils'

export default {
  name: 'payInvoice',
  data() {
    return {
      // TODO: allow user to switch between wallets
      activeWallet: {},
      serverUrl: '',
      showDialog: true,
      parse: {
        invoice: null,
        lnurlpay: null,
        data: {
          request: '',
          amount: 0,
          comment: '',
        },
        paymentChecker: null,
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
      balance: 0,
      requestedBy: '',
    }
  },
  computed: {
    canPay: function () {
      if (!this.parse.invoice) return false
      return this.parse.invoice.sat <= this.balance
    },
    hasAccount: function () {
      console.log('### activeWallet', this.activeWallet)
      if (this.serverUrl && this.activeWallet && this.activeWallet.id) {
        return true
      }
      return false
    },
  },
  filters: {
    msatoshiFormat: function (value) {
      return uiUtils.formatSat(value / 1000)
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
        try {
          const response = await lnbitsApi(this.serverUrl).request(
            'GET',
            '/api/v1/lnurlscan/' + this.parse.data.request,
            this.activeWallet.adminkey
          )
          let data = response.data
          console.log('data', data)
          if (data.status === 'ERROR') {
            this.$q.notify({
              timeout: 5000,
              type: 'warning',
              message: `${data.domain} lnurl call failed.`,
              caption: data.reason,
            })
            return
          }

          if (data.kind === 'pay') {
            this.parse.lnurlpay = Object.freeze(data)
            this.parse.data.amount = data.minSendable / 1000
            // } else if (data.kind === 'auth') {
            //   this.parse.lnurlauth = Object.freeze(data)
          } else if (data.kind === 'withdraw') {
            this.receive.show = true
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
          uiUtils.notifyApiError(err)
        }
        return
      }

      let invoice
      try {
        invoice = bolt11.decode(this.parse.data.request)
      } catch (error) {
        this.$q.notify({
          timeout: 3000,
          type: 'warning',
          message: error + '.',
          caption: '400 BAD REQUEST',
        })

        return
      }

      let cleanInvoice = {
        msat: invoice.millisatoshis,
        sat: invoice.millisatoshis / 1000,
        fsat: invoice.millisatoshis / 1000,
        // fsat: LNbits.utils.formatSat(invoice.millisatoshis / 1000), // TODO
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

      this.parse.invoice = Object.freeze(cleanInvoice)
    },
    fetchBalance: async function () {
      // TODO: handle http status >=400
      const response = await lnbitsApi(this.serverUrl).getWallet(this.activeWallet)
      this.balance = Math.round(response.data.balance / 1000)
    },
    payInvoice: async function () {
      const dismissPaymentMsg = this.$q.notify({
        timeout: 0,
        message: 'Processing payment...',
      })
      try {
        const response = await lnbitsApi(this.serverUrl).payInvoice(
          this.activeWallet,
          this.parse.data.request
        )
        clearInterval(this.parse.paymentChecker)
        setTimeout(() => {
          clearInterval(this.parse.paymentChecker)
        }, 40000)
        const payResponse = await lnbitsApi(this.serverUrl).getPayment(
          this.activeWallet,
          response.data.payment_hash
        )

        this.parse.paymentChecker = setInterval(() => {
          if (payResponse.data.paid) {
            clearInterval(this.parse.paymentChecker)
            dismissPaymentMsg()
            this.closeDialog()
          }
        }, 2000)
      } catch (err) {
        uiUtils.notifyApiError(err)
        dismissPaymentMsg()
      }
    },
    payLnurl: async function () {
      let dismissPaymentMsg = this.$q.notify({
        timeout: 0,
        message: 'Processing payment...',
      })

      try {
        const response = await lnbitsApi(this.serverUrl).payLnurl(
          this.activeWallet,
          this.parse.lnurlpay.callback,
          this.parse.lnurlpay.description_hash,
          this.parse.data.amount * 1000,
          this.parse.lnurlpay.description.slice(0, 120),
          this.parse.data.comment
        )

        clearInterval(this.parse.paymentChecker)
        setTimeout(() => {
          clearInterval(this.parse.paymentChecker)
        }, 40000)
        this.parse.paymentChecker = setInterval(async () => {
          const res = await lnbitsApi(this.serverUrl).getPayment(
            this.activeWallet,
            response.data.payment_hash
          )
          if (res.data.paid) {
            dismissPaymentMsg()
            clearInterval(this.parse.paymentChecker)

            // show lnurlpay success action
            if (response.data.success_action) {
              switch (response.data.success_action.tag) {
                case 'url':
                  this.$q.notify({
                    message: `<a target="_blank" style="color: inherit" href="${response.data.success_action.url}">${response.data.success_action.url}</a>`,
                    caption: response.data.success_action.description,
                    html: true,
                    type: 'positive',
                    timeout: 0,
                    closeBtn: true,
                  })
                  break
                case 'message':
                  this.$q.notify({
                    message: response.data.success_action.message,
                    type: 'positive',
                    timeout: 0,
                    closeBtn: true,
                  })
                  break
              }
            }
          }
        }, 2000)
      } catch (err) {
        dismissPaymentMsg()
        uiUtils.notifyApiError(err)
      }
    },
    gotoOptionsPage() {
      this.$browser.tabs.create({ url: this.$browser.runtime.getURL('views/options/options.html') })
    },
    closeDialog() {
      console.log('############################ closeDialog pay invoices')
      this.$browser.runtime.sendMessage('hide_iframe')
    },
  },
  mounted: async function () {
    console.log('############################ mounted')
    this.showDialog = true
    this.parse.data.request = this.$route.query.paymentRequest || ''
    this.requestedBy = this.$route.query.requestedBy || ''

    const result = await this.$browser.storage.sync.get({ serverUrl: '' })
    this.serverUrl = result.serverUrl

    const result1 = await this.$browser.storage.sync.get({
      user: '',
    })
    this.activeWallet = result1.user.wallets[0]
    this.decodeRequest()
    this.fetchBalance()
  },
}
</script>
