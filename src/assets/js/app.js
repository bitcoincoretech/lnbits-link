import Vue from 'vue'
import App from './components/App.vue'

// Mozilla's polyfill
Vue.prototype.$browser = require('webextension-polyfill')

new Vue({
  el: '#app',
  render: (h) => h(App),
})
