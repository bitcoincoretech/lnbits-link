import Vue from 'vue'
import VueRouter from 'vuerouter'
import Quasar from 'quasar'
import Popup from '../../components/Popup.vue'
import routes from './routes'

// Mozilla's polyfill
Vue.prototype.$browser = require('webextension-polyfill')
Vue.use(VueRouter)
Vue.use(Quasar)

const router = new VueRouter({
  routes
})
router.replace('/connect')

new Vue({
  el: '#popup',
  router,
  render: (h) => h(Popup),
})