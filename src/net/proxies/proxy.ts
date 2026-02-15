import { post, get, put, patch, del } from '../request'
import { getToken } from '../token'
import {
  CreateTunnelParams,
  UpdateTunnelParams,
  GetProxyConfigParams,
  GetFreePortParams,
  ToggleProxyParams,
  DeleteProxyParams,
  ProxyListResponse,
  NodeResponse,
  ProxyConfigResponse,
  FreePortResponse,
  CreateTunnelResponse,
  UpdateTunnelResponse,
  DeleteTunnelResponse,
  ToggleTunnelResponse,
} from './type'

/**
 * 创建隧道
 * @param params 隧道参数
 * @returns 创建结果
 */
export async function createTunnel(
  params: CreateTunnelParams,
): Promise<CreateTunnelResponse> {
  try {
    return await post<CreateTunnelResponse>('/proxies', params, {
      headers: {
        Authorization: getToken(),
      },
    })
  } catch (error) {
    console.error('创建隧道失败:', error)
    throw error
  }
}

/**
 * 获取代理列表
 * @returns 代理列表
 */
export async function getProxyList(): Promise<ProxyListResponse> {
  try {
    return await get<ProxyListResponse>('/proxies', {
      headers: {
        Authorization: getToken(),
      },
    })
  } catch (error) {
    console.error('获取代理列表失败:', error)
    throw error
  }
}

/**
 * 获取代理节点列表
 * @returns 节点列表
 */
export async function getProxyNodes(): Promise<NodeResponse> {
  try {
    return await get<NodeResponse>('/proxies/nodes', {
      headers: {
        Authorization: getToken(),
      },
    })
  } catch (error) {
    console.error('获取节点列表失败:', error)
    throw error
  }
}

/**
 * 更新隧道
 * @param params 更新参数
 * @returns 更新结果
 */
export async function updateProxy(
  params: UpdateTunnelParams,
): Promise<UpdateTunnelResponse> {
  try {
    return await put<UpdateTunnelResponse>('/proxies', params, {
      headers: {
        Authorization: getToken(),
      },
    })
  } catch (error) {
    console.error('更新隧道失败:', error)
    throw error
  }
}

/**
 * 删除隧道
 * @param params 删除参数
 * @returns 删除结果
 */
export async function deleteProxy(
  params: DeleteProxyParams,
): Promise<DeleteTunnelResponse> {
  try {
    return await del<DeleteTunnelResponse>('/proxies', params, {
      headers: {
        Authorization: getToken(),
      },
    })
  } catch (error) {
    console.error('删除隧道失败:', error)
    throw error
  }
}

/**
 * 切换隧道状态
 * @param params 切换参数
 * @returns 切换结果
 */
export async function toggleProxy(
  params: ToggleProxyParams,
): Promise<ToggleTunnelResponse> {
  try {
    return await patch<ToggleTunnelResponse>('/proxies/toggle', params, {
      headers: {
        Authorization: getToken(),
      },
    })
  } catch (error) {
    console.error('切换隧道状态失败:', error)
    throw error
  }
}

/**
 * 获取隧道配置
 * @param params 配置参数
 * @returns 配置内容
 */
export async function getProxyConfig(
  params: GetProxyConfigParams,
): Promise<ProxyConfigResponse> {
  try {
    return await get<ProxyConfigResponse>('/proxies/config', {
      params,
      headers: {
        Authorization: getToken(),
      },
    })
  } catch (error) {
    console.error('获取隧道配置失败:', error)
    throw error
  }
}

/**
 * 获取空闲端口
 * @param params 端口参数
 * @returns 空闲端口
 */
export async function getFreePort(
  params: GetFreePortParams,
): Promise<FreePortResponse> {
  try {
    return await post<FreePortResponse>('/proxies/free-port', params, {
      headers: {
        Authorization: getToken(),
      },
    })
  } catch (error) {
    console.error('获取空闲端口失败:', error)
    throw error
  }
}

/**
 * 批量操作隧道
 * @param proxyIds 隧道ID数组
 * @param action 操作类型
 * @returns 操作结果
 */
export async function batchOperateProxies(
  proxyIds: number[],
  action: 'delete' | 'toggle' | 'enable' | 'disable',
): Promise<any> {
  try {
    const params = {
      proxyIds,
      action,
    }
    return await post('/proxies/batch', params, {
      headers: {
        Authorization: getToken(),
      },
    })
  } catch (error) {
    console.error('批量操作隧道失败:', error)
    throw error
  }
}

/**
 * 获取隧道统计信息
 * @returns 统计信息
 */
export async function getProxyStats(): Promise<any> {
  try {
    return await get('/proxies/status', {
      headers: {
        Authorization: getToken(),
      },
    })
  } catch (error) {
    console.error('获取隧道统计失败:', error)
    throw error
  }
}

/**
 * 重载代理
 * @returns 重载结果
 */
export async function reloadProxies(): Promise<any> {
  try {
    return await post(
      '/proxies/reload',
      {},
      {
        headers: {
          Authorization: getToken(),
        },
      },
    )
  } catch (error) {
    console.error('重载代理失败:', error)
    throw error
  }
}
