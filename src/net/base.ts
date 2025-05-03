import axios from 'axios';
import { Window } from '@/types'

const api = axios.create({
    baseURL: 'http://localhost:8081/',
    headers: {
        //* NOTE: defalut content-type is set
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});

const defaultFailure = (messageText: string, code: number, url: string) => {
    //! TODO: only console warning, don't show message here
    window.$message?.warning(`${messageText}`);
};


const defaultError = (err: Error) => {
    //! TODO: only console error, don't show message here
    console.error(err);
    window.$message?.error(`发生了一些小问题,要不试试刷新一下（＾ω＾）`);
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
        localStorage.setItem('token', tokenStr);
    } else {
        sessionStorage.setItem('token', tokenStr);
    }
}

//! TODO: Specifies the return value type
function getToken() {
    const tokenStr = localStorage.getItem('token') || sessionStorage.getItem('token');
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
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
}

//! TODO: why the return value has two type(string or Object)?
declare const window: Window

function accessHandle() {
    //! TODO: what the type of token? string or Object
    const token = getToken();
    return token ? {
        //! TODO:                only can be string
        'Authorization': `${getToken()}`
    } : {};
    
    // 在请求开始时显示加载条
    window.$loadingBar?.start()
    
   return {
    'Authorization': `${getToken()}`
};

}

//! TODO: use promise instead of callback
function post(url: string, data: any, headers: Record<string, string | number>, success: Function, failure = defaultFailure, error = defaultError) {
    api.post(url, data, {
        headers
    }).then(({ data }) => {
        if (data.code === 0) {
            success(data);
        } else {
            failure(data.message, data.code, data.url);
        }
    }).catch(err => error(err));
}

//! TODO: use promise instead of callback
function get(url: string, headers: Record<string, string>, success: Function, failure = defaultFailure, error = defaultError) {
    api.get(url, {
        headers: headers
    }).then(({ data }) => {
        if (data.code === 0) {
            success(data);
            window.$loadingBar?.finish()
        } else {
            failure(data.message, data.code, data.url);
            window.$loadingBar?.error()
        }
    }).catch(err => error(err));
}

function unauthorized() {
    return !getToken();
}

export { api, defaultFailure, defaultError, storeToken, getToken, accessHandle, removeToken, post, get, unauthorized }