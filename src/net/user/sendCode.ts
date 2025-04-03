import { defaultFailure, post } from "@/net/base";

//! TODO: module is not used
export function sendCode(email: string, module, success: Function, failure = defaultFailure) {
    post(`/user/code/${module}`, {
        email: email,
    },
        //! TODO: to be deleted
        {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        //! TODO: why not just use "success" as param? failure is same
        (data) => {
            success(data);
        }, (message, code, url) => {
            failure(message, code, url);
        });
}