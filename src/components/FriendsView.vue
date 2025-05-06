<template>
  <div class="friend-view">
    <div class="tabs">
      <button
        v-for="tabOption in tabs"
        :key="tabOption.id"
        :class="{ active: tab === tabOption.id }"
        @click="tab = tabOption.id"
      >
        {{ tabOption.label }}
      </button>
    </div>
    <div v-if="tab === 'search'" class="section">
      <h2>搜索用户</h2>
      <input
        ref="searchInput"
        v-model.trim="searchQuery"
        placeholder="输入用户名或账号"
        @input="onInput"
      />
      <div v-show="isSearching" class="loading">搜索中...</div>
      <div v-show="!isSearching">
        <ul v-if="searchResults.length">
          <li v-for="user in searchResults" :key="user.account">
            <div class="user-info">
              <img
                :src="user.avatar || defaultAvatar"
                :alt="`${user.username}的头像`"
                class="avatar"
                @error="handleImageError($event, user)"
              />
              {{ user.username }} ({{ user.account }})
            </div>
            <div class="action-group">
              <input
                v-model="user.message"
                placeholder="附言（可选）"
                class="message-input"
              />
              <button
                @click="sendFriendRequestHandler(user)"
                :disabled="user.isSending"
              >
                {{ user.isSending ? '发送中...' : '发送好友请求' }}
              </button>
            </div>
          </li>
        </ul>
        <p v-else-if="searchQuery && !isSearching">无搜索结果</p>
      </div>
    </div>
    <div v-if="tab === 'notifications'" class="section">
      <h2>通知</h2>
      <button
        @click="markAllReadHandler"
        :disabled="!notifications.length || isMarkingAllRead"
      >
        {{ isMarkingAllRead ? '处理中...' : '全部标记为已读' }}
      </button>
      <ul v-if="notifications.length">
        <li v-for="request in notifications" :key="request.id">
          <div class="notification-content">
            <img
              :src="request.senderAvatar || defaultAvatar"
              :alt="`${request.senderUsername || '用户'}的头像`"
              class="avatar"
              @error="handleImageError($event, request, 'senderAvatar')"
            />
            <div class="notification-details">
              <span>{{ request.senderUsername || '未知用户' }} ({{ request.senderAccount }}) 请求添加你为好友</span>
              <p v-if="request.message" class="message">附言: {{ request.message }}</p>
              <p v-if="request.createTime" class="timestamp">申请时间: {{ formatTime(request.createTime) }}</p>
            </div>
          </div>
          <div class="action-group">
            <span v-if="request.status === 'accepted'" class="status-text">已接受</span>
            <span v-else-if="request.status === 'rejected'" class="status-text">已拒绝</span>
            <template v-else>
              <button
                @click="handleFriendRequestHandler(request, 'accepted')"
                :disabled="request.isProcessing"
              >
                {{ request.isProcessing ? '处理中...' : '接受' }}
              </button>
              <button
                @click="handleFriendRequestHandler(request, 'rejected')"
                :disabled="request.isProcessing"
              >
                {{ request.isProcessing ? '处理中...' : '拒绝' }}
              </button>
            </template>
          </div>
        </li>
      </ul>
      <p v-else>暂无通知</p>
    </div>
    <div v-if="tab === 'friends'" class="section">
      <h2>好友列表</h2>
      <ul v-if="friends.length">
        <li v-for="friend in friends" :key="friend.account">
          <div class="user-info">
            <img
              :src="friend.avatar || defaultAvatar"
              :alt="`${friend.username}的头像`"
              class="avatar"
              @error="handleImageError($event, friend)"
            />
            {{ friend.username }} ({{ friend.account }})
          </div>
          <button
            @click="removeFriendHandler(friend)"
            :disabled="friend.isRemoving"
          >
            {{ friend.isRemoving ? '删除中...' : '删除好友' }}
          </button>
        </li>
      </ul>
      <p v-else>暂无好友</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import {
  searchUsers,
  sendFriendRequest,
  fetchNotifications,
  handleFriendRequest,
  markAllRead,
  fetchFriends,
  removeFriend,
} from '@/api/friends';
import { ElMessage } from 'element-plus';

const currentAccount = ref(localStorage.getItem('account') || '');
// 常量
const tabs = [
  { id: 'friends', label: '好友列表' },
  { id: 'search', label: '搜索用户' },
  { id: 'notifications', label: '通知' },
];
const defaultAvatar = 'https://via.placeholder.com/40';

// 状态
const tab = ref('search');
const searchQuery = ref('');
const searchResults = ref([]);
const notifications = ref([]);
const friends = ref([]);
const isSearching = ref(false);
const isMarkingAllRead = ref(false);
const searchInput = ref(null);

