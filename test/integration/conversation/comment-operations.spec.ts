import {ConversationClient} from '../../../src/impl/ConversationClient';
import {Kind, ModerationType, Reaction, ReportType} from '../../../src/models/CommonModels';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {RestfulConversationModerationManager} from "../../../src/impl/conversation/REST/RestfulConversationModerationManager";
import {CommentListResponse, CommentResponse, Vote} from "../../../src/models/ConversationModels";

dotenv.config();

let client;
let mod;
const { expect } = chai;

describe('Comment Operations', function() {
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
    describe("Responses", function() {
        let commentary: CommentListResponse;
        it("Reply", async ()=>{
            try {
                const conv = await client2.createConversation(conversation, true)
                const resp = await client2.makeComment("This is my comment")
                expect(resp.body).to.be.equal("This is my comment");
                // @ts-ignore
                const response:CommentResponse = await client.reactToComment(resp, Reaction.like);
                expect(response.kind).to.be.equal(Kind.comment);
                const reply = await client.makeComment("I'm replying", resp);
                commentary = await client.getComments();
                expect(commentary.comments.length).to.be.greaterThan(0);
                const replylist:CommentListResponse = await client.getCommentReplies(resp);
                expect(replylist.comments.length).to.be.greaterThan(0);
            } catch (e) {
                throw e;
            }
        });
        it("Lets you retrieve specific comments", async ()=>{
            const firstComment = commentary.comments[0];
            let comment = await client.getComment(firstComment);
            if(comment) {
                expect(comment.id).to.be.equal(firstComment.id)
            } else {
                throw new Error("No comment retrieved!");
            }
        })
        it("Lets you vote on a comment", async ()=>{
            const firstComment = commentary.comments[0];
            let comment = await client.getComment(firstComment);
            let voted = await client.voteOnComment(firstComment, Vote.up);
            expect(voted.votes).to.have.lengthOf(1);
            expect(voted.votescore).to.be.equal(1);
            expect(voted.votecount).to.be.equal(1);
            return;
        })
    })

   describe("User flags comment", function() {
       it("Let's User2 flag User1's comment", async ()=> {
           await client.makeComment("This is user1 comment");
           const commentary = await client2.getComments();
           expect(commentary.comments.length).to.be.greaterThan(0);
           await client2.reportComment(commentary.comments[0], ReportType.abuse)
          // await client.reportComment(commentary.comments[0], ReportType.abuse)
       })
       it('Shows that comment is flagged', async () => {
            const queue = await ModerationClient.getModerationQueue();
            expect(queue.length).to.be.greaterThan(0);
       })
   });

    describe("User updates comment", function() {
        it("Let's User2 flag User1's comment", async ()=> {
            const comment = await client.makeComment("This is user1 comment to update");
            const newComment = Object.assign({}, comment, {body: "UPDATED"});
            const updated = await client.updateComment(newComment);
            expect(updated.body).to.be.equal("UPDATED");
            expect(updated.body === comment.body).to.be.false;
            // await client.reportComment(commentary.comments[0], ReportType.abuse)
        })
        it('Shows that comment is flagged', async () => {
            const queue = await ModerationClient.getModerationQueue();
            expect(queue.length).to.be.greaterThan(0);
        })
    });

   describe("Comment Deletion", function(){
       it("Lets a user delete their comment", async ()=>{
           const comment = await client.makeComment("Delete me");
           const deleted =  await client.deleteComment(comment, true);
           expect(deleted.kind).to.be.equal(Kind.deletedcomment);
           const exists = await client.getComment(comment);
           expect(exists).to.be.null;
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
