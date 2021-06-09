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
            <div class="q-gutter-md">
              <q-input
                :readonly="hasActiveUser"
                filled
                dense
                v-model.trim="serverUrl"
                type="text"
                label="LNbits Server URL *"
                hint="The LNbits server URL that can optionally contain the User ID and Wallet ID"
              ></q-input>
              <q-input
                :readonly="hasActiveUser"
                :type="showUserId ? 'text' : 'password'"
                filled
                dense
                v-model.trim="userId"
                label="User ID"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showUserId ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showUserId = !showUserId"
                  /> </template
              ></q-input>
              <q-input
                :readonly="hasActiveUser"
                type="text"
                filled
                dense
                v-model.trim="walletId"
                label="Wallet ID"
              ></q-input>
              <q-expansion-item
                v-if="requestDisconnect"
                v-model="requestDisconnect"
                group="extras"
                class="bg-yellow-4"
                icon="warning"
                label="Warning"
              >
                <p class="text-wrap">
                  All data related to this user will be removed from the browser extension!
                </p>
                <p>
                  Please make sure to backup the User ID if you have any funds associated with it!
                </p>
              </q-expansion-item>

              <div v-if="!hasActiveUser" class="row q-mt-lg">
                <q-btn @click="connect" color="deep-purple" type="submit" unelevated>Connect</q-btn>
                <q-space />
                <q-btn @click="connectNewUser" color="purple" unelevated>New User</q-btn>
              </div>
              <div v-else class="row q-mt-lg">
                <q-btn @click="disconnect" color="red-10" unelevated>Disconnect</q-btn>
                <q-space />
                <q-btn
                  v-if="requestDisconnect"
                  @click="cancelDisconnect"
                  flat
                  color="grey"
                  class="q-ml-auto"
                  >Cancel</q-btn
                >
                <q-btn
                  v-if="!requestDisconnect"
                  @click="connect"
                  flat
                  color="grey"
                  class="q-ml-auto"
                  >Back</q-btn
                >
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
    <q-footer class="bg-transparent q-px-lg q-py-md" :class="{ 'text-dark': !$q.dark.isActive }">
      <q-toolbar>
        <q-toolbar-title class="text-caption">
          <strong>LN</strong>bits, free and open-source lightning wallet/accounts system
        </q-toolbar-title>
        <q-space></q-space>
        <q-btn
          flat
          dense
          :color="$q.dark.isActive ? 'white' : 'deep-purple'"
          icon="code"
          type="a"
          href="https://github.com/lnbits/lnbits"
          target="_blank"
          rel="noopener"
        >
          <q-tooltip>View project in GitHub</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import lnBitsConnect from '../utils/lnbits-scraper'
import configSvc from '../services/config.svc'

export default {
  name: 'connect',
  data() {
    return {
      userId: '',
      walletId: '',
      showUserId: false,
      userData: {},
      serverUrl: '',
      error: '',
      requestDisconnect: false,
    }
  },
  async mounted() {
    try {
      this.userId = await configSvc.getUserId()
      this.walletId = await configSvc.getWalletId()
      this.userData = await configSvc.getUser()
      this.serverUrl = await configSvc.getServerUrl()
    } catch (err) {
      console.error(err)
      this.$q.notify({
        type: 'negative',
        message: 'Unexpected error!',
        caption: `Cannot init Connect View!`,
      })
    }
  },
  watch: {
    userId: {
      async handler(val) {
        try {
          await configSvc.setUserId(val)
        } catch (error) {
          console.error(error)
        }
      },
    },
    walletId: {
      async handler(val) {
        try {
          await configSvc.setWalletId(val)
        } catch (error) {
          console.error(error)
        }
      },
    },
    serverUrl: {
      async handler(val) {
        try {
          const url = new URL(val || '')

          if (url.searchParams.has('wal')) {
            this.walletId = url.searchParams.get('wal')
          }

          if (url.searchParams.has('usr')) {
            this.userId = url.searchParams.get('usr')
          }

          await configSvc.setServerUrl(url.origin || '')
        } catch (err) {
          console.log(err)
          await configSvc.setServerUrl('')
        }
      },
    },
  },
  computed: {
    hasActiveUser() {
      return !!(this.userData && this.userData.id)
    },
  },
  methods: {
    async connect() {
      try {
        const serverUrl = await configSvc.getServerUrl()

        const user = await lnBitsConnect.checkUser(serverUrl, this.userId)
        if (!user || !user.id || !user.wallets || !user.wallets.length) {
          this.$q.notify({
            type: 'negative',
            message: 'Cannot connect user!',
            caption: `Please check that the 'Server URL' and 'User ID' are valid!`,
          })
          return
        }

        const wallet = !this.walletId
          ? user.wallets[0]
          : user.wallets.find((w) => w.id === this.walletId)
        if (!wallet) {
          this.$q.notify({
            type: 'negative',
            message: 'Cannot find wallet!',
            caption: `Please check that the 'Wallet ID' is valid!`,
          })
          return
        }
        await configSvc.setWalletId(wallet.id)
        await configSvc.setUser(user)

        this.$router.push({
          path: 'lnbits',
        })
      } catch (err) {
        console.error(err)
        this.$q.notify({
          type: 'negative',
          message: 'Unexpected error!',
          caption: `Please check console logs.`,
        })
      }
    },
    async connectNewUser() {
      try {
        if (!this.serverUrl) {
          this.$q.notify({
            type: 'warning',
            message: 'Server URL is missing!',
          })
          return
        }
        if (this.userId) {
          this.$q.notify({
            type: 'warning',
            message: 'User ID must be empty. The old User ID will be lost!',
            caption: 'Crate a back-up if you want to use it in the future!',
            timeout: 10000,
          })
          return
        }

        const user = await lnBitsConnect.newUser(this.serverUrl)

        if (!user || !user.id || !user.wallets || !user.wallets.length) {
          this.$q.notify({
            type: 'negative',
            message: 'Cannot create new user!',
            caption: `Please check that '${this.serverUrl}' is up.`,
          })
          return
        }

        await configSvc.setUserId(user.id)
        await configSvc.setWalletId(user.wallets[0].id)
        await configSvc.setUserId(user)
        this.$router.push({
          path: 'lnbits',
        })
      } catch (err) {
        console.error(err)
        this.$q.notify({
          type: 'negative',
          message: 'Unexpected error!',
          caption: `Please check console logs.`,
        })
      }
    },
    async disconnect() {
      if (!this.requestDisconnect) {
        this.requestDisconnect = true
        return
      }
      this.requestDisconnect = false
      this.userId = ''
      this.walletId = ''
      this.userData = {}
      await configSvc.cleanConfig()
    },
    async cancelDisconnect() {
      this.requestDisconnect = false
    },
  },
}
</script>
