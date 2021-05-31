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
              ></q-input>
              <q-input
                :readonly="hasActiveUser"
                :type="showUserId ? 'text' : 'password'"
                filled
                dense
                v-model.trim="userId"
                label="User ID (optional)"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showUserId ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showUserId = !showUserId"
                  /> </template
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

export default {
  name: 'connect',
  data() {
    return {
      userId: '',
      showUserId: false,
      userData: {},
      serverUrl: '',
      error: '',
      requestDisconnect: false,
    }
  },
  async mounted() {
    this.userId = await this.getUserId()
    this.userData = await this.getUserData()
    this.serverUrl = await this.getServerUrl()
  },
  watch: {
    userId: {
      async handler(val) {
        try {
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
  computed: {
    hasActiveUser() {
      return !!(this.userData && this.userData.id)
    },
  },
  methods: {
    async getUserId() {
      try {
        const result = await this.$browser.storage.sync.get({ userId: '' })
        return result.userId
      } catch (error) {
        // TODO notify
        console.error(error)
      }
    },
    async getUserData() {
      try {
        const result = await this.$browser.storage.sync.get({ user: '' })
        return result.user
      } catch (error) {
        // TODO notify
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
      try {
        const user = await lnBitsConnect.checkUser(this.serverUrl, this.userId)

        if (!user || !user.id || !user.wallets || !user.wallets.length) {
          this.$q.notify({
            type: 'negative',
            message: 'Cannot connect user!',
            caption: `Please check that the 'Server URL' and 'User ID' are valid!`,
          })
          return
        }

        await this.$browser.storage.sync.set({ user })
        this.$router.push({
          path: 'lnbits',
          query: { userId: user.id, walletId: user.wallets[0].id },
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

        await this.$browser.storage.sync.set({ userId: user.id })
        await this.$browser.storage.sync.set({ user })
        this.$router.push({
          path: 'lnbits',
          query: { userId: user.id, walletId: user.wallets[0].id },
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
      this.userData = {}
      await this.$browser.storage.sync.set({ userId: '' })
      await this.$browser.storage.sync.set({ user: {} })
    },
    async cancelDisconnect() {
      this.requestDisconnect = false
    },
  },
}
</script>
