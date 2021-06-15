import browser from "webextension-polyfill";
import Vue from 'vue'
import VueRouter from 'vuerouter'
import Quasar from 'quasar'
import configSvc from '../../services/config.svc'
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

  const isConfigValid = await configSvc.isConfigValid()

  if (isConfigValid) {
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