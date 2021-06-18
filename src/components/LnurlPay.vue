<template>
  <div>
    <div v-if="currentView === 'invoice'">
      <p v-if="lnurlpay.fixed" class="q-my-none text-h6">
        <b>{{ lnurlpay.domain }}</b> is requesting {{ lnurlpay.maxSendable | msatoshiFormat }} sat
        <span v-if="lnurlpay.commentAllowed > 0">
          <br />
          and a {{ lnurlpay.commentAllowed }}-char comment
        </span>
      </p>
      <p v-else class="q-my-none text-h6 text-center">
        <b>{{ lnurlpay.domain }}</b> is requesting <br />
        between <b>{{ lnurlpay.minSendable | msatoshiFormat }}</b> and
        <b>{{ lnurlpay.maxSendable | msatoshiFormat }}</b> sat
        <span v-if="lnurlpay.commentAllowed > 0">
          <br />
          and a {{ lnurlpay.commentAllowed }}-char comment
        </span>
      </p>
      <q-separator class="q-my-sm"></q-separator>
      <div class="row">
        <p class="col text-justify text-italic">
          {{ lnurlpay.description }}
        </p>
        <p class="col-4 q-pl-md" v-if="lnurlpay.image">
          <q-img :src="lnurlpay.image" />
        </p>
      </div>
      <div class="row">
        <div class="col">
          <q-input
            filled
            dense
            v-model.number="data.amount"
            type="number"
            label="Amount (sat) *"
            :min="lnurlpay.minSendable / 1000"
            :max="lnurlpay.maxSendable / 1000"
            :readonly="lnurlpay.fixed"
          ></q-input>
        </div>
        <div class="col-8 q-pl-md" v-if="lnurlpay.commentAllowed > 0">
          <q-input
            filled
            dense
            v-model="data.comment"
            :type="lnurlpay.commentAllowed > 64 ? 'textarea' : 'text'"
            label="Comment (optional)"
            :maxlength="lnurlpay.commentAllowed"
          ></q-input>
        </div>
      </div>
      <div class="row q-mt-lg">
        <q-btn unelevated color="deep-purple" @click="payLnurl">Send satoshis</q-btn>
        <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
      </div>
    </div>
    <div v-else>
      <payment-status
        v-if="currentView === 'paymentStatus'"
        :isPayed="paymentStatus.isPayed"
        :message="paymentStatus.message"
        :details="paymentStatus.details"
      ></payment-status>
      <error-card
        v-else-if="currentView === 'error'"
        :title="error.title"
        :message="error.message"
        :details="error.details"
      ></error-card>
      <div class="row q-mt-lg">
        <q-space />
        <q-btn v-close-popup flat color="grey" class="q-ml-auto cursor-pointer">Close</q-btn>
        <q-space />
      </div>
    </div>
  </div>
</template>
<script>
import lnbitsApi from '../services/lnbits-api.svc'
import configSvc from '../services/config.svc'
import uiUtils from '../utils/ui-utils'

export default {
  name: 'lnurl-pay',
  props: {
    lnurlpay: Object,
    amount: Number,
    comment: String,
  },
  data() {
    return {
      serverUrl: '',
      activeWallet: null,
      data: {
        amount: 0,
        comment: '',
      },
      paymentChecker: null,
      currentView: 'invoice',
      paymentStatus: {
        isPayed: false,
        message: '...',
        details: '',
      },
      error: {
        title: '',
        message: '',
        details: '',
      },
    }
  },
  mounted: async function () {
    this.data.amount = this.amount
    this.data.comment = this.comment
    this.serverUrl = await configSvc.getServerUrl()
    this.activeWallet = await configSvc.getActiveWallet()
  },
  filters: {
    msatoshiFormat: function (value) {
      return uiUtils.formatSat(value / 1000)
    },
  },
  methods: {
    payLnurl: async function () {
      try {
        this.showPaymentInProgressCard()
        const response = await lnbitsApi(this.serverUrl).payLnurl(
          this.activeWallet,
          this.lnurlpay.callback,
          this.lnurlpay.description_hash,
          this.data.amount * 1000,
          this.lnurlpay.description.slice(0, 120),
          this.data.comment
        )

        clearInterval(this.paymentChecker)
        setTimeout(() => {
          clearInterval(this.paymentChecker)
        }, 40000)
        this.paymentChecker = setInterval(async () => {
          try {
            const res = await lnbitsApi(this.serverUrl).getPayment(
              this.activeWallet,
              response.data.payment_hash
            )
            if (res.data.paid) {
              clearInterval(this.paymentChecker)
              this.showPaidMessage(response.data)
            }
          } catch (err) {
            this.showErrorCard(err, 'Cannot check LNURL payment!')
            clearInterval(this.paymentChecker)
          }
        }, 2000)
      } catch (err) {
        this.showErrorCard(err, 'Cannot pay LNURL invoice!')
      }
    },
    showPaidMessage(data) {
      // show lnurlpay success action
      if (data.success_action) {
        switch (data.success_action.tag) {
          case 'url':
            const actionDescription = `<strong>Message: </strong> ${data.success_action.description}`
            const actionLink = `<a target="_blank" style="color: inherit" href="${data.success_action.url}">${data.success_action.url}</a>`
            this.showPaymentCompentedCard(
              `<p class="text-wrap">${actionDescription}<br>${actionLink}</p>`
            )
            break
          case 'message':
            const message = `<p class="text-wrap"><strong>Message: </strong> ${data.success_action.message}</p>`
            this.showPaymentCompentedCard(message)
            break
          default:
            const preimageHtml = `<p class="text-wrap"><strong>Preimage: </strong> ${
              data.preimage || ''
            } </p>`
            this.showPaymentCompentedCard(preimageHtml)
            break
        }
      } else {
        const value = data.preimage || data.checking_id || payment_hash || ''
        const label = data.preimage ? 'Primage' : data.checking_id ? 'Checking ID ' : 'Payment Hash'
        const preimageHtml = `<p class="text-wrap"><strong>${label}: </strong> ${value} </p>`
        this.showPaymentCompentedCard(preimageHtml)
      }
    },
    showPaymentInProgressCard(message = 'Processing payment...') {
      this.currentView = 'paymentStatus'
      this.paymentStatus.isPayed = false
      this.paymentStatus.message = message
      this.paymentStatus.details = ''
    },
    showPaymentCompentedCard(details = '') {
      this.currentView = 'paymentStatus'
      this.paymentStatus.isPayed = true
      this.paymentStatus.message = 'Success!'
      this.paymentStatus.details = details
    },
    showErrorCard(err, title = 'Error', details = '') {
      this.currentView = 'error'
      this.error.title = title
      this.error.message = `${err.message || err}`
      this.error.details = details
    },
  },
}
</script>
