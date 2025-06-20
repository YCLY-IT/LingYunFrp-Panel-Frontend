import axios from 'axios';
import { Window } from '@/types'
import packageData from '@/../package.json'

const api = axios.create({
    baseURL: '/api',
    headers: {
        //* NOTE: defalut content-type is set
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});

const defaultFailure = (messageText: string) => {
    //! TODO: only console warning, don't show message here
    window.$message?.warning(messageText);
    window.$loadingBar?.error()
};


const defaultError = (err: any) => {
    //! TODO: only console error, don't show message here
    console.error(err);
    if (err.response) {
        if (err.response.data.code === 2) {
            window.$dialog?.error({
                title: '提示',
                content: '登录信息已过期，请重新登录',
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: () => {
                    removeToken();
                    window.location.href = '/login';
                }
            });
        }
    }
    window.$message?.error(err.response?.data?.message || '请求失败，请稍后重试');
    window.$loadingBar?.error()
};

//! TODO: Specifies the params and return value type
function storeToken(Authorization, remember, expires) {
    const token = {
        Authorization: Authorization,
        remember: remember,
        expires: expires
    };
    const tokenStr = JSON.stringify(token);
    if (remember) {
        localStorage.setItem('Authorization', tokenStr);
    } else {
        sessionStorage.setItem('Authorization', tokenStr);
    }
}

//! TODO: Specifies the return value type
function getToken() {
    const tokenStr = localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization');
    if (tokenStr) {
        const token = JSON.parse(tokenStr);
        if (token.expires && token.expires < new Date().getTime()) {
            removeToken();
            //! TODO: only return error, don't show message here
            window.$message?.error('登录信息已过期，请重新登录');
            return null;
        }
        return token.Authorization;
    }
    return null;
}

function removeToken() {
    localStorage.removeItem('Authorization');
    sessionStorage.removeItem('Authorization');
}

//! TODO: why the return value has two type(string or Object)?
declare const window: Window

function accessHandle() {
    
   return {
    'Authorization': `${getToken()}`
};

}

//! TODO: use promise instead of callback
function post(url: string, data: any, headers: Record<string, string | number>, success: Function, failure = defaultFailure, error = defaultError) {
    window.$loadingBar?.start();
    api.post(url, data, {
        headers
    }).then(({ data }) => {
        if (data.code === 0) {
            success(data);
        } else if (data.code === 2) {
            window.$dialog?.error({
                title: '提示',
                content: '登录信息已过期，请重新登录',
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: () => {
                    removeToken();
                    window.location.href = '/login';
                }
            });
            failure(data.message); 
        } else {
            failure(data.message);
        }
    }).catch(err => error(err));
}

//! TODO: use promise instead of callback
function get(url: string, headers: Record<string, string>, success: Function, failure = defaultFailure, error = defaultError) {
    window.$loadingBar?.start();
    api.get(url, {
        headers
    }).then(({ data }) => {
        if(!data.code){
            success(data);
            window.$loadingBar?.finish()
            return;
        }
        if (data.code === 0) {
            success(data);
            window.$loadingBar?.finish()
        }else if (data.code === 2) {
            window.$dialog?.error({
                title: '提示',
                content: '登录信息已过期，请重新登录',
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: () => {
                    removeToken();
                    window.location.href = '/login';
                }
            });
            failure(data.message); 
        } else {
            failure(data.message);
        }
        window.$loadingBar?.finish();
    }).catch(err => error(err));
}

function unauthorized() {
    return !getToken();
}

export { api, defaultFailure, defaultError, storeToken, getToken, accessHandle, removeToken, post, get, unauthorized }