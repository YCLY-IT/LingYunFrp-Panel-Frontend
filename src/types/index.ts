export * from './proxy'
export * from './User'

export declare interface Window extends globalThis.Window {
    $loadingBar?: {
        start: () => void
        finish: () => void
        error: () => void
    }
    $message?: any
    $dialog?: any
    $notification?: any
    initGeetest?: (config: any, callback: (captcha: any) => void) => void;
    gt?: string;
    challenge?: string;
}
