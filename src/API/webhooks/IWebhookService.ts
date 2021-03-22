import {Webhook, WebhookListResponse} from "../../models/CommonModels";
import {ISportsTalkConfigurable} from "../Configuration";

/**
 * @interface
 */
export interface IWebhookService extends ISportsTalkConfigurable {
    listWebhooks(): Promise<WebhookListResponse>

    createWebhook(hook: Webhook): Promise<Webhook>;

    updateWebhook(hook: Webhook): Promise<Webhook>;

    deleteWebhook(hook: Webhook | string): Promise<Webhook>;
}