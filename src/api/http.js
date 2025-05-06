import axios from 'axios'
import { ElMessage} from 'element-plus'

const http = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
})

http.interceptors.request.use(
  (config) => {
    if (useUserStore().token) {
      config.headers['authorization'] = `${useUserStore().token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          break;
        default:
          ElMessage.error(error.response.data.message || '服务器错误')
      }
    }
    return Promise.reject(error)
  }
)

export default http
