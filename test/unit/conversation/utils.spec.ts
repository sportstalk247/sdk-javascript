import {getUrlConversationId} from "../../../src/impl/conversation/ConversationUtils";
import {Conversation, ModerationType} from "../../../src/models/ConversationModels";
import * as chai from 'chai';

const {expect} = chai;

describe("ConversationUtils", function(){
    it("Will extract conversation ID from conversation", ()=>{
        const fakeId = "fakeConversationID";
        const conversation:Conversation = {
            owneruserid: "someowner",
            conversationid:fakeId,
            property: "testing",
            moderation: ModerationType.post
        }
        const id = getUrlConversationId(conversation);
        expect(id).to.be.equal(fakeId);
    })
    it("Will extract conversation ID from string", ()=>{
        const fakeId = "fakeConversationID";
        const id = getUrlConversationId(fakeId);
        expect(id).to.be.equal(fakeId);
    })
})