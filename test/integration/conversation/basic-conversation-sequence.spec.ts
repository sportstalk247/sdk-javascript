import {ConversationClient} from '../../../src/impl/ConversationClient';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {ModerationType} from "../../../src/models/CommonModels";

dotenv.config();

let client;
let mod;
const { expect } = chai;

describe('BASIC Conversation Sequence', function() {
    const client = ConversationClient.create({
        apiKey:process.env.TEST_KEY,
        endpoint: process.env.TEST_ENDPOINT,
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    });
    const client2 = ConversationClient.create({
        apiKey:process.env.TEST_KEY,
        endpoint: process.env.TEST_ENDPOINT,
        user: {
            userid: 'testuser2',
            handle: 'handle2'
        }
    });

    const conversation = {
        conversationid: "testconversation",
        "owneruserid" : 'testuser1',
        "property" : "testing",
        "moderation" : ModerationType.post,
        "maxreports" : 3,
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
                done()
            }).catch(res=>{
                done(res);
            });
        })
    });
    describe("User joins Conversation", function() {
        it("Lets user 2 join", function(done){
            client.createConversation(conversation, true)
                .then(conversation=>{
                    return client2.makeComment("This is my comment")
                })
                .then(resp=>{
                    done();
                })
                .catch(done)
        })
    })
    describe('Delete Conversation', function () {
        it('Deletes Conversation', function (done) {
            client.deleteConversation(	 "testconversation").then(results => {
                done()
            }).catch(res=>{
                done(res);
            });
        })
    });
    // describe('User 2', function () {
    //     it('Joins room', function (done) {
    //         client2.createConversation({
    //             name: "Test room",
    //             slug: "chat-test-room",
    //         }).then(room => {
    //         }).catch(done)
    //     })
    // })
});
