<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card>
        <q-card-section>
          <h3 class="q-my-none"><strong>LN</strong>bits</h3>
          <h5 class="q-my-md">Free and open-source lightning wallet</h5>
        </q-card-section>
      </q-card>

      <!-- buttons example -->
      <q-card-actions>
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn color="primary" label="Cancel" @click="onCancelClick" />
        <!-- <div class="row q-mt-lg">
          <q-btn color="deep-purple" unelevated>Connect</q-btn>
          <q-space />
          <q-btn color="purple" unelevated>New User</q-btn>
        </div> -->
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'Layout',

  data() {
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
