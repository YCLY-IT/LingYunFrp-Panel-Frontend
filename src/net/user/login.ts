import { post, defaultFailure, storeToken, defaultError } from "../base";

/**
 * 用户登录请求函数
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {boolean} remember - 是否记住登录状态
 * @param {Function} success - 登录成功的回调函数，参数为响应数据
 * @param {Function} [failure=defaultFailure] - 登录失败的回调函数，参数为(错误信息,错误码,请求URL)
 * @description 向服务器发送登录请求，成功后存储token并执行回调
 */
export function login(username: string, password: string, remember: boolean, url: string, success: Function, failure: Function = defaultFailure, error: Function = defaultError) {
    post(`/user/login${url}`, {
        username: username,
        password: password
    },{}, (data: any) => {
        storeToken(data.data.Authorization, remember, data.expires);
        localStorage.setItem('email', data.data.email);
        localStorage.setItem('username', data.data.username);
        localStorage.setItem('remember', remember.toString());
        localStorage.setItem('token', data.data.token);
        success(data);
    }, (message) => {
        failure(message);
    }, (err)=> error(err));
}
