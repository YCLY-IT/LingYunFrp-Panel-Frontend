import { get } from '../request'
import { getToken } from '../token'
import { NodeResponse } from './type'

export interface NodeHistoryItem {
  cpu_usage: number
  used_memory: number
  free_memory: number
  in_traffic: number
  out_traffic: number
  client_counts: number
  tunnel_counts: number
  cur_rate_in_kb: number
  cur_rate_out_kb: number
  record_time: string
}

export async function getNodeHistory(
  nodeId: number,
  hours: number = 1,
): Promise<NodeHistoryItem[]> {
  return await get<NodeHistoryItem[]>(
    `/proxies/status?nodeId=${nodeId}&hours=${hours}`,
    {
      headers: {
        Authorization: getToken(),
      },
    },
  )
}

export async function getNodes(): Promise<any> {
  return await get<NodeResponse>('/proxies/nodes', {
    headers: {
      Authorization: getToken(),
    },
  })
}
