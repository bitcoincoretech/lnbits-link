import browser from 'webextension-polyfill'

const BOLT11_PREFIX = 'lightning:'
const LNURL_PREFIX = BOLT11_PREFIX + 'LNURL'

function handleLinkClick() {
    let isInitialized = false;
    const iframe = document.createElement('iframe');
    iframe.src = browser.extension.getURL("views/content-inject/content.html");
    iframe.className = 'css-isolation-popup';
    iframe.frameBorder = 0;
    iframe.style.display = 'none';

    document.addEventListener('click', function (e) {
        const link = e.target.closest('a')
        if (!link || !link.href) {
            return
        }

        const isBolt11Link = BOLT11_PREFIX.toUpperCase() === link.href.substring(0, BOLT11_PREFIX.length).toUpperCase()
        const isLnUrlLink = LNURL_PREFIX.toUpperCase() === link.href.substring(0, LNURL_PREFIX.length).toUpperCase()

        if (!isBolt11Link && !isLnUrlLink) {
            return
        }

        if (!isInitialized) {
            _init()
        }

        if (isLnUrlLink) {
            console.log("###### LNURL")
        } else if (isBolt11Link) {
            console.log("###### BOLT11")
        }
        iframe.style.display = null;

    }, false);

    function _init() {
        document.body.appendChild(iframe);
    }
}

export default handleLinkClick;