import {ChatClient} from '../../../../src/impl/ChatClient';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as dotenv from 'dotenv';
import {Reaction, SportsTalkConfig} from "../../../../src/models/CommonModels";
import {RestfulChatEventService} from "../../../../src/impl/REST/chat/RestfulChatEventService";
import {UserRole} from "../../../../src/models/user/User";

dotenv.config();

const USER_TOKEN:string = process.env.USER_JWT || '';
const REFRESHED:string = "refreshed"
const { expect } = chai;
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID || "",
    endpoint: process.env.TEST_ENDPOINT,
    userToken: USER_TOKEN,
    userTokenRefreshFunction: async (jwt) => {
        console.log("Refreshing token");
        return REFRESHED
    }
};
const delay = function(timer) {
    return new Promise(function(accept, reject){
        const timeout = setTimeout(accept, timer)
    })
}
let chatMessage;

describe("Event Service", () => {
    let reactionTriggered = false;
    let replyTriggered = false;
    // @ts-ignore
    const client = <ChatClient> ChatClient.init(config)
    const US = client.getUserService();
    const EM = client.getEventService();
    const RM = client.getRoomService();
    const onChatStart = sinon.fake();
    const onChatEvent = sinon.spy();
    const onAdminCommand = sinon.fake();
    const onPurgeEvent = sinon.fake();
    const onReply =  sinon.fake();
    const onReaction = function(e) {
        reactionTriggered = true;
    }

    client.setEventHandlers({
        onChatStart,
        onChatEvent,
        onAdminCommand,
        onPurgeEvent,
        onReply,
        onReaction
    });
    let room;

    describe("User token handling", function() {
        it("Refresh function is delegated, refreshing any token refreshes all", async function () {
            client.setUserToken(USER_TOKEN);
            let userToken = await client.getUserToken();
            expect(USER_TOKEN).to.be.equal(userToken);
            await EM.refreshUserToken();
            let updatedToken = await client.getUserToken();
            let emToken = await EM.getUserToken()
            expect(REFRESHED).to.be.equal(emToken)
            expect(emToken).to.be.equal(updatedToken);
            client.setUserToken(USER_TOKEN);
            emToken = await EM.getUserToken()
            expect(emToken).to.be.equal(USER_TOKEN)
        })
    })

    describe("Triggers callbacks", function() {
        this.timeout(5000);

        describe("onChatStart", () => {
            it("will trigger onChatStart", async () => {
                room = await RM.createRoom({name: "CallbackTest", slug: "callback-test"});
                await EM.setCurrentRoom(room);
                expect(onChatStart.calledOnce)
            });
        });
        describe("onChatEvent", () => {
            it("Will trigger onChatEvent", async () => {
                const user = await client.createOrUpdateUser({userid:"chatEventUser", handle: "chatEventUser", role: UserRole.admin});
                client.setUser(user);
                const join = await client.joinRoom(room);
                const response = await client.executeChatCommand("This is a chat event command");
                // @ts-ignore
                const updates = await client.getEventService()._fetchUpdatesAndTriggerCallbacks();
                expect(onChatEvent.callCount).to.be.greaterThan(0);
                // @ts-ignore
                chatMessage = response.data.speech;
                await EM.stopEventUpdates();
            });
        });
        describe("onReply", ()=>{
            it("Will trigger onReply", async()=>{
                const id = chatMessage.id;
                const reply = await client.sendThreadedReply("This is my reply", id)
                const eventService = <RestfulChatEventService> await client.getEventService()
                await eventService._fetchUpdatesAndTriggerCallbacks();
                const handlers = client.getEventService().getEventHandlers()
                // @ts-ignore
                expect(onReply.callCount).to.be.equal(1);
                // @ts-ignore
                expect(handlers.onChatEvent.callCount).to.be.greaterThan(0);
            })
        })

        describe("onReaction", ()=>{
            it("Will trigger onReaction", async()=>{
                const id = chatMessage.id;
                const reaction = await client.reactToEvent(Reaction.like, id);
                const eventService = <RestfulChatEventService> await client.getEventService()
                await eventService._fetchUpdatesAndTriggerCallbacks();
                const handlers = client.getEventService().getEventHandlers()
                // @ts-ignore
                expect(reactionTriggered).to.be.true;
            })
        })
        describe("Search chat events", ()=>{
            it('can search events', done=>{
                EM.searchEventHistory({fromuserid: "chatEventUser"}).then(res=>{
                    expect(res.kind).to.be.equal('list.chatevents');
                    done();
                }).catch(done)
            })
        })

        describe("onAdmin", ()=>{
            it("Will trigger onAdminCommand", async()=>{
                try {
                    const purge = await client.executeChatCommand("*purge chatEventUser");
                    expect(onAdminCommand.callCount).to.be.greaterThan(0);
                }catch(e){
                    throw e;
                }
            })
        })
        describe('onPurge', ()=>{
            it("Will trigger onPurgeEvent", async()=>{
                const eventService = <RestfulChatEventService> await client.getEventService()
                await eventService._fetchUpdatesAndTriggerCallbacks();
                expect(onPurgeEvent.callCount).to.be.greaterThan(0);
            })
        })

        describe("Kill chat room", ()=>{
            it("closes chat", done=>{
                RM.deleteRoom(room).then(()=>{
                    EM.stopEventUpdates();
                    done();
                }).catch(done);
            })
        })

    })
})
