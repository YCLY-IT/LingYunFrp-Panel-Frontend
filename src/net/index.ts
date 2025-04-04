import { login } from "./user/login"
import {register} from "./user/register"
import { forget } from "./user/forget"
import { sendEmailCode, sendSmsCode} from "./user/sendCode"
import { post } from "./base"
import { get } from "./base"

const userApi = {
    login,
    register,
    forget,
    sendEmailCode,
    sendSmsCode,
    post,
    get,
}

export { userApi }