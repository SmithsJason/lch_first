<template>
  <div class="friend-view">
    <div class="tabs">
      <button v-for="tabOption in tabs" :key="tabOption.id" :class="{ active: tab === tabOption.id }"
        @click="tab = tabOption.id">
        {{ tabOption.label }}
      </button>
    </div>
    <div v-if="tab === 'groups'" class="section">
      <h2>群聊列表</h2>
      <div v-if="isLoadingGroups" class="loading">加载中...</div>
      <ul v-else-if="groups.length">
        <li v-for="group in groups" :key="group.id" @click="enterGroupHandler(group)" style="cursor: pointer;">
          <span>{{ group.name }} (ID: {{ group.id }})</span>
        </li>
      </ul>
      <p v-else>暂无群聊</p>
    </div>
    <div v-if="tab === 'search'" class="section">
      <h2>搜索用户</h2>
      <input ref="searchInput" v-model.trim="searchQuery" placeholder="输入用户名或账号" @input="onInput" />
      <div v-show="isSearching" class="loading">搜索中...</div>
      <div v-show="!isSearching">
        <ul v-if="searchResults.length">
          <li v-for="user in searchResults" :key="user.account">
            <div class="user-info">
              <!--远程存储oss过期，先使用本地图片进行展示-->
              <!-- <img :src="user.avatar || defaultAvatar" :alt="`${user.username}的头像`" class="avatar"
                @error="handleImageError($event, user)"  -->
              <img :src="defaultAvatar" :alt="`${user.username}的头像`" class="avatar"
                />
              {{ user.username }} ({{ user.account }})
            </div>
            <div class="action-group">
              <input v-model="user.message" placeholder="附言（可选）" class="message-input" />
              <button @click="sendFriendRequestHandler(user)" :disabled="user.isSending">
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
      <button @click="markAllReadHandler" :disabled="!notifications.length || isMarkingAllRead">
        {{ isMarkingAllRead ? '处理中...' : '全部标记为已读' }}
      </button>
      <ul v-if="notifications.length">
        <li v-for="request in notifications" :key="request.id">
          <div class="notification-content">
            <!--远程存储oss过期，先使用本地图片进行展示-->
            <!-- <img :src="request.senderAvatar || defaultAvatar" :alt="`${request.senderUsername || '用户'}的头像`"
              class="avatar" @error="handleImageError($event, request, 'senderAvatar')" /> -->
              <img :src="request.senderAvatar || defaultAvatar" :alt="`${request.senderUsername || '用户'}的头像`"
              class="avatar"  />
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
              <button @click="handleFriendRequestHandler(request, 'accepted')" :disabled="request.isProcessing">
                {{ request.isProcessing ? '处理中...' : '接受' }}
              </button>
              <button @click="handleFriendRequestHandler(request, 'rejected')" :disabled="request.isProcessing">
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
      <button @click="showCreateGroupDialog = true" class="create-group-btn">创建群聊</button>
      <el-dialog v-model="showCreateGroupDialog" title="创建群聊">
        <el-input v-model="groupName" placeholder="请输入群聊名称" />
        <el-checkbox-group v-model="selectedFriends">
          <el-checkbox v-for="friend in friends" :key="friend.account" :label="friend.account">
            {{ friend.username }}
          </el-checkbox>
        </el-checkbox-group>
        <template #footer>
          <el-button @click="showCreateGroupDialog = false">取消</el-button>
          <el-button type="primary" @click="createGroupHandler">创建</el-button>
        </template>
      </el-dialog>
      <ul v-if="friends.length">
        <li v-for="friend in friends" :key="friend.account">
          <div class="user-info">
            <img :src="friend.avatar || defaultAvatar" :alt="`${friend.username}的头像`" class="avatar"
              @error="handleImageError($event, friend)" />
            {{ friend.username }} ({{ friend.account }})
          </div>
          <div class="action-group">
            <button @click="enterChatHandler(friend)">
              进入聊天
            </button>
            <button @click="removeFriendHandler(friend)" :disabled="friend.isRemoving">
              {{ friend.isRemoving ? '删除中...' : '删除好友' }}
            </button>
          </div>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import axios from 'axios';

// 当前用户账号
const currentAccount = ref(localStorage.getItem('account') || '');

