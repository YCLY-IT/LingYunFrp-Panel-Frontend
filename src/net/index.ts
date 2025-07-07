import { getNodes, getStatus } from "./proxy/node"
import { 
    createTunnel, 
    getProxyList, 
    getProxyNodes, 
    updateProxy, 
    deleteProxy, 
    toggleProxy, 
    getProxyConfig, 
    getFreePort,
    batchOperateProxies,
    getProxyStats,
    searchProxies
} from "./proxy/proxy"
import { 
    forget, 
    getBroadcast, 
    getHitokoto,  
    getTrafficTrend, 
    getUserGroups, 
    getUserInfo, 
    getUserTraffic, 
    login, 
    logout, 
    register, 
    sendEmailCode, 
    sendSmsCode, 
    sign,
    getSoftwares,
    getDownloadSources,
    getSoftwareVersions,
    getProducts,
    buyProduct,
    updateUsername,
    updateNickname,
    updateAvatar,
    updatePassword,
    submitRealname
} from "./user/user"
import {
    getUserList,
    getUserById,
    updateUser,
    toggleUser,
    getNodeList,
    createNode,
    updateNode,
    deleteNode,
    toggleNode,
    getProxyList as getAdminProxyList,
    updateProxy as updateAdminProxy,
    deleteProxy as deleteAdminProxy,
    toggleProxy as toggleAdminProxy,
    getProductList as getAdminProductList,
    createProduct,
    updateProduct,
    deleteProduct,
    getSoftwareList as getAdminSoftwareList,
    createSoftware,
    updateSoftware,
    deleteSoftware,
    createSoftwareVersion,
    deleteSoftwareVersion,
    getSoftwareVersions as getAdminSoftwareVersions,
    getSystemSettings,
    getBroadcastList,
    createBroadcast,
    getGroupList,
    createGroup,
    updateGroup,
    deleteGroup,
    getDownloadSources as getAdminDownloadSources,
    createDownloadSource,
    updateDownloadSource,
    deleteDownloadSource,
    updateSafetySetting
} from "./admin/admin"
import { get } from './request'

const userApi = {
    login,
    register,
    forget,
    sendEmailCode,
    sendSmsCode,
    getHitokoto,
    logout,
    getTrafficTrend,
    getBroadcast,
    getUserInfo,
    getUserTraffic,
    sign,
    getStatus,
    getNodes,
    getUserGroups,
    createTunnel,
    getProxyList,
    getProxyNodes,
    updateProxy,
    deleteProxy,
    toggleProxy,
    getProxyConfig,
    getFreePort,
    batchOperateProxies,
    getProxyStats,
    searchProxies,
    getSoftwares,
    getDownloadSources,
    getSoftwareVersions,
    getProducts,
    buyProduct,
    updateUsername,
    updateNickname,
    updateAvatar,
    updatePassword,
    submitRealname
}

const adminApi = {
    // 用户管理
    getUserList,
    getUserById,
    updateUser,
    toggleUser,
    // 节点管理
    getNodeList,
    createNode,
    updateNode,
    deleteNode,
    toggleNode,
    // 代理管理
    getProxyList: getAdminProxyList,
    updateProxy: updateAdminProxy,
    deleteProxy: deleteAdminProxy,
    toggleProxy: toggleAdminProxy,
    // 产品管理
    getProductList: getAdminProductList,
    createProduct,
    updateProduct,
    deleteProduct,
    // 软件管理
    getSoftwareList: getAdminSoftwareList,
    createSoftware,
    updateSoftware,
    deleteSoftware,
    createSoftwareVersion,
    deleteSoftwareVersion,
    getSoftwareVersions: getAdminSoftwareVersions,
    // 系统设置
    getSystemSettings,
    updateSafetySetting,
    getBroadcastList,
    createBroadcast,
    // 用户组管理
    getGroupList,
    createGroup,
    updateGroup,
    deleteGroup,
    // 下载源管理
    getDownloadSources: getAdminDownloadSources,
    createDownloadSource,
    updateDownloadSource,
    deleteDownloadSource
}

// 新增：Bing背景图片API封装
export function getBingBackgroundUrl(): Promise<string> {
    // 直接返回图片URL字符串
    return get<{url: string}>(
        'https://api.nxvav.cn/api/bing'
    ).then(res => {
        // 兼容API返回格式
        if (typeof res === 'string') return res
        if (res && res.url) return res.url
        return 'https://api.nxvav.cn/api/bing'
    })
}

export { userApi, adminApi }