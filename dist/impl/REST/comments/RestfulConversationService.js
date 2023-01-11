"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestfulConversationService = void 0;
var api_1 = require("../../constants/api");
var utils_1 = require("../../utils");
var ConversationUtils_1 = require("./ConversationUtils");
var network_1 = require("../../network");
/**
 * This is the class that governs the lifecycle of conversations.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
var RestfulConversationService = /** @class */ (function () {
    /**
     * Create a new comments service
     * @param config
     */
    function RestfulConversationService(config) {
        var _this = this;
        this._apiExt = 'comment/conversations';
        this.request = network_1.bindJWTUpdates(this);
        this.getCurrentUser = function () {
            return _this._config.user;
        };
        this.getUserToken = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._config.userToken || ''];
            });
        }); };
        this.refreshUserToken = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this._config.userTokenRefreshFunction) {
                    return [2 /*return*/, this._config.userTokenRefreshFunction(this._config.userToken || '')];
                }
                return [2 /*return*/, ''];
            });
        }); };
        this.setUser = function (user) {
            _this._config.user = user;
        };
        /**
         * Set configuraiton
         * @param config
         */
        this.setConfig = function (config) {
            _this._config = config;
            _this._apiHeaders = utils_1.getUrlEncodedHeaders(_this._config.apiToken, _this._config.userToken);
            _this._jsonHeaders = utils_1.getJSONHeaders(_this._config.apiToken, _this._config.userToken);
        };
        /**
         * Sets the user's JWT access token
         * @param userToken
         */
        this.setUserToken = function (userToken) {
            _this._config.userToken = userToken;
            _this.setConfig(_this._config);
        };
        /**
         * Sets a refreshFunction for the user's JWT token.
         * @param refreshFunction
         */
        this.setUserTokenRefreshFunction = function (refreshFunction) {
            _this._config.userTokenRefreshFunction = refreshFunction;
            _this.setConfig(_this._config);
        };
        /**
         * Create a comments
         * @param settings
         */
        this.createConversation = function (settings) {
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt),
                headers: _this._jsonHeaders,
                data: settings,
            };
            return _this.request(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Get a conversation object
         * @param conversation
         */
        this.getConversation = function (conversation) {
            // @ts-ignore
            var id = ConversationUtils_1.getUrlConversationId(conversation);
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id),
                headers: _this._jsonHeaders,
            };
            return _this.request(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Get a conversation object
         * @param conversation
         */
        this.getConversationByCustomId = function (conversation) {
            // @ts-ignore
            var id = ConversationUtils_1.getUrlConversationId(conversation, 'customid');
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, "comment/find/conversation/bycustomid?customid=" + id),
                headers: _this._jsonHeaders,
            };
            return _this.request(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Deletes a conversation and all the comments in it.
         */
        this.deleteConversation = function (conversation) {
            // @ts-ignore
            var id = ConversationUtils_1.getUrlConversationId(conversation);
            // @ts-ignore
            var config = {
                method: api_1.DELETE,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id),
                headers: _this._jsonHeaders,
            };
            return _this.request(config);
        };
        /**
         * List available conversations
         * @param filter
         */
        this.listConversations = function (filter) {
            var query = "";
            if (filter) {
                query = "?" + utils_1.formify(filter);
            }
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + query),
                headers: _this._jsonHeaders,
            };
            return _this.request(config).then(function (response) { return response.data; });
        };
        if (config) {
            this.setConfig(config);
        }
    }
    RestfulConversationService.prototype.getTokenExp = function () {
        return 0;
    };
    RestfulConversationService.prototype.getConversationBatchDetails = function (conversations, options) {
        //@ts-ignore
        var ids = [].concat(conversations).map(function (conversation) {
            //@ts-ignore
            return conversation.conversationid ? conversation.conversationid : conversation;
        });
        var requestOptions = Object.assign({}, options || {});
        var cids = [].concat(requestOptions.cid).join(',');
        var entities = [].concat(requestOptions.entities).join(',');
        var config = {
            method: api_1.GET,
            url: utils_1.buildAPI(this._config, this._apiExt + "/details/batch?ids=" + ids.join(',') + (cids ? '&cid=' + cids : '') + (entities ? '&entities=' + entities : '')),
            headers: this._jsonHeaders
        };
        return this.request(config).then(function (response) { return response.data; });
    };
    return RestfulConversationService;
}());
exports.RestfulConversationService = RestfulConversationService;
//# sourceMappingURL=RestfulConversationService.js.map