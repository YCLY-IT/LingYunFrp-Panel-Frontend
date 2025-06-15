import { defaultFailure, post } from "@/net/base.js";

//! TODO: 
export function forget(email: string, password: string, code, url: string, success: Function, failure = defaultFailure) {
    post(`/user/forget${url}`, {
        email: email,
        password: password,
        code: code
    }, 
    //! TODO: delete
    {
        'Content-Type': 'application/x-www-form-urlencoded'
    }, 
    //! TODO: just success as param
    (data) => {
        success(data);
    }, (message) => {
        failure(message);
    });
}