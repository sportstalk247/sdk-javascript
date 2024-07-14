import {CommentClient} from '../../../src/impl/CommentClient';
import {Kind, Reaction, SportsTalkConfig} from '../../../src/models/CommonModels';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {DEFAULT_CONFIG} from "../../../src/impl/constants/api";
import {User} from "../../../src/models/user/User";
import {ModerationType, ReportType} from "../../../src/models/Moderation";
dotenv.config();

const { expect } = chai;

describe("Conversation Client", function(){
    describe("Sportstalk Configuration", function(){
        it("is built with factory function", ()=>{
            const client = CommentClient.init(DEFAULT_CONFIG);
            const config: SportsTalkConfig = client.getConfig();
            expect(config.endpoint).to.be.equal(DEFAULT_CONFIG.endpoint);
        })
    })
    describe("User Configuration", function(){
        it("Can set user aftr creation", ()=>{
            const userid = "TestID";
            const handle = "handle";
            const client = CommentClient.init(DEFAULT_CONFIG);
            client.setUser({userid, handle});
            const user:User = client.getCurrentUser();
            expect(user.handle).to.be.equal(handle);
            expect(user.userid).to.be.equal(userid);
        })
    });
    describe("Conversation Configuration", function(){
        it("Can set comments as part of creation", function(){
            const conversationid = "TestId";
            const property = "propertytest";
            const moderation = ModerationType.post;
            const client = CommentClient.init(DEFAULT_CONFIG,
                { conversationid,
                property,
                moderation
            });
            const conversation  = client.getCurrentConversation();
            // @ts-ignore
            expect(conversation.conversationid).to.be.equal(conversationid);
            // @ts-ignore
            expect(conversation.property).to.be.equal(property);
            // @ts-ignore
            expect(conversation.moderation).to.be.equal(moderation)
        })
        it("Can set comments after creation", function(){
            const conversationid = "TestId";
            const property = "propertytest";
            const moderation = ModerationType.post;
            const client = CommentClient.init(DEFAULT_CONFIG);
            client.setCurrentConversationId({
                conversationid,
                property,
                moderation
            })
            const conversation  = client.getCurrentConversation();
            // @ts-ignore
            expect(conversation.conversationid).to.be.equal(conversationid);
            // @ts-ignore
            expect(conversation.property).to.be.equal(property);
            // @ts-ignore
            expect(conversation.moderation).to.be.equal(moderation)
        })
    })

})