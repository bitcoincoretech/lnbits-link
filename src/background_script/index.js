import browser from 'webextension-polyfill'

browser.runtime.onMessage.addListener(async function (message, sender) {
    console.log("lnbits: background received ", message)
    if (message.method === 'captured') {
        try {
            console.log('########### captured')
            const a = await capture(message)
            console.log('######## base64 image', a);
        } catch (e) {
            console.error(e)
        }

        return;
    }

    browser.tabs.sendMessage(sender.tab.id, message);
});

browser.contextMenus.create({
    'id': 'capture-ln-qrcode',
    'title': 'Lightning QR Code Capture',
    'contexts': ['page', 'selection', 'link', 'frame']
});

browser.contextMenus.onClicked.addListener(async (message, tab) => {
    if (message.menuItemId === "capture-ln-qrcode") {
        console.log('capture-ln-qrcode')
        browser.tabs.sendMessage(tab.id, {
            messageId: 'capture-screen'
        });
    }
    console.log('message', message)
});



function capture(request) {
    return new Promise(async function (resolve, reject) {
        const dataUrl = await browser.tabs.captureVisibleTab(null, {
            format: 'png'
        })
        if (!request) {
            return resolve(dataUrl);
        }

        const left = request.left * request.devicePixelRatio;
        const top = request.top * request.devicePixelRatio;
        const width = request.width * request.devicePixelRatio;
        const height = request.height * request.devicePixelRatio;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = width || img.width;
            canvas.height = height || img.height;
            if (width && height) {
                ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
            } else {
                ctx.drawImage(img, 0, 0);
            }
            resolve(canvas.toDataURL());
        };
        img.onerror = e => reject(e);
        img.src = dataUrl;
    });

}