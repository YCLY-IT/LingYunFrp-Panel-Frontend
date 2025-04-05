export * from './proxy'
export * from './user'

export interface Window extends globalThis.Window {
    $loadingBar?: {
        start: () => void
        finish: () => void
        error: () => void
    }
    $message?: any
    $dialog?: any
    $notification?: any
}
