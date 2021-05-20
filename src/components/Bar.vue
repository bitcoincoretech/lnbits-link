<template>
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
</template>
