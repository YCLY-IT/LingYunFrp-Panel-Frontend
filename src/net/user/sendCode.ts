import { post } from "@/net/base";

export function sendEmailCode(email: string, module: string) {
    return post(`/user/code/${module}`, { email });
}
export function sendSmsCode(phone: string) {
    return post(`/user/code/${module}`, {
        phone: phone,
    });
}