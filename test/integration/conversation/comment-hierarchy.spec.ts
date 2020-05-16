import {CommentClient} from '../../../src/impl/CommentClient';
import {Kind, ModerationType, Reaction, ReportType} from '../../../src/models/CommonModels';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {RestfulCommentModerationService} from "../../../src/impl/REST/comments/RestfulCommentModerationService";
import {
    Comment,
    CommentListResponse,
    CommentModeration,
    CommentResponse,
    Vote
} from "../../../src/models/CommentsModels";
import {RestfulCommentService} from "../../../src/impl/REST/comments/RestfulCommentService";
import {RequireUserError, SettingsError, ValidationError} from "../../../src/impl/errors";
import {MISSING_REPLYTO_ID, NO_CONVERSATION_SET, USER_NEEDS_ID} from "../../../src/impl/constants/messages";

dotenv.config();

const { expect } = chai;
const config = {
    apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID,
    endpoint: process.env.TEST_ENDPOINT,
};


const comments = require('../../../samples/comments.json')

const defaultconversation = {property: 'test', moderation: ModerationType.post, conversationid: '12342'}

describe('Comment Operations', function() {

    it("parses a comment hierarchy", function(){
        // deepest should be first
        const map = {}
        const sorted = comments.sort((comment1, comment2)=> {
            map[comment1.id] = comment1;
            map[comment2.id] = comment2;
            comment1.hierarchy.length-comment2.hierarchy.length
        })



    })
});
