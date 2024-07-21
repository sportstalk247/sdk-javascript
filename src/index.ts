import {ChatClient} from './impl/ChatClient';
import {CommentClient} from './impl/CommentClient';
import {UserClient} from './impl/UserClient';
import {RestfulChatModerationService} from "./impl/REST/chat/RestfulChatModerationService";
import {RestfulPollService} from "./impl/REST/poll/RestfulPollService";
import {RestfulChatEventService} from "./impl/REST/chat/RestfulChatEventService";
import {RestfulChatRoomService} from "./impl/REST/chat/RestfulChatRoomService";
import {RestfulUserService} from "./impl/REST/users/RestfulUserService";
import * as ChatModels from './models/ChatModels';
import * as PollModels from './models/PollModels';
import * as CommentModels from './models/CommentsModels';
import { SportsTalkConfig } from './models/CommonModels';
import * as CommonModels from './models/CommonModels';
import * as Constants from './impl/constants/api';
import * as Messages from './impl/constants/messages';
import * as Errors from './impl/errors';
import {RestfulConversationService} from "./impl/REST/comments/RestfulConversationService";
import {RestfulCommentModerationService} from "./impl/REST/comments/RestfulCommentModerationService";
import {RestfulCommentService} from './impl/REST/comments/RestfulCommentService'
import {RestfulWebhookService} from "./impl/REST/webhooks/RestfulWebhookService";

const Chat = {
    RestfulChatModerationService,
    RestfulChatEventService,
    RestfulChatRoomService
}


const Comments = {
    RestfulConversationService,
    RestfulCommentService,
    RestfulCommentModerationService
}

const Polls = {
    RestfulPollService
}


const Users = {
    RestfulUserService,
}

const Webhooks = {
    RestfulWebhookService
}

const REST ={
    Chat,
    Comments,
    Users,
    Polls,
    Webhooks
}

const Services = {
    ChatModerationService: RestfulChatModerationService,
    ChatEventService: RestfulChatEventService,
    ChatRoomService: RestfulChatRoomService,
    UserService: RestfulUserService,
    WebhookService: RestfulWebhookService,
    ConversationService: RestfulConversationService,
    CommentService: RestfulCommentService,
    CommentModerationService: RestfulCommentModerationService,
    PollsService: RestfulPollService
}

const impl = {
    REST
}

const Types = {
    Comments: CommentModels,
    Chat: ChatModels,
    Common: CommonModels,
    Polls: PollModels,
    Errors,
    Messages,
}

export {
    ChatClient,
    CommentClient,
    UserClient,
    Services,
    impl,
    ChatModels,
    CommentModels,
    CommonModels,
    Constants,
    Types,
    SportsTalkConfig,
}
