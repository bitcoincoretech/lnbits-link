import browser from "webextension-polyfill";
import Vue from 'vue'
import VueRouter from 'vuerouter'
import Quasar from 'quasar'
import App from '../../components/App.vue'
import routes from './routes'

// Mozilla's polyfill
Vue.prototype.$browser = browser
Vue.use(VueRouter)
Vue.use(Quasar)

async function init(elementId = 'app') {
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
    })
  } else {
    router.replace('/connect')
  }


  new Vue({
    el: `#${elementId}`,
    router,
    render: (h) => h(App),
  })
}

export default init