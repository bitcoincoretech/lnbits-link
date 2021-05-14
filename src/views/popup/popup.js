import Vue from 'vue'
// import Popup from '../../components/Popup.vue'
import Home from '../../components/Home.vue'

// Mozilla's polyfill
Vue.prototype.$browser = require('webextension-polyfill')

new Vue({
  el: '#popup',
  render: (h) => h(Home),
})
