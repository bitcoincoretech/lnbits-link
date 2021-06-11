<template>
  <div>
    <q-card-section dark bordered class="bg-red-5">
      <div class="text-h6">{{ title }}</div>
      <div class="text-subtitle2">{{ message }}</div>
    </q-card-section>
    <q-expansion-item group="extras" class="bg-yellow-2" icon="error" label="Details">
      <p class="text-wrap">
        {{ details }}
      </p>
    </q-expansion-item>
  </div>
</template>
<script>
export default {
  name: 'error-card',
  props: {
    title: String,
    message: String,
    details: String,
  },
}
</script>
