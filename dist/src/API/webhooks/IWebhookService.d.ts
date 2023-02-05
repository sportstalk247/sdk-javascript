import { ISportsTalkConfigurable } from "../Configuration";
import { Webhook, WebhookListResponse } from "../../models/webhooks/Webhooks";
/**
 * @interface
 */
export interface IWebhookService extends ISportsTalkConfigurable {
    listWebhooks(): Promise<WebhookListResponse>;
    createWebhook(hook: Webhook): Promise<Webhook>;
    updateWebhook(hook: Webhook): Promise<Webhook>;
    deleteWebhook(hook: Webhook | string): Promise<Webhook>;
}
