import {CommentClient} from '../../../src/impl/CommentClient';
import {Kind, ModerationType, Reaction, ReportType} from '../../../src/models/CommonModels';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {RestfulCommentModerationService} from "../../../src/impl/comments/REST/RestfulCommentModerationService";
import {
    Comment,
    CommentListResponse,
    CommentModeration,
    CommentResponse,
    Vote
} from "../../../src/models/CommentsModels";
import {RestfulCommentService} from "../../../src/impl/comments/REST/RestfulCommentService";
import {RequireUserError, SettingsError, ValidationError} from "../../../src/impl/errors";
import {MISSING_REPLYTO_ID, NO_CONVERSATION_SET, USER_NEEDS_ID} from "../../../src/impl/constants/messages";

dotenv.config();

const { expect } = chai;
const config = {
    apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID,
    endpoint: process.env.TEST_ENDPOINT,
};

const defaultconversation = {property: 'test', moderation: ModerationType.post, conversationid: '12342'}

describe('Comment Operations', function() {

    const client = CommentClient.create(Object.assign(config, {
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    }));
    const client2 = CommentClient.create(Object.assign(config, {
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
    describe("Responses", function() {
        let commentary: CommentListResponse;
        let resp;
        it("React to a comment", async ()=>{
            try {
                const conv = await client2.createConversation(conversation, true)
                resp = await client2.publishComment("This is my comment")
                expect(resp.body).to.be.equal("This is my comment");
                // @ts-ignore
                const response:CommentResponse = await client.reactToComment(resp, Reaction.like);
                expect(response.kind).to.be.equal(Kind.comment);

            } catch (e) {
                throw e;
            }
        });
        it("Reply to a comment", async()=>{
            try {
                const reply = await client.publishComment("I'm replying", resp);
                commentary = await client.listComments();
                console.log(commentary);
                expect(commentary.comments.length).to.be.greaterThan(0);
                const replylist: CommentListResponse = await client.getCommentReplies(resp);
                expect(replylist.comments.length).to.be.greaterThan(0);
            }catch(e) {
                throw e;
            }
        })
        it("Lets you retrieve specific comments", async ()=>{
            const firstComment:Comment = commentary.comments[0];
            console.log(firstComment);
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
           await client.publishComment("This is user1 comment");
           const commentary = await client2.listComments();
           expect(commentary.comments.length).to.be.greaterThan(0);
           await client2.reportComment(commentary.comments[0], ReportType.abuse)
          // await client.reportComment(commentary.comments[0], ReportType.abuse)
       })
       it('Shows that comment is flagged', async () => {
            const queue = await ModerationClient.getModerationQueue();
            expect(queue.comments.length).to.be.greaterThan(0);
            expect(queue.comments[0].moderation).to.be.equal(CommentModeration.flagged);
       })
   });

    describe("User updates comment", function() {
        let queue: CommentListResponse
        let rejectcomment;
        let acceptcomment;
        client.setCurrentConversation(conversation);
        client2.setCurrentConversation(conversation);
        it("Let's User2 report User1's comment", async ()=> {

            rejectcomment = await client.publishComment("This is user1 comment to update");
            const newComment = Object.assign({}, rejectcomment, {body: "UPDATED"});
            const updated = await client.updateComment(newComment);
            expect(updated.body).to.be.equal("UPDATED");
            expect(updated.body === rejectcomment.body).to.be.false;
            const reported = await client.reportComment(rejectcomment, ReportType.abuse)
            // @ts-ignore
            expect(reported.reports.length).to.be.greaterThan(0);
            // @ts-ignore
            expect(reported.reports[0]).to.haveOwnProperty('userid')
            // @ts-ignore
            expect(reported.reports[0]).to.haveOwnProperty('reason')
        })

        it('Shows that comment is flagged', async () => {
            queue = await ModerationClient.getModerationQueue();
            expect(queue.comments.length).to.be.greaterThan(0);
            expect(queue.comments[0].active).to.be.false;
        })
        it('Lets the moderator reject a comment', async()=>{
            const moderated = await ModerationClient.rejectComment(queue.comments[0]);
            expect(moderated.moderation).to.be.equal(CommentModeration.rejected);
        })
        it('Can create a comment that gets accepted', async()=>{
            acceptcomment = await client.publishComment("This is user1 comment to update");
            const report = await client2.reportComment(acceptcomment, ReportType.abuse);
            const newqueue = await ModerationClient.getModerationQueue();
            expect(newqueue.comments.length).to.be.greaterThan(0);
            const approved = await ModerationClient.approveComment(acceptcomment)
            expect(approved.moderation).to.be.equal(CommentModeration.approved);
        })

    });
   describe("Create comment with preset timestamp", function(){
       client.setCurrentConversation(conversation)
       it('can create a comment with a preset timestamp', async()=>{
           try {
               const time = Math.floor(new Date().getTime() - 100000000); // unix time.
               const timedcomment = await client.publishComment({body: 'commentbody', added: new Date(time).toISOString() })
               //expect(timedcomment.added).to.be.lessThan(time);
           }catch (e) {
               throw e;
           }
       })
   })

   describe("Comment Deletion", function(){
       client.setCurrentConversation(conversation);
       client2.setCurrentConversation(conversation);
       it("Lets a user delete their comment", async ()=>{
           const comment = await client.publishComment("Delete me");
           const deleted =  await client.deleteComment(comment, true);
           expect(deleted.kind).to.be.equal(Kind.deletedcomment);
           const exists = await client.getComment(comment);
           expect(exists).to.be.null;
       })
       it("Lets a user mark their comment for deletion", async ()=>{
           const comment = await client.publishComment("Delete me v2");
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
               commentManager.listComments({}, {});
               throw new Error("Shouldn't happen");
           } catch (e) {
               expect(e instanceof ValidationError).to.be.true;
               expect(e.message).to.be.equal(NO_CONVERSATION_SET)
           }
       });

       it("Throws error on getComment if no conversation set", async ()=>{
           const commentManager = new RestfulCommentService();
           try {
               const comment = await commentManager.getComment('', "someID", );
               throw new Error("should have failed")
           }catch(e) {
               expect(e instanceof ValidationError).to.be.true;
               expect(e.message).to.be.equal(NO_CONVERSATION_SET)
           }
       });

       it("Throws error on createComment if no conversation set", async ()=>{
           const commentManager = new RestfulCommentService();
           try {
               // @ts-ignore
               const comment = await commentManager.createComment(null, "some comment body", {userid: "fake", handle:"fake"});
               throw new Error("should have failed")
           }catch(e) {
               expect(e instanceof ValidationError).to.be.true;
               expect(e.message).to.be.equal(NO_CONVERSATION_SET)
           }
       })
       it("Throws error on updateComment if no conversation set", ()=>{
           const commentManager = new RestfulCommentService();
           try {
               const comment = commentManager.updateComment('', {userid: "fake", handle:"fake", body: "some body", id:"fakeid"});
               throw new Error("should have failed")
           }catch(e) {
               expect(e instanceof ValidationError).to.be.true;
               expect(e.message).to.be.equal(NO_CONVERSATION_SET)
           }
       })
       it("throws error if a reply is missing an id", async ()=>{
           const commentManager = new RestfulCommentService( config);
           try {
               // @ts-ignore
               const comment = await commentManager.createComment('1235', "some comment body", {userid: "fake", handle:"fake"}, {});
               throw new Error("should have failed")
           } catch(e) {
               expect(e instanceof ValidationError).to.be.true;
               expect(e.message).to.be.equal(MISSING_REPLYTO_ID)
           }
       })
       it("throws error if comment has no user", async ()=>{
           const commentManager = new RestfulCommentService(config);
           try {
               // @ts-ignore
               const comment = await commentManager.createComment('1235', "some comment body", {userid: "", handle:"fake"}, {});
               throw new Error("should have failed")
           } catch(e) {
               expect(e instanceof RequireUserError).to.be.true;
               expect(e.message).to.be.equal(USER_NEEDS_ID)
           }
       })
   })
});
