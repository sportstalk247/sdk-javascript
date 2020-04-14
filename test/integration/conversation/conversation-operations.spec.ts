import {ConversationClient} from '../../../src/impl/ConversationClient';
import {Kind, ModerationType, Reaction, ReportType} from '../../../src/models/CommonModels';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {RestfulConversationModerationManager} from "../../../src/impl/conversation/REST/RestfulConversationModerationManager";
import {Conversation} from "../../../src/models/ConversationModels";


dotenv.config();


const { expect } = chai;

describe('Conversation Operations', function() {
    const config = {
        apiToken:process.env.TEST_KEY,
        appId: process.env.TEST_APP_ID,
        endpoint: process.env.TEST_ENDPOINT,
    };
    const client = ConversationClient.create(Object.assign(config, {
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    }));
    const client2 = ConversationClient.create(Object.assign(config, {
        user: {
            userid: 'testuser2',
            handle: 'handle2'
        }
    }));

    const ModerationClient = new RestfulConversationModerationManager(config)

    const conversation = {
        "conversationid": "TEST_ITEM",
        "owneruserid" : 'testuser1',
        "property" : "testing",
        "moderation" : ModerationType.post,
        "maxreports" : 0,
        "title": "Test Conversation",
        "maxcommentlen": 512,
        "conversationisopen" : true,
        "tags" : ["taga", "tagb"],
        "udf1" : "/sample/userdefined1",
        "udf2" : "/sample/userdefined2/äöüÄÖÜß"
    }
    const conversation2 = {
        "conversationid": "TEST_ITEM_UNIQUE",
        "owneruserid" : 'testuser1',
        "property" : "UNIQUE_PROPERTY_KEY",
        "moderation" : ModerationType.post,
        "maxreports" : 0,
        "title": "Test Conversation",
        "maxcommentlen": 512,
        "conversationisopen" : true,
        "tags" : ["taga", "tagb"],
        "udf1" : "/sample/userdefined1",
        "udf2" : "/sample/userdefined2/äöüÄÖÜß"
    }

    describe('Setup Conversation', function () {
        it('User Creates Conversation', async function () {
            const results = await client.createConversation(conversation, true)
            const results2 = await client.createConversation(conversation2, true)
            expect(results.kind).to.be.equal(Kind.conversation)
            expect(results.owneruserid).to.be.equal('testuser1');
            expect(results.conversationid).to.be.equal('TEST_ITEM');
        })
    });

    describe('list conversations', function() {
        let conversation:Conversation;
        it("Can list all conversations", async () => {
            const response = await client.listConversations();
            expect(response.conversations.length).to.be.greaterThan(1);
            conversation = response.conversations[0];
        });
        it("Can filter conversations", async()=>{
            const response = await client.listConversations({propertyid: "UNIQUE_PROPERTY_KEY"});
            expect(response.conversations.length).to.be.equal(1);
        })
        it("Can get conversation by conversation", async()=>{
            const requestedConversation = await client.getConversation(conversation);
            expect(requestedConversation.conversationid).to.be.equal(conversation.conversationid);
        })
        it("Can get conversation by conversationid string", async()=>{
            const requestedConversation = await client.getConversation(conversation.conversationid);
            expect(requestedConversation.conversationid).to.be.equal(conversation.conversationid);
        })
    })

   describe('Delete Conversation', function () {
       it('Deletes Conversation', async function () {
          await client.deleteConversation(	 "TEST_ITEM");
          await client.deleteConversation("TEST_ITEM_UNIQUE");
       })
   });
});
