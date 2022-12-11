import { ListRequest, SportsTalkConfig } from "../../../models/CommonModels";
import { IWebhookService } from "../../../API/webhooks/IWebhookService";
import { Webhook, WebhookListResponse, WebhookLogResponse } from "../../../models/webhooks/Webhooks";
/**
 * This class uses REST operations to manage webhooks. Most clients will not need it unless you are building a custom admin UI.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export declare class RestfulWebhookService implements IWebhookService {
    private _config;
    private _apiHeaders;
    private _apiExt;
    constructor(config: SportsTalkConfig);
    /**
     * Set config
     * @param config
     */
    setConfig(config: SportsTalkConfig): void;
    /**
     * List all webhooks
     */
    listWebhooks: () => Promise<WebhookListResponse>;
    /**
     * Get Webhook Logs
     */
    listWebhookLogs: (webhook: Webhook | string, logRequest: ListRequest) => Promise<WebhookLogResponse>;
    /**
     * Create a webhook
     * @param hook
     */
    createWebhook: (hook: Webhook) => Promise<Webhook>;
    /**
     * Update an existing hook
     * @param hook
     */
    updateWebhook: (hook: Webhook) => Promise<Webhook>;
    /**
     * Delete a webhook
     * @param hook
     */
    deleteWebhook: (hook: Webhook | string) => Promise<Webhook>;
}
