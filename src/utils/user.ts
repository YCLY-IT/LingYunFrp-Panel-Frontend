import { LoginInfo, UserInfoStore } from "@/net/user/type";

export const storeLoginInfo = (data: LoginInfo) => {
        localStorage.setItem('email', data.email);
        localStorage.setItem('username', data.username);
        localStorage.setItem('nickname', data.nickname);
        localStorage.setItem('token', data.token);
}

export const storeUserInfo = (data: UserInfoStore) => {
      localStorage.setItem('group', data.group)
      localStorage.setItem('token', data.token)
      localStorage.setItem('avatar', data.avatar)
      localStorage.setItem('email', data.email)
      localStorage.setItem('username', data.username)
      localStorage.setItem('nickname', data.nickname)
      localStorage.setItem('token', data.token)
}