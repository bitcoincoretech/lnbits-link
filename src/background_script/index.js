chrome.runtime.onMessage.addListener(function (message, sender) {
    console.log("background received ", message)
    chrome.tabs.sendMessage(sender.tab.id, message);
});