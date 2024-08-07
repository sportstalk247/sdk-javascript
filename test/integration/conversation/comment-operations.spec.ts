import {CommentClient} from '../../../src/impl/CommentClient';
import {Kind, Reaction} from '../../../src/models/CommonModels';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {RestfulCommentModerationService} from "../../../src/impl/REST/comments/RestfulCommentModerationService";
import {
    Comment,
    CommentListResponse,
    CommentModeration, CommentReplyList,
    CommentResult, Conversation, HasConversationID, ModerationType,
    Vote
} from "../../../src/models/CommentsModels";
import {RestfulCommentService} from "../../../src/impl/REST/comments/RestfulCommentService";
import {RequireUserError, ValidationError} from "../../../src/impl/errors";
import {MISSING_REPLYTO_ID, NO_CONVERSATION_SET, USER_NEEDS_ID} from "../../../src/impl/constants/messages";
import {ReportType} from "../../../src/models/Moderation";

dotenv.config();

const { expect } = chai;
const config = {
    apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID,
    endpoint: process.env.TEST_ENDPOINT,
};

const defaultconversation = {property: 'test', moderation: ModerationType.post, conversationid: '12342'}

describe('Comment Operations', function() {

    const client = CommentClient.init(Object.assign(config, {
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    }));
    const client2 = CommentClient.init(Object.assign(config, {
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
        replycount: 0,
        reactioncount:0,
        reactions: [],
        "open" : true,
        "tags" : ["taga", "tagb"],
    } as Conversation;

    describe('Setup Conversation', function () {
        it('User Creates Conversation', function (done) {
            client.createConversation(conversation as Conversation, true).then(results => {
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
        let resp:CommentResult;
        it("React to a comment", async ()=>{
            try {
                const conv = await client2.createConversation(conversation as Conversation, true)
                resp = await client2.publishComment({
                    body:"This is my comment",
                    customfield1: "CF1",
                    customfield2: "CF2",
                    customtags: ["customtag1", "customtag2"]
                })
                expect(resp.body).to.be.equal("This is my comment");
                expect(resp.customfield1).to.be.equal("CF1");
                expect(resp.customfield2).to.be.equal("CF2");
                expect(resp.customtags).to.have.length(2)
                // @ts-ignore
                const response:CommentResult = await client.reactToComment(resp, {reaction: Reaction.like});
                expect(response.kind).to.be.equal(Kind.comment);
                //@ts-ignore
                expect(response.reactions[0].count).to.be.equal(1);
                const unreact:Comment = await client.reactToComment(resp, {reaction: Reaction.like, reacted: false});
                //@ts-ignore
                expect(unreact.reactions[0].count).to.be.equal(0);
            } catch (e) {
                throw e;
            }
        });
        it("Reply to a comment", async()=>{
            try {
                const reply = await client.publishComment("I'm replying", resp);
                commentary = await client.listComments();
                expect(commentary.comments.length).to.be.greaterThan(0);
                const replylist: CommentListResponse = await client.getCommentReplies(resp);
                expect(replylist.comments.length).to.be.greaterThan(0);
            }catch(e) {
                throw e;
            }
        })
        it('Gets batch replies', async () => {
            try {
                // @ts-ignore
                const comment2 = await client.publishComment("Another comment");
                const reply = await client.publishComment("Another reply", comment2);
                const replies = await client.listRepliesBatch([resp.id, comment2.id]);
                expect(replies.kind).to.be.equal(Kind.repliesbyparentidlist);
                expect(replies.repliesgroupedbyparentid).to.have.lengthOf(2);
                expect(replies.itemcount).to.be.equal(2);
                const group: CommentReplyList = replies.repliesgroupedbyparentid[0];
                expect(group.parentid).to.be.equal(resp.id);
                expect(group.kind).to.be.equal(Kind.commentreplygrouplist)
                expect(group.comments).to.have.lengthOf(1);
                const comment:Comment = group.comments[0];
                expect(comment.kind).to.be.equal(Kind.comment);
            } catch(e) {
                throw e;
            }
        })
        it('Retrieves commentary', async()=>{
            commentary = await client.listComments();
            expect(commentary.comments).to.have.length.greaterThan(0);
        })
        it("Lets you retrieve specific comments", async ()=>{
            expect(commentary.comments).to.have.length.greaterThan(0);
            const firstComment:CommentResult = commentary.comments[0];
            expect(firstComment.id).to.be.not.null;
            expect(firstComment.id).to.be.not.undefined;
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
            if(comment) {
                expect(comment.id).to.be.not.null;
                expect(comment.id).to.be.not.undefined;
            } else {
                throw new Error("Comment is null");
            }
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
            const queue = await ModerationClient.listCommentsInModerationQueue();
            expect(queue.comments.length).to.be.greaterThan(0);
            expect(queue.comments[0].moderation).to.be.equal(CommentModeration.flagged);
            return queue;
       })
   });

    describe("User updates comment", function() {
        let queue: CommentListResponse
        let rejectcomment;
        let acceptcomment;
        client.setCurrentConversationId(conversation as HasConversationID);
        client2.setCurrentConversationId(conversation as HasConversationID);
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
            queue = await ModerationClient.listCommentsInModerationQueue();
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
            const newqueue = await ModerationClient.listCommentsInModerationQueue();
            expect(newqueue.comments.length).to.be.greaterThan(0);
            const approved = await ModerationClient.approveComment(acceptcomment)
            expect(approved.moderation).to.be.equal(CommentModeration.approved);
        })

    });
   describe("Create comment with preset timestamp", function(){
       client.setCurrentConversationId(conversation as HasConversationID)
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
       client.setCurrentConversationId(conversation as HasConversationID);
       client2.setCurrentConversationId(conversation as HasConversationID);
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
               const comment = await commentManager.publishComment(null, "some comment body", {userid: "fake", handle:"fake"});
               throw new Error("should have failed")
           }catch(e) {
               expect(e instanceof ValidationError).to.be.true;
               expect(e.message).to.be.equal(NO_CONVERSATION_SET)
           }
       })
       it("Throws error on updateComment if no conversation set", ()=>{
           const commentManager = new RestfulCommentService();
           try {
               const comment = commentManager.updateComment('', {userid: "fake", handle:"fake", body: "some body", id:"fakeid", kind: Kind.comment});
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
               const comment = await commentManager.publishComment('1235', "some comment body", {userid: "fake", handle:"fake"}, {});
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
               const comment = await commentManager.publishComment('1235', "some comment body", {userid: "", handle:"fake"}, {});
               throw new Error("should have failed")
           } catch(e) {
               expect(e instanceof RequireUserError).to.be.true;
               expect(e.message).to.be.equal(USER_NEEDS_ID)
           }
       })
   })
});
