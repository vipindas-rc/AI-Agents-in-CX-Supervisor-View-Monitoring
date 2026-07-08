declare module 'agent_ui.service.notification' {
    import type { TranslateService } from '@ngx-translate/core';
    import type { IRootScopeService } from 'angular';

    export const NOTIFICATION_EVENTS: {
        ERROR: string;
        INFO: string;
        WARNING: string;
        SUCCESS: string;
        REMOVE: string;
    };

    type MessageType = 'error' | 'warning' | 'info' | 'success';

    export interface NotificationService {
        showError(message: string, props?: Record<string, any>): Notification;
        showWarning(message: string, props?: Record<string, any>): Notification;
        showInfo(message: string, props?: Record<string, any>): Notification;
        showSuccess(message: string, props?: Record<string, any>): Notification;
        setEmbeddedNotification(data: { key: string; id: string }): void;
        saveNotification(item: {
            message: string;
            type: MessageType;
            ttl?: number;
        }): void;
        showSavedNotifications(): void;
    }

    export interface Notification {
        destroy(): void;
    }

    export function NotificationService(
        $rootScope: IRootScopeService,
        growl: any,
        $translate: TranslateService,
        NOTIFICATION_EVENTS: typeof NOTIFICATION_EVENTS
    ): NotificationService;
}
