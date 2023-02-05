"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestfulWebhookService = void 0;
var utils_1 = require("../../utils");
var api_1 = require("../../constants/api");
var errors_1 = require("../../errors");
var network_1 = require("../../network");
var MISSING_ID = "Missing webhook or webhook missing ID";
/**
 * This class uses REST operations to manage webhooks. Most clients will not need it unless you are building a custom admin UI.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
var RestfulWebhookService = /** @class */ (function () {
    function RestfulWebhookService(config) {
        var _this = this;
        this._config = { appId: "" };
        this._apiExt = 'webhook/hooks';
        /**
         * List all webhooks
         */
        this.listWebhooks = function () {
            return network_1.stRequest({
                url: utils_1.buildAPI(_this._config, _this._apiExt),
                method: api_1.GET,
                headers: _this._apiHeaders
            }).then(function (response) {
                return response.data;
            });
        };
        /**
         * Get Webhook Logs
         */
        this.listWebhookLogs = function (webhook, logRequest) {
            var id = utils_1.forceObjKeyOrString(webhook);
            return network_1.stRequest({
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id + "/logentries"),
                method: api_1.GET,
                headers: _this._apiHeaders
            }).then(function (response) {
                return response.data;
            });
        };
        /**
         * Create a webhook
         * @param hook
         */
        this.createWebhook = function (hook) {
            return network_1.stRequest({
                url: utils_1.buildAPI(_this._config, _this._apiExt),
                method: api_1.POST,
                headers: _this._apiHeaders,
                data: hook
            }).then(function (response) {
                return response.data;
            });
        };
        /**
         * Update an existing hook
         * @param hook
         */
        this.updateWebhook = function (hook) {
            if (!hook || !hook.id) {
                throw new errors_1.ValidationError(MISSING_ID);
            }
            return network_1.stRequest({
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + hook.id),
                method: api_1.PUT,
                headers: _this._apiHeaders,
                data: hook
            }).then(function (response) {
                return response.data;
            });
        };
        /**
         * Delete a webhook
         * @param hook
         */
        this.deleteWebhook = function (hook) {
            if (!hook) {
                throw new errors_1.ValidationError(MISSING_ID);
            }
            // @ts-ignore
            var id = hook.id || hook;
            var config = {
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id),
                method: api_1.DELETE,
                headers: _this._apiHeaders
            };
            return network_1.stRequest(config).then(function (response) {
                return response.data;
            });
        };
        this.setConfig(config);
    }
    /**
     * Set config
     * @param config
     */
    RestfulWebhookService.prototype.setConfig = function (config) {
        this._config = Object.assign({}, api_1.DEFAULT_CONFIG, config);
        this._apiHeaders = utils_1.getJSONHeaders(this._config.apiToken, this._config.userToken);
    };
    return RestfulWebhookService;
}());
exports.RestfulWebhookService = RestfulWebhookService;
//# sourceMappingURL=RestfulWebhookService.js.map