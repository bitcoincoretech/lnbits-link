import { Notify } from 'quasar'

const utils = {
    formatCurrency: function (value, currency) {
        return new Intl.NumberFormat(window.LOCALE, {
            style: 'currency',
            currency: currency
        }).format(value)
    },
    formatSat: function (value) {
        return new Intl.NumberFormat(window.LOCALE).format(value)
    },
    notifyApiError: function (error) {
        var types = {
            400: 'warning',
            401: 'warning',
            500: 'negative'
        }
        // Quasar.plugins.
        Notify.create({
            timeout: 5000,
            type: types[error.response.status] || 'warning',
            message: error.response.data.message || null,
            caption: [error.response.status, ' ', error.response.statusText]
                .join('')
                .toUpperCase() || null,
            icon: null
        })
    }
}

export default utils