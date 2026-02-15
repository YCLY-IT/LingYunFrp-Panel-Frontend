import { get, post, put, patch, del } from '../request'
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
  BroadcastListApiResponse,
  CreateBroadcastParams,
  UpdateBroadcastParams,
  OperationLogListApiResponse,
} from './type'
import { ApiBaseResponse } from '../user/type'

// 用户管理API
export async function getUserList(): Promise<UserListApiResponse> {
  return await get<UserListApiResponse>('/admin/users/', {
    headers: { Authorization: getToken() },
  })
}

export async function updateUser(
  params: UpdateUserParams,
): Promise<CodeResponse> {
  return await put<CodeResponse>(`/admin/users/${params.id}`, params, {
    headers: { Authorization: getToken() },
  })
}

export async function toggleUser(
  params: ToggleUserParams,
): Promise<CodeResponse> {
  return await patch<CodeResponse>(`/admin/users/toggle`, params, {
    headers: { Authorization: getToken() },
  })
}

// 节点管理API
export async function getNodeList(): Promise<NodeListApiResponse> {
  return await get<NodeListApiResponse>('/admin/nodes/', {
    headers: { Authorization: getToken() },
  })
}

export async function getNodeById(id: number): Promise<any> {
  return await get<any>(`/admin/nodes/${id}`, {
    headers: { Authorization: getToken() },
  })
}

