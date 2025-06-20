import {accessHandle, defaultFailure, defaultError, post} from "@/net/base";

//! TODO: module is not used
export function sendEmailCode(email: string, module, success: Function, failure = defaultFailure, error = defaultError) {
    post(`/user/code/${module}`, {
        email: email,
    },{},
        //! TODO: why not just use "success" as param? failure is same
        (data) => {
            success(data);
        }, (message) => {
            failure(message);
        },
        (err) => {
            error(err);
        }
    );
}
export function sendSmsCode(phone: string, module, success: Function, failure = defaultFailure, error = defaultError) {
    post(`/user/code/${module}`, {
        phone: phone,
    },
        //! TODO: to be deleted
        accessHandle(),
        //! TODO: why not just use "success" as param? failure is same
        (data) => {
            success(data);
        }, (message) => {
           failure(message);
        },
        (err) => {
            error(err);
        }
    )
}