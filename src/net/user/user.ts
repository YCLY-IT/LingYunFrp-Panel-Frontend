import { storeLoginInfo } from "@/utils/user";
import { get, post } from "../request";
import { getToken, storeToken } from "../token";
import { 
  ForgetParams, 
  LoginParams, 
  RegisterParams,
  BuyProductParams,
  CodeResponse,
  LoginResponse,
  ProductsResponse,
  SoftwaresResponse,
  DownloadSourcesResponse,
  SoftwareVersionsResponse,
  BuyProductResponse,
  LogoutResponse,
  LoginInfo,
  UpdateUsernameParams,
  UpdatePasswordParams,
  RealnameParams,
  UpdateUsernameResponse,
  UpdateNicknameResponse,
  UpdatePasswordResponse,
  UpdateAvatarResponse,
  SubmitRealnameResponse
} from "./type";
import type { 
  BroadcastResponse, 
  GitHubCommitsResponse, 
  GroupResponse, 
  SignResponse, 
  TrafficTrendResponse, 
  UserInfoResponse, 
  UserTrafficResponse 
} from './type'

export async function forget(params: ForgetParams): Promise<CodeResponse> {
  const { email, password, code, url } = params;
  return await post<CodeResponse>(`/user/forget${url}`, { email, password, code });
}

export async function getHitokoto(): Promise<string> {
    return await get<string>("https://v1.hitokoto.cn/?c=i&encode=text");
}

export async function sendEmailCode(email: string, module: string): Promise<CodeResponse> {
    return await post<CodeResponse>(`/user/code/${module}`, { email });
}

export async function sendSmsCode(phone: string, module: string): Promise<CodeResponse> {
    return await post<CodeResponse>(`/user/code/${module}`, { phone });
}
  
export async function register(params: RegisterParams): Promise<CodeResponse> {
    const { username, nickname, password, email, code, url } = params;
    return await post<CodeResponse>(`/user/register${url}`, { username, nickname, password, email, code });
}

export async function login({ username, password, remember, url }: LoginParams): Promise<LoginResponse> {
    const data = await post<LoginResponse>(`/user/login${url}`, { username, password });
    storeToken(data.data.Authorization, remember, data.expires);
    const loginInfo: LoginInfo = {
        email: data.data.email || '',
        username: data.data.username || '',
        nickname: data.data.nickname || '',
        token: data.data.Authorization || ''
    };
    storeLoginInfo(loginInfo);
    return data;
}

/**
 * 获取 51la 统计数据
 * @param apiUrl 51la 的统计 API 地址
 * @returns string[] 统计数据数组
 */
export async function getLaStatistic(apiUrl: string): Promise<string[] | null> {
  try {
    const data = await get<string>(apiUrl, { responseType: 'text' });
    const matches = data.match(/(?<=<\/span><span>).*?(?=<\/span><\/p>)/g);
    if (!matches || matches.length === 0) {
      throw new Error('无法解析统计数据');
    }
    return matches;
  } catch (err) {
    console.error('获取统计数据失败:', err);
    return null;
  }
}

export async function getGitHubCommits(): Promise<GitHubCommitsResponse> {
  try {
    const data = await get<GitHubCommitsResponse>('/user/info/githubCommits', {
      headers: {
        Authorization: getToken(),
      },
    });
    return data;
  } catch (err: any) {
    console.error('获取 GitHub 提交数据失败:', err);
    return err;
  }
}

export async function logout(): Promise<LogoutResponse> {
  return await post<LogoutResponse>('/user/logout', {
    headers: { 
      Authorization: getToken() 
    }}, {});
}

export async function getTrafficTrend(day: number): Promise<TrafficTrendResponse> {
  try {
    const token = getToken();
    return await get<TrafficTrendResponse>(
      `/user/info/trafficTrend?day=${day}`,
      { headers: { Authorization: token } }
    );
  }  catch (err: any) {
    console.error('获取流量趋势数据失败:', err);
    return err;
  }
}

export async function getBroadcast(): Promise<BroadcastResponse> {
  try {
    const token = getToken();
    return await get<BroadcastResponse>('/user/info/broadcast', { headers: { Authorization: token } });
  } catch (err: any) {
    console.error('获取广播数据失败:', err);
    return err;
  }
}

export async function getUserInfo(): Promise<UserInfoResponse> {
  try {
    const token = getToken();
    return await get<UserInfoResponse>('/user/info', { headers: { Authorization: token } });
  } catch (err: any) {
    console.error('获取用户信息失败:', err);
    return err;
  }
}

export async function sign(): Promise<SignResponse> {
  return await post<SignResponse>('/user/sign', {
    headers: { 
      Authorization: getToken() 
    }}, {});
}

export async function getUserTraffic(): Promise<UserTrafficResponse> {
  return await get<UserTrafficResponse>('/user/info/traffic', {
    headers: { 
      Authorization: getToken() 
    }});
}

export async function getUserGroups(): Promise<GroupResponse> {
  return await get<GroupResponse>('/user/info/groups', {
    headers: { 
      Authorization: getToken() 
    }});
}

export async function getSoftwares(): Promise<SoftwaresResponse> {
  return await get<SoftwaresResponse>('/user/info/softwares', {
    headers: { 
      Authorization: getToken() 
    }});
}

export async function getDownloadSources(): Promise<DownloadSourcesResponse> {
  return await get<DownloadSourcesResponse>('/user/info/download/sources', {
    headers: { 
      Authorization: getToken() 
    }});
}

export async function getSoftwareVersions(): Promise<SoftwareVersionsResponse> {
  return await get<SoftwareVersionsResponse>('/user/info/softwares/version', {
    headers: { 
      Authorization: getToken() 
    }});
}

export async function getProducts(): Promise<ProductsResponse> {
  return await get<ProductsResponse>('/user/info/product', {
    headers: { 
      Authorization: getToken() 
    }});
}

export async function buyProduct(params: BuyProductParams): Promise<BuyProductResponse> {
  return await post<BuyProductResponse>('/user/buy', params, {
    headers: { 
      Authorization: getToken() 
    }});
}

// 更新用户名
export async function updateUsername(params: UpdateUsernameParams): Promise<UpdateUsernameResponse> {
  return await post<UpdateUsernameResponse>('/user/update/username', params, {
    headers: { 
      Authorization: getToken() 
    }});
}

// 更新昵称
export async function updateNickname(nickname: string): Promise<UpdateNicknameResponse> {
  return await post<UpdateNicknameResponse>(`/user/update/nickname/${nickname}`, { nickname }, {
    headers: { 
      Authorization: getToken() 
    }});
}

// 更新头像
export async function updateAvatar(formData: FormData): Promise<UpdateAvatarResponse> {
  return await post<UpdateAvatarResponse>('/user/update/avatar', formData, {
    headers: { 
      Authorization: getToken(),
      'Content-Type': 'multipart/form-data',
    }});
}

// 更新密码
export async function updatePassword(params: UpdatePasswordParams): Promise<UpdatePasswordResponse> {
  return await post<UpdatePasswordResponse>('/user/update/password', params, {
    headers: { 
      Authorization: getToken() 
    }});
}

// 实名认证
export async function submitRealname(params: RealnameParams): Promise<SubmitRealnameResponse> {
  return await post<SubmitRealnameResponse>('/user/realname', params, {
    headers: { 
      Authorization: getToken() 
    }});
}