<template>
  <div class="sidebar">
    <div class="user-profile">
      <div class="avatar-container">
        <img :src="userInfo.avatar || '/default-avatar.png'" class="avatar" @error="handleImageError" />
        <div class="edit-overlay">
          <i class="el-icon-edit"></i>
        </div>
      </div>
      <h3>{{ userInfo.username || '未登录' }}</h3>
      <div class="status">在线</div>
      <el-button type="text" class="logout-btn" @click="handleLogout">退出登录</el-button>
    </div>
    <nav class="nav-menu">
      <div class="nav-item" :class="{ active: currentView === 'editprofile' }" @click="updateCurrentView('editprofile')">
        <i class="el-icon-user-solid"></i><span>个人中心</span>
      </div>
      <div class="nav-item" :class="{ active: currentView === 'friends' }" @click="updateCurrentView('friends')">
        <i class="el-icon-user"></i><span>好友列表</span>
      </div>
      <div class="nav-item" :class="{ active: currentView === 'ai' }" @click="updateCurrentView('ai')">
        <i class="el-icon-magic-stick"></i><span>AI助手</span>
      </div>
      <div class="nav-item" :class="{ active: currentView === 'notifications' }" @click="updateCurrentView('notifications')">
        <i class="el-icon-bell"></i><span>验证消息</span>
        <el-badge v-if="unreadNotifications" :value="unreadNotifications" class="notification-badge" />
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import router from '@/router';

const props = defineProps({
  currentView: {
    type: String,
    default: 'friends'
  },
  unreadNotifications: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:current-view', 'logout', 'handle-image-error']);

const userInfo = ref({
  avatar: null,
  username: null
});

const fetchUserInfo = async (account) => {
  try {
    const response = await axios.get('http://localhost:8080/api/user/info', {
      params: { account }
    });
    const { avatar, username } = response.data;
    userInfo.value.avatar = avatar;
    userInfo.value.username = username;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    localStorage.removeItem('account');
    localStorage.removeItem('token');
    router.push('/');
  }
};

const updateCurrentView = (view) => {
  console.log('Updating view to:', view);
  emit('update:current-view', view);
};

const handleLogout = () => {
  console.log('退出登录');
  userInfo.value = { avatar: null, username: null };
  localStorage.removeItem('account');
  emit('logout');
};

const handleImageError = (event) => {
  console.log('头像加载失败', event);
  userInfo.value.avatar = '/default-avatar.png';
  emit('handle-image-error', event);
};

onMounted(() => {
  const account = localStorage.getItem('account') || 'defaultAccount';
  fetchUserInfo(account);
});
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.user-profile {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .edit-overlay {
  opacity: 1;
}

.nav-menu {
  padding: 20px 0;
}

.nav-item {
  padding: 15px 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-item:hover {
  background: #f5f5f5;
}

.nav-item.active {
  background: #e6f7ff;
  color: #1890ff;
}

.status {
  color: #52c41a;
  font-size: 14px;
}

.notification-badge {
  margin-left: 5px;
}

.logout-btn {
  margin-top: 10px;
}
</style>