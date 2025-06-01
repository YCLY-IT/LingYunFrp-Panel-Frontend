export interface UserInfo {
    id: number
    username: string
    isRealname: boolean
    group: string
    friendlyGroup: string
    usedProxies: number
    maxProxies: number
    create_at: number
    traffic: number
    outBound: number
    inBound: number
    email: string
    status: number
    todaySigned: boolean
    token : string
}
export interface FilterUsersArgs {
    page: number;
    limit: number;
    group?: string;
    isRealname?: boolean;
    status?: number;
    keyword?: string;
}

export interface UpdateNodeArgs {
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
}

export interface GetNodesArgs {
    page: number;
    limit: number;
    isOnline?: boolean;
    isDisabled?: boolean;
    keyword?: string;
}

export interface Node {
    port: number
    nodeId: number;
    name: string;
    hostname: string;
    description: string;
    token: string;
    servicePort: number;
    adminPort: number;
    adminPass: string;
    allowGroup: string;
    allowPort: string;
    allowType: string;
    isDisabled: boolean;
    isOnline: boolean;
    ip: string;
    need_realname: boolean;
    bandWidth: number;
    location: string;
    id: number;
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
}

export interface Download {
    id: number
    name: string
    path: string
    arch: string
    version: string
    os: string  
    desc: string
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
  date: string;
  inTraffic: number;
  outTraffic: number;
  userId: number;
}