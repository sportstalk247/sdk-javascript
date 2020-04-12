import { ChatClient } from '../../../src/impl/ChatClient';
import {EventResult} from "../../../src/models/ChatModels";
import * as chai from 'chai';
import {RestfulChatModerationManager} from "../../../src/impl/chat/REST/RestfulChatModerationManager";
import * as dotenv from 'dotenv';
import {ModerationType, SportsTalkConfig} from "../../../src/models/CommonModels";
dotenv.config();

const { expect } = chai;
const config: SportsTalkConfig = {apiKey:process.env.TEST_KEY, appId: process.env.TEST_APP_ID || "", endpoint: process.env.TEST_ENDPOINT};
const delay = function(timer) {
    return new Promise(function(accept, reject){
        const timeout = setTimeout(accept, timer)
    })
}
describe('Pre Moderation sequences', function() {
    describe('DENY', function () {
        // @ts-ignore

        let roomid;
        const client = ChatClient.create(config);
        const mod = new RestfulChatModerationManager(config);
        it('Can create a room, join the room, deny messages, kill room', (done) => {
            client.createRoom({
                name: "Pre-moderation test Room",
                slug: "pre-test-room",
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
                return client.sendCommand('Test message')
            }).then(() => {
                return mod.getModerationQueue()
            }).then(events => {
                expect(events.length).to.be.greaterThan(0);
                const list: Array<EventResult> = events || [];
                return Promise.all(list.map(function (event) {
                    return mod.rejectEvent(event)
                }))
            }).then(events => {
                return mod.getModerationQueue()
            }).then(events => {
                expect(events).to.have.lengthOf(0);
            }).then(() => {
                client.deleteRoom(roomid);
                done();
            }).catch(async e=>{
                try {
                    await client.deleteRoom(roomid);
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
        const client = ChatClient.create(config);
        const mod = new RestfulChatModerationManager(config);
        it('Can create a room, join the room, approve messages, kill room', (done) => {
            client.createRoom({
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
                return client.sendCommand('Test message')
            }).then(() => {
                return mod.getModerationQueue()
            }).then(events => {
                expect(events.length).to.be.greaterThan(0);
                const list: Array<EventResult> = events || [];
                return Promise.all(list.map(function (event) {
                    return mod.approveEvent(event)
                }))
            }).then(events => {
                return mod.getModerationQueue()
            }).then(events => {
                expect(events).to.have.lengthOf(0);
                return delay(1000);
            }).then(()=>{
                return client.getEventManager().getUpdates()
            }).then((events) => {
               // expect(events).to.have.lengthOf(1)
                client.deleteRoom(roomid);
                done();
            }).catch(async e=>{
                try {
                    await client.deleteRoom(roomid);
                } catch(err) {
                    console.log("Could not cleanly delete test room");
                }
                console.log(e);
                done(e);
            });
        })
    });
});
