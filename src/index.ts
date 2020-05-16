import * as API from "./API/ChatAPI";
import {ChatClient} from './impl/ChatClient';
import {CommentClient} from './impl/CommentClient';
import {RestfulChatModerationService} from "./impl/REST/chat/RestfulChatModerationService";
import {RestfulChatEventService} from "./impl/REST/chat/RestfulChatEventService";
import {RestfulChatRoomService} from "./impl/REST/chat/RestfulChatRoomService";
import {RestfulUserService} from "./impl/REST/users/RestfulUserService";
import * as ChatModels from './models/ChatModels';
import * as ConversationModels from './models/CommentsModels';
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
    RestfulRoomService: RestfulChatRoomService,
}

const Conversation = {
    RestfulConversationService,
    RestfulCommentService,
    RestfulCommentModerationService
}
const Common = {
    RestfulUserService,
    RestfulWebhookService
}

const REST ={
    Chat,
    Conversation,
    Common,
}

const services = {
    ChatModerationService: RestfulChatModerationService,
    ChatEventService: RestfulChatEventService,
    ChatRoomService: RestfulChatRoomService,
    UserService: RestfulUserService,
    WebhookService: RestfulWebhookService,
    ConversationService: RestfulConversationService,
    CommentService: RestfulCommentService,
    CommentModerationService: RestfulCommentModerationService
}

const impl = {
    REST
}

export {
    ChatClient,
    CommentClient,
    services,
    impl,
    ChatModels,
    ConversationModels,
    CommonModels,
    Constants,
    Errors,
    Messages,
    API
}
