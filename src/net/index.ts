import { login } from "./user/login"
import {register} from "./user/register"
import { forget } from "./user/forget"
import {sendCode} from "./user/sendCode"
import { post } from "./base"
import { get } from "./base"

const userApi = {
    login,
    register,
    forget,
    sendCode,
    post,
    get,
}

export { userApi }