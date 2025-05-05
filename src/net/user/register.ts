import { defaultErrorFunc, post } from "@/net/base.js";
import { UserRegisterApiRespond } from "@/types/net/user";

export function register(username: string, nickname: string, password: string, email: string, code: string) {
    return new Promise<UserRegisterApiRespond>((resolve, reject) => {
        post('/user/register', {
            username,
            nickname,
            password,
            email,
            code
        }).then((data) => {
            if (data.code === 0) {
                resolve(data);
            } else {
                reject(data);
            }
        }).catch(defaultErrorFunc);
    });
}