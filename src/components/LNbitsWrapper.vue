<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <iframe width="400px" height="500px" id="lnbits-site"></iframe>
      </q-page>
    </q-page-container>

    <q-footer>
      <q-toolbar class="bg-lnbits-dark">
        <q-icon name="account_box" clickable :color="'blue-grey-1'" :size="'32px'"></q-icon>
        <q-space />
        <q-icon name="fullscreen" clickable :color="'blue-grey-1'" :size="'32px'"></q-icon>
         <q-space />
        <q-icon name="open_in_new" clickable :color="'blue-grey-1'" :size="'32px'"></q-icon>
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
