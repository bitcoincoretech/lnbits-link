import browser from 'webextension-polyfill'

const BOLT11_PREFIX = 'lightning:'
const LNURL_PREFIX = BOLT11_PREFIX + 'LNURL1'

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
        console.log("###### link.href", link.href)

        if (!isInitialized) {
            isInitialized = true;
            document.body.appendChild(iframe);
        }
        iframe.style.display = null;

        setTimeout(() => {
            iframe.contentWindow.postMessage({
                invoice: link.href
            }, '*');
            console.log("#### iframe.contentWindow.postMessage")
        })


    }, false);


    browser.runtime.onMessage.addListener(function (message) {
        console.log("################# content script received:", message)
        if (iframe && message == 'hide_popup') {
            iframe.style.display = 'none';
        }
    });
}

export default handleLinkClick;