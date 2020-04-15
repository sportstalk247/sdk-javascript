import * as API from "./API/ChatAPI";
import {ChatClient} from './impl/ChatClient';
import {ConversationClient} from './impl/ConversationClient';
import {RestfulChatModerationService} from "./impl/chat/REST/RestfulChatModerationService";
import {RestfulEventService} from "./impl/chat/REST/RestfulEventService";
import {RestfulRoomService} from "./impl/chat/REST/RestfulRoomService";
import {RestfulUserManager} from "./impl/common/REST/RestfulUserManager";
import * as ChatModels from './models/ChatModels';
import * as ConversationModels from './models/ConversationModels';
import * as CommonModels from './models/CommonModels';
import * as Constants from './impl/constants/api';
import * as Messages from './impl/constants/messages';
import * as Errors from './impl/errors';
import {RestfulConversationService} from "./impl/conversation/REST/RestfulConversationService";
import {RestfulCommentService} from './impl/conversation/REST/RestfulCommentService'
import {RestfulWebhookManager} from "./impl/common/REST/RestfulWebhookManager";

const Chat = {
    RestfulChatModerationManager: RestfulChatModerationService,
    RestfulEventManager: RestfulEventService,
    RestfulRoomManager: RestfulRoomService,
}

const Conversation = {
    RestfulConversationManager: RestfulConversationService,
    RestfulCommentManager: RestfulCommentService
}
const Common = {
    RestfulUserManager,
    RestfulWebhookManager
}

const REST ={
    Chat,
    Conversation,
    Common,
}

const impl = {
    REST
}

export {
    ChatClient,
    ConversationClient,
    impl,
    ChatModels,
    ConversationModels,
    CommonModels,
    Constants,
    Errors,
    Messages,
    API
}
