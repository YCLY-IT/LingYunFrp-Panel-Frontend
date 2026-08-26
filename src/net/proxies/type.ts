import { ApiBaseResponse } from '../user/type'

export interface NodeData {
  id: number
  nodeId: number
  name: string
  hostname: string
  description: string
  token: string
  servicePort: number
  allowGroup: string
  allowPort: string
  allowType: string
  status: boolean
  isDisabled: boolean
  needRealname: boolean
  bandWidth: number
  location: string
}

export interface CreateTunnelParams {
  nodeId: number
  proxyName: string
  localIp: string
  localPort: number
  remotePort: number
  domain: string
  proxyType: string
  accessKey: string
  proxyProtocolVersion: string
  useEncryption: boolean
  useCompression: boolean
  ipLimitIn?: number
  ipLimitOut?: number
}

export interface UpdateTunnelParams extends CreateTunnelParams {
  proxyId: number
}

export interface ProxyData {
  proxyId: number
  proxyName: string
  localIp: string
  localPort: number
  remotePort: number
  domain: string
  proxyType: string
  accessKey: string
  proxyProtocolVersion: string
  useEncryption: boolean
  useCompression: boolean
  nodeId: number
  isOnline: boolean
  isBanned: boolean
  isDisabled: boolean
  username: string
  location: string
  ipLimitIn?: number
  /** 前端显示单位，不提交到服务端 */
  ipLimitInUnit?: string
  ipLimitOut?: number
  /** 前端显示单位，不提交到服务端 */
  ipLimitOutUnit?: string
}

export interface ProxyConfigData {
  config: string
  format: string
}

export interface ToggleProxyParams {
  proxyId: number
  isDisabled: boolean
}

export interface DeleteProxyParams {
  proxyId: number
}

export interface GetProxyConfigParams {
  proxyId: number
  type: 'toml' | 'ini' | 'json' | 'yml'
}

export interface GetFreePortParams {
  nodeId: number
  protocol: 'tcp' | 'udp'
}

// 分页响应基础类型
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type NodeResponse = ApiBaseResponse<NodeData[]>
// 用户端代理列表响应（后端使用 proxies 字段名）
export interface ProxyListResponseData {
  proxies: ProxyData[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
export type ProxyListResponse = ApiBaseResponse<ProxyListResponseData>
export type ProxyConfigResponse = ApiBaseResponse<ProxyConfigData>
export type FreePortResponse = ApiBaseResponse<number>
export type CreateTunnelResponse = ApiBaseResponse<{ proxyId: number }>
export type UpdateTunnelResponse = ApiBaseResponse<null>
export type DeleteTunnelResponse = ApiBaseResponse<null>
export type ToggleTunnelResponse = ApiBaseResponse<null>
