import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // 后端地址
  headers: {
    'Content-Type': 'application/json'
  },
});

export async function loginApi(account, password) { 
  try {
    const response = await api.post('/api/auth/login', {
      account: account, 
      password: password
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('登录请求失败:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || '登录失败，请稍后重试',
    };
  }
}
// 获取用户信息接口
export async function getInfo(account) { 
  try {
    const response = await api.get('/api/user/info', {
      params: { account } // 使用 query 参数传递 account
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('获取用户信息失败:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || '获取用户信息失败，请稍后重试',
    };
  }
}