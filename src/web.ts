// @Sportstalk Client 3.7.x
(function(window) {
    const chatClient = require('./impl/ChatClient');
    const commentClient = require('./impl/CommentClient');
    const chatModels = require('./models/ChatModels');
    const commonModels = require('./models/CommonModels');
    const conversationModels = require('./models/CommentsModels');
    if (window) {
        // @ts-ignore
        var ChatClient = window.ChatClient || chatClient.default || chatClient.ChatClient || chatClient;
        // @ts-ignore
        var CommentClient = window.CommentClient || commentClient.default || commentClient.CommentClient || commentClient;
        // @ts-ignore
        window.ChatClient = ChatClient;
        // @ts-ignore
        window.CommentClient = CommentClient;
        // @ts-ignore
        window.SportsTalk = {};
        // @ts-ignore
        window.Conversation = {}
        // @ts-ignore
        window.SportsTalk.chat = {};
        // @ts-ignore
        window.SportsTalk.chat.Models = chatModels;
        // @ts-ignore
        window.SportsTalk.comments = {};
        // @ts-ignore
        window.SportsTalk.common = {};
        // @ts-ignore
        window.SportsTalk.common.Models = commonModels;
        // @ts-ignore
        window.SportsTalk.comments.Models = conversationModels
    }
    console.log("Chat and commenting powered by Sportstalk247")
})(window);