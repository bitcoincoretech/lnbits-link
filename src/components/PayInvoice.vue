<template>
  <q-dialog ref="dialog" v-model="showDialog" @hide="closeDialog">
    <q-card class="q-pa-lg q-pt-xl lnbits__dialog-card">
      <p class="text-wrap">
        <strong>Payment Request:</strong> {{ paymentRequest }}<br />
      </p>
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
      paymentRequest: '',
    }
  },
  methods: {
    closeDialog() {
      console.log('############################ closeDialog pay invoices')
      this.$browser.runtime.sendMessage('hide_popup')
    },
  },
  mounted: function () {
    this.showDialog = true
    this.paymentRequest = this.$route.query.paymentRequest || ''
    console.log('############################# mounted: this.$route.query', this.$route.query)
  },
}
</script>
