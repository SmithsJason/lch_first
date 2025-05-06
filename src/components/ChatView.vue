<template>
  <div class="app-container">
    <Sidebar
      :current-view="currentView"
      :unread-notifications="unreadNotifications"
      @update:current-view="navigateTo"
      @logout="handleLogout"
      @handle-image-error="handleImageError"
    />
    <div class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="$route.fullPath" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';

const unreadNotifications = ref(3);

const route = useRoute();
const router = useRouter();

const currentView = computed(() => {
  const validViews = ['Chat', 'Friends', 'AI', 'EditProfile'];
  if (validViews.includes(route.name)) {
    return route.name.toLowerCase();
  }
  return '';
});

const navigateTo = (view) => {
  const routes = {
    chat: '/chat',
    friends: '/chat/friends',
    ai: '/chat/ai',
    editprofile: '/chat/profile'
  };
  const path = routes[view] || '/chat';
  console.log('Navigating to:', path);
  router.push(path).catch((err) => {
    console.error('Navigation error:', err);
  });
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('account');
  ElMessage.success('已退出登录');
  router.push('/');
};

const handleImageError = (event) => {
  console.log('头像加载失败', event);
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>