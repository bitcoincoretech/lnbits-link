<template>
  <q-dialog ref="dialog">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <q-input
          filled
          dense
          type="textarea"
          label="Paste an invoice, payment request or lnurl code *"
        >
        </q-input>
        <div class="q-mt-lg">
          <q-btn unelevated color="deep-purple" type="submit">Read</q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="OK" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'Layout',
  props: ['bolt11Invoice'],
  computed: {
    contentSize() {
      return this.moreContent ? 150 : 5
    },
  },
  data() {
    console.log('############## bolt11Invoice', this.bolt11Invoice)
    return {
      layout: false,

      moreContent: true,
      drawer: false,
      drawerR: false,

      lorem:
        'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Natus, ratione eum minus fuga, quasi dicta facilis corporis magnam, suscipit at quo nostrum!',
    }
  },

  // computed: {
  //   contentSize() {
  //     return this.moreContent ? 150 : 5
  //   },
  // },

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide()
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok')
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide()
    },
  },
}
</script>
