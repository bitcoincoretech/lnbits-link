import Vue from 'vue'
import Quasar from 'quasar'
import {
    Notify, Dialog
} from 'quasar'






const BOLT11_PREFIX = 'lightning:'
const LNURL_PREFIX = BOLT11_PREFIX + 'LNURL'

function handleLinkClick() {
    console.log("######################### handleLinkClick");


    document.addEventListener('DOMContentLoaded', function () {
        console.log("######################### document", document);
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
    }, false);


    document.addEventListener('click', function (e) {
        const link = e.target.closest('a')

        if (link) {
            const href = link.href || '';
            console.log('############### href', href)

            if (href.startsWith(LNURL_PREFIX)) {
                console.log("###### LNURL")
            } else if (href.startsWith(BOLT11_PREFIX)) {
                console.log("###### BOLT11")
            }
        }
        console.log('Quasar', Quasar)
        console.log('Dialog', Dialog)
        Notify.create('Danger, Will Robinson! Danger!')

    }, false);
}

export default handleLinkClick;