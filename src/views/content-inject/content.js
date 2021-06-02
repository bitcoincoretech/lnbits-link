import browser from 'webextension-polyfill'
import Vue from 'vue'
import VueRouter from 'vuerouter'
import VueQrcode from 'vueQrcode'
import Quasar from 'quasar'
import Options from '../../components/Options.vue'
import routes from './routes'


try {
  initIFrame()
  // Mozilla's polyfill
  Vue.prototype.$browser = require('webextension-polyfill')
  Vue.use(VueRouter)
  Vue.use(Quasar)
  Vue.component('qrcode', VueQrcode)


  const router = new VueRouter({
    routes
  })
  //find better default
  router.replace('/loading')

  new Vue({
    el: '#content',
    router,
    render: (h) => h(Options),
  })


  window.addEventListener("message", (e) => {
    const data = e.data;
    if (router.currentRoute.path === '/payment') {
      router.replace('/loading')
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


} catch (err) {
  browser.runtime.sendMessage('hide_iframe')
  console.error(err)
}

function initIFrame() {
  document.getElementById('lnbits-overlay')
    .addEventListener('click', function () {
      browser.runtime.sendMessage('hide_iframe')
    });


  setTimeout(() => {
    // remove any quasar injected background color
    document.body.style.background = 'none';
  })
}