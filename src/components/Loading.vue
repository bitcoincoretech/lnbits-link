<template>
  <div class="q-pa-md"></div>
</template>
<script>
export default {
  beforeDestroy() {
    this.$q.loading.hide()
  },
  mounted: function () {
    console.log('############################ mounted loading')
    document.body.style.background = 'none'
    this.$q.loading.show()
  },
}
</script>
