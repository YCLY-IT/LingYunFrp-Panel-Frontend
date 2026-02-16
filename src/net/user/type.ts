export interface LoginParams {
  username: string
  password: string
  remember: boolean
  url: string
}

export interface LoginInfo {
  email: string
  username: string
  nickname: string
  token: string
}

export interface RegisterParams {
  username: string
  nickname: string
  password: string
  email: string
  code: string
}

export interface ForgetParams {
  email: string
  password: string
  code: string
}

export interface TrafficData {
  date: {
    day: string
    hour: number
  }
  inTraffic: number
  outTraffic: number
  userId: number
}

export interface ApiBaseResponse<T = any> {
  code: number
  data: T
  message: string
}

// 分页响应基础类型
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GitHubCommit {
  sha: string
  html_url: string
  author: {
    login: string
    avatar_url: string
  }
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
}

export interface BroadcastData {
  id: number
  title: string
  message: string
  top: boolean
  created_at: string
  updated_at: string
}

export interface UserInfoStore extends LoginInfo {
  group: string
  avatar: string
}

export interface UserInfoData {
  avatar: string
  email: string
  isRealname: boolean
  nickname: string
  friendlyGroup: string
  group: string
  status: string
  outlimit: number
  inlimit: number
  noCNOutlimit: number
  noCNInlimit: number
  traffic: number
  maxProxies: number
  username: string
  remainder: number
  sign: string
  signRemainder: number
  point: number
  regTime: string
  usedProxies: number
  token: string
}

export interface SignData {
  point: number
  traffic: number
}

export interface StatusData {
  total_traffic_in: number
  total_traffic_out: number
  today_out_traffic: number
  today_in_traffic: number
  node_name: string
  id: number
  isOnline: boolean
  client_counts: number
  tunnel_counts: number
  cpu_usage?: number
  used_memory?: number
  total_memory?: number
  memory_used?: number
  memory_total?: number
  free_memory?: number
  cur_rate_in_kb?: number
  cur_rate_out_kb?: number
}

export interface UserTraffic {
  allTraffic: number
  todayUsedTraffic: number
  allUsedTraffic: number
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

export interface DiscountDetail {
  months: number
  total_price: number
  discount_rate: number
  saved_amount: number
  original_price: number
  total_points: number
  saved_points: number
  original_points: number
}

export interface DiscountInfo {
  has_discount: boolean
  base_price: number
  point_price: number
  rules: Record<string, number>
  details: DiscountDetail[]
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
  discountInfo?: DiscountInfo
}

export interface BuyProductParams {
  productId: number
  type: string
  amount: number
  isPoint: boolean
}

export interface ProductsData {
  products: Product[]
}

export interface CodeResponse {
  code: number
  message: string
}

export interface HitokotoResponse {
  hitokoto: string
  from: string
  from_who: string
  creator: string
  creator_uid: number
  reviewer: number
  uuid: string
  created_at: string
  type: string
}

export interface LoginResponse {
  code: number
  data: {
    Authorization: string
    [key: string]: any
  }
  expires: number
  message: string
}

export type GroupResponse = ApiBaseResponse<any>
export type UserTrafficResponse = ApiBaseResponse<UserTraffic>
export interface StatusDataWrapper {
  nodes: StatusData[]
}
export type StatusResponse = ApiBaseResponse<StatusDataWrapper>
export type SignResponse = ApiBaseResponse<SignData>
export type UserInfoResponse = ApiBaseResponse<UserInfoData>
export type BroadcastResponse = ApiBaseResponse<BroadcastData[]>
export type GitHubCommitsResponse = ApiBaseResponse<GitHubCommit[]>
export type TrafficTrendResponse = ApiBaseResponse<TrafficData[]>
export type ProductsResponse = ApiBaseResponse<ProductsData>
export type SoftwaresResponse = ApiBaseResponse<Software[]>
export type DownloadSourcesResponse = ApiBaseResponse<DownloadSource[]>
// 软件版本列表分页响应
export interface SoftwareVersionsResponseData {
  list: SoftwareVersion[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
export type SoftwareVersionsResponse =
  ApiBaseResponse<SoftwareVersionsResponseData>
export type BuyProductResponse = ApiBaseResponse<any>
export type CodeSendResponse = ApiBaseResponse<any>
export type LogoutResponse = ApiBaseResponse<any>

export interface UpdateUsernameParams {
  newUsername: string
  emailCode: string
}

export interface UpdatePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface RealnameParams {
  name: string
  IDCard: string
  phone: string
  phoneCode: string
}

export interface AvatarResponse {
  code: number
  data: string
  message: string
}

export interface StatisticData {
  totalUsers: number
  totalProxies: number
  totalTraffic: number
  onlineUsers: number
}

export interface NodeStatus {
  id: number
  name: string
  isOnline: boolean
  clientCount: number
  tunnelCount: number
  totalTrafficIn: number
  totalTrafficOut: number
  todayTrafficIn: number
  todayTrafficOut: number
}

export interface UploadFileInfo {
  id: string
  name: string
  status: 'pending' | 'uploading' | 'finished' | 'error'
  percentage: number
  file?: File
  url?: string
  type?: string
  batchId?: string | null
  thumbnailUrl?: string
  fullPath?: string
}

export interface UsernameForm {
  currentUsername: string
  newUsername: string
  emailCode: string
}

export interface AvatarForm {
  avatarUrl: string
  avatarFile: UploadFileInfo[]
}

export interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface NicknameForm {
  newNickname: string
}

export interface RealnameForm {
  realname: string
  idCard: string
  phone: string
  phoneCode: string
}

export interface ModalStates {
  changeUsername: boolean
  changeAvatar: boolean
  changePassword: boolean
  changeEmail: boolean
  changeNickname: boolean
  changeRealname: boolean
}

export type UpdateUsernameResponse = CodeResponse
export type UpdateNicknameResponse = CodeResponse
export type UpdatePasswordResponse = CodeResponse
export type UpdateAvatarResponse = AvatarResponse
export type SubmitRealnameResponse = CodeResponse
export type CheckPaymentStatusResponse = CodeResponse
export type StatisticResponse = ApiBaseResponse<StatisticData>
export type NodeStatusResponse = ApiBaseResponse<NodeStatus[]>
