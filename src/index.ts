import * as API from "./API/ChatAPI";
import {ChatClient} from './impl/ChatClient';
import {ConversationClient} from './impl/ConversationClient';
import {RestfulChatModerationManager} from "./impl/chat/REST/RestfulChatModerationManager";
import {RestfulEventManager} from "./impl/chat/REST/RestfulEventManager";
import {RestfulRoomManager} from "./impl/chat/REST/RestfulRoomManager";
import {RestfulUserManager} from "./impl/common/REST/RestfulUserManager";
import * as ChatModels from './models/ChatModels';
import * as ConversationModels from './models/ConversationModels';
import * as CommonModels from './models/CommonModels';
import * as Constants from './constants/api';
import * as Messages from './constants/messages';
import * as Errors from './impl/errors';
import {RestfulConversationManager} from "./impl/conversation/REST/RestfulConversationManager";
import {RestfulCommentManager} from './impl/conversation/REST/RestfulCommentManager'
import {RestfulWebhookManager} from "./impl/common/REST/RestfulWebhookManager";

const Chat = {
    RestfulChatModerationManager,
    RestfulEventManager,
    RestfulRoomManager,
}

const Conversation = {
    RestfulConversationManager,
    RestfulCommentManager
}
const Common = {
    RestfulUserManager,
    RestfulWebhookManager
}

export {
    ChatClient,
    ConversationClient,
    Chat,
    Conversation,
    Common,
    ChatModels,
    ConversationModels,
    CommonModels,
    Constants,
    Errors,
    Messages,
    API
}
