import { get, post } from '../request'
import { getToken } from '../token'
import {
  UserListApiResponse,
  UpdateUserParams,
  ToggleUserParams,
  NodeListApiResponse,
  CreateNodeParams,
  UpdateNodeParams,
  ProxyListApiResponse,
  UpdateProxyParams,
  ProductListApiResponse,
  CreateProductParams,
  UpdateProductParams,
  SoftwareListApiResponse,
  CreateSoftwareParams,
  UpdateSoftwareParams,
  CreateSoftwareVersionParams,
  UpdateSoftwareVersionParams,
  SystemSettingApiResponse,
  GroupListApiResponse,
  CreateGroupParams,
  UpdateGroupParams,
  DownloadSourceApiResponse,
  CodeResponse,
  SoftwareVersion,
  SmtpSettingApiResponse,
  SmsSettingApiResponse,
} from './type'
import { ApiBaseResponse } from '../user/type'

// 用户管理API
export async function getUserList(): Promise<UserListApiResponse> {
  return await get<UserListApiResponse>('/admin/user/list', {
    headers: { Authorization: getToken() },
  })
}

export async function updateUser(
  params: UpdateUserParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>(`/admin/user/set/${params.id}`, params, {
    headers: { Authorization: getToken() },
  })
}

export async function toggleUser(
  params: ToggleUserParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>(`/admin/user/toggle`, params, {
    headers: { Authorization: getToken() },
  })
}

// 节点管理API
export async function getNodeList(): Promise<NodeListApiResponse> {
  return await get<NodeListApiResponse>('/admin/node/list', {
    headers: { Authorization: getToken() },
  })
}

export async function getNodeById(id: number): Promise<any> {
  return await get<any>(`/admin/node/get/${id}`, {
    headers: { Authorization: getToken() },
  })
}

export async function createNode(
  params: CreateNodeParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/node/create', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateNode(
  params: UpdateNodeParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>(`/admin/node/set/${params.id}`, params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteNode(id: number): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/node/delete/${id}`,
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function toggleNode(
  id: number,
  isDisabled: boolean,
): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/node/toggle/${id}`,
    { isDisabled },
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 代理管理API
export async function getProxyList(): Promise<ProxyListApiResponse> {
  return await get<ProxyListApiResponse>('/admin/proxy/list', {
    headers: { Authorization: getToken() },
  })
}

export async function updateProxy(
  params: UpdateProxyParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/proxy/update', params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteProxy(id: number): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/proxy/delete/${id}`,
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function toggleProxy(
  id: number,
  isDisabled: boolean,
): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/proxy/toggle/${id}`,
    { isDisabled },
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function banProxy(
  id: number,
  isBanned: boolean,
): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/proxy/ban/${id}`,
    { isBanned },
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 产品管理API
export async function getProductList(): Promise<ProductListApiResponse> {
  return await get<ProductListApiResponse>('/user/info/product', {
    headers: { Authorization: getToken() },
  })
}

export async function createProduct(
  params: CreateProductParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/product/create', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateProduct(
  params: UpdateProductParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/product/update/${params.id}`,
    params,
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function deleteProduct(id: number): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/product/delete/${id}`,
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 软件管理API
export async function getSoftwareList(): Promise<SoftwareListApiResponse> {
  return await get<SoftwareListApiResponse>('/user/info/softwares', {
    headers: { Authorization: getToken() },
  })
}

export async function getSoftwareVersions(): Promise<
  ApiBaseResponse<SoftwareVersion[]>
> {
  return await get<ApiBaseResponse<SoftwareVersion[]>>(
    '/user/info/softwares/version',
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function createSoftware(
  params: CreateSoftwareParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/software', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateSoftware(
  params: UpdateSoftwareParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/software/update/${params.id}`,
    params,
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function deleteSoftware(id: number): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/software/delete/${id}`,
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function createSoftwareVersion(
  params: CreateSoftwareVersionParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/software/version', params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteSoftwareVersion(id: number): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/software/version/delete/${id}`,
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function updateSoftwareVersion(
  params: UpdateSoftwareVersionParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/software/version/update/${params.id}`,
    params,
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 系统设置API
export async function getSystemSettings(): Promise<SystemSettingApiResponse> {
  return await get<SystemSettingApiResponse>('/admin/setting/get', {
    headers: { Authorization: getToken() },
  })
}
export async function updateSmtpSetting(params: any): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/setting/smtp', params, {
    headers: { Authorization: getToken() },
  })
}

export async function getSmtpSetting(): Promise<SmtpSettingApiResponse> {
  return await get<SmtpSettingApiResponse>('/admin/setting/smtp', {
    headers: { Authorization: getToken() },
  })
}

export async function updateSmsSetting(params: any): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/setting/sms', params, {
    headers: { Authorization: getToken() },
  })
}

export async function getSmsSetting(): Promise<SmsSettingApiResponse> {
  return await get<SmsSettingApiResponse>('/admin/setting/sms', {
    headers: { Authorization: getToken() },
  })
}

export async function updateSetting(params: any): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/setting', params, {
    headers: { Authorization: getToken() },
  })
}

export async function setBroadcast(content: string): Promise<CodeResponse> {
  return await post<CodeResponse>(
    '/admin/setting/Broadcast',
    { message: content },
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 用户组管理API
export async function getGroupList(): Promise<GroupListApiResponse> {
  return await get<GroupListApiResponse>('/user/info/groups', {
    headers: { Authorization: getToken() },
  })
}

export async function createGroup(
  params: CreateGroupParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/setting/groups/create', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateGroup(
  params: UpdateGroupParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/setting/groups/update/${params.id}`,
    params,
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function deleteGroup(id: number): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/setting/groups/delete/${id}`,
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 下载源管理API
export async function getDownloadSources(): Promise<DownloadSourceApiResponse> {
  return await get<DownloadSourceApiResponse>('/user/info/download/sources', {
    headers: { Authorization: getToken() },
  })
}

export async function createDownloadSource(params: {
  name: string
  path: string
}): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/setting/download/create', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateDownloadSource(
  id: number,
  params: { name: string; path: string },
): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/setting/download/update/${id}`,
    params,
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function deleteDownloadSource(id: number): Promise<CodeResponse> {
  return await post<CodeResponse>(
    `/admin/setting/download/delete/${id}`,
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}
