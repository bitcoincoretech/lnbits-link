<template>
  <q-layout>
    <q-header bordered>
      <q-toolbar class="bg-lnbits-dark">
        <q-toolbar-title> <strong>LN</strong>bits </q-toolbar-title>

        <q-badge color="yellow" text-color="black">
          <span
            ><span v-show="$q.screen.gt.sm">USE WITH CAUTION - LNbits wallet is still in </span
            >BETA</span
          >
        </q-badge>
      </q-toolbar>
    </q-header>

    <div
      v-if="error"
      class="flex items-center justify-center text-xs border-t-4 rounded-sm text-yellow-800 border-yellow-600 bg-yellow-100 p-2 mb-3"
      role="alert"
    >
      {{ error }}
    </div>

    <q-page-container>
      <q-page class="q-px-md q-py-lg">
        <q-card>
          <q-card-section>
            <h3 class="q-my-none"><strong>LN</strong>bits</h3>
            <h5 class="q-my-md">Free and open-source lightning wallet</h5>
          </q-card-section>
          <q-card-section>
            <q-form @submit="connect" class="q-gutter-md">
              <q-input
                filled
                dense
                v-model.trim="serverUrl"
                type="text"
                label="LNbits Server URL *"
              ></q-input>
              <q-input
                filled
                dense
                v-model.trim="userId"
                type="text"
                label="User ID (optional, if empty one will be assigned to you)"
              ></q-input>

              <div class="row q-mt-lg">
                <q-btn
                  unelevated
                  color="deep-purple"
                  :disable="userId == null || serverUrl == null"
                  type="submit"
                  >Connect</q-btn
                >
              </div>
            </q-form>
          </q-card-section>
        </q-card>
        <iframe id="lnbits-com" nonce="lxS8LnlZ"></iframe>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from 'axios'
import $ from 'jquery'

export default {
  name: 'home',
  data() {
    return {
      userId: '',
      serverUrl: '',
      error: '',
    }
  },
  async mounted() {
    this.userId = await this.getUserId()
    this.serverUrl = await this.getServerUrl()
  },
  watch: {
    userId: {
      async handler(val) {
        try {
          console.log('watch user ##### ', val)
          await this.$browser.storage.sync.set({ userId: val })
        } catch (error) {
          console.log(error)
        }
      },
    },
    serverUrl: {
      async handler(val) {
        try {
          await this.$browser.storage.sync.set({ serverUrl: val })
        } catch (error) {
          console.error(error)
        }
      },
    },
  },
  computed: {},
  methods: {
    async getUserId() {
      try {
        const result = await this.$browser.storage.sync.get({ userId: '' })
        return result.userId
      } catch (error) {
        console.error(error)
      }
    },
    async getServerUrl() {
      try {
        const result = await this.$browser.storage.sync.get({ serverUrl: '' })
        return result.serverUrl || 'https://lnbits.com'
      } catch (error) {
        console.log(error)
      }
    },
    async connect() {
      console.log('!!!! connect !!!!')

      const res = await axios.get(`${this.serverUrl}/wallet?usr=${this.userId}`)

      console.log('res:', res)
      console.log('res.request.responseURL', res.request.responseURL)
      const div = $(res.data)
      const scripts = []
      div.each(function () {
        if (this.nodeName === 'SCRIPT' && !this.src) {
          scripts.push(this)
        }
      })
      const user = extractUserFromScripts(scripts)
      console.log('user', user)

      const iFrame = document.getElementById('lnbits-com')
      // TODO: no wallet found
      iFrame.src = `${this.serverUrl}/wallet?usr=${this.userId}&wal=${user.wallets[0].id}`
    },

    async disconnect() {
      console.log('!!!! disconnect !!!!')
    },
  },
}
function extractUserFromScripts(scripts = []) {
  // fragile and temporary hack
  // TODO: request api/v1/user

  const searchText = 'window.user ='
  const userDataScript = scripts.find((s) => s.innerHTML.indexOf(searchText) != -1)
  if (userDataScript) {
    const userData = userDataScript.innerHTML
    const startIndex = userData.indexOf(searchText)
    const endIndex = userData.indexOf(';', startIndex)
    const userStr = userData.substring(startIndex + searchText.length, endIndex)
    const u = JSON.parse(userStr)
    const wallets = (u[3] || []).map((wallet) => ({
      id: wallet[0],
      name: wallet[1],
      balance: wallet[5],
      adminKey: wallet[3],
      invoiceKey: wallet[4],
    }))
    return {
      userId: u[0],
      wallets,
    }
  }
  return null
}
</script>
