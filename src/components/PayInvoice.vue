<template>
  <q-dialog ref="dialog" v-model="showDialog" @hide="closeDialog">
    <q-card class="q-pa-lg q-pt-xl lnbits__dialog-card">
      <!-- <p class="text-wrap"><strong>Payment Request:</strong> {{ paymentRequest }}<br /></p> -->
      <div v-if="parse.invoice">
        <h6 class="q-my-none">{{ parse.invoice.fsat }} sat</h6>
        <q-separator class="q-my-sm"></q-separator>
        <p class="text-wrap">
          <strong>Description:</strong> {{ parse.invoice.description }}<br />
          <strong>Expire date:</strong> {{ parse.invoice.expireDate }}<br />
          <strong>Hash:</strong> {{ parse.invoice.hash }}
        </p>
        <q-expansion-item group="extras" icon="crop_free" label="QR Code">
          <qrcode :value="paymentRequest" class="rounded-borders"></qrcode>
        </q-expansion-item>

        <div v-if="canPay" class="row q-mt-lg">
          <q-btn unelevated color="deep-purple" @click="payInvoice">Pay</q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
        </div>
        <div v-else class="row q-mt-lg">
          <q-btn unelevated disabled color="yellow" text-color="black">Not enough funds!</q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import bolt11 from 'bolt11'
import _ from 'lodash'

export default {
  name: 'payInvoice',
  data() {
    return {
      showDialog: true,
      paymentRequest: '',
      parse: {
        show: false,
        invoice: null,
        lnurlpay: null,
        data: {
          request: '',
          amount: 0,
          comment: '',
        },
        paymentChecker: null,
      },
      balance: 0,
    }
  },
  computed: {
    canPay: function () {
      if (!this.parse.invoice) return false
      return this.parse.invoice.sat <= this.balance
    },
  },
  methods: {
    decodeRequest: function () {
      this.parse.show = true

      if (this.parse.data.request.startsWith('lightning:')) {
        this.parse.data.request = this.parse.data.request.slice(10)
      } else if (this.parse.data.request.startsWith('lnurl:')) {
        this.parse.data.request = this.parse.data.request.slice(6)
      } else if (this.parse.data.request.indexOf('lightning=lnurl1') !== -1) {
        this.parse.data.request = this.parse.data.request.split('lightning=')[1].split('&')[0]
      }

      // if (this.parse.data.request.toLowerCase().startsWith('lnurl1')) {
      //   LNbits.api
      //     .request('GET', '/api/v1/lnurlscan/' + this.parse.data.request, this.g.wallet.adminkey)
      //     .catch((err) => {
      //       LNbits.utils.notifyApiError(err)
      //     })
      //     .then((response) => {
      //       let data = response.data

      //       if (data.status === 'ERROR') {
      //         this.$q.notify({
      //           timeout: 5000,
      //           type: 'warning',
      //           message: `${data.domain} lnurl call failed.`,
      //           caption: data.reason,
      //         })
      //         return
      //       }

      //       if (data.kind === 'pay') {
      //         this.parse.lnurlpay = Object.freeze(data)
      //         this.parse.data.amount = data.minSendable / 1000
      //       } else if (data.kind === 'auth') {
      //         this.parse.lnurlauth = Object.freeze(data)
      //       } else if (data.kind === 'withdraw') {
      //         this.parse.show = false
      //         this.receive.show = true
      //         this.receive.status = 'pending'
      //         this.receive.paymentReq = null
      //         this.receive.paymentHash = null
      //         this.receive.data.amount = data.maxWithdrawable / 1000
      //         this.receive.data.memo = data.defaultDescription
      //         this.receive.minMax = [data.minWithdrawable / 1000, data.maxWithdrawable / 1000]
      //         this.receive.lnurl = {
      //           domain: data.domain,
      //           callback: data.callback,
      //           fixed: data.fixed,
      //         }
      //       }
      //     })
      //   return
      // }

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
        this.parse.show = false
        return
      }

      let cleanInvoice = {
        msat: invoice.millisatoshis,
        sat: invoice.millisatoshis / 1000,
        fsat: invoice.millisatoshis / 1000,
        // fsat: LNbits.utils.formatSat(invoice.millisatoshis / 1000),
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
    closeDialog() {
      console.log('############################ closeDialog pay invoices')
      this.$browser.runtime.sendMessage('hide_iframe')
    },
  },
  mounted: function () {
    console.log('############################ mounted')
    this.showDialog = true
    this.paymentRequest = this.$route.query.paymentRequest || ''
    this.parse.data.request = this.$route.query.paymentRequest || ''
    this.decodeRequest()
  },
}
</script>
