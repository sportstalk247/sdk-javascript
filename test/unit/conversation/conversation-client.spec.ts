import {ConversationClient} from '../../../src/impl/ConversationClient';
import {Kind, ModerationType, Reaction, ReportType, SportsTalkConfig} from '../../../src/models/CommonModels';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {RestfulCommentModerationService} from "../../../src/impl/conversation/REST/RestfulCommentModerationService";
import {Conversation} from "../../../src/models/ConversationModels";
import {DEFAULT_CONFIG} from "../../../src/impl/constants/api";
import {User} from "../../../dist/models/CommonModels";
dotenv.config();

const { expect } = chai;

describe("Conversation Client", function(){
    describe("Sportstalk Configuration", function(){
        it("is built with factory function", ()=>{
            const client = ConversationClient.create(DEFAULT_CONFIG);
            const config: SportsTalkConfig = client.getConfig();
            expect(config.endpoint).to.be.equal(DEFAULT_CONFIG.endpoint);
        })
    })
    describe("User Configuration", function(){
        it("Can set user aftr creation", ()=>{
            const userid = "TestID";
            const handle = "handle";
            const client = ConversationClient.create(DEFAULT_CONFIG);
            client.setUser({userid, handle});
            const user:User = client.getUser();
            expect(user.handle).to.be.equal(handle);
            expect(user.userid).to.be.equal(userid);
        })
    });
    describe("Conversation Configuration", function(){
        it("Can set conversation as part of creation", function(){
            const conversationid = "TestId";
            const property = "propertytest";
            const moderation = ModerationType.post;
            const client = ConversationClient.create(DEFAULT_CONFIG,
                { conversationid,
                property,
                moderation
            });
            const conversation  = client.getDefaultConversation();
            // @ts-ignore
            expect(conversation.conversationid).to.be.equal(conversationid);
            // @ts-ignore
            expect(conversation.property).to.be.equal(property);
            // @ts-ignore
            expect(conversation.moderation).to.be.equal(moderation)
        })
        it("Can set conversation after creation", function(){
            const conversationid = "TestId";
            const property = "propertytest";
            const moderation = ModerationType.post;
            const client = ConversationClient.create(DEFAULT_CONFIG);
            client.setDefaultConversation({
                conversationid,
                property,
                moderation
            })
            const conversation  = client.getDefaultConversation();
            // @ts-ignore
            expect(conversation.conversationid).to.be.equal(conversationid);
            // @ts-ignore
            expect(conversation.property).to.be.equal(property);
            // @ts-ignore
            expect(conversation.moderation).to.be.equal(moderation)
        })
    })

})