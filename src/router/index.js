import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: () => import('@/views/tabbar-layout'),
      children: [
        {
          name: 'home',
          path: '/',
          component: () => import('@/views/home')
        }
      ]
    },

    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/login')
    },
    {
      name: 'test',
      path: '/test',
      component: () => import('@/views/test')
    }
  ]
})
