export interface UserInfo {
    userId: number
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
}
export interface FilterUsersArgs {
    page: number;
    limit: number;
    group?: string;
    isRealname?: boolean;
    status?: number;
    keyword?: string;
}
export interface UpdateNodeArgs extends AddNodeArgs {
    nodeId: number;
}

export interface GetNodesArgs {
    page: number;
    limit: number;
    isOnline?: boolean;
    isDisabled?: boolean;
    keyword?: string;
}

export interface Node {
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
    ip: string;
    need_realname: boolean;
}
export interface Group {
    name: string
    friendlyName: string
    proxies: number
    traffic: number
    out_limit: number
    in_limit: number
}

export interface DownloadSource {
    id: string
    path: string
    name: string
}