export async function createNode(
  params: CreateNodeParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/nodes/', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateNode(
  params: UpdateNodeParams,
): Promise<CodeResponse> {
  return await put<CodeResponse>(`/admin/nodes/${params.id}`, params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteNode(id: number): Promise<CodeResponse> {
  try {
    return await del<CodeResponse>(
      `/admin/nodes/${id}`,
      {},
      {
        headers: {
          Authorization: getToken(),
        },
      },
    )
  } catch (error) {
    throw error
  }
}

export async function toggleNode(
  id: number,
  isDisabled: boolean,
): Promise<CodeResponse> {
  return await patch<CodeResponse>(
    `/admin/nodes/${id}/toggle`,
    { isDisabled },
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 代理管理API
export async function getProxyList(): Promise<ProxyListApiResponse> {
  return await get<ProxyListApiResponse>('/admin/proxies/', {
    headers: { Authorization: getToken() },
  })
}

export async function updateProxy(
  params: UpdateProxyParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/proxies/', params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteProxy(id: number): Promise<CodeResponse> {
  try {
    return await del<CodeResponse>(
      `/admin/proxies/${id}`,
      {},
      {
        headers: { Authorization: getToken() },
      },
    )
  } catch (error) {
    throw error
  }
}

export async function toggleProxy(
  id: number,
  isDisabled: boolean,
): Promise<CodeResponse> {
  return await patch<CodeResponse>(
    `/admin/proxies/${id}/toggle`,
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
  return await patch<CodeResponse>(
    `/admin/proxies/${id}/ban`,
    { isBanned },
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 产品管理API
export async function getProductList(): Promise<ProductListApiResponse> {
  return await get<ProductListApiResponse>('/info/products', {
    headers: { Authorization: getToken() },
  })
}

export async function createProduct(
  params: CreateProductParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/products/', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateProduct(
  params: UpdateProductParams,
): Promise<CodeResponse> {
  return await put<CodeResponse>(`/admin/products/${params.id}`, params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteProduct(id: number): Promise<CodeResponse> {
  try {
    return await del<CodeResponse>(
      `/admin/products/${id}`,
      {},
      {
        headers: { Authorization: getToken() },
      },
    )
  } catch (error) {
    throw error
  }
}

// 软件管理API
export async function getSoftwareList(): Promise<SoftwareListApiResponse> {
  return await get<SoftwareListApiResponse>('/info/softwares', {
    headers: { Authorization: getToken() },
  })
}

export async function getSoftwareVersions(): Promise<
  ApiBaseResponse<SoftwareVersion[]>
> {
  return await get<ApiBaseResponse<SoftwareVersion[]>>(
    '/info/softwares/versions',
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function createSoftware(
  params: CreateSoftwareParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/software/', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateSoftware(
  params: UpdateSoftwareParams,
): Promise<CodeResponse> {
  return await put<CodeResponse>(`/admin/software/${params.id}`, params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteSoftware(id: number): Promise<CodeResponse> {
  try {
    return await del<CodeResponse>(
      `/admin/software/${id}`,
      {},
      {
        headers: { Authorization: getToken() },
      },
    )
  } catch (error) {
    throw error
  }
}

export async function createSoftwareVersion(
  params: CreateSoftwareVersionParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/software/versions/', params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteSoftwareVersion(id: number): Promise<CodeResponse> {
  try {
    return await del<CodeResponse>(
      `/admin/software/versions/${id}`,
      {},
      {
        headers: { Authorization: getToken() },
      },
    )
  } catch (error) {
    throw error
  }
}

export async function updateSoftwareVersion(
  params: UpdateSoftwareVersionParams,
): Promise<CodeResponse> {
  return await put<CodeResponse>(
    `/admin/software/versions/${params.id}`,
    params,
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 系统设置API
export async function getSystemSettings(): Promise<SystemSettingApiResponse> {
  return await get<SystemSettingApiResponse>('/admin/settings/', {
    headers: { Authorization: getToken() },
  })
}
export async function updateSmtpSetting(params: any): Promise<CodeResponse> {
  return await put<CodeResponse>('/admin/settings/smtp', params, {
    headers: { Authorization: getToken() },
  })
}

export async function getSmtpSetting(): Promise<SmtpSettingApiResponse> {
  return await get<SmtpSettingApiResponse>('/admin/settings/smtp', {
    headers: { Authorization: getToken() },
  })
}

export async function updateSmsSetting(params: any): Promise<CodeResponse> {
  return await put<CodeResponse>('/admin/settings/sms', params, {
    headers: { Authorization: getToken() },
  })
}

export async function getSmsSetting(): Promise<SmsSettingApiResponse> {
  return await get<SmsSettingApiResponse>('/admin/settings/sms', {
    headers: { Authorization: getToken() },
  })
}

export async function updateSetting(params: any): Promise<CodeResponse> {
  return await put<CodeResponse>('/admin/settings/safety', params, {
    headers: { Authorization: getToken() },
  })
}

// 用户组管理API
export async function getGroupList(): Promise<GroupListApiResponse> {
  return await get<GroupListApiResponse>('/info/groups', {
    headers: { Authorization: getToken() },
  })
}

export async function createGroup(
  params: CreateGroupParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/groups/', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateGroup(
  params: UpdateGroupParams,
): Promise<CodeResponse> {
  return await put<CodeResponse>(`/admin/groups/${params.id}`, params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteGroup(id: number): Promise<CodeResponse> {
  try {
    return await del<CodeResponse>(
      `/admin/groups/${id}`,
      {},
      {
        headers: { Authorization: getToken() },
      },
    )
  } catch (error) {
    throw error
  }
}

// 下载源管理API
export async function getDownloadSources(): Promise<DownloadSourceApiResponse> {
  return await get<DownloadSourceApiResponse>('/info/downloads/sources', {
    headers: { Authorization: getToken() },
  })
}

export async function createDownloadSource(params: {
  name: string
  path: string
}): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/downloads/', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateDownloadSource(
  id: number,
  params: { name: string; path: string },
): Promise<CodeResponse> {
  return await put<CodeResponse>(`/admin/downloads/${id}`, params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteDownloadSource(id: number): Promise<CodeResponse> {
  try {
    return await del<CodeResponse>(
      `/admin/downloads/${id}`,
      {},
      {
        headers: { Authorization: getToken() },
      },
    )
  } catch (error) {
    throw error
  }
}

export async function getBroadcastList(): Promise<BroadcastListApiResponse> {
  return await get<BroadcastListApiResponse>('/info/broadcasts', {
    headers: { Authorization: getToken() },
  })
}

export async function createBroadcast(
  params: CreateBroadcastParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/broadcasts/', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateBroadcast(
  params: UpdateBroadcastParams,
): Promise<CodeResponse> {
  return await put<CodeResponse>(`/admin/broadcasts/${params.id}`, params, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteBroadcast(id: number): Promise<CodeResponse> {
  try {
    return await del<CodeResponse>(
      `/admin/broadcasts/${id}`,
      {},
      {
        headers: { Authorization: getToken() },
      },
    )
  } catch (error) {
    throw error
  }
}

export async function toggleBroadcastTop(
  id: number,
  top: boolean,
): Promise<CodeResponse> {
  return await patch<CodeResponse>(
    `/admin/broadcasts/${id}/top`,
    { top },
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 用户操作日志API
export async function getOperationLogList(): Promise<OperationLogListApiResponse> {
  return await get<OperationLogListApiResponse>('/logs/operations', {
    headers: { Authorization: getToken() },
  })
}

// 管理员操作日志API
export async function getAdminOperationLogList(): Promise<OperationLogListApiResponse> {
  return await get<OperationLogListApiResponse>('/admin/logs/operations', {
    headers: { Authorization: getToken() },
  })
}

export async function deleteAdminOperationLog(
  id: number,
): Promise<CodeResponse> {
  try {
    return await del<CodeResponse>(
      `/admin/logs/operations/${id}`,
      {},
      {
        headers: { Authorization: getToken() },
      },
    )
  } catch (error) {
    throw error
  }
}

export async function clearAdminOperationLog(): Promise<CodeResponse> {
  return await post<CodeResponse>(
    '/admin/logs/operations/clear',
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}
