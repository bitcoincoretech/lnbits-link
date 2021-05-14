<template>
  <div class="p-3">
    <div
      v-if="error"
      class="flex items-center justify-center text-xs border-t-4 rounded-sm text-yellow-800 border-yellow-600 bg-yellow-100 p-2 mb-3"
      role="alert"
    >
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      userId: '',
      serverUrl: 'https://lnbits.com',
      error: '11',
    }
  },
  async mounted() {
    this.userId = await this.getUserId()
    this.serverUrl = await this.getServerUrl()
  },
  watch: {
    userId: {
      async handler(val) {
        try {
          await this.$browser.storage.sync.set({ userId: val })
        } catch (error) {
          console.log(error)
        }
      },
    },
    serverUrl: {
      async handler(val) {
        try {
          await this.$browser.storage.sync.set({ serverUrl: val })
        } catch (error) {
          console.error(error)
        }
      },
    },
  },
  computed: {},
  methods: {
    async getUserId() {
      try {
        var result = await this.$browser.storage.sync.get({ getUserId: '' })
        return result.getUserId
      } catch (error) {
        console.error(error)
      }
    },
    async getServerUrl() {
      try {
        var result = await this.$browser.storage.sync.get({ serverUrl: '' })
        return result.serverUrl
      } catch (error) {
        console.log(error)
      }
    },
    async connect() {
      console.log('!!!! connect !!!!')
    },
    async disconnect() {
      console.log('!!!! disconnect !!!!')
    },
  },
}
</script>
