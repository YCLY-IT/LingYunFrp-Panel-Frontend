import { Group } from "@/types";

export interface LoginParams {
    username: string;
    password: string;
    remember: boolean;
    url: string;
}
  
export interface LoginInfo {
    email: string;
    username: string;
    nickname: string;
    token: string;
}


export interface RegisterParams {
    username: string;
    nickname: string;
    password: string;
    email: string;
    code: string;
    url: string;
}

export interface ForgetParams {
    email: string;
    password: string;
    code: string;
    url: string;
  }

export interface TrafficData {
  date: string;
  inTraffic: number;
  outTraffic: number;
  userId: number;
}

export interface ApiBaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
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
  broadcast: string
}

export interface UserInfoStore extends LoginInfo {
  group: string;
  avatar: string;
}

export interface UserInfoData {
  avatar: string;
  email: string;
  isRealname: boolean;
  nickname: string;
  friendlyGroup: string;
  group: string;
  status: string;
  outlimit: number;
  inlimit: number;
  traffic: number;
  maxProxies: number;
  username: string;
  remainder: number;
  sign: string;
  signRemainder: number;
  point: number;
  regTime: string;
  usedProxies: number;
  token: string;
}

export interface SignData {
  point: number;
  traffc: number;
}

export interface StatusData {
  total_traffic_in: number;
  total_traffic_out: number;
  today_out_traffic: number;
  today_in_traffic: number;
  node_name: string;
  id: number;
  isOnline: boolean;
  client_counts: number;
  tunnel_counts: number;
}

export interface UserTraffic {
  allTraffic: number;
  todayUsedTraffic: number;
  allUsedTraffic: number;
}

export interface DownloadSource {
  id: number;
  name: string;
  path: string;
}

export interface Software extends DownloadSource {
  id: number;
  code: string;
  name: string;
  description: string;
  sourceId: number;
}

export interface SoftwareVersion {
  id: number;
  name: string;
  os: string;
  arch: string;
  version: string;
  softwareId: number;
  downloadUrl: string;
}

export interface Product {
  id: number;
  name: string;
  isPermanent: boolean;
  type: string;
  pointPrice: number;
  price: number;
  desc: string;
  payMethod: string;
  payMethods: string[];
  isPoint: boolean;
  selectedAmount: number;
}

export interface BuyProductParams {
  productId: number;
  type: string;
  amount: number;
  isPoint: boolean;
}

export interface ProductsData {
  products: Product[];
}

export interface CodeResponse {
  code: number;
  message: string;
}

export interface HitokotoResponse {
  hitokoto: string;
  from: string;
  from_who: string;
  creator: string;
  creator_uid: number;
  reviewer: number;
  uuid: string;
  created_at: string;
  type: string;
}

export interface LoginResponse {
  code: number;
  data: {
    Authorization: string;
    [key: string]: any;
  };
  expires: number;
  message: string;
}

export type GroupResponse = ApiBaseResponse<Group[]>;
export type UserTrafficResponse = ApiBaseResponse<UserTraffic>;
export type StatusResponse = ApiBaseResponse<StatusData>;
export type SignResponse = ApiBaseResponse<SignData>;
export type UserInfoResponse = ApiBaseResponse<UserInfoData>;
export type BroadcastResponse = ApiBaseResponse<BroadcastData[]>;
export type GitHubCommitsResponse = ApiBaseResponse<GitHubCommit[]>;
export type TrafficTrendResponse = ApiBaseResponse<TrafficData[]>;
export type ProductsResponse = ApiBaseResponse<ProductsData>;
export type SoftwaresResponse = ApiBaseResponse<Software[]>;
export type DownloadSourcesResponse = ApiBaseResponse<DownloadSource[]>;
export type SoftwareVersionsResponse = ApiBaseResponse<SoftwareVersion[]>;
export type BuyProductResponse = ApiBaseResponse<any>;
export type CodeSendResponse = ApiBaseResponse<any>;
export type LogoutResponse = ApiBaseResponse<any>;

export interface UpdateUsernameParams {
  newUsername: string;
  emailCode: string;
}

export interface UpdatePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RealnameParams {
  name: string;
  IDCard: string;
  phone: string;
  phoneCode: string;
}

export interface AvatarResponse {
  code: number;
  data: string;
  message: string;
}

export interface StatisticData {
  totalUsers: number;
  totalProxies: number;
  totalTraffic: number;
  onlineUsers: number;
}

export interface NodeStatus {
  id: number;
  name: string;
  isOnline: boolean;
  clientCount: number;
  tunnelCount: number;
  totalTrafficIn: number;
  totalTrafficOut: number;
  todayTrafficIn: number;
  todayTrafficOut: number;
}

export interface UploadFileInfo {
  id: string;
  name: string;
  status: 'pending' | 'uploading' | 'finished' | 'error';
  percentage: number;
  file?: File;
  url?: string;
  type?: string;
  batchId?: string | null;
  thumbnailUrl?: string;
  fullPath?: string;
}

export interface UsernameForm {
  currentUsername: string;
  newUsername: string;
  emailCode: string;
}

export interface AvatarForm {
  avatarUrl: string;
  avatarFile: UploadFileInfo[];
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NicknameForm {
  newNickname: string;
}

export interface RealnameForm {
  realname: string;
  idCard: string;
  phone: string;
  phoneCode: string;
}

export interface ModalStates {
  changeUsername: boolean;
  changeAvatar: boolean;
  changePassword: boolean;
  changeEmail: boolean;
  changeNickname: boolean;
  changeRealname: boolean;
}

export type UpdateUsernameResponse = CodeResponse;
export type UpdateNicknameResponse = CodeResponse;
export type UpdatePasswordResponse = CodeResponse;
export type UpdateAvatarResponse = AvatarResponse;
export type SubmitRealnameResponse = CodeResponse;
export type StatisticResponse = ApiBaseResponse<StatisticData>;
export type NodeStatusResponse = ApiBaseResponse<NodeStatus[]>;