// 计算属性
const hasNotifications = computed(() => notifications.value.length > 0);

// 处理图片加载错误
const handleImageError = (event, item, avatarKey = 'avatar') => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`头像加载失败: ${item[avatarKey] || '无URL'}, 使用默认头像`);
  }
  event.target.src = defaultAvatar;
  item[avatarKey] = defaultAvatar;
};

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');
};

// 搜索处理
const performSearch = async (query) => {
  if (!query) {
    searchResults.value = [];
    isSearching.value = false;
    return;
  }
  if (!currentAccount.value) {
    ElMessage.error('未登录，请先登录');
    searchResults.value = [];
    isSearching.value = false;
    return;
  }
  isSearching.value = true;
  try {
    const users = await searchUsers(query, currentAccount.value);
  
    searchResults.value = users.map(user => reactive({
      ...user,
      isSending: false,
      message: '',
    }));
  } catch (error) {
    console.error('搜索错误:', error);
    ElMessage.error(error.message || '搜索失败，请稍后重试');
    searchResults.value = [];
  } finally {
    isSearching.value = false;
    if (searchInput.value) {
      searchInput.value.focus();
    }
  }
};

// 监听输入事件
const onInput = () => {};

// 监听搜索查询变化，延迟 0.1 秒触发
let searchTimeout = null;
watch(searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    performSearch(newQuery);
  }, 100);
});

// 方法
const sendFriendRequestHandler = async (user) => {
  user.isSending = true;
  try {
    const data = await sendFriendRequest(currentAccount.value, user.account, user.message);
    ElMessage.success(data.message);
    user.message = '';
  } catch (error) {
    ElMessage.error(error.message || '发送请求失败');
  } finally {
    user.isSending = false;
  }
};

const fetchNotificationsHandler = async () => {
  if (!currentAccount.value) {
    ElMessage.error('未登录，请先登录');
    return;
  }
  try {
    notifications.value = await fetchNotifications(currentAccount.value);
  } catch (error) {
    ElMessage.error(error.message || '获取通知失败');
  }
};

const handleFriendRequestHandler = async (request, action) => {
  request.isProcessing = true;
  try {
    const data = await handleFriendRequest(request.id, action, currentAccount.value);
    ElMessage.success(data.message);
    await Promise.all([
      fetchNotificationsHandler(),
      action === 'accepted' ? fetchFriendsHandler() : Promise.resolve(),
    ]);
  } catch (error) {
    ElMessage.error(error.message || '处理请求失败');
  } finally {
    request.isProcessing = false;
  }
};

const markAllReadHandler = async () => {
  if (!hasNotifications.value) return;
  if (!currentAccount.value) {
    ElMessage.error('未登录，请先登录');
    return;
  }
  isMarkingAllRead.value = true;
  try {
    const data = await markAllRead(currentAccount.value);
    ElMessage.success(data.message);
    await fetchNotificationsHandler();
  } catch (error) {
    ElMessage.error(error.message || '标记已读失败');
  } finally {
    isMarkingAllRead.value = false;
  }
};

const fetchFriendsHandler = async () => {
  if (!currentAccount.value) {
    ElMessage.error('未登录，请先登录');
    return;
  }
  try {
    friends.value = await fetchFriends(currentAccount.value);
  } catch (error) {
    ElMessage.error(error.message || '获取好友列表失败');
  }
};

const removeFriendHandler = async (friend) => {
  friend.isRemoving = true;
  console.log('删除好友:', currentAccount.value, friend.account);
  try {
    const data = await removeFriend(currentAccount.value, friend.account);
    ElMessage.success(data.message);
    await fetchFriendsHandler();
  } catch (error) {
    ElMessage.error(error.message || '删除好友失败');
  } finally {
    friend.isRemoving = false;
  }
};

// 生命周期
onMounted(async () => {
  if (!currentAccount.value) {
    ElMessage.error('未登录，请先登录');
    return;
  }
  await Promise.all([fetchFriendsHandler(), fetchNotificationsHandler()]);
});
</script>

<style scoped>
.notification-details {
  display: flex;
  flex-direction: column;
}

.timestamp {
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

/* Existing styles */
.status-text {
  color: #28a745; /* Green for accepted */
  font-weight: 500;
}

.friend-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.tabs button {
  flex: 1;
  padding: 12px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
}

.tabs button.active {
  background: #007bff;
  color: white;
  transform: translateY(-2px);
}

.section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.message-input {
  width: 200px;
  margin: 0 10px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info,
.notification-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.notification-content .message {
  margin-left: 50px;
  margin-top: 5px;
  color: #666;
}

.action-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

.loading {
  text-align: center;
  color: #666;
  padding: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  vertical-align: middle;
}
</style>