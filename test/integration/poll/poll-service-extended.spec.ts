import * as dotenv from "dotenv";
import chai from "chai";
import {RestfulPollService} from "../../../src/impl/REST/poll/RestfulPollService";
import {DEFAULT_CONFIG} from "../../../src/impl/constants/api";
import {Poll, PollSettings} from "../../../src/models/PollModels";
dotenv.config();

const { expect } = chai;

/**
 * Live-API spec for the poll endpoints added to the SDK (update, delete choice, leads, paged responses),
 * mirroring poll-service.spec.ts. Requires TEST_KEY / TEST_APP_ID (/ TEST_ENDPOINT) with poll permissions.
 */
describe("Poll service (extended endpoints)", function() {
    const config = Object.assign({}, DEFAULT_CONFIG, {
        apiToken: process.env.TEST_KEY,
        appId: process.env.TEST_APP_ID,
        endpoint: process.env.TEST_ENDPOINT,
    });
    const service = new RestfulPollService(config);
    let poll: Poll;
    let choice;

    it("Can create a poll with lead capture enabled", async function() {
        const settings: PollSettings = {
            ownerid: "moderator",
            title: "Extended endpoints test",
            description: "Testing update/lead/response endpoints",
            sortchoices: "random",
            customid: "sdk-extended-test",
            leadcaptureenabled: true,
            allowanonymouspolling: true,
        };
        poll = await service.createOrUpdatePoll(settings);
        expect(poll).to.be.not.null;
        expect(poll.id).to.be.not.null;
    });

    it("Can update an existing poll by id", async function() {
        const updated = await service.updatePoll(poll, {
            ownerid: "moderator",
            title: "Extended endpoints test (updated)",
            subtitle: "now with a subtitle",
        } as PollSettings);
        expect(updated);
    });

    it("Can create a choice and vote, then read paged responses", async function() {
        const choices = await service.createOrUpdatePollChoice(poll, {position: -1, title: "Option A"});
        choice = choices[choices.length - 1];
        await service.createPollResponse(poll, choice, {userid: "moderator"});

        const responses = await service.listResponses(poll, 50);
        expect(responses);
        const all = await service.getResponses(poll, {userid: "moderator"});
        expect(all);
    });

    it("Can capture and list leads", async function() {
        const lead = await service.createLead(poll, {firstname: "Test", lastname: "Lead", email: "lead@example.com"});
        expect(lead);
        const leads = await service.listLeads(poll, 50);
        expect(leads);
    });

    it("Can delete a single choice", async function() {
        const deleted = await service.deletePollChoice(poll, choice);
        expect(deleted);
    });

    it("Can delete the poll", async function() {
        const deleted = await service.deletePoll(poll);
        expect(deleted);
    });
});
