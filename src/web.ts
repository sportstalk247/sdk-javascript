// @ts-ignore
const client = require('./impl/ChatClient');
const conversation = require('./impl/ConversationClient');
const types = require('./models/ChatModels');
const common = require('./models/CommonModels');
const conversationtypes = require('./models/ConversationModels');
// @ts-ignore
var SportsTalkClient = window.SportsTalkClient || client.default || client.ChatClient || client;
var ConversationClient = window.ConversationClient || conversation.default || conversation.ConversationClient || conversation;

if(window) {
    // @ts-ignore
    window.ChatClient = SportsTalkClient;
    // @ts-ignore
    window.ConversationClient = ConversationClient;
    // @ts-ignore
    window.SportsTalk = {};
    // @ts-ignore
    window.Conversation = {}
    // @ts-ignore
    window.SportsTalk.chat = {};
    // @ts-ignore
    window.SportsTalk.chat.Types = types;
    // @ts-ignore
    window.SportsTalk.conversation = {};
    // @ts-ignore
    window.SportsTalk.common = {};
    // @ts-ignore
    window.SportsTalk.common.Types = common;
    // @ts-ignore
    window.SportsTalk.conversation.Types = conversationtypes
}
