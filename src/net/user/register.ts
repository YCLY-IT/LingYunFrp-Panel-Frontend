import {defaultFailure, post} from "@/net/base.js";

export interface RegisterData
{
    
}

export function register(username: string, nickname: string, password: string, email: string, code: string,  success: (arg0: any) => void, failure = defaultFailure) {
    post('/user/register', {
        username,
        nickname,
        password,
        email,
        code
    }, {
        'Content-Type': 'application/x-www-form-urlencoded'
    }, (data: any) => {
        success(data);
    }, (message, code, url) => {
        failure(message, code, url);
    });
}