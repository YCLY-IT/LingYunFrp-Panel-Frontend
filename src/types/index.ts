export * from './proxy'
export * from './User'
import type { DialogApi, MessageApi, } from 'naive-ui'
export declare interface Window extends globalThis.Window {
    $loadingBar?: {
        start: () => void
        finish: () => void
        error: () => void
    }
    $message?: MessageApi
    $dialog?: DialogApi
    $notification?: any
    initGeetest?: (config: any, callback: (captcha: any) => void) => void;
    gt?: string;
    challenge?: string;

}