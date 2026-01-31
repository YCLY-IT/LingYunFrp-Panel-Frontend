export interface UserInfo {
  id: number
  username: string
  isRealname: boolean
  group: string
  friendlyGroup: string
  usedProxies: number
  maxProxies: number
  created_at: number
  traffic: number
  outBound: number
  inBound: number
  email: string
  status: number
  todaySigned: boolean
  token: string
}
export interface FilterUsersArgs {
  page: number
  limit: number
  group?: string
  isRealname?: boolean
  status?: number
  keyword?: string
}

export interface UpdateNodeArgs {
  id: number
  name: string
  hostname: string
  ip: string
  description: string
  token: string
  port: number
  adminPort: number
  adminPass: string
  group: string
  allowPort: string
  allowType: string
  need_realname: boolean
  bandWidth: number
  location: string
}

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
}
export interface Group {
  id: number
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

export interface DownloadSource {
  id: number
  name: string
  path: string
}

export interface Software extends DownloadSource {
  id: number
  code: string
  name: string
  description: string
  source_id: number
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
  force_update: boolean
  size: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  isPermanent: boolean
  type: string
  pointPrice: number
  price: number
  desc: string
  payMethod: string
  payMethods: string[]
  isPoint: boolean
  selectedAmount: number
}

export interface TrafficType {
  todayUsedTraffic: number
  allUsedTraffic: number
  allTraffic: number
}

export interface TrafficData {
  date: string
  inTraffic: number
  outTraffic: number
  userId: number
}
