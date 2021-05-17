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
      <q-page class="q-px-md q-py-lg" :class="{ 'q-px-lg': $q.screen.gt.xs }">
        <q-card class="q-pa-lg q-pt-xl lnbits__dialog-card">
          <q-card-section>
            <h6 class="text-subtitle1 q-my-none">Connect to LNbits</h6>
          </q-card-section>
          <q-card-section>
            <q-form @submit="connect" class="q-gutter-md">
              <q-input filled dense v-model.trim="userId" type="text" label="User ID *"></q-input>
              <q-input
                filled
                dense
                v-model.trim="serverUrl"
                type="text"
                label="LNbits Server URL *"
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
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      userId: '',
      serverUrl: 'https://lnbits.com',
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
        var result = await this.$browser.storage.sync.get({ getUserId: '' })
        return result.getUserId
      } catch (error) {
        console.error(error)
      }
    },
    async getServerUrl() {
      try {
        var result = await this.$browser.storage.sync.get({ serverUrl: '' })
        return result.serverUrl
      } catch (error) {
        console.log(error)
      }
    },
    async connect() {
      console.log('!!!! connect !!!!')
    },
    async disconnect() {
      console.log('!!!! disconnect !!!!')
    },
  },
}
</script>
