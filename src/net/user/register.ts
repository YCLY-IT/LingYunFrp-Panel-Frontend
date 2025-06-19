import {defaultFailure, post} from "@/net/base.js";

export interface RegisterData
{
    
}

export function register(username: string, nickname: string, password: string, email: string, code: string, url: string,  success: (arg0: any) => void, failure = defaultFailure) {
    post(`/user/register${url}`, {
        username,
        nickname,
        password,
        email,
        code,
    },{}, (data: any) => {
        if (data.code === 0) {
            success(data);
        }else {
            failure(data.message);
        }

    }, (message) => {
        failure(message);
    }, (err) => {
        failure(err);
    });
}