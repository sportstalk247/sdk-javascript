import {ConversationClient} from '../../../src/impl/ConversationClient';
import {Kind, ModerationType, Reaction, ReportType} from '../../../src/models/CommonModels';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {RestfulCommentModerationService} from "../../../src/impl/conversation/REST/RestfulCommentModerationService";
import {
    Comment,
    CommentListResponse,
    CommentModeration,
    CommentResponse,
    Vote
} from "../../../src/models/ConversationModels";
import {RestfulCommentService} from "../../../src/impl/conversation/REST/RestfulCommentService";
import {RequireUserError, SettingsError, ValidationError} from "../../../src/impl/errors";
import {MISSING_REPLYTO_ID, NO_CONVERSATION_SET, USER_NEEDS_ID} from "../../../src/impl/constants/messages";

dotenv.config();

let client;
let mod;
const { expect } = chai;
const config = {
    apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID,
    endpoint: process.env.TEST_ENDPOINT,
};

describe('Comment Operations', function() {

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

    const ModerationClient = new RestfulCommentModerationService(config)

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
        let resp;
        it("React", async ()=>{
            try {
                const conv = await client2.createConversation(conversation, true)
                resp = await client2.makeComment("This is my comment")
                expect(resp.body).to.be.equal("This is my comment");
                // @ts-ignore
                const response:CommentResponse = await client.reactToComment(resp, Reaction.like);
                expect(response.kind).to.be.equal(Kind.comment);

            } catch (e) {
                throw e;
            }
        });
        it("Reply", async()=>{
            try {
                const reply = await client.makeComment("I'm replying", resp);
                commentary = await client.getComments();
                expect(commentary.comments.length).to.be.greaterThan(0);
                const replylist: CommentListResponse = await client.getCommentReplies(resp);
                expect(replylist.comments.length).to.be.greaterThan(0);
            }catch(e) {
                throw e;
            }
        })
        it("Lets you retrieve specific comments", async ()=>{
            const firstComment:Comment = commentary.comments[0];
            let comment = await client.getComment(firstComment);
            if(comment) {
                expect(comment.id).to.be.equal(firstComment.id)
            } else {
                throw new Error("No comment retrieved!");
            }
            // @ts-ignore
            comment = await client.getComment(firstComment.id);
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
            expect(queue[0].moderation).to.be.equal(CommentModeration.flagged);
       })
   });

    describe("User updates comment", function() {
        let queue: Comment[]
        let rejectcomment;
        let acceptcomment;
        it("Let's User2 flag User1's comment", async ()=> {
            rejectcomment = await client.makeComment("This is user1 comment to update");
            const newComment = Object.assign({}, rejectcomment, {body: "UPDATED"});
            const updated = await client.updateComment(newComment);
            expect(updated.body).to.be.equal("UPDATED");
            expect(updated.body === rejectcomment.body).to.be.false;
            await client.reportComment(rejectcomment, ReportType.abuse)
        })

        it('Shows that comment is flagged', async () => {
            queue = await ModerationClient.getModerationQueue();
            expect(queue.length).to.be.greaterThan(0);
            expect(queue[0].active).to.be.false;
        })
        it('Lets the moderator reject a comment', async()=>{
            const moderated = await ModerationClient.rejectComment(queue[0]);
            expect(moderated.moderation).to.be.equal(CommentModeration.rejected);
        })
        it('Can create a comment that gets accepted', async()=>{
            acceptcomment = await client.makeComment("This is user1 comment to update");
            await client2.reportComment(acceptcomment, ReportType.abuse);
            const newqueue = await ModerationClient.getModerationQueue();
            expect(newqueue.length).to.be.greaterThan(0);
            const approved = await ModerationClient.approveComment(acceptcomment)
            expect(approved.moderation).to.be.equal(CommentModeration.approved);
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
       it("Lets a user mark their comment for deletion", async ()=>{
           const comment = await client.makeComment("Delete me v2");
           const deleted =  await client.deleteComment(comment, false);
           expect(deleted.kind).to.be.equal(Kind.deletedcomment);
           // @ts-ignore
           const exists = await client.getComment(comment);
           expect(exists).to.be.not.null;
           expect(exists && exists.deleted).to.be.true;
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
   describe('Error behavior', function(){
       it("Throws error if no converation id", async()=>{
           const commentManager = new RestfulCommentService();
           commentManager.setConfig(config);
           try {
               // @ts-ignore
               commentManager.getComments({}, {});
               throw new Error("Shouldn't happen");
           } catch (e) {
               expect(e instanceof SettingsError).to.be.true;
               expect(e.message).to.be.equal(NO_CONVERSATION_SET)
           }
       })
       it("Throws error on getComment if no conversation set", ()=>{
           const commentManager = new RestfulCommentService();
           try {
               const comment = commentManager.getComment("someID");
               throw new Error("should have failed")
           }catch(e) {
               expect(e instanceof SettingsError).to.be.true;
               expect(e.message).to.be.equal(NO_CONVERSATION_SET)
           }
       })
       it("Throws error on getComment if no conversation set", ()=>{
           const commentManager = new RestfulCommentService();
           try {
               const comment = commentManager.create("some comment body", {userid: "fake", handle:"fake"});
               throw new Error("should have failed")
           }catch(e) {
               expect(e instanceof SettingsError).to.be.true;
               expect(e.message).to.be.equal(NO_CONVERSATION_SET)
           }
       })
       it("Throws error on getComment if no conversation set", ()=>{
           const commentManager = new RestfulCommentService();
           try {
               const comment = commentManager.update({userid: "fake", handle:"fake", body: "some body", id:"fakeid"});
               throw new Error("should have failed")
           }catch(e) {
               expect(e instanceof SettingsError).to.be.true;
               expect(e.message).to.be.equal(NO_CONVERSATION_SET)
           }
       })
       it("throws error if a reply is missing an id", async ()=>{
           const commentManager = new RestfulCommentService( config,{property: 'test', moderation: ModerationType.post, conversationid: '12342'});
           try {
               // @ts-ignore
               const comment = await commentManager.create("some comment body", {userid: "fake", handle:"fake"}, {});
               throw new Error("should have failed")
           } catch(e) {
               expect(e instanceof ValidationError).to.be.true;
               expect(e.message).to.be.equal(MISSING_REPLYTO_ID)
           }
       })
       it("throws error if comment has no user", async ()=>{
           const commentManager = new RestfulCommentService(config,{property: 'test', moderation: ModerationType.post, conversationid: '12342'});
           try {
               // @ts-ignore
               const comment = await commentManager.create("some comment body", {userid: "", handle:"fake"}, {});
               throw new Error("should have failed")
           } catch(e) {
               expect(e instanceof RequireUserError).to.be.true;
               expect(e.message).to.be.equal(USER_NEEDS_ID)
           }
       })
   })
    describe("Configuration", function(){
        it("Will accept a config", () => {
            const commentManager = new RestfulCommentService();
            let conversation = commentManager.getConversation();
            expect(conversation).to.be.undefined
            const setconv = commentManager.setConversation({conversationid: "TEST", property: "testing", moderation: ModerationType.post});
            expect(setconv.conversationid).to.be.equal("TEST");
            conversation = commentManager.getConversation();
            // @ts-ignore
            expect(conversation.conversationid).to.be.equal("TEST");
        })
        it("Can set a conversation in constructor",()=>{
            const conversation = {conversationid: "TEST", property: "testing", moderation: ModerationType.post};
            const commentManager = new RestfulCommentService({apiToken:"",}, conversation);
            const setconversation = commentManager.getConversation();
            // @ts-ignore
            expect(setconversation.conversationid).to.be.equal("TEST");
        })
    })
});
