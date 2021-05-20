import browser from 'webextension-polyfill'
import Vue from 'vue'
import VueRouter from 'vuerouter'
import Quasar from 'quasar'
import Options from '../../components/Options.vue'
import routes from './routes'


// Mozilla's polyfill
Vue.prototype.$browser = require('webextension-polyfill')
Vue.use(VueRouter)
Vue.use(Quasar)


const router = new VueRouter({
  routes
})
router.replace('/bar')

new Vue({
  el: '#content',
  router,
  render: (h) => h(Options),
})


window.addEventListener("message", (e) => {
  const data = e.data;
  if (router.currentRoute.path === '/payment') {
    router.replace('/foo')
  }
  setTimeout(() => {
    router.replace({
      path: '/payment',
      query: {
        paymentRequest: data.paymentRequest,
        requestedBy: e.origin
      }
    })
  })
}, false);

document.getElementById('lnbits-overlay')
  .addEventListener('click', function () {
    browser.runtime.sendMessage('hide_popup')
  });


setTimeout(() => {
  // remove any quasar injected background color
  document.body.style.background = 'none';
})