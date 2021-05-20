<template>
  <q-dialog ref="dialog" v-model="showDialog" @hide="closeDialog">
    <q-card class="q-pa-lg q-pt-xl lnbits__dialog-card">
      PAY INVOICE
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'payInvoice',
  // clean state before open
  data() {
    return {
      showDialog: true,
    }
  },
  methods: {
    closeDialog() {
      console.log('############################ closeDialog pay invoices')
      this.$browser.runtime.sendMessage('hide_popup');
      this.showDialog = true
    },
  },
}
</script>
