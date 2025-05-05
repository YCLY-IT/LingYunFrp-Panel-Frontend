import { login } from "./user/login";
import {register} from "./user/register";
import { forget } from "./user/forget";
import { sendEmailCode, sendSmsCode} from "./user/sendCode";

const userApi = {
    login,
    register,
    forget,
    sendEmailCode,
    sendSmsCode,
};

export { userApi };