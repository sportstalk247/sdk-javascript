import { ChatClient } from '../../../src/impl/ChatClient';
import {EventResult} from "../../../src/models/ChatModels";
import * as chai from 'chai';
import {RestfulChatModerationService} from "../../../src/impl/REST/chat/RestfulChatModerationService";
import * as dotenv from 'dotenv';
import {ModerationType, SportsTalkConfig} from "../../../src/models/CommonModels";
import {RestfulChatRoomService} from "../../../src/impl/REST/chat/RestfulChatRoomService";
dotenv.config();

const { expect } = chai;
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID || "", endpoint: process.env.TEST_ENDPOINT};
const delay = function(timer) {
    return new Promise(function(accept, reject){
        const timeout = setTimeout(accept, timer)
    })
}
describe('Pre Moderation sequences', function() {
    describe('DENY', function () {
        // @ts-ignore

        let roomid;
        const client = <ChatClient> ChatClient.init(config);
        const rm = new RestfulChatRoomService(config);
        const mod = new RestfulChatModerationService(config);
        it('Can create a room, join the room, deny messages, kill room', (done) => {
            rm.createRoom({
                name: "Pre-moderation test Room",
                slug: "pre-test-room"+new Date().getTime(),
                moderation: ModerationType.pre,
            }).then(room => {
                roomid = room.id;
                expect(room.moderation).to.be.equal(ModerationType.pre)
                return room;
            }).then(room => {
                return client.createOrUpdateUser({
                    userid: 'testsequence',
                    handle: 'test'
                });
            }).then((user) => {
                client.setUser(user);
                return client.joinRoom(roomid)
            }).then(() => {
                return client.executeChatCommand('Test message')
            }).then(() => {
                return mod.listMessagesInModerationQueue()
            }).then(events => {
                expect(events.events.length).to.be.greaterThan(0);
                const list: Array<EventResult> = events.events || [];
                return Promise.all(list.map(function (event) {
                    return mod.moderateEvent(event, false)
                }))
            }).then(events => {
                return mod.listMessagesInModerationQueue()
            }).then(events => {
                expect(events.events).to.have.lengthOf(0);
            }).then(() => {
                rm.deleteRoom(roomid);
                done();
            }).catch(async e=>{
                try {
                    await rm.deleteRoom(roomid);
                } catch(err) {
                    console.log("Could not cleanly delete test room");
                }
                console.log(e);
                done(e);
            });
        })
    });

    describe('APPROVE', function () {
        this.timeout(20000);
        let roomid;
        const client = <ChatClient>ChatClient.init(config);
        const rm = new RestfulChatRoomService(config);
        const mod = new RestfulChatModerationService(config);
        it('Can create a room, join the room, approve messages, kill room', (done) => {
            rm.createRoom({
                name: "Pre-moderation test Room",
                slug: "pre-test-room2",
                moderation: ModerationType.pre,
            }).then(room => {
                roomid = room.id;
                expect(room.moderation).to.be.equal(ModerationType.pre)
                return room;
            }).then(room => {
                return client.createOrUpdateUser({
                    userid: 'testsequence',
                    handle: 'test'
                });
            }).then((user) => {
                client.setUser(user);
                return client.joinRoom(roomid)
            }).then(() => {
                return client.executeChatCommand('Test message')
            }).then(() => {
                return mod.listMessagesInModerationQueue()
            }).then(events => {
                expect(events.events.length).to.be.greaterThan(0);
                const list: Array<EventResult> = events.events || [];
                return Promise.all(list.map(async function (event) {
                    const approval = await mod.approveEvent(event)
                    return approval;
                }))
            }).then(events => {
                return mod.listMessagesInModerationQueue()
            }).then(events => {
                expect(events.events).to.have.lengthOf(0);
                return delay(1000);
            }).then(()=>{
                return client.getEventService().getUpdates()
            }).then(async (result) => {
                expect(result.events).to.have.lengthOf(1)
                const deleted = await rm.deleteRoom(roomid);
                done();
            }).catch(async e=>{
                try {
                    await rm.deleteRoom(roomid);
                } catch(err) {
                    console.log("Could not cleanly delete test room");
                }
                console.log(e);
                done(e);
            });
        })
    });
});
