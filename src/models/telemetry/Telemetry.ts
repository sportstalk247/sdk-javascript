import {RestApiResult} from "../CommonModels";

/**
 * The kind of a telemetry signal. Selected by which write endpoint you call (increment / sample /
 * heartbeat), it determines how samples are aggregated and how the live reading is interpreted.
 */
export enum TelemetrySignalKind {
    /** Counter. Each push is one (or `by`) occurrence(s). Answers "how many". */
    metric = "metric",
    /** Continuous 0..1 reading aggregated to an average/sum over a window. Answers "how much / how loud now". */
    gauge = "gauge",
    /** Distinct users active in a sliding window via heartbeats. Answers "how many here now". */
    presence = "presence",
}

/**
 * The live aggregate for a single signal within a context. Which fields are populated depends on `kind`:
 * metric -> windowvalue/total; gauge -> average/aggregate/active; presence -> active. `intensity`
 * (normalized 0..1, recommended for UI meters) is populated for every kind.
 */
export interface TelemetryReading {
    key: string,
    kind: TelemetrySignalKind | string,
    /** metric: occurrences in the current window. */
    windowvalue?: number,
    /** metric: cumulative count since the context began. */
    total?: number,
    /** gauge: mean of samples across active users in the window. */
    average?: number,
    /** gauge: sum of sample values in the window. */
    aggregate?: number,
    /** gauge/presence: distinct users active in the window. */
    active?: number,
    /** normalized 0..1 intensity, smoothed against a rolling peak. */
    intensity: number,
}

/**
 * The live, synchronized state of every signal in a context. This is the payload you poll (~1s) to drive
 * real-time meters. It is identical for all viewers of a context.
 */
export interface TelemetrySnapshot {
    kind: "telemetry.snapshot",
    contextid: string,
    asof: string,
    /** opaque cursor (current bucket time); pass back on the next read for future per-tick delta reads. */
    cursor: string,
    signals: Array<TelemetryReading>,
}

/** Body for the increment (metric) push. */
export interface TelemetryIncrementRequest {
    userid: string,
    /** occurrences to add; defaults to 1 server-side, values <= 0 are treated as 1. */
    by?: number,
}

/** Body for the sample (gauge) push. `value` is a 0..1 reading; out-of-range values are clamped server-side. */
export interface TelemetrySampleRequest {
    userid: string,
    value: number,
}

/** Body for the heartbeat (presence) push. */
export interface TelemetryHeartbeatRequest {
    userid: string,
}

export type TelemetryBatchOp = "increment" | "sample" | "heartbeat";

/** One action within a batch. `contextid`/`userid` default to the batch-level values when omitted. */
export interface TelemetryBatchItem {
    op: TelemetryBatchOp | string,
    key: string,
    /** optional per-item context override (defaults to the request context) for cross-context batches. */
    contextid?: string,
    /** increment only: occurrences to add (defaults to 1). */
    by?: number,
    /** sample only: the 0..1 reading. */
    value?: number,
    /** optional per-item user override (defaults to the batch userid). */
    userid?: string,
}

/** Body for the batch submit. Buffer actions on the device and flush periodically (e.g. every 1-2s). */
export interface TelemetryBatchRequest {
    userid: string,
    ops: Array<TelemetryBatchItem>,
}

/** Returned in the `data` of a successful batch submit (best-effort, partial success). */
export interface TelemetryBatchResult {
    kind: "telemetry.batchresult",
    accepted: number,
    rejected: number,
    /** map of rejected op index -> reason. */
    errors: { [index: string]: string },
}

/** Write endpoints resolve to the standard API envelope; the simple writes carry no data payload. */
export type TelemetryAck = RestApiResult<null>;
