export interface TokenData {
  Authorization: string;
  remember: boolean;
  expires: number;
}

export function storeToken(Authorization: string, remember: boolean, expires: number) {
  const token: TokenData = {
    Authorization,
    remember,
    expires
  };
  const tokenStr = JSON.stringify(token);
  if (remember) {
    localStorage.setItem('Authorization', tokenStr);
  } else {
    sessionStorage.setItem('Authorization', tokenStr);
  }
}

export function getToken(): string | null {
  const tokenStr = localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization');
  if (tokenStr) {
    const token: TokenData = JSON.parse(tokenStr);
    if (token.expires && token.expires < new Date().getTime()) {
      removeToken();
      return null;
    }
    return "Bearer " + token.Authorization;
  }
  return null;
}

export function removeToken() {
  localStorage.removeItem('Authorization');
  sessionStorage.removeItem('Authorization');
} 

export const unauthorized = () => {
  return !getToken();
}