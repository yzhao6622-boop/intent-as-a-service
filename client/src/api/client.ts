import axios from 'axios';

// 动态检测 API URL
function getApiBaseUrl(): string {
  // 如果设置了环境变量，优先使用
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 开发环境且是本地访问，使用代理
  if (import.meta.env.DEV && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  
  // 生产环境或远程访问，自动构建后端地址
  // 使用当前 hostname，后端端口 3002
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3002/api`;
}

const API_BASE_URL = getApiBaseUrl();

// 开发时输出 API 地址，方便调试
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 详细错误日志
    if (error.response) {
      // 服务器返回了响应，但状态码不在 2xx 范围内
      console.error('API错误响应:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('API请求错误: 无响应', {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      // 在设置请求时出错
      console.error('API请求配置错误:', error.message);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
