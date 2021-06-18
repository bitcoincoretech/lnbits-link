<template>
  <div>
    <div v-if="currentView === 'invoice'">
      <h6 class="q-my-none">{{ invoice.fsat }} sat</h6>
      <q-separator class="q-my-sm"></q-separator>
      <p class="text-wrap">
        <strong>Requested By:</strong> {{ requestedBy }}<br />
        <strong>Description:</strong> {{ invoice.description }}<br />
        <strong>Expire date:</strong> {{ invoice.expireDate }}<br />
        <strong>Hash:</strong> {{ invoice.hash }}
      </p>
      <q-expansion-item group="extras" icon="crop_free" label="QR Code">
        <qrcode :value="paymentRequest" class="rounded-borders"></qrcode>
      </q-expansion-item>

      <div v-if="!isConfigValid" class="row q-mt-lg">
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
import PaymentStatus from './PaymentStatus.vue'

export default {
  components: { PaymentStatus },
  name: 'invoice-details',
  props: {
    invoice: Object,
    requestedBy: String,
    paymentRequest: String,
  },
  data() {
    return {
      balance: 0,
      serverUrl: '',
      isConfigValid: false,
      paymentChecker: null,
      currentView: 'invoice',
      withdrawLink: null,
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
    this.serverUrl = await configSvc.getServerUrl()
    this.isConfigValid = await configSvc.isConfigValid()
    this.activeWallet = await configSvc.getActiveWallet()
    this.fetchBalance()

    try {
      const response = await lnbitsApi(this.serverUrl).getWithdrawLinks(this.activeWallet)
      const withdrawLinks = response.data || []
      await configSvc.setWithdrawLinks(withdrawLinks)
      this.withdrawLink = withdrawLinks.find((link) => link.title === this.requestedBy)
      if (this.withdrawLink) {
        await this.payInvoice()
      }
    } catch (err) {
      console.error(err)
    }
  },

  computed: {
    canPay: function () {
      if (!this.invoice) return false
      return this.invoice.sat <= this.balance
    },

    hasAccount: function () {
      return this.isConfigValid || false
    },
  },
  methods: {
    payInvoice: async function () {
      try {
        this.showPaymentInProgressCard(this.withdrawLink ? 'Using allowance for payment' : '')
        await this.callPaymentApi()
        clearInterval(this.paymentChecker)
        setTimeout(() => {
          clearInterval(this.paymentChecker)
        }, 40000)
        const payResponse = await lnbitsApi(this.serverUrl).getPayment(
          this.activeWallet,
          this.invoice.hash
        )

        this.paymentChecker = setInterval(() => {
          if (payResponse.data.paid) {
            clearInterval(this.paymentChecker)
            const preimageHtml = `<p class="text-wrap"><strong>Preimage: </strong> ${payResponse.data.preimage} </p>`
            this.showPaymentCompentedCard(preimageHtml)
            this.$emit("allowancePaid");
          }
        }, 1000)
      } catch (err) {
        this.showErrorCard(err, 'Cannot pay BOLT11 invoice!')
      }
    },
    fetchBalance: async function () {
      // TODO: handle http status >=400
      const response = await lnbitsApi(this.serverUrl).getWallet(this.activeWallet)
      this.balance = Math.round(response.data.balance / 1000)
    },
    callPaymentApi: async function () {
      if (!this.withdrawLink) {
        await lnbitsApi(this.serverUrl).payInvoice(this.activeWallet, this.paymentRequest)
        return
      }
      const response = await lnbitsApi(this.serverUrl).withdrawFunds(
        this.activeWallet,
        this.withdrawLink,
        this.paymentRequest
      )
      if (response.data && response.data.status === 'ERROR') {
        throw new Error(response.data.reason || 'Unknown Reason')
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
    gotoOptionsPage: function () {
      this.$browser.tabs.create({ url: this.$browser.runtime.getURL('views/options/options.html') })
    },
  },
}
</script>
