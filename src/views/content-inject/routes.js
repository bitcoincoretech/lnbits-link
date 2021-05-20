import Foo from '../../components/Foo.vue'
import Bar from '../../components/Bar.vue'
import Loading from '../../components/Loading.vue'
import PayInvoice from '../../components/PayInvoice.vue'

const routes = [{
        path: '/foo',
        component: Foo
    },
    {
        path: '/bar',
        component: Bar
    },
    {
        path: '/payment',
        component: PayInvoice
    },
    {
        path: '/loading',
        component: Loading
    }
]

export default routes