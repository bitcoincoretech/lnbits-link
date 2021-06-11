<template>
  <div>
    <q-card-section dark bordered>
      <p class="text-center">
        <q-icon v-if="isPayed" name="check_circle" size="5.5em" color="green" />
        <q-spinner-bars v-else color="purple" size="5.5em" />
      </p>
      <p class="q-my-none text-h6 text-center">{{ message }}</p>
      <q-expansion-item
        v-if="details && details.length"
        group="extras"
        icon="info"
        class="bg-yellow-1"
        label="Details"
      >
        <span v-html="details"></span>
      </q-expansion-item>
    </q-card-section>
  </div>
</template>
<script>
export default {
  name: 'payment-status',
  props: {
    isPayed: Boolean,
    message: String,
    details: String,
  },
}
</script>
