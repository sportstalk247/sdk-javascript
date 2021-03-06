/* istanbul ignore file */

import {ChatClientConfig, ClientConfig, SportsTalkConfig, Webhook, WebhookListResponse} from "../models/CommonModels";

/**
 * @interface
 */
export interface ISportsTalkConfigurable {
    setConfig(config: SportsTalkConfig):void
}

export interface IChatClientConfigurable {
    setConfig(config: ChatClientConfig): void
}

/**
 * @interface
 */
export interface IConfigurable {
    setConfig(config: ClientConfig): void
}

/**
 * @interface
 */
export interface IWebhookService extends ISportsTalkConfigurable {
    listWebhooks(): Promise<WebhookListResponse>
    createWebhook(hook: Webhook): Promise<Webhook>;
    updateWebhook(hook: Webhook): Promise<Webhook>;
    deleteWebhook(hook: Webhook | string): Promise<Webhook>;
}