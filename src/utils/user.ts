import { LoginInfo, UserInfoStore } from "@/net/user/type";

export const storeLoginInfo = (data: LoginInfo) => {
      // check has all data
      if (data.token && data.email && data.username && data.nickname) {
            localStorage.setItem('email', data.email);
            localStorage.setItem('username', data.username);
            localStorage.setItem('nickname', data.nickname);
            localStorage.setItem('token', data.token);
      }
}

export const storeUserInfo = (data: UserInfoStore) => {
      if (data.token && data.email && data.username && data.nickname && data.avatar && data.group) {
            localStorage.setItem('group', data.group)
            localStorage.setItem('token', data.token)
            localStorage.setItem('avatar', data.avatar)
            localStorage.setItem('email', data.email)
            localStorage.setItem('username', data.username)
            localStorage.setItem('nickname', data.nickname)
      }
}