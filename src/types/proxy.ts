export interface CreateProxyArgs {
    nodeId: number
    proxyName: string
    localIp: string
    localPort: number
    remotePort: number
    domain?: string
    proxyType: string
    accessKey?: string
    hostHeaderRewrite?: string
    headerXFromWhere?: string
    proxyProtocolVersion?: string
    useEncryption: boolean
    useCompression: boolean
}
export interface Proxy {
    proxyId: number;
    proxyName: string;
    nodeId: number;
    localIp: string;
    localPort: number;
    remotePort: number;
    domain?: string;
    proxyType: string;
    /** 隧道是否在线 */
    isOnline: boolean;
    /** 隧道是否被封禁（管理员手动封禁） */
    isBanned: boolean;
    /** 隧道所属用户名 */
    username?: string;
    /** 隧道是否被禁用 */
    isDisabled?: boolean;
    location: string;
    accessKey: string;
    lastStartTime: number;
    lastCloseTime: number;
    hostHeaderRewrite: string;
    headerXFromWhere: string;
    useEncryption: boolean;
    useCompression: boolean;
    proxyProtocolVersion: string;
}
export interface UserNodeName {
    nodeId: number;
    name: string;
    hostname: string;
}

export interface FilterProxiesArgs {
    page: number;
    limit: number;
    nodeId?: number;
    username?: string;
    proxyType?: string;
    isOnline?: boolean;
    isBanned?: boolean;
    keyword?: string;
}

export interface UserNode {
    id: any;
    name: string;
    hostname: string;
    description: string;
    allowGroup: string;
    allowPort: string;
    allowType: string;
    isOnline: boolean;
    isDisabled: boolean;
}