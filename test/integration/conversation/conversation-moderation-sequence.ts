import {ConversationClient} from '../../../src/impl/ConversationClient';
import {Kind, ModerationType, ReportType} from '../../../src/models/CommonModels';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {RestfulConversationModerationManager} from "../../../src/impl/conversation/REST/RestfulConversationModerationManager";

dotenv.config();

let client;
let mod;
const { expect } = chai;

describe('Conversation Moderation', function() {
    const config = {
        apiKey:process.env.TEST_KEY,
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

    describe('Setup Conversation', function () {
        it('User Creates Conversation', function (done) {
            client.createConversation(conversation, true).then(results => {
                expect(results.kind).to.be.equal(Kind.conversation)
                expect(results.owneruserid).to.be.equal('testuser1');
                expect(results.conversationid).to.be.equal('TEST_ITEM');
                done()
            }).catch(res=>{
                done(res);
            });
        })
    });
    describe("User joins Conversation", function() {
        it("Lets user 2 join", function(done){
            client2.createConversation(conversation, true)
                .then(conversation=>{
                    return client2.makeComment("This is my comment")
                })
                .then(resp=>{
                    expect(resp.body).to.be.equal("This is my comment");
                    done();
                })
                .catch(e=>{
                    done(e);
                })
        })
    })

   describe("User flags comment", function() {
       it("Let's User2 flag User1's comment", function(done){
           client.makeComment("This is user1 comment")
               .then(()=>client2.getComments())
               .then((commentary)=>{
                   expect(commentary.comments.length).to.be.greaterThan(0);
                   client2.reportComment(commentary.comments[0], ReportType.abuse)
                   done()
               }).catch(done);

       })
       it('Shows that comment is flagged', async () => {
            const queue = await ModerationClient.getModerationQueue();
            expect(queue.length).to.be.greaterThan(0);
       })
   });
   describe('Delete Conversation', function () {
       it('Deletes Conversation', function (done) {
           client.deleteConversation(	 "TEST_ITEM").then(results => {
               done()
           }).catch(res=>{
               done(res);
           });
       })
   });
});
