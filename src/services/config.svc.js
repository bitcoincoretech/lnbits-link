async function getServerUrl() {
    const result = await this.$browser.storage.sync.get({
        serverUrl: ''
    })
    return result.serverUrl
}

async function setServerUrl(value) {
    return this.$browser.storage.sync.set({
        serverUrl: value
    });
}

async function getUser() {
    const result = await this.$browser.storage.sync.get({
        user: '',
    });
    return result.user;
}

async function setUser(value) {
    return this.$browser.storage.sync.set({
        user: value
    });
}

async function getUserId() {
    const result = await this.$browser.storage.sync.get({
        userId: ''
    })
    return result.userId
}

async function setUserId(value) {
    return this.$browser.storage.sync.set({
        userId: value
    });
}

async function getWalletId() {
    const result = await this.$browser.storage.sync.get({
        walletId: ''
    })
    return result.walletId
}

async function setWalletId(value) {
    return this.$browser.storage.sync.set({
        walletId: value
    });
}

async function getActiveWallet() {
    const user = await getUser()
    const walletId = await getWalletId()
    const activeWallet = user.wallets.find((w) => w.id === walletId)
    return activeWallet || user.wallets[0];
}

async function cleanConfig() {
    await setServerUrl('')
    await setUserId('')
    await setWalletId('')
    await setUser({})
}

async function isConfigValid() {
    const serverUrl = await getServerUrl()
    const user = await getUser()

    return serverUrl && user && user.id && user.wallets && user.wallets.length
}

export default {
    getServerUrl,
    setServerUrl,
    getUser,
    setUser,
    getUserId,
    setUserId,
    getWalletId,
    setWalletId,
    getActiveWallet,
    cleanConfig,
    isConfigValid,
}