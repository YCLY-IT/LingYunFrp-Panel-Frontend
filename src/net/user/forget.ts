import { defaultErrorFunc, post } from "@/net/base.js";
export function forget(email: string, password: string, code:string,errFunc = defaultErrorFunc) {
    return new Promise((resolve,reject)=>{
        post('/user/forget', {
            email: email,
            password: password,
            code: code
        }).then((data) => {
            if(data.code === 0)
                resolve(data);
            else
                reject(data);            
        }).catch(errFunc);
    });
}