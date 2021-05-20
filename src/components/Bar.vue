<template>
  <q-dialog ref="dialog" v-model="showDialog" @hide="closeDialog">
    <q-card class="q-pa-lg q-pt-xl lnbits__dialog-card">
      <div>
        <q-form class="q-gutter-md">
          <q-input
            filled
            dense
            type="textarea"
            label="Paste an invoice, payment request or lnurl code *"
          >
          </q-input>
          <div class="row q-mt-lg">
            <q-btn unelevated color="deep-purple" type="submit">Read</q-btn>
            <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
          </div>
        </q-form>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'Bar',
  props: ['bolt11Invoice'],
  data() {
    console.log('############## bolt11Invoice', this.bolt11Invoice)
    return {
      showDialog: true,
    }
  },
  methods: {
    closeDialog() {
      console.log('############################ closeDialog')
      this.$browser.runtime.sendMessage('hide_popup');
    },
  },
}
</script>
