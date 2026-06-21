import {ISportsTalkConfigurable} from "../Configuration";
import {RestApiResult} from "../../models/CommonModels";
import {
    TelemetrySnapshot,
    TelemetryIncrementRequest,
    TelemetrySampleRequest,
    TelemetryHeartbeatRequest,
    TelemetryBatchRequest,
    TelemetryBatchResult,
} from "../../models/telemetry/Telemetry";

/**
 * Generic real-time telemetry meter. Push high-frequency samples into an arbitrary `contextid` (any string
 * you choose, e.g. `game:lakers-celtics`) and poll a live, synchronized aggregate that drives meters such as
 * cheer/boo counts, a loudness meter, floating-reaction visualizations, or "users online now".
 *
 * `contextid` and `key` are customer-owned identifiers: the client URL-encodes them for transport and the
 * server uses the decoded value verbatim. The decoded value must be URL-safe (letters, digits, and
 * `- . _ ~ :`) and at most 256 characters, otherwise the server rejects the request with a 400.
 * @interface
 */
export interface ITelemetryService extends ISportsTalkConfigurable {
    /** metric: record one (or `by`) occurrence(s) of a counter signal. */
    increment(contextid: string, key: string, request: TelemetryIncrementRequest): Promise<RestApiResult<null>>
    /** gauge: record a continuous 0..1 reading (e.g. mic loudness) from a user. */
    sample(contextid: string, key: string, request: TelemetrySampleRequest): Promise<RestApiResult<null>>
    /** presence: mark a user active in the context; send periodically while engaged. */
    heartbeat(contextid: string, key: string, request: TelemetryHeartbeatRequest): Promise<RestApiResult<null>>
    /** Submit many actions in one request (best-effort, partial success). Valid items are pipelined together. */
    batch(contextid: string, request: TelemetryBatchRequest): Promise<RestApiResult<TelemetryBatchResult>>
    /** Read the live aggregate for every signal in the context. Poll ~1s to drive meters. */
    getSnapshot(contextid: string): Promise<TelemetrySnapshot>
}
