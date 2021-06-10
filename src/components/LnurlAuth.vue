<template>
  <div>
    <div v-if="currentView === 'auth'">
      <q-form @submit="authLnurl" class="q-gutter-md">
        <p class="q-my-none text-h6">
          Authenticate with <b>{{ lnurlauth.domain }}</b
          >?
        </p>
        <q-separator class="q-my-sm"></q-separator>
        <p>
          For every website and for every LNbits wallet, a new keypair will be deterministically
          generated so your identity can't be tied to your LNbits wallet or linked across websites.
          No other data will be shared with {{ lnurlauth.domain }}.
        </p>
        <p>
          Your public key for <b>{{ lnurlauth.domain }}</b> is:
        </p>
        <p class="q-mx-xl">
          <code class="text-wrap"> {{ lnurlauth.pubkey }} </code>
        </p>
        <div class="row q-mt-lg">
          <q-btn unelevated color="deep-purple" type="submit">Login</q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
        </div>
      </q-form>
    </div>
    <div v-else>
      <payment-status
        v-if="currentView === 'authStatus'"
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

export default {
  name: 'lnurl-auth',
  props: {
    lnurlauth: object,
  },
  data() {
    return {
      paymentChecker: null,
      currentView: 'auth',
      authStatus: {
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
  methods: {
    authLnurl: async function () {
      try {
        this.showAuthInProgressCard('Performing authentication...')
        await lnbitsApi(this.serverUrl).authLnurl(this.activeWallet, this.lnurlauth.callback)
        this.showAuthCompentedCard('Authentication successful!')
      } catch (err) {
        if (err.response && err.response.data && err.response.data.reason) {
          this.showErrorCard(
            err,
            `Authentication failed! ${this.lnurlauth.domain} says: ${err.response.data.reason}`
          )
        } else {
          this.showErrorCard(err, 'Cannot authenticate!')
        }
      }
    },

    showAuthInProgressCard(message = 'Processing payment...') {
      this.currentView = 'authStatus'
      this.authStatus.isPayed = false
      this.authStatus.message = message
      this.authStatus.details = ''
    },
    showAuthCompentedCard(details = '') {
      this.currentView = 'authStatus'
      this.authStatus.isPayed = true
      this.authStatus.message = 'Success!'
      this.authStatus.details = details
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
