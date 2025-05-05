import { DialogApiInjection } from 'naive-ui/es/dialog/src/DialogProvider';
import { LoadingBarApiInjection } from 'naive-ui/es/loading-bar/src/LoadingBarProvider';
import { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider';
import { NotificationApiInjection } from 'naive-ui/es/notification/src/NotificationProvider';

export * from './proxy';
export * from './user';

export interface Window extends globalThis.Window {
    $loadingBar?: LoadingBarApiInjection
    $message?: MessageApiInjection
    $dialog?: DialogApiInjection
    $notification?: NotificationApiInjection
}
