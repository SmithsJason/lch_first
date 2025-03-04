import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true }
    }
  ]
})

// router.beforeEach((to, from, next) => {
//   const isAuthenticated = localStorage.getItem('user')
  
//   if (to.meta.requiresAuth && !isAuthenticated) {
//     next({ name: 'login' })
//   } else {
//     next()
//   }
// })

export default router