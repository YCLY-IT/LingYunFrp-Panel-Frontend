import { get } from '../request'
import { getToken } from '../token'
import { StatusResponse } from '../user/type'
import { NodeResponse } from './type'

export async function getStatus(): Promise<StatusResponse> {
  return await get<StatusResponse>('/proxy/status', {
    headers: {
      Authorization: getToken(),
    },
  })
}

export async function getNodes(): Promise<any> {
  return await get<NodeResponse>('/proxy/node/list', {
    headers: {
      Authorization: getToken(),
    },
  })
}
