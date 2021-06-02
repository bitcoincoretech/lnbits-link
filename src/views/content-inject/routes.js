import Loading from '../../components/Loading.vue'
import PayInvoice from '../../components/PayInvoice.vue'

const routes = [{
        path: '/payment',
        component: PayInvoice
    },
    {
        path: '/loading',
        component: Loading
    }
]

export default routes