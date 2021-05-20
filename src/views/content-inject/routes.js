import Foo from '../../components/Foo.vue'
import Bar from '../../components/Bar.vue'
import Layout from '../../components/Layout.vue'

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
        component: Layout
    }
]

export default routes