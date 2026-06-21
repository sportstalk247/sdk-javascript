import * as dotenv from "dotenv";
import chai from "chai";
import {RestfulTelemetryService} from "../../../src/impl/REST/telemetry/RestfulTelemetryService";
import {DEFAULT_CONFIG} from "../../../src/impl/constants/api";
import {TelemetrySignalKind, TelemetrySnapshot} from "../../../src/models/TelemetryModels";
dotenv.config();

const { expect } = chai;

/**
 * Live-API spec for the telemetry meter, mirroring poll-service.spec.ts.
 *
 * Requires the telemetry endpoints deployed and an API token granted the TelemetryPush/TelemetryRead
 * permissions, supplied via TEST_KEY / TEST_APP_ID (/ TEST_ENDPOINT). The context/key below are URL-safe.
 */
describe("Telemetry service", function() {
    const config = Object.assign({}, DEFAULT_CONFIG, {
        apiToken: process.env.TEST_KEY,
        appId: process.env.TEST_APP_ID,
        endpoint: process.env.TEST_ENDPOINT,
    });
    const service = new RestfulTelemetryService(config);
    const contextid = "game:sdk-test";
    const userid = "moderator";

    it("Can push a metric increment", async function() {
        const result = await service.increment(contextid, "cheer.home", {userid, by: 3});
        expect(result);
    });

    it("Can push a gauge sample", async function() {
        const result = await service.sample(contextid, "thunder", {userid, value: 0.7});
        expect(result);
    });

    it("Can push a presence heartbeat", async function() {
        const result = await service.heartbeat(contextid, "online", {userid});
        expect(result);
    });

    it("Can submit a batch of actions", async function() {
        const result = await service.batch(contextid, {
            userid,
            ops: [
                {op: "increment", key: "cheer.home", by: 2},
                {op: "sample", key: "thunder", value: 0.4},
                {op: "heartbeat", key: "online"},
            ],
        });
        expect(result);
    });

    it("Can read the live snapshot", async function() {
        const snapshot: TelemetrySnapshot = await service.getSnapshot(contextid);
        expect(snapshot);
        expect(snapshot.contextid).to.be.equal(contextid);
        if (snapshot.signals && snapshot.signals.length) {
            const reading = snapshot.signals[0];
            expect(reading.key).to.be.not.undefined;
            expect(Object.values(TelemetrySignalKind)).to.include(reading.kind);
        }
    });
});
