import { ChatClient } from './impl/ChatClient';
import { CommentClient } from './impl/CommentClient';
import { UserClient } from './impl/UserClient';
import { RestfulChatModerationService } from "./impl/REST/chat/RestfulChatModerationService";
import { RestfulChatEventService } from "./impl/REST/chat/RestfulChatEventService";
import { RestfulChatRoomService } from "./impl/REST/chat/RestfulChatRoomService";
import { RestfulUserService } from "./impl/REST/users/RestfulUserService";
import * as ChatModels from './models/ChatModels';
import * as CommentModels from './models/CommentsModels';
import { SportsTalkConfig } from './models/CommonModels';
import * as CommonModels from './models/CommonModels';
import * as Constants from './impl/constants/api';
import * as Messages from './impl/constants/messages';
import * as Errors from './impl/errors';
import { RestfulConversationService } from "./impl/REST/comments/RestfulConversationService";
import { RestfulCommentModerationService } from "./impl/REST/comments/RestfulCommentModerationService";
import { RestfulCommentService } from './impl/REST/comments/RestfulCommentService';
import { RestfulWebhookService } from "./impl/REST/webhooks/RestfulWebhookService";
declare const Services: {
    ChatModerationService: typeof RestfulChatModerationService;
    ChatEventService: typeof RestfulChatEventService;
    ChatRoomService: typeof RestfulChatRoomService;
    UserService: typeof RestfulUserService;
    WebhookService: typeof RestfulWebhookService;
    ConversationService: typeof RestfulConversationService;
    CommentService: typeof RestfulCommentService;
    CommentModerationService: typeof RestfulCommentModerationService;
};
declare const impl: {
    REST: {
        Chat: {
            RestfulChatModerationService: typeof RestfulChatModerationService;
            RestfulChatEventService: typeof RestfulChatEventService;
            RestfulChatRoomService: typeof RestfulChatRoomService;
        };
        Comments: {
            RestfulConversationService: typeof RestfulConversationService;
            RestfulCommentService: typeof RestfulCommentService;
            RestfulCommentModerationService: typeof RestfulCommentModerationService;
        };
        Users: {
            RestfulUserService: typeof RestfulUserService;
        };
        Webhooks: {
            RestfulWebhookService: typeof RestfulWebhookService;
        };
    };
};
declare const Types: {
    Comments: typeof CommentModels;
    Chat: typeof ChatModels;
    Common: typeof CommonModels;
    Errors: typeof Errors;
    Messages: typeof Messages;
};
export { ChatClient, CommentClient, UserClient, Services, impl, ChatModels, CommentModels, CommonModels, Constants, Types, SportsTalkConfig };
