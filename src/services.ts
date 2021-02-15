import {RestfulChatModerationService} from "./impl/REST/chat/RestfulChatModerationService";
import {RestfulChatEventService} from "./impl/REST/chat/RestfulChatEventService";
import {RestfulChatRoomService} from "./impl/REST/chat/RestfulChatRoomService";
import {RestfulUserService} from "./impl/REST/users/RestfulUserService";
import {RestfulWebhookService} from "./impl/REST/webhooks/RestfulWebhookService";
import {RestfulConversationService} from "./impl/REST/comments/RestfulConversationService";
import {RestfulCommentService} from "./impl/REST/comments/RestfulCommentService";
import {RestfulCommentModerationService} from "./impl/REST/comments/RestfulCommentModerationService";
import {RestfulNotificationService} from "./impl/REST/notifications/RestfulNotificationService";


export const ChatModerationService = RestfulChatModerationService;
export const ChatEventService = RestfulChatEventService;
export const ChatRoomService = RestfulChatRoomService;
export const UserService = RestfulUserService;
export const WebhookService = RestfulWebhookService;
export const ConversationService = RestfulConversationService;
export const CommentService = RestfulCommentService;
export const CommentModerationService = RestfulCommentModerationService;
export const NotificationService = RestfulNotificationService
