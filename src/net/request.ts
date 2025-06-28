import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  error => {
    if (error.response?.code === 2) {
      // 抛出自定义错误，调用方捕获后自行处理 UI
      return Promise.reject(new Error('登录信息已过期，请重新登录'));
    }
    return Promise.reject(error.response);
  }
);

export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return api.get(url, config).then(res => res.data);
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return api.post(url, data, config).then(res => res.data);
}

export default api; 