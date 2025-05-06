// src/api/friends.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const fetchNotifications = async (account) => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      params: { account },
    });
    return response.data.map(notification => {
      const avatar = notification.senderAvatar || 'https://via.placeholder.com/40';
      return {
        ...notification,
        isProcessing: false,
        senderAvatar: avatar,
      };
    });
  } catch (error) {
    console.error('获取通知错误:', error);
    throw new Error('获取通知失败');
  }
};

export const searchUsers = async (query, currentAccount) => {
  try {
    const response = await axios.get(`${API_URL}/users/search`, {
      params: { query, currentAccount },
    });
    return response.data.map(user => ({
      ...user,
      message: '',
      isSending: false,
      avatar: user.avatar || 'https://via.placeholder.com/40',
    }));
  } catch (error) {
    console.error('搜索用户错误:', error);
    throw new Error('搜索用户失败');
  }
};

export const sendFriendRequest = async (senderAccount, receiverAccount, message) => {
  try {
    const response = await axios.post(`${API_URL}/friend-requests/send`, {
      senderAccount,
      receiverAccount,
      message,
    });
    return response.data;
  } catch (error) {
    console.error('发送好友请求错误:', error);
    throw new Error('发送好友请求失败');
  }
};

export const handleFriendRequest = async (requestId, action, account) => {
  console.log(`处理好友请求: ${requestId}, 操作: ${action}, 账户: ${account}`);
  try {
    const response = await axios.post(`${API_URL}/friend-requests/${requestId}/${action}`, {
      account,
    });
    console.log(`${action}好友请求成功:`, response.data);
    return response.data;
   
  } catch (error) {
    console.error(`${action}好友请求错误:`, error);
    throw new Error(`处理好友请求失败`);
  }
};

export const markAllRead = async (account) => {
  try {
    const response = await axios.post(`${API_URL}/notifications/mark-all-read`, {
      account,
    });
    return response.data;
  } catch (error) {
    console.error('标记全部已读错误:', error);
    throw new Error('标记已读失败');
  }
};

export const fetchFriends = async (account) => {
  try {
    const response = await axios.get(`${API_URL}/friends`, {
      params: { account },
    });
    return response.data.map(friend => ({
      ...friend,
      isRemoving: false,
      avatar: friend.avatar || 'https://via.placeholder.com/40',
    }));
  } catch (error) {
    console.error('获取好友列表错误:', error);
    throw new Error('获取好友列表失败');
  }
};

export const removeFriend = async (userAccount, friendAccount) => {
  try {
    const response = await axios.delete(`${API_URL}/friends/remove`, {
      params: { userAccount, friendAccount },
    });
    return response.data;
  } catch (error) {
    console.error('删除好友错误:', error);
    throw new Error('删除好友失败');
  }
};