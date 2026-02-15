import { storeLoginInfo } from '@/utils/user'
import { get, post, patch } from '../request'
import { getToken, storeToken } from '../token'
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
  SubmitRealnameResponse,
} from './type'
import type {
  BroadcastResponse,
  CheckPaymentStatusResponse,
  GitHubCommitsResponse,
  GroupResponse,
  SignResponse,
  TrafficTrendResponse,
  UserInfoResponse,
  UserTrafficResponse,
} from './type'

export async function forget(params: ForgetParams): Promise<CodeResponse> {
  const { email, password, code } = params
  return await post<CodeResponse>(`/auth/password/reset`, {
    email,
    password,
    code,
  })
}

export async function getHitokoto(): Promise<string> {
  return await get<string>('https://v1.hitokoto.cn/?c=i&encode=text')
}

export async function sendEmailCode(
  email: string,
  module: string,
  url?: string,
): Promise<CodeResponse> {
  const endpoint = url ? `/codes/${module}${url}` : `/codes/${module}`
  return await post<CodeResponse>(endpoint, { email })
}

export async function sendSmsCode(
  phone: string,
  module: string,
  url?: string,
): Promise<CodeResponse> {
  const endpoint = url ? `/codes/${module}${url}` : `/codes/${module}`
  return await post<CodeResponse>(
    endpoint,
    { phone },
    {
      headers: {
        Authorization: getToken(),
      },
    },
  )
}

export async function register(params: RegisterParams): Promise<CodeResponse> {
  const { username, nickname, password, email, code } = params
  return await post<CodeResponse>(`/auth/register`, {
    username,
    nickname,
    password,
    email,
    code,
  })
}

export async function login({
  username,
  password,
  remember,
  url,
}: LoginParams): Promise<LoginResponse> {
  const data = await post<LoginResponse>(`/auth/login${url}`, {
    username,
    password,
  })
  storeToken(data.data.Authorization, remember, data.expires)
  const loginInfo: LoginInfo = {
    email: data.data.email || '',
    username: data.data.username || '',
    nickname: data.data.nickname || '',
    token: data.data.Authorization || '',
  }
  storeLoginInfo(loginInfo)
  return data
}

/**
 * 获取 51la 统计数据
 * @param apiUrl 51la 的统计 API 地址
 * @returns string[] 统计数据数组
 */
export async function getLaStatistic(apiUrl: string): Promise<string[] | null> {
  try {
    const data = await get<string>(apiUrl, { responseType: 'text' })
    const matches = data.match(/(?<=<\/span><span>).*?(?=<\/span><\/p>)/g)
    if (!matches || matches.length === 0) {
      throw new Error('无法解析统计数据')
    }
    return matches
  } catch (err) {
    console.error('获取统计数据失败:', err)
    return null
  }
}

export async function getGitHubCommits(): Promise<GitHubCommitsResponse> {
  try {
    const data = await get<GitHubCommitsResponse>('/info/github/commits', {
      headers: {
        Authorization: getToken(),
      },
    })
    return data
  } catch (err: any) {
    console.error('获取 GitHub 提交数据失败:', err)
    return err
  }
}

export async function logout(): Promise<LogoutResponse> {
  return await post<LogoutResponse>(
    '/auth/logout',
    {},
    {
      headers: {
        Authorization: getToken(),
      },
    },
  )
}

export async function getTrafficTrend(
  day: number,
): Promise<TrafficTrendResponse> {
  try {
    const token = getToken()
    return await get<TrafficTrendResponse>(`/user/traffic/trend?day=${day}`, {
      headers: { Authorization: token },
    })
  } catch (err: any) {
    console.error('获取流量趋势数据失败:', err)
    return err
  }
}

export async function getBroadcast(): Promise<BroadcastResponse> {
  try {
    const token = getToken()
    return await get<BroadcastResponse>('/info/broadcasts', {
      headers: { Authorization: token },
    })
  } catch (err: any) {
    console.error('获取广播数据失败:', err)
    return err
  }
}

export async function getUserInfo(): Promise<UserInfoResponse> {
  try {
    const token = getToken()
    return await get<UserInfoResponse>('/user/info', {
      headers: { Authorization: token },
    })
  } catch (err: any) {
    console.error('获取用户信息失败:', err)
    return err
  }
}

