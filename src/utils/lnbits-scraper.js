import axios from 'axios'
import $ from 'jquery'

async function checkUser(serverUrl, userId) {
    try {
        const res = await axios.get(`${serverUrl}/wallet?usr=${userId}`)
        // TODO: handle 404 not found exception

        const div = $(res.data)
        const scripts = []
        div.each(function () {
            if (this.nodeName === 'SCRIPT' && !this.src) {
                scripts.push(this)
            }
        })
        return _extractUserFromScripts(scripts)
    } catch (err) {
        console.error(err);
    }
}

async function newUser(serverUrl) {
    try {
        const res = await axios.get(`${serverUrl}/wallet?nme=Browser%20wallet`)
        // TODO: handle 404 not found exception
        const div = $(res.data)
        const scripts = []
        div.each(function () {
            if (this.nodeName === 'SCRIPT' && !this.src) {
                scripts.push(this)
            }
        })
        return _extractUserFromScripts(scripts)
    } catch (err) {
        console.error(err);
    }
}

function _extractUserFromScripts(scripts = []) {
    // fragile and temporary hack
    // TODO: request api/v1/user

    const searchText = 'window.user ='
    const userDataScript = scripts.find((s) => s.innerHTML.indexOf(searchText) != -1)
    if (userDataScript) {
        const userData = userDataScript.innerHTML
        const startIndex = userData.indexOf(searchText)
        const endIndex = userData.indexOf(';', startIndex)
        const userStr = userData.substring(startIndex + searchText.length, endIndex)
        const u = JSON.parse(userStr)
        const wallets = (u[3] || []).map((wallet) => ({
            id: wallet[0],
            name: wallet[1],
            balance: wallet[5],
            adminkey: wallet[3],
            inkey: wallet[4],
        }))
        return {
            id: u[0],
            wallets,
        }
    }
    return null
}

export default {
    checkUser,
    newUser
};