import browser from 'webextension-polyfill'

const BOLT11_PREFIX = 'lightning:'
const LNURL_PREFIX = BOLT11_PREFIX + 'LNURL1'

function handleLinkClick() {
    try {
        let isInitialized = false;
        const iframe = document.createElement('iframe');
        iframe.src = browser.extension.getURL("views/content-inject/content.html");
        iframe.className = 'lnbits-css-isolation-popup';
        iframe.style.display = 'none';

        document.addEventListener('click', function (e) {
            try {
                const link = e.target.closest('a')
                if (!link || !link.href) {
                    return
                }

                const isBolt11Link = BOLT11_PREFIX.toUpperCase() === link.href.substring(0, BOLT11_PREFIX.length).toUpperCase()
                const isLnUrlLink = LNURL_PREFIX.toUpperCase() === link.href.substring(0, LNURL_PREFIX.length).toUpperCase()

                if (!isBolt11Link && !isLnUrlLink) {
                    return
                }

                // stop redirect or request for app selection
                e.preventDefault()

                _postMessageToIFrame({
                    paymentRequest: link.href
                });
            } catch (err) {
                console.error(err)
            }
        }, false);


        browser.runtime.onMessage.addListener(function (message = '') {
            if (iframe && message == 'hide_iframe') {
                iframe.style.display = 'none';
                return;
            }
            if (message.messageId === 'capture-screen') {
                _postMessageToIFrame(message)
            }
        });

        function _postMessageToIFrame(message) {
            if (!isInitialized) {
                isInitialized = true;
                document.body.appendChild(iframe);
                iframe.addEventListener("load", function () {
                    iframe.contentWindow.postMessage(message, '*');
                });
            } else {
                iframe.contentWindow.postMessage(message, '*');
            }
            iframe.style.display = null;
        }
    } catch (err) {
        console.error(err)
    }
}

export default handleLinkClick;