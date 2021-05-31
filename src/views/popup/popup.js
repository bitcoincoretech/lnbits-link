import browser from "webextension-polyfill";
import Vue from 'vue'
import VueRouter from 'vuerouter'
import Quasar from 'quasar'
import Popup from '../../components/Popup.vue'
import routes from './routes'

// Mozilla's polyfill
Vue.prototype.$browser = browser
Vue.use(VueRouter)
Vue.use(Quasar)

async function init() {
  const router = new VueRouter({
    routes
  })

  // TODO: extract
  const serverResult = await browser.storage.sync.get({
    serverUrl: ''
  })
  const serverUrl = serverResult.serverUrl

  const result = await browser.storage.sync.get({
    user: ''
  })
  const user = result.user

  if (serverUrl && user && user.id && user.wallets && user.wallets.length) {

    router.replace({
      path: 'lnbits',
      query: {
        userId: user.id,
        walletId: user.wallets[0].id
      },
    })
  } else {
    router.replace('/connect')
  }


  new Vue({
    el: '#popup',
    router,
    render: (h) => h(Popup),
  })
}

init()