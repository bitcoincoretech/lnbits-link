import browser from 'webextension-polyfill'

browser.runtime.onMessage.addListener(function (message, sender) {
    console.log("lnbits: background received ", message)
    browser.tabs.sendMessage(sender.tab.id, message);
});

browser.contextMenus.create({
    'id': 'capture-ln-qrcode',
    'title': 'Lightning QR Code Capture',
    'contexts': ['page', 'selection', 'link', 'frame']
});

browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "capture-ln-qrcode") {
        console.log('capture-ln-qrcode')
    }
    console.log('info', info)
});