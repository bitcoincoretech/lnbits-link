import Vue from 'vue'
import Quasar from 'quasar'
import {
    Dialog
} from 'quasar'

import Layout from '../components/Layout'


const BOLT11_PREFIX = 'lightning:'
const LNURL_PREFIX = BOLT11_PREFIX + 'LNURL'

function handleLinkClick() {
    let isVueInitialized = false;

    document.addEventListener('click', function (e) {
        const link = e.target.closest('a')
        if (!link || !link.href) {
            return
        }

        const isBolt11Link = BOLT11_PREFIX.toUpperCase()  === link.href.substring(0, BOLT11_PREFIX.length).toUpperCase()
        const isLnUrlLink = LNURL_PREFIX.toUpperCase() === link.href.substring(0, LNURL_PREFIX.length).toUpperCase()

        if (!isBolt11Link && !isLnUrlLink) {
            return
        }

        if (!isVueInitialized) {
            _initVue()
        }

        if (isLnUrlLink) {
            console.log("###### LNURL")
        } else if (isBolt11Link) {
            console.log("###### BOLT11")
        }

        Dialog.create({
            component: Layout
        })

    }, false);

    function _initVue() {
        const div = document.createElement("div")
        div.id = "lnbits-browser-extension"
        document.body.insertBefore(div, document.body.firstChild);
        Vue.use(Quasar)
        new Vue({
            el: '#lnbits-browser-extension',
            render: h => {
                return '<div></div>'
            }
        })
    }
}

export default handleLinkClick;