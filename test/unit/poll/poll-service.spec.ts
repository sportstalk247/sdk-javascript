import * as dotenv from "dotenv";
import chai from "chai";
import {RestfulPollService} from "../../../src/impl/REST/poll/RestfulPollService";
import {DEFAULT_CONFIG} from "../../../src/impl/constants/api";
import {PollSettings} from "../../../src/models/polls/Poll";
import {Poll} from "../../../src/models/PollModels";
dotenv.config();

const { expect } = chai;

describe("Poll service", function() {
    const config = Object.assign({}, DEFAULT_CONFIG, { apiToken:process.env.TEST_KEY,
        appId: process.env.TEST_APP_ID})
    const service = new RestfulPollService(config);
    let pollid = "";
    let pollchoice;
    it("Can Create Poll", async function () {
        const pollSettings:PollSettings =  {
            ownerid: "moderator",
            title: "TestPoll",
            description: "Vote for your favorite color",
            sortanswers: "random",
            customid: "custompoll",
            maxtotalresponsesperuser: 50,
            allowmultiplechoicesperuser: true,
            maxresponsesperchoiceperuser:50,
            maxtotalvotesperuser: 50
        }
        const poll: Poll = await service.createOrUpdatePoll( pollSettings);
        expect(poll)
        pollid = poll.id
    })
    it("Can create a poll choice", async function(){
        const choices =  await service.createOrUpdatePollChoice(pollid, {
            position: -1,
            title: "title",
        });
        expect(choices.length);
        pollchoice = choices[choices.length-1];
    })
    it("Can vote for a choice", async function() {
        const vote =  await service.createPollResponse(pollid, pollchoice, {userid:"moderator"})
        expect(vote);
    })
    it("Can delete a poll", async function() {
        const deleted = await service.deletePoll(pollid);
        expect(deleted);
    })
});