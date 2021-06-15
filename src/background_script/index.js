import browser from 'webextension-polyfill'

browser.runtime.onMessage.addListener(async function (message, sender) {
    console.log("lnbits: background received ", message)
    browser.tabs.sendMessage(sender.tab.id, message);
});

browser.contextMenus.create({
    'id': 'capture-ln-qrcode',
    'title': 'Lightning QR Code Capture',
    'contexts': ['page', 'selection', 'link', 'frame', 'image']
});

browser.contextMenus.onClicked.addListener(async (message, tab) => {
    if (message.menuItemId === "capture-ln-qrcode") {
        browser.tabs.sendMessage(tab.id, {
            messageId: 'capture-screen'
        });
    }
});