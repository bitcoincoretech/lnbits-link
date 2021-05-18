<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <iframe width="400px" height="500px" id="lnbits-site"></iframe>
      </q-page>
    </q-page-container>

    <q-footer>
      <q-toolbar class="bg-lnbits-dark">
        <q-toolbar-title> <strong>LN</strong>bits </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
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
}
</script>
