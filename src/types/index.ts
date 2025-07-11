export * from './proxy'
export * from './User'
import type { DialogApi, MessageApi } from 'naive-ui'

declare global {
  interface Window {
    $loadingBar?: {
      start: () => void
      finish: () => void
      error: () => void
    }
    $message?: MessageApi
    $dialog?: DialogApi
    $notification?: any
    initGeetest?: (config: any, callback: (captcha: any) => void) => void
    gt?: string
    challenge?: string
  }
}
