import { ApiBaseResponse } from '../user/type'

// 用户管理相关类型
export interface User {
  id: number
  username: string
  password: string
  email: string
  nickname: string
  avatar: string
  group: string
  status: number
  remainder: number
  is_realname: boolean
  traffic: number
  proxies: number
  outBound: number
  inBound: number
  noCnOutBound: number
  noCnInBound: number
  updated_at: string
  created_at: string
  friendlyGroup?: string
  isRealname?: boolean
  usedProxies?: number
  maxProxies?: number
  point?: number
  regTime?: string
  lastLoginTime?: string
}

export interface UserListResponse {
  users: User[]
}

export interface UpdateUserParams {
  id: number
  username?: string
  nickname?: string
  email?: string
  group?: string
  status?: number
  maxProxies?: number
  traffic?: number
  outBound?: number
  inBound?: number
  noCnOutBound?: number
  noCnInBound?: number
  point?: number
  isRealname?: boolean
  remainder?: number
  reason?: string
}

export interface ToggleUserParams {
  userId: number
  status: number
  reason?: string
}

// 节点管理相关类型
export interface Node {
  id: number
  name: string
  hostname: string
  ip: string
  description: string
  token: string
  port: number
  admin_port: number
  admin_pass: string
  group: string
  allow_port: string
  allow_type: string
  need_realname: boolean
  bandwidth: number
  location: string
  is_disabled: boolean
  is_online: boolean
  updated_at: string
  created_at: string
  clientCount?: number
  tunnelCount?: number
  totalTrafficIn?: number
  totalTrafficOut?: number
  todayTrafficIn?: number
  todayTrafficOut?: number
}
export interface NodeListResponse {
  nodes: Node[]
}

export interface CreateNodeParams {
  name: string
  hostname: string
  ip: string
  description: string
  token: string
  port: number
  admin_port: number
  admin_pass: string
  group: string
  allow_port: string
  allow_type: string
  need_realname: boolean
  bandwidth: number
  location: string
}

export interface UpdateNodeParams extends CreateNodeParams {
  id: number
}

// 代理管理相关类型
export interface Proxy {
  id: number
  proxyId: number
  name: string
  type: string
  localIp: string
  localPort: number
  remotePort: number
  nodeId: number
  nodeName: string
  userId: number
  username: string
  status: number
  createdAt: string
  updatedAt: string
}
export interface ProxyListResponse {
  proxies: Proxy[]
}

export interface UpdateProxyParams {
  id: number
  name?: string
  type?: string
  localIp?: string
  localPort?: number
  remotePort?: number
  nodeId?: number
  status?: number
  hostHeaderRewrite?: string
  headerXFromWhere?: string
  useEncryption?: boolean
  useCompression?: boolean
  proxyProtocolVersion?: string
  accessKey?: string
  // 还有 domain 字段
  domain?: string
  // 速率限制字段 - 以KB为单位
  ipLimitIn?: number
  ipLimitOut?: number
}

// 产品管理相关类型
export interface Product {
  id: number
  name: string
  isPermanent: boolean
  type: string
  pointPrice: number
  price: number
  desc: string
  payMethod: string
  createdAt: string
  updatedAt: string
}

export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

export interface CreateProductParams {
  name: string
  isPermanent: boolean
  type: string
  pointPrice: number
  price: number
  desc: string
  payMethod: string
}

export interface UpdateProductParams extends CreateProductParams {
  id: number
}

// 软件管理相关类型
export interface Software {
  id: number
  code: string
  name: string
  description: string
  sourceId: number
  sourceName: string
  versions: SoftwareVersion[]
  created_at: string
  updated_at: string
}

export interface SoftwareVersion {
  id: number
  name: string
  os: string
  arch: string
  version: string
  software_id: number
  download_url: string
  size: number
  force_update: boolean
  created_at: string
  updated_at: string
}

export interface CreateSoftwareParams {
  code: string
  name: string
  description: string
  sourceId: number
}

export interface UpdateSoftwareParams extends CreateSoftwareParams {
  id: number
}

export interface CreateSoftwareVersionParams {
  name: string
  os: string
  arch: string
  version: string
  softwareId: number
  downloadUrl: string
  size: number
  forceUpdate: boolean
}

export interface UpdateSoftwareVersionParams
  extends CreateSoftwareVersionParams {
  id: number
}

export interface SoftwareListResponse {
  softwares: Software[]
}

// 系统设置相关类型
export interface SystemSetting {
  type: string
  value: string
}

export interface Group {
  no_cn_out_limit: number
  no_cn_in_limit: number
  id: number
  name: string
  friendlyName: string
  point: number
  proxies: number
  traffic: number
  out_limit: number
  in_limit: number
}

export interface CreateGroupParams {
  name: string
  friendlyName: string
  point: number
  proxies: number
  traffic: number
  out_limit: number
  in_limit: number
  no_cn_out_limit: number
  no_cn_in_limit: number
}

export interface UpdateGroupParams extends CreateGroupParams {
  id: number
  setUserGroup?: string
}

export interface SmsSettingResponse {
  app_id: string
  token: string
  context: string
}

export interface SmtpSettingResponse {
  host: string
  port: number
  username: string
  password: string
  from: string
  encryption: 'ssl' | 'tls' | 'none'
}

export interface Broadcast {
  id: number
  title: string
  message: string
  top: boolean
  created_at: string
  updated_at: string
}

export interface CreateBroadcastParams {
  title: string
  message: string
  top: boolean
}

export interface UpdateBroadcastParams extends CreateBroadcastParams {
  id: number
}

// 响应类型定义
export type UserListApiResponse = ApiBaseResponse<UserListResponse>
export type UserApiResponse = ApiBaseResponse<User>
export type NodeListApiResponse = ApiBaseResponse<NodeListResponse>
export type NodeApiResponse = ApiBaseResponse<Node>
export type ProxyListApiResponse = ApiBaseResponse<ProxyListResponse>
export type ProxyApiResponse = ApiBaseResponse<Proxy>
export type ProductListApiResponse = ApiBaseResponse<ProductListResponse>
export type ProductApiResponse = ApiBaseResponse<Product>
export type SoftwareListApiResponse = ApiBaseResponse<SoftwareListResponse>
export type SoftwareApiResponse = ApiBaseResponse<Software>
export type SoftwareVersionApiResponse = ApiBaseResponse<SoftwareVersion>
export type SystemSettingApiResponse = ApiBaseResponse<SystemSetting[]>
export type GroupListApiResponse = ApiBaseResponse<{ groups: Group[] }>
export type GroupApiResponse = ApiBaseResponse<Group>
export type DownloadSourceApiResponse = ApiBaseResponse<any[]>
export type CodeResponse = ApiBaseResponse<any>
export type SmsSettingApiResponse = ApiBaseResponse<SmsSettingResponse>
export type SmtpSettingApiResponse = ApiBaseResponse<SmtpSettingResponse>
export type BroadcastListApiResponse = ApiBaseResponse<Broadcast[]>
export type BroadcastApiResponse = ApiBaseResponse<Broadcast>

// 用户操作日志相关类型
export interface OperationLog {
  id: number
  user_id: number
  user_name: string
  operation_time: string
  operation_ip: string
  operation_type: string
  operation_status: string
  submit_content: Record<string, any> | null
  before_status: Record<string, any> | null
  after_status: Record<string, any> | null
  operation_module: string
  message: string
  operation_duration: number
}

export type OperationLogListApiResponse = ApiBaseResponse<OperationLog[]>
