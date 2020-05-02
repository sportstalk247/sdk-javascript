import {CommentClient} from '../../../src/impl/CommentClient';
import {Kind} from '../../../src/models/CommonModels';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {ModerationType} from "../../../src/models/CommonModels";

dotenv.config();

let client;
let mod;
const { expect } = chai;

describe('BASIC Conversation Sequence', function() {
    const client = CommentClient.create({
        apiToken:process.env.TEST_KEY,
        appId: process.env.TEST_APP_ID,
        endpoint: process.env.TEST_ENDPOINT,
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    });
    const client2 = CommentClient.create({
        apiToken:process.env.TEST_KEY,
        appId: process.env.TEST_APP_ID,
        endpoint: process.env.TEST_ENDPOINT,
        user: {
            userid: 'testuser2',
            handle: 'handle2'
        }
    });

    const conversation = {
        "conversationid": "TEST_ITEM",
        "owneruserid" : 'testuser1',
        "property" : "testing",
        "moderation" : ModerationType.post,
        "maxreports" : 3,
        "title": "Test Conversation",
        "maxcommentlen": 512,
        "open" : true,
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
            client2.setCurrentConversation(conversation);
            return client2.makeComment("This is my comment")
                .then(resp=>{
                    expect(resp.body).to.be.equal("This is my comment");
                    done();
                })
                .catch(e=>{
                    done(e);
                })
        })
    })

   describe("User Interaction", function() {
       it("Let's User1 comment", function(done){
           client.makeComment("This is user1 comment")
               .then(()=>client2.getComments())
               .then((commentary)=>{
                   expect(commentary.comments.length).to.be.greaterThan(0);
                   done()
               }).catch(done);

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
