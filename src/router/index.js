import { createRouter, createWebHistory } from 'vue-router';
import Chat from '../components/ChatView.vue';

const routes = [
  {
    path: '/chat',
    component: Chat,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'friends',
        name: 'Friends',
        component: () => import('@/components/FriendsView.vue')
      },
      {
        path: 'ai',
        name: 'AI',
        component: () => import('@/components/AIView.vue')
      },
      {
        path: 'profile',
        name: 'EditProfile',
        component: () => import('@/components/EditProfile.vue')
      },
      {
        path: ':friendAccount',
        name: 'ChatWindow',
        component: () => import('@/components/ChatWindow.vue')
      }
    ]
  },
  {
    path: '/',
    name: 'Login',
    component: () => import('@/components/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/components/Register.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/components/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.afterEach((to) => {
  const titles = {
    EditProfile: '编辑资料',
    Chat: '聊天',
    Friends: '好友',
    AI: 'AI助手',
    ChatWindow: '聊天',
    Login: '登录',
    Register: '注册',
    NotFound: '页面未找到'
  };
  document.title = titles[to.name] || '聊天系统';
});

export default router;