import {AxiosRequestConfig} from "axios";
import {buildAPI, getJSONHeaders} from "../../utils";
import {DEFAULT_CONFIG, GET, POST} from "../../constants/api";
import {RestApiResult, SportsTalkConfig} from "../../../models/CommonModels";
import {ValidationError} from "../../errors";
import {stRequest} from "../../network";
import {ITelemetryService} from "../../../API/telemetry/ITelemetryService";
import {
    TelemetrySnapshot,
    TelemetryIncrementRequest,
    TelemetrySampleRequest,
    TelemetryHeartbeatRequest,
    TelemetryBatchRequest,
    TelemetryBatchResult,
} from "../../../models/telemetry/Telemetry";

const MISSING_CONTEXT = "A contextid is required for telemetry operations";
const MISSING_KEY = "A signal key is required for this telemetry operation";

/**
 * REST implementation of the generic real-time telemetry meter.
 *
 * `contextid` and `key` are customer-owned identifiers used verbatim by the server. This client
 * URL-encodes them when building the request path so reserved characters transport safely as a single
 * path segment; the decoded value must still be URL-safe (letters, digits, and `- . _ ~ :`) and at most
 * 256 characters or the server returns a 400.
 *
 * Write calls resolve to the standard API result envelope (`RestApiResult`); the snapshot read resolves to
 * the `TelemetrySnapshot` directly.
 *
 * NOTE: All operations can throw on network/server errors. Ensure every returned promise is handled.
 * @class
 */
export class RestfulTelemetryService implements ITelemetryService {
    private _config: SportsTalkConfig = {appId: ""};
    private _apiHeaders;
    private _apiExt = 'telemetry/contexts';

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    /**
     * Set config
     * @param config
     */
    public setConfig(config: SportsTalkConfig) {
        this._config = Object.assign({}, DEFAULT_CONFIG, config);
        this._apiHeaders = getJSONHeaders(this._config.apiToken, this._config.userToken);
    }

    /**
     * Build the base path for a context, URL-encoding the customer-owned contextid. The server never
     * modifies the identifier, so the client is responsible for encoding it for safe transport.
     */
    private _contextPath(contextid: string): string {
        if (!contextid) {
            throw new ValidationError(MISSING_CONTEXT);
        }
        return `${this._apiExt}/${encodeURIComponent(contextid)}`;
    }

    increment = (contextid: string, key: string, request: TelemetryIncrementRequest): Promise<RestApiResult<null>> => {
        if (!key) {
            throw new ValidationError(MISSING_KEY);
        }
        const config: AxiosRequestConfig = {
            method: POST,
            headers: this._apiHeaders,
            url: buildAPI(this._config, `${this._contextPath(contextid)}/metrics/${encodeURIComponent(key)}/increment`),
            data: request,
        }
        return stRequest(config);
    }

    sample = (contextid: string, key: string, request: TelemetrySampleRequest): Promise<RestApiResult<null>> => {
        if (!key) {
            throw new ValidationError(MISSING_KEY);
        }
        const config: AxiosRequestConfig = {
            method: POST,
            headers: this._apiHeaders,
            url: buildAPI(this._config, `${this._contextPath(contextid)}/gauges/${encodeURIComponent(key)}/sample`),
            data: request,
        }
        return stRequest(config);
    }

    heartbeat = (contextid: string, key: string, request: TelemetryHeartbeatRequest): Promise<RestApiResult<null>> => {
        if (!key) {
            throw new ValidationError(MISSING_KEY);
        }
        const config: AxiosRequestConfig = {
            method: POST,
            headers: this._apiHeaders,
            url: buildAPI(this._config, `${this._contextPath(contextid)}/presence/${encodeURIComponent(key)}/heartbeat`),
            data: request,
        }
        return stRequest(config);
    }

    batch = (contextid: string, request: TelemetryBatchRequest): Promise<RestApiResult<TelemetryBatchResult>> => {
        const config: AxiosRequestConfig = {
            method: POST,
            headers: this._apiHeaders,
            url: buildAPI(this._config, `${this._contextPath(contextid)}/batch`),
            data: request,
        }
        return stRequest(config);
    }

    getSnapshot = (contextid: string): Promise<TelemetrySnapshot> => {
        const config: AxiosRequestConfig = {
            method: GET,
            headers: this._apiHeaders,
            url: buildAPI(this._config, this._contextPath(contextid)),
        }
        return stRequest(config).then(response => response.data);
    }
}
