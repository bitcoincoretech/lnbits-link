<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <iframe width="400px" height="500px" id="lnbits-site"></iframe>
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
        ></q-icon>
        <q-space />
        <q-icon
          name="fullscreen"
          clickable
          @click="gotoOptionsPage"
          :color="'blue-grey-1'"
          :size="'32px'"
          class="cursor-pointer"
        ></q-icon>
        <q-space />
        <q-icon
          name="open_in_new"
          clickable
          @click="gotoWebSite"
          :color="'blue-grey-1'"
          :size="'32px'"
          class="cursor-pointer"
        ></q-icon>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import browser from 'webextension-polyfill'
export default {
  name: 'lnbits-wrapper',
  async mounted() {
    console.log('this.$route.query.', this.$route.query)
    const userId = this.$route.query.userId || ''
    const walletId = this.$route.query.walletId || ''
    const result = await this.$browser.storage.sync.get({ serverUrl: '' })
    const serverUrl = result.serverUrl
    // TODO: no user/wallet/serverUrl found

    const iFrame = document.getElementById('lnbits-site')

    iFrame.src = `${serverUrl}/wallet?usr=${userId}&wal=${walletId}`
  },
  methods: {
    gotoConnectPage() {
      console.log('!!!!!!!!!!!!!!! goto connect')
      this.$router.push('connect')
    },
    gotoOptionsPage() {
      browser.tabs.create({ url: browser.runtime.getURL('views/options/options.html') })
    },
    async gotoWebSite() {
      try {
        const serverResult = await browser.storage.sync.get({
          serverUrl: '',
        })
        const serverUrl = serverResult.serverUrl

        const result = await browser.storage.sync.get({
          user: '',
        })
        const user = result.user
        const url = `${serverUrl}/wallet?usr=${user.id}`
        browser.tabs.create({ url })
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>
