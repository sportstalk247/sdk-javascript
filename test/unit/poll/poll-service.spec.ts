import * as dotenv from "dotenv";
import chai from "chai";
import {RestfulPollService} from "../../../src/impl/REST/poll/RestfulPollService";
import {SettingsError} from "../../../src/impl/errors";
import {DEFAULT_CONFIG} from "../../../src/impl/constants/api";
import {PollSettings} from "../../../src/models/polls/Poll";
import {Poll} from "../../../src/models/PollModels";
dotenv.config();

const { expect } = chai;

describe("Poll service", function() {
    const config = Object.assign({}, DEFAULT_CONFIG, { apiToken:process.env.TEST_KEY,
        appId: process.env.TEST_APP_ID})
    const service = new RestfulPollService(config);

    it("Can Create Poll", async function () {
        const poll: Poll = await service.createOrUpdatePoll({
            ownerid: "moderator",
            title: "TestPoll",
            description: "Vote for your favorite color",
            sortanswers: "random",
            customid: "custompoll",
        } as PollSettings);
        expect(poll)

    })
});