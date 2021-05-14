import Vue from 'vue'
import Options from '../../components/Options.vue'

// Mozilla's polyfill
Vue.prototype.$browser = require('webextension-polyfill')


new Vue({
  el: '#options',
  render: (h) => h(Options),
})
