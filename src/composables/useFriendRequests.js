import { ref } from 'vue';
import axios from 'axios';

export function useFriendRequests(currentAccount) {
  const error = ref(null);
  const loading = ref(false);

  const handleRequest = async (url, method = 'get', data = {}) => {
    try {
      loading.value = true;
      const response = await axios({
        method,
        url: `http://localhost:8080/api${url}`,
        data: { ...data, senderAccount: currentAccount }
      });
      return response.data;
    } catch (err) {
      error.value = {
        message: err.response?.data?.message || '请求失败，请稍后重试',
        code: err.response?.status || 500
      };
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const sendFriendRequest = (receiverAccount, message) => 
    handleRequest('/friend-requests/send', 'post', { receiverAccount, message });

  const handleFriendRequest = (requestId, action) =>
    handleRequest(`/friend-requests/${requestId}/${action}`, 'post');

  return {
    sendFriendRequest,
    handleFriendRequest,
    loading,
    error
  };
}