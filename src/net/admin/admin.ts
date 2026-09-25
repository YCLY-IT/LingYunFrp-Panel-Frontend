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
  ProductKindListApiResponse,
  ProductKindApiResponse,
  CreateProductKindParams,
  UpdateProductKindParams,
  ProductGrantListApiResponse,
  GrantTargetListApiResponse,
  CreateProductGrantParams,
  UpdateProductGrantParams,
  SellableProductKindListApiResponse,
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
  RedeemCodeListApiResponse,
  CreateRedeemCodesParams,
  CreateRedeemCodesApiResponse,
  ExportRedeemCodesParams,
  ExportRedeemCodesApiResponse,
  UpdateRedeemCodeStatusApiResponse,
} from './type'
import { ApiBaseResponse } from '../user/type'

// 用户管理API
export async function getUserList(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  group?: string,
  isRealname?: boolean,
  status?: number,
  sortKey?: string,
  sortOrder?: string,
): Promise<UserListApiResponse> {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('pageSize', String(pageSize))
  if (search) params.append('search', search)
  if (group) params.append('group', group)
  if (isRealname !== undefined) params.append('isRealname', String(isRealname))
  if (status !== undefined) params.append('status', String(status))
  if (sortKey) params.append('sortKey', sortKey)
  if (sortOrder) params.append('sortOrder', sortOrder)

  return await get<UserListApiResponse>(`/admin/users?${params.toString()}`, {
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
export async function getNodeList(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  isOnline?: string,
  status?: string,
  sortKey?: string,
  sortOrder?: string,
): Promise<NodeListApiResponse> {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('pageSize', String(pageSize))
  if (search) params.append('search', search)
  if (isOnline) params.append('isOnline', isOnline)
  if (status) params.append('status', status)
  if (sortKey) params.append('sortKey', sortKey)
  if (sortOrder) params.append('sortOrder', sortOrder)

  return await get<NodeListApiResponse>(`/admin/nodes?${params.toString()}`, {
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
export async function getProxyList(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  nodeId?: number,
  proxyType?: string,
  isOnline?: string,
  isBanned?: string,
  sortKey?: string,
  sortOrder?: string,
): Promise<ProxyListApiResponse> {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('pageSize', String(pageSize))
  if (search) params.append('search', search)
  if (nodeId) params.append('nodeId', String(nodeId))
  if (proxyType) params.append('proxyType', proxyType)
  if (isOnline) params.append('isOnline', isOnline)
  if (isBanned) params.append('isBanned', isBanned)
  if (sortKey) params.append('sortKey', sortKey)
  if (sortOrder) params.append('sortOrder', sortOrder)

  return await get<ProxyListApiResponse>(
    `/admin/proxies?${params.toString()}`,
    {
      headers: { Authorization: getToken() },
    },
  )
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

// 商品类型API
export async function getProductKinds(): Promise<ProductKindListApiResponse> {
  return await get<ProductKindListApiResponse>('/admin/products/kinds', {
    headers: { Authorization: getToken() },
  })
}

export async function createProductKind(
  params: CreateProductKindParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/products/kinds', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateProductKind(
  params: UpdateProductKindParams,
): Promise<ProductKindApiResponse> {
  const { id, ...body } = params
  return await put<ProductKindApiResponse>(
    `/admin/products/kinds/${id}`,
    body,
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function deleteProductKind(id: number): Promise<CodeResponse> {
  return await del<CodeResponse>(
    `/admin/products/kinds/${id}`,
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 发放规则API
export async function getProductGrants(): Promise<ProductGrantListApiResponse> {
  return await get<ProductGrantListApiResponse>('/admin/products/grants', {
    headers: { Authorization: getToken() },
  })
}

// 发放目标白名单
export async function getGrantTargets(): Promise<GrantTargetListApiResponse> {
  return await get<GrantTargetListApiResponse>(
    '/admin/products/grants/targets',
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function createProductGrant(
  params: CreateProductGrantParams,
): Promise<CodeResponse> {
  return await post<CodeResponse>('/admin/products/grants', params, {
    headers: { Authorization: getToken() },
  })
}

export async function updateProductGrant(
  params: UpdateProductGrantParams,
): Promise<CodeResponse> {
  const { id, ...body } = params
  return await put<CodeResponse>(`/admin/products/grants/${id}`, body, {
    headers: { Authorization: getToken() },
  })
}

export async function deleteProductGrant(id: number): Promise<CodeResponse> {
  return await del<CodeResponse>(
    `/admin/products/grants/${id}`,
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 可售商品类型（用户组 + 商品类型）
export async function getSellableProductKinds(): Promise<SellableProductKindListApiResponse> {
  return await get<SellableProductKindListApiResponse>('/info/products/kinds', {
    headers: { Authorization: getToken() },
  })
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
  return await put<CodeResponse>('/admin/settings/basic', params, {
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
export async function getOperationLogList(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  module?: string,
  status?: string,
): Promise<OperationLogListApiResponse> {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('pageSize', String(pageSize))
  if (search) params.append('search', search)
  if (module) params.append('module', module)
  if (status) params.append('status', status)

  return await get<OperationLogListApiResponse>(
    `/logs/operations?${params.toString()}`,
    {
      headers: { Authorization: getToken() },
    },
  )
}

// 管理员操作日志API
export async function getAdminOperationLogList(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  module?: string,
  status?: string,
): Promise<OperationLogListApiResponse> {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('pageSize', String(pageSize))
  if (search) params.append('search', search)
  if (module) params.append('module', module)
  if (status) params.append('status', status)

  return await get<OperationLogListApiResponse>(
    `/admin/logs/operations?${params.toString()}`,
    {
      headers: { Authorization: getToken() },
    },
  )
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

// 兑换码管理API
export async function getRedeemCodeList(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  type?: string,
  batch?: string,
  status?: number,
): Promise<RedeemCodeListApiResponse> {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('pageSize', String(pageSize))
  if (search) params.append('search', search)
  if (type) params.append('type', type)
  if (batch) params.append('batch', batch)
  if (status !== undefined && status !== null) {
    params.append('status', String(status))
  }

  return await get<RedeemCodeListApiResponse>(
    `/admin/redeem/codes?${params.toString()}`,
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function createRedeemCodes(
  params: CreateRedeemCodesParams,
): Promise<CreateRedeemCodesApiResponse> {
  return await post<CreateRedeemCodesApiResponse>(
    '/admin/redeem/codes',
    params,
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function exportRedeemCodes(
  params: ExportRedeemCodesParams,
): Promise<ExportRedeemCodesApiResponse> {
  const search = new URLSearchParams()
  if (params.type) search.append('type', params.type)
  if (params.batch) search.append('batch', params.batch)
  if (params.status !== undefined && params.status !== null) {
    search.append('status', String(params.status))
  }
  if (params.limit) search.append('limit', String(params.limit))

  const query = search.toString()
  return await get<ExportRedeemCodesApiResponse>(
    `/admin/redeem/codes/export${query ? `?${query}` : ''}`,
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function updateRedeemCodeStatus(
  id: number,
  status: number,
): Promise<UpdateRedeemCodeStatusApiResponse> {
  return await patch<UpdateRedeemCodeStatusApiResponse>(
    `/admin/redeem/codes/${id}/status`,
    { status },
    {
      headers: { Authorization: getToken() },
    },
  )
}

export async function deleteRedeemCode(id: number): Promise<CodeResponse> {
  return await del<CodeResponse>(
    `/admin/redeem/codes/${id}`,
    {},
    {
      headers: { Authorization: getToken() },
    },
  )
}