export async function sign(url: string): Promise<SignResponse> {
  return await post<SignResponse>(
    `/sign${url}`,
    {},
    {
      headers: {
        Authorization: getToken(),
      },
    },
  )
}

export async function getUserTraffic(): Promise<UserTrafficResponse> {
  return await get<UserTrafficResponse>('/user/traffic', {
    headers: {
      Authorization: getToken(),
    },
  })
}

export async function getUserGroups(): Promise<GroupResponse> {
  return await get<GroupResponse>('/info/groups', {
    headers: {
      Authorization: getToken(),
    },
  })
}

export async function getSoftwares(): Promise<SoftwaresResponse> {
  return await get<SoftwaresResponse>('/info/softwares', {
    headers: {
      Authorization: getToken(),
    },
  })
}

export async function getDownloadSources(): Promise<DownloadSourcesResponse> {
  return await get<DownloadSourcesResponse>('/info/downloads/sources', {
    headers: {
      Authorization: getToken(),
    },
  })
}

export async function getSoftwareVersions(): Promise<SoftwareVersionsResponse> {
  return await get<SoftwareVersionsResponse>('/info/softwares/versions', {
    headers: {
      Authorization: getToken(),
    },
  })
}

export async function getProducts(): Promise<ProductsResponse> {
  return await get<ProductsResponse>('/info/products', {
    headers: {
      Authorization: getToken(),
    },
  })
}

export async function buyProduct(
  params: BuyProductParams,
): Promise<BuyProductResponse> {
  return await post<BuyProductResponse>('/orders/', params, {
    headers: {
      Authorization: getToken(),
    },
  })
}

// 检查支付状态
export async function checkPaymentStatus(
  outTradeNo: string,
): Promise<CheckPaymentStatusResponse> {
  return await get<CheckPaymentStatusResponse>(`/orders/status/${outTradeNo}`, {
    headers: {
      Authorization: getToken(),
    },
  })
}

// 更新用户名
export async function updateUsername(
  params: UpdateUsernameParams,
): Promise<UpdateUsernameResponse> {
  return await patch<UpdateUsernameResponse>('/user/username', params, {
    headers: {
      Authorization: getToken(),
    },
  })
}

// 更新昵称
export async function updateNickname(
  nickname: string,
): Promise<UpdateNicknameResponse> {
  return await patch<UpdateNicknameResponse>(
    `/user/nickname`,
    { nickname },
    {
      headers: {
        Authorization: getToken(),
      },
    },
  )
}

// 上传图片
export async function updateAvatarUpload(
  formData: FormData,
): Promise<UpdateAvatarResponse> {
  return await post<UpdateAvatarResponse>('/user/avatar', formData, {
    headers: {
      Authorization: getToken() || '',
      'Content-Type': 'multipart/form-data',
    },
  })
}

// QQ头像
export async function updateAvatarQQ(
  qq: string,
): Promise<UpdateAvatarResponse> {
  return await post<UpdateAvatarResponse>(
    '/user/avatar/qq',
    { qq },
    {
      headers: {
        Authorization: getToken() || '',
      },
    },
  )
}

// Cravatar
export async function updateAvatarCravatar(
  cravatar: string,
): Promise<UpdateAvatarResponse> {
  return await post<UpdateAvatarResponse>(
    '/user/avatar/cravatar',
    { cravatar },
    {
      headers: {
        Authorization: getToken() || '',
      },
    },
  )
}

// 更新密码
export async function updatePassword(
  params: UpdatePasswordParams,
): Promise<UpdatePasswordResponse> {
  return await post<UpdatePasswordResponse>('/auth/password/update', params, {
    headers: {
      Authorization: getToken(),
    },
  })
}

// 实名认证
export async function submitRealname(
  params: RealnameParams,
): Promise<SubmitRealnameResponse> {
  return await post<SubmitRealnameResponse>('/realname/', params, {
    headers: {
      Authorization: getToken(),
    },
  })
}

export async function resetToken(): Promise<any> {
  return await post(
    '/user/reset/token',
    {},
    {
      headers: {
        Authorization: getToken(),
      },
    },
  )
}
