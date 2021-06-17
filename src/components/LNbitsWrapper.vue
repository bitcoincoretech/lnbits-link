<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <iframe
          id="lnbits-site"
          class="iframe-style"
          allow="clipboard-read; clipboard-write"
        ></iframe>
      </q-page>
    </q-page-container>

    <q-footer>
      <q-toolbar class="bg-lnbits-dark">
        <q-icon
          name="account_box"
          clickable
          @click="gotoConnectPage"
          :color="'blue-grey-1'"
          :size="'32px'"
          class="cursor-pointer"
        >
          <q-tooltip> Manage User </q-tooltip>
        </q-icon>
        <q-space />
        <q-icon
          name="fullscreen"
          clickable
          @click="gotoOptionsPage"
          :color="'blue-grey-1'"
          :size="'32px'"
          class="cursor-pointer"
        >
          <q-tooltip> Full Screen </q-tooltip>
        </q-icon>
        <q-space />
        <q-icon
          name="open_in_new"
          clickable
          @click="gotoWebSite"
          :color="'blue-grey-1'"
          :size="'32px'"
          class="cursor-pointer"
        >
          <q-tooltip> {{ serverUrl }} </q-tooltip>
        </q-icon>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
// TODO: can replace with this.$browser?
import browser from 'webextension-polyfill'
import configSvc from '../services/config.svc'

export default {
  name: 'lnbits-wrapper',
  data() {
    return {
      user: {},
      serverUrl: '',
    }
  },
  async mounted() {
    this.serverUrl = await configSvc.getServerUrl()
    this.user = await configSvc.getUser()
    const userId = await configSvc.getUserId()

    const walletId = await configSvc.getWalletId()

    // TODO: no user/serverUrl found

    const closeLoading = this.$q.notify({
      type: 'ongoing',
      message: 'Loading...',
      caption: this.serverUrl,
      position: 'center',
      timeout: 1500,
      spinner: true,
    })

    const iFrame = document.getElementById('lnbits-site')

    iFrame.src = `${this.serverUrl}/wallet?usr=${userId}&wal=${walletId || ''}`
    iFrame.addEventListener('load', function () {
      closeLoading()
    })
  },
  methods: {
    gotoConnectPage() {
      this.$router.push('connect')
    },
    gotoOptionsPage() {
      browser.tabs.create({ url: browser.runtime.getURL('views/options/options.html') })
    },
    async gotoWebSite() {
      try {
        const url = `${this.serverUrl}/wallet?usr=${this.user.id}`
        browser.tabs.create({ url })
      } catch (err) {
        console.error(err)
        this.$q.notify({
          type: 'negative',
          message: 'Unexpected error!',
          caption: `Please check console logs.`,
        })
      }
    },
  },
}
</script>
