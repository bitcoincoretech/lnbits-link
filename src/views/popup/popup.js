import Vue from 'vue'
import Quasar from 'quasar'
import Home from '../../components/Home.vue'

// Mozilla's polyfill
Vue.prototype.$browser = require('webextension-polyfill')
Vue.use(Quasar)

new Vue({
  el: '#popup',
  render: (h) => h(Home),
})
