import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {ModerationType, SportsTalkConfig, User} from "../../../src/models/CommonModels";
import {Conversation, Comment} from "../../../src/models/ConversationModels";
import {RestfulConversationService} from "../../../src/impl/conversation/REST/RestfulConversationService";
import {RestfulCommentService} from "../../../src/impl/conversation/REST/RestfulCommentService";

dotenv.config();
const { expect } = chai;

const testconversation:Conversation = {
    "conversationid": "TEST_ITEM",
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

const sampleUser:User = {
    userid: 'testuser1',
    handle: 'handle1'
}

let commentList:Comment[] = [
    {
        userid: "myuserid",
        handle: "userhandle",
        body: "Comment body"
    },
    {
        id:"repliedcomment",
        userid: "myuserid",
        handle: "userhandle",
        body: "Comment body #2"
    },
    {
        id: "12341234",
        userid: "myuserid2",
        handle: "user2handle",
        body: "Comment body #3",
    },
];

const ID_DICTIONARY = {

}

function conversationFormatAdapter(conversationToMigrate): Conversation {
    // Add code here to migrate a conversation and return the Conversation object.
    return conversationToMigrate;
}

function commentFormatAdapter(commentToMigrate):Comment {
    // Add code to adapt format of a comment here and return a Comment object
    return commentToMigrate;
}

describe('conversation Migration', function() {
    const config:SportsTalkConfig = {
        apiToken:process.env.TEST_KEY,
        appId: process.env.TEST_APP_ID,
        endpoint: process.env.TEST_ENDPOINT
    }
    const conversationService = new RestfulConversationService(config);
    const commentService = new RestfulCommentService(config)
    // Will be set with created conversation data;
    let createdConversation:Conversation;

    describe('Create Conversation', function () {
        it('Uses the REST service to create a new conversation', async ()  => {
            const conversation = conversationFormatAdapter(testconversation)
            // creates the conversation and sets the client to aim at this by default.
            createdConversation = await conversationService.createConversation(conversation)
            commentService.setConversation(conversation);
        })
    });
    describe("Migrate comments", function() {
        it("Lets us migrate comments", async () => {
            // This won't scale to thousands because it launches everything in parallel, but will show how to use the REST client.
            const uploads = commentList.map(comment=> {
               return commentService.create(comment);
            })
            const created = await Promise.all(uploads);
            expect(created.length).to.be.equal(commentList.length);
        })
    })

    describe('Cleanup', function () {
        it('Use the REST client to delete conversation', async () => {
            await conversationService.deleteConversation(testconversation);
        })
    });
});