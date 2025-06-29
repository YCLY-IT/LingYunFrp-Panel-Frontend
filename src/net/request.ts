import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import router from '@/router';
// 定义统一的错误类型
export interface ApiError {
  message: string;
  [key: string]: any;
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

declare const window: Window

let isAlerting = false; // 防止多次弹窗

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      if (!isAlerting) {
        isAlerting = true;
        // 这里用 window，因为 setup 里没法直接用 useMessage/useRouter
        window.$message?.error?.('登录信息已过期，请重新登录');
        // 弹窗
        window.$dialog?.warning?.({
          title: '登录失效',
          content: '登录信息已过期，请重新登录',
          positiveText: '确定',
          onPositiveClick: () => {
            isAlerting = false;
            // 清除本地token等
            localStorage.clear();
            sessionStorage.clear();
            // 跳转登录页
            router.push('/login');
          }
        });
      }
      // 这里改成 reject
      return Promise.reject({
        code: 1,
        message: '未登录或登录失效',
        data: null
      });
    }
    
    // 统一处理错误，确保返回的对象有message属性
    const errorData = error.response?.data || error;
    const errorMessage = errorData?.message || errorData?.error || '请求失败';
    
    return Promise.reject({
      message: errorMessage,
      ...errorData
    } as ApiError);
  }
);

export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return api.get(url, config).then(res => res.data);
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return api.post(url, data, config).then(res => res.data);
}

export default api; 