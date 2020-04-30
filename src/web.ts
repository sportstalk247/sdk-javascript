// @Sportstalk Client 3.7.x
const chatClient = require('./impl/ChatClient');
const conversationClient = require('./impl/ConversationClient');
const chatModels = require('./models/ChatModels');
const commonModels = require('./models/CommonModels');
const conversationModels = require('./models/ConversationModels');
// @ts-ignore
var ChatClient = window.ChatClient || chatClient.default || chatClient.ChatClient || chatClient;
var ConversationClient = window.ConversationClient || conversationClient.default || conversationClient.ConversationClient || conversationClient;

if(window) {
    // @ts-ignore
    window.ChatClient = ChatClient;
    // @ts-ignore
    window.ConversationClient = ConversationClient;
    // @ts-ignore
    window.SportsTalk = {};
    // @ts-ignore
    window.Conversation = {}
    // @ts-ignore
    window.SportsTalk.chat = {};
    // @ts-ignore
    window.SportsTalk.chat.Models = chatModels;
    // @ts-ignore
    window.SportsTalk.conversation = {};
    // @ts-ignore
    window.SportsTalk.common = {};
    // @ts-ignore
    window.SportsTalk.common.Models = commonModels;
    // @ts-ignore
    window.SportsTalk.conversation.Models = conversationModels
}
console.log("Chat and commenting powered by Sportstalk247")