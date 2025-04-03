import { defaultFailure, post } from "@/net/base.js";

//! TODO: 
export function forget(email: string, password: string, code, success: Function, failure = defaultFailure) {
    post('/user/forget', {
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
    }, (message, code, url) => {
        failure(message, code, url);
    });
}