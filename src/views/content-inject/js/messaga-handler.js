import capture from './capture'

function handle(e, router) {
    const data = e.data;
    const requestedBy = e.origin;
    if (data.messageId === 'capture-screen') {
        _handleCaptureScreen(router)
        return;
    }
    _handlePayment(router, data, requestedBy)
}

function _handlePayment(router, data, requestedBy) {
    if (router.currentRoute.path === '/payment') {
        router.replace('/loading')
    }
    setTimeout(() => {
        router.replace({
            path: '/payment',
            query: {
                paymentRequest: data.paymentRequest,
                requestedBy
            }
        })
    })
}

function _handleCaptureScreen(router) {
    if (router.currentRoute.path !== '/blank') {
        router.replace('/blank')
    }
    capture.install()
}

export default {
    handle
}