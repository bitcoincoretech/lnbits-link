<template>
  <div>
    <div v-if="currentView === 'withdraw'">
      <div v-if="!receive.paymentReq">
        <q-form @submit="createInvoice" class="q-gutter-md">
          <p v-if="receive.lnurl" class="text-h6 text-center q-my-none">
            <b>{{ receive.lnurl.domain }}</b> is requesting an invoice:
          </p>
          <q-input
            filled
            dense
            v-model.number="receive.data.amount"
            type="number"
            label="Amount (sat) *"
            :min="receive.minMax[0]"
            :max="receive.minMax[1]"
            :readonly="receive.lnurl && receive.lnurl.fixed"
          ></q-input>
          <q-input
            filled
            dense
            v-model.trim="receive.data.memo"
            label="Memo"
            placeholder="LNbits invoice"
          ></q-input>
          <div v-if="receive.status == 'pending'" class="row q-mt-lg">
            <q-btn
              unelevated
              color="deep-purple"
              :disable="
                receive.data.memo == null || receive.data.amount == null || receive.data.amount <= 0
              "
              type="submit"
            >
              <span v-if="receive.lnurl"> Withdraw</span>
              <span v-else> Create invoice </span>
            </q-btn>
            <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
          </div>
          <q-spinner-bars v-if="receive.status == 'loading'" color="purple" size="5.5em" />
        </q-form>
      </div>
    </div>
    <div v-else>
      <payment-status
        v-if="currentView === 'withdrawStatus'"
        :isPayed="withdrawStatus.isPayed"
        :message="withdrawStatus.message"
        :details="withdrawStatus.details"
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

export default {
  name: 'lnurl-withdraw',
  props: {
    receive: Object,
  },
  data() {
    return {
      serverUrl: '',
      activeWallet: null,
      paymentChecker: null,
      currentView: 'withdraw',
      withdrawStatus: {
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
    this.activeWallet = await configSvc.getActiveWallet()
  },
  methods: {
    createInvoice: async function () {
      try {
        this.showPaymentInProgressCard()
        const response = await lnbitsApi(this.serverUrl).createInvoice(
          this.activeWallet,
          this.receive.data.amount,
          this.receive.data.memo,
          this.receive.lnurl && this.receive.lnurl.callback
        )

        console.log('response.data', response.data)

        this.receive.status = 'success'
        this.receive.paymentReq = response.data.payment_request
        this.receive.paymentHash = response.data.payment_hash

        if (response.data.lnurl_response !== null) {
          if (response.data.lnurl_response === false) {
            response.data.lnurl_response = `Unable to connect`
          }

          if (typeof response.data.lnurl_response === 'string') {
            this.showErrorCard(
              response.data.lnurl_response,
              `${this.receive.lnurl.domain} lnurl-withdraw call failed.`
            )
            return
          }
          if (response.data.lnurl_response === true) {
            this.showPaymentInProgressCard(`Invoice sent to ${this.receive.lnurl.domain}!`)
          }
        }

        clearInterval(this.paymentChecker)
        setTimeout(() => {
          clearInterval(this.paymentChecker)
          this.showErrorCard(
            'Timed Out! Invoice was not payed!',
            `Please also check the LNbits transactions list for this wallet: ${this.activeWallet.name}`
          )
        }, 40000)
        this.paymentChecker = setInterval(async () => {
          try {
            const hash = response.data.payment_hash
            const paymentResponse = await lnbitsApi(this.serverUrl).getPayment(
              this.activeWallet,
              hash
            )

            if (paymentResponse.data.paid) {
              clearInterval(this.paymentChecker)
              const preimageHtml = `<p class="text-wrap"><strong>Preimage: </strong> ${paymentResponse.data.preimage} </p>`
              this.showPaymentCompentedCard(preimageHtml)
            }
          } catch (err) {
            this.showErrorCard(err, 'Invoice was not payed!')
            clearInterval(this.paymentChecker)
          }
        }, 5000)
      } catch (err) {
        console.error(err)
        this.showErrorCard(err, 'Cannot create invoice!')
      }
    },
    showPaymentInProgressCard(message = 'Processing payment...') {
      this.currentView = 'withdrawStatus'
      this.withdrawStatus.isPayed = false
      this.withdrawStatus.message = message
      this.withdrawStatus.details = ''
    },
    showPaymentCompentedCard(details = '') {
      this.currentView = 'withdrawStatus'
      this.withdrawStatus.isPayed = true
      this.withdrawStatus.message = 'Success!'
      this.withdrawStatus.details = details
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