// 常量
const tabs = [
  { id: 'friends', label: '好友列表' },
  { id: 'groups', label: '群聊列表' },
  { id: 'search', label: '搜索用户' },
  { id: 'notifications', label: '通知' },
];
// 使用本地默认头像
const defaultAvatar = new URL('@/assets/img/001.jpg', import.meta.url).href;

const tab = ref('search');
const searchQuery = ref('');
const searchResults = ref([]);
const notifications = ref([]);
const friends = ref([]);
const isSearching = ref(false);
const isMarkingAllRead = ref(false);
const searchInput = ref(null);
const router = useRouter();
const showCreateGroupDialog = ref(false);
const groupName = ref('');
const selectedFriends = ref([]);
const groups = ref([]);
const isLoadingGroups = ref(false);

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
    searchResults.value = users.map((user) =>
      reactive({
        ...user,
        isSending: false,
        message: '',
      })
    );
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
    const data = await sendFriendRequest(
      currentAccount.value,
      user.account,
      user.message
    );
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
    const data = await handleFriendRequest(
      request.id,
      action,
      currentAccount.value
    );
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
  try {
    await ElMessageBox.confirm(`确定要删除好友 ${friend.username} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    friend.isRemoving = true;
    const data = await removeFriend(currentAccount.value, friend.account);
    ElMessage.success(data.message);
    await fetchFriendsHandler();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除好友失败');
    }
  } finally {
    friend.isRemoving = false;
  }
};

const enterChatHandler = (friend) => {
  router.push({ name: 'Chat', params: { account: friend.account } });
};

const createGroupHandler = async () => {
  // 验证群聊名称
  if (!groupName.value || groupName.value.trim() === '') {
    ElMessage.error('请输入有效的群聊名称');
    return;
  }

  // 验证成员列表（至少包含当前用户或其他成员）
  if (selectedFriends.value.length === 0 && !currentAccount.value) {
    ElMessage.error('请至少选择一名成员或确保已登录');
    return;
  }

  // 构造成员列表，包含当前用户（如果后端要求）
  const members = [...selectedFriends.value];
  if (currentAccount.value && !members.includes(currentAccount.value)) {
    members.push(currentAccount.value); // 添加当前用户
  }

  // 构造请求体
  const requestBody = {
    name: groupName.value.trim(),
    members: members,
  };

  try {
    const res = await axios.post(
      'http://localhost:8080/api/group/create',
      requestBody
    );

    if (res.data.code === 200) {
      ElMessage.success('群聊创建成功');
      showCreateGroupDialog.value = false;
      groupName.value = ''; // 清空表单
      selectedFriends.value = []; // 清空选择
      await fetchGroupsHandler(); // 刷新群聊列表
      router.push({ name: 'GroupChat', params: { groupId: res.data.data } });
    } else {
      ElMessage.error(res.data.message || '创建群聊失败');
    }
  } catch (e) {
    console.error('创建群聊错误:', e.response?.data || e.message);
    ElMessage.error(e.response?.data?.message || '创建群聊失败，请检查网络或服务器');
  }
};

const fetchGroupsHandler = async () => {
  isLoadingGroups.value = true;
  try {
    const account = localStorage.getItem('account');
    if (!account) {
      throw new Error('未登录，请先登录');
    }
    const res = await axios.get('http://localhost:8080/api/group/list', {
      params: { account },
    });
    groups.value = res.data.groups || [];
  } catch (e) {
    console.error('获取群聊列表错误:', e.response?.data || e.message);
    groups.value = [];
    ElMessage.error('获取群聊列表失败');
  } finally {
    isLoadingGroups.value = false;
  }
};

const enterGroupHandler = (group) => {
  if (!group || !group.id) {
    ElMessage.error('无法进入群聊:群组ID缺失');
    return;
  }
  router.push({ name: 'GroupChat', params: { id: group.id } });
};

watch(tab, (newTab) => {
  if (newTab === 'groups') {
    fetchGroupsHandler();
  }
});

// 生命周期
onMounted(async () => {
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
  color: #28a745;
  /* Green for accepted */
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

.create-group-btn {
  margin-bottom: 20px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.create-group-btn:hover:not(:disabled) {
  background: #0056b3;
}
</style>