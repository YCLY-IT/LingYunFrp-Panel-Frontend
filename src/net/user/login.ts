import { UserLoginApiRespond } from "@/types/net/user";
import { post, storeToken } from "../base";

/**
 * 用户登录请求函数
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {boolean} remember - 是否记住登录状态
 * @description 向服务器发送登录请求，成功后存储token并执行回调
 */
export function login(username: string, password: string, remember: boolean) {
    return new Promise((resolve, reject) => {
        post('/user/login', {
            username: username,
            password: password
        }).then(({ data }: { data: UserLoginApiRespond }) => {
            storeToken(data., remember, data.expires);
            resolve(data);
        }, reject);
    });
}
