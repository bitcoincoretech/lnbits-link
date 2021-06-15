import browser from 'webextension-polyfill'
import Vue from 'vue'
import VueRouter from 'vuerouter'
import VueQrcode from 'vueQrcode'
import Quasar from 'quasar'
import Options from '../../../components/Options.vue'
import InvoiceDetails from '../../../components/InvoiceDetails.vue'
import PaymentStatus from '../../../components/PaymentStatus.vue'
import LnurlPay from '../../../components/LnurlPay.vue'
import LnurlWithdraw from '../../../components/LnurlWithdraw.vue'
import LnurlAuth from '../../../components/LnurlAuth.vue'
import ErrorCard from '../../../components/ErrorCard.vue'

import routes from './routes'
import messageHandler from './messaga-handler'

try {
  initIFrame()
  // Mozilla's polyfill
  Vue.prototype.$browser = require('webextension-polyfill')
  Vue.use(VueRouter)
  Vue.use(Quasar)
  Vue.component('qrcode', VueQrcode)
  Vue.component('invoice-details', InvoiceDetails)
  Vue.component('payment-status', PaymentStatus)
  Vue.component('lnurl-pay', LnurlPay)
  Vue.component('lnurl-withdraw', LnurlWithdraw)
  Vue.component('lnurl-auth', LnurlAuth)
  Vue.component('error-card', ErrorCard)


  const router = new VueRouter({
    routes
  })
  
  router.replace('/loading')

  new Vue({
    el: '#content',
    router,
    render: (h) => h(Options),
  })


  window.addEventListener("message", (e) => {
    messageHandler.handle(e, router)
  }, false);


} catch (err) {
  console.error(err)
  _hideIframe()
}

function initIFrame() {
  document.getElementById('lnbits-overlay')
    .addEventListener('click', function () {
      _hideIframe()
    });


  setTimeout(() => {
    // remove any quasar injected background color
    document.body.style.background = 'none';
  })
}

async function _hideIframe() {
  try {
    await browser.runtime.sendMessage('hide_iframe')
  } catch (err) {
    console.error(err)
    const overalyDiv = document.getElementById('lnbits-overlay')
    overalyDiv && overalyDiv.remove()
  }
}