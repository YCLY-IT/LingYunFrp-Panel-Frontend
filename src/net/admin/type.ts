import { ApiBaseResponse } from "../user/type";

// 用户管理相关类型
export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  nickname: string;
  avatar: string;
  group: string;
  status: number;
  remainder: number;
  is_realname: boolean;
  traffic: number;
  proxies: number;
  outBound: number;
  inBound: number;
  updated_at: string;
  created_at: string;
  friendlyGroup?: string;
  isRealname?: boolean;
  usedProxies?: number;
  maxProxies?: number;
  point?: number;
  regTime?: string;
  lastLoginTime?: string;
}

export interface UserListParams {
  page: number;
  limit: number;
  group?: string;
  isRealname?: boolean;
  status?: number;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface UpdateUserParams {
  id: number;
  username?: string;
  nickname?: string;
  email?: string;
  group?: string;
  status?: number;
  maxProxies?: number;
  traffic?: number;
  outBound?: number;
  inBound?: number;
  point?: number;
  isRealname?: boolean;
  remainder?: number;
  reason?: string;
}

export interface ToggleUserParams {
  userId: number;
  status: number;
  reason?: string;
}

// 节点管理相关类型
export interface Node {
  id: number;
  name: string;
  hostname: string;
  ip: string;
  description: string;
  token: string;
  port: number;
  adminPort: number;
  adminPass: string;
  group: string;
  allowPort: string;
  allowType: string;
  need_realname: boolean;
  bandWidth: number;
  location: string;
  isDisabled: boolean;
  isOnline: boolean;
  clientCount: number;
  tunnelCount: number;
  totalTrafficIn: number;
  totalTrafficOut: number;
  todayTrafficIn: number;
  todayTrafficOut: number;
}

export interface NodeListParams {
  page: number;
  limit: number;
  isOnline?: boolean;
  isDisabled?: boolean;
  keyword?: string;
}

export interface NodeListResponse {
  nodes: Node[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateNodeParams {
  name: string;
  hostname: string;
  ip: string;
  description: string;
  token: string;
  port: number;
  adminPort: number;
  adminPass: string;
  group: string;
  allowPort: string;
  allowType: string;
  need_realname: boolean;
  bandWidth: number;
  location: string;
}

export interface UpdateNodeParams extends CreateNodeParams {
  id: number;
}

// 代理管理相关类型
export interface Proxy {
  id: number;
  proxyId: number;
  name: string;
  type: string;
  localIp: string;
  localPort: number;
  remotePort: number;
  nodeId: number;
  nodeName: string;
  userId: number;
  username: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProxyListParams {
  page: number;
  limit: number;
  type?: string;
  status?: number;
  nodeId?: number;
  userId?: number;
  keyword?: string;
}

export interface ProxyListResponse {
  proxies: Proxy[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface UpdateProxyParams {
  id: number;
  name?: string;
  type?: string;
  localIp?: string;
  localPort?: number;
  remotePort?: number;
  nodeId?: number;
  status?: number;
  hostHeaderRewrite?: string;
  headerXFromWhere?: string;
  useEncryption?: boolean;
  useCompression?: boolean;
  proxyProtocolVersion?: string;
  // 还有 domain 字段
  domain?: string;
}

// 产品管理相关类型
export interface Product {
  id: number;
  name: string;
  isPermanent: boolean;
  type: string;
  pointPrice: number;
  price: number;
  desc: string;
  payMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductParams {
  name: string;
  isPermanent: boolean;
  type: string;
  pointPrice: number;
  price: number;
  desc: string;
  payMethod: string;
}

export interface UpdateProductParams extends CreateProductParams {
  id: number;
}

// 软件管理相关类型
export interface Software {
  id: number;
  code: string;
  name: string;
  description: string;
  sourceId: number;
  sourceName: string;
  versions: SoftwareVersion[];
  created_at: string;
  updated_at: string;
}

export interface SoftwareVersion {
  id: number;
  name: string;
  os: string;
  arch: string;
  version: string;
  softwareId: number;
  downloadUrl: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSoftwareParams {
  code: string;
  name: string;
  description: string;
  sourceId: number;
}

export interface UpdateSoftwareParams extends CreateSoftwareParams {
  id: number;
}

export interface CreateSoftwareVersionParams {
  name: string;
  os: string;
  arch: string;
  version: string;
  softwareId: number;
  downloadUrl: string;
  size: number;
}

export interface SoftwareListResponse {
  softwares: Software[];
}

// 系统设置相关类型
export interface SystemSetting {
  type: string;
  value: string;
  description: string;
}

export interface Broadcast {
  id: number;
  broadcast: string;
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  friendlyName: string;
  point: number;
  proxies: number;
  traffic: number;
  out_limit: number;
  in_limit: number;
}

export interface CreateGroupParams {
  name: string;
  friendlyName: string;
  point: number;
  proxies: number;
  traffic: number;
  out_limit: number;
  in_limit: number;
}

export interface UpdateGroupParams extends CreateGroupParams {
  id: number;
  setUserGroup?: string;
}

// 响应类型定义
export type UserListApiResponse = ApiBaseResponse<UserListResponse>;
export type UserApiResponse = ApiBaseResponse<User>;
export type NodeListApiResponse = ApiBaseResponse<NodeListResponse>;
export type NodeApiResponse = ApiBaseResponse<Node>;
export type ProxyListApiResponse = ApiBaseResponse<ProxyListResponse>;
export type ProxyApiResponse = ApiBaseResponse<Proxy>;
export type ProductListApiResponse = ApiBaseResponse<ProductListResponse>;
export type ProductApiResponse = ApiBaseResponse<Product>;
export type SoftwareListApiResponse = ApiBaseResponse<SoftwareListResponse>;
export type SoftwareApiResponse = ApiBaseResponse<Software>;
export type SoftwareVersionApiResponse = ApiBaseResponse<SoftwareVersion>;
export type SystemSettingApiResponse = ApiBaseResponse<SystemSetting[]>;
export type BroadcastApiResponse = ApiBaseResponse<Broadcast[]>;
export type GroupListApiResponse = ApiBaseResponse<{ groups: Group[] }>;
export type GroupApiResponse = ApiBaseResponse<Group>;
export type DownloadSourceApiResponse = ApiBaseResponse<any[]>;
export type CodeResponse = ApiBaseResponse<any>;
