import { ChatClient } from '../../../../src/impl/ChatClient';
import {RestfulChatModerationService} from "../../../../src/impl/REST/chat/RestfulChatModerationService";
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as dotenv from 'dotenv';
import {SportsTalkConfig} from "../../../../src/models/CommonModels";
dotenv.config();

const { expect } = chai;
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};
const delay = function(timer) {
    return new Promise(function(accept, reject){
        const timeout = setTimeout(accept, timer)
    })
}

const ModerationService = new RestfulChatModerationService(config);

describe("Chat Moderation Service", ()=>{
    it("Can query the moderation queue without filters", async (done)=>{
        const queue = await ModerationService.listMessagesInModerationQueue({});
        expect(queue);
    })
})
