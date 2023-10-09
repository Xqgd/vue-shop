import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect:'/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/home',
    redirect: '/welcome',
    component: Home,
    children: [
      {
        path: '/welcome',
        component: () => import('../views/Welcome.vue')
      },
      {
        path: '/users',
        component: () => import('../components/user/User.vue')
      },
      {
        path: '/rights',
        component: () => import('../components/power/Rights.vue')
      },
      {
        path: '/roles',
        component: () => import('../components/power/Roles.vue')
      },
      {
        path: '/categories',
        component: () => import('../components/goods/Categories.vue')
      },
      {
        path: '/params',
        component: () => import('../components/goods/Params.vue')
      },
      {
        path: '/goods',
        component: () => import('../components/goods/Goods.vue'),
      },
      {
        path: '/goods/add',
        component: () => import('../components/goods/Add.vue')
      },
      {
        path: '/orders',
        component: () => import('../components/orders/Orders.vue')
      },
      {
        path: '/reports',
        component: () => import('../components/reports/Reports.vue')
      }
    
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, form, next) => {
  if (to.path === '/login') return next()
  const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) return next('/login')
  next()
})

export default router
