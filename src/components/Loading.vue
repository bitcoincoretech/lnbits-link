<template>
  <div class="q-pa-md"></div>
</template>
<script>
export default {
  name: 'loading',
  beforeDestroy() {
    this.$q.loading.hide()
  },
  mounted: function () {
    document.body.style.background = 'none'
    this.$q.loading.show()
  },
}
</script>
