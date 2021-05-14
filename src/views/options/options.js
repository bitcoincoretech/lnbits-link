import Vue from 'vue'
import Quasar from 'quasar'
import Options from '../../components/Options.vue'

// Mozilla's polyfill
Vue.prototype.$browser = require('webextension-polyfill')
Vue.use(Quasar)

new Vue({
  el: '#options',
  render: (h) => h(Options),
})