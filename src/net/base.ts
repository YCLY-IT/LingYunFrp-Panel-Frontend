import { ApiRespond } from '@/types/net/base';
import axios from 'axios';
import { createDiscreteApi } from 'naive-ui'; // 新增离散式API

const api = axios.create({
    baseURL: 'http://localhost:8081/',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});
const { message } = createDiscreteApi(
    ['message'],
    {
        messageProviderProps: {
            duration: 4500
        }
    }
);

const defaultErrorFunc = (err: Error) => {
    console.error(err);
    message.error('发生了一些小问题,要不试试刷新一下（＾ω＾）');
};

//! TODO: Specifies the params and return value type
function storeToken(Authorization: string, remember: boolean, expires) {
    const token = {
        Authorization,
        remember: remember,
        expires: expires
    };
    const tokenStr = JSON.stringify(token);
    if (remember) {
        localStorage.setItem('token', tokenStr);
    } else {
        sessionStorage.setItem('token', tokenStr);
    }
}

function getToken(): string | null {
    const tokenStr = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (tokenStr) {
        const token = JSON.parse(tokenStr);
        if (token.expires && token.expires < new Date().getTime()) {
            removeToken();
            message.warning('登录信息已过期，请重新登录');
            return null;
        }
        return token.Authorization;
    }
    return null;
}

function removeToken() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
}

function accessHandle() {
    return {
        'Authorization': getToken()
    };
}

/**
 * 
 * @param url 请求路径 
 * @param data 数据
 * @param headers 头
 * @param errFunc 错误函数，**仅在请求出错时使用**
 * @returns 
 */
function post(url: string, data: Record<string, unknown>, headers?: Record<string, string | number>, options?: Record<string, string | number>, errFunc = defaultErrorFunc) {
    return new Promise<ApiRespond>((resolve, reject) => {
        api.post(url, data, {
            headers,
            ...options
        }).then(({ data }: { data: ApiRespond }) => {
            if (data.code === 0) {
                resolve(data);
            } else {
                reject(data);
            }
        }).catch(err => errFunc(err));
    });
}

function get(url: string, headers: Record<string, string>, errFunc = defaultErrorFunc) {
    return new Promise((resolve, reject) => {
        api.get(url, {
            headers: headers
        }).then(({ data }) => {
            if (data.code === 0) {
                resolve(data);
            } else {
                reject(data);
            }
        }).catch(err => errFunc(err));
    });
}

function unauthorized() {
    return !getToken();
}

export { api, storeToken, getToken, accessHandle, removeToken, post, get, unauthorized, defaultErrorFunc };