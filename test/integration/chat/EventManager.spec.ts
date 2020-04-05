import { ChatClient } from '../../../src/impl/ChatClient';
import {EventHandlerConfig} from "../../../src/models/ChatModels";
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as dotenv from 'dotenv';
import {Reaction, SportsTalkConfig} from "../../../src/models/CommonModels";
dotenv.config();


const { expect } = chai;
const config: SportsTalkConfig = {apiKey:process.env.TEST_KEY, appId: process.env.TEST_APP_ID || "", endpoint: process.env.TEST_ENDPOINT};
const delay = function(timer) {
    return new Promise(function(accept, reject){
        const timeout = setTimeout(accept, timer)
    })
}

describe("Event Manager", ()=>{

    // @ts-ignore
    const client = ChatClient.create(config)
    const EM = client.getEventManager();
    const RM = client.getRoomManager();
    const onChatStart = sinon.fake();
    const onChatEvent = sinon.spy();
    const onAdminCommand = sinon.fake();
    const onPurgeEvent = sinon.fake();
    const onReply = sinon.fake();

    EM.setEventHandlers({
        onChatStart,
        onChatEvent,
        onAdminCommand,
        onPurgeEvent,
        onReply
    });
    let room;

    describe("Triggers callbacks", function() {
        this.timeout(5000);
        let chatMessage;
        describe("onChatStart", () => {
            it("will trigger onChatStart", async () => {
                room = await RM.createRoom({name: "CallbackTest", slug: "callback-test"});
                await EM.setCurrentRoom(room);
                await EM.startTalk();
                expect(onChatStart.calledOnce)
            });
        });
        describe("onChatEvent", () => {
            it("Will trigger onChatEvent", async () => {
                const user = await client.createOrUpdateUser({userid:"chatEventUser", handle: "chatEventUser"});
                client.setUser(user);
                const join = await client.joinRoom(room);
                const response = await client.sendCommand("This is a chat event command");
                await delay(1000);
                expect(onChatEvent.callCount).to.be.greaterThan(0);
                chatMessage = onChatEvent.getCall(0).args[0];
            });
        });
        describe("onReply", ()=>{
            it("Will trigger onReaction", async()=>{
                const id = chatMessage.id;
                const reaction = await client.sendReply("This is my reply", id)
                await delay(3000);
                expect(onReply.callCount).to.be.greaterThan(0);
                expect(onChatEvent.callCount).to.be.greaterThan(0);
            })
        })
        describe("onAdmin", ()=>{
            it("Will trigger onAdminCommand", async()=>{
                const purge = await client.sendCommand("*purge zola chatEventUser");
                await delay(3000);
                expect(onAdminCommand.callCount).to.be.greaterThan(0);
            })
        })
        describe('onPurge', ()=>{
            it("Will trigger onPurgeEvent", async()=>{
                expect(onPurgeEvent.callCount).to.be.greaterThan(0);
            })
        })
        describe("Kill chat room", ()=>{
            it("closes chat", done=>{
                RM.deleteRoom(room).then(()=>{
                    EM.stopTalk();
                    done();
                }).catch(done);
            })
        })
    })
})
