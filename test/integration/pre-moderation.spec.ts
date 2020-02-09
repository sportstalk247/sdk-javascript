import { SportsTalkClient } from '../../src/SportsTalkClient';
import {EventResult, ModerationType} from "../../src/DataModels";
import * as chai from 'chai';
import {RestfulModerationManager} from "../../src/impl/REST/RestfulModerationManager";

const { expect } = chai;
describe('Pre Moderation sequences', function() {
    describe('DENY', function () {
        let roomid;
        const client = SportsTalkClient.create({
            apiKey:process.env.TEST_KEY,
            endpoint: process.env.TEST_ENDPOINT,
        });
        const mod = new RestfulModerationManager({
            apiKey:process.env.TEST_KEY,
            endpoint: process.env.TEST_ENDPOINT,
        });
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
            }).then(() => {
                return client.joinRoom(roomid)
            }).then(() => {
                return client.sendCommand('Test message')
            }).then(() => {
                return mod.getModerationQueueEvents()
            }).then(events => {
                expect(events.length).to.be.greaterThan(0);
                const list: Array<EventResult> = events || [];
                return Promise.all(list.map(function (event) {
                    return mod.removeEvent(event)
                }))
            }).then(events => {
                return mod.getModerationQueueEvents()
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
        const client = SportsTalkClient.create({
            apiKey:process.env.TEST_KEY,
            endpoint: process.env.TEST_ENDPOINT,
        });
        const mod = new RestfulModerationManager({
            apiKey:process.env.TEST_KEY,
            endpoint: process.env.TEST_ENDPOINT,
        });
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
            }).then(() => {
                return client.joinRoom(roomid)
            }).then(() => {
                return client.sendCommand('Test message')
            }).then(() => {
                return mod.getModerationQueueEvents()
            }).then(events => {
                expect(events.length).to.be.greaterThan(0);
                const list: Array<EventResult> = events || [];
                return Promise.all(list.map(function (event) {
                    return mod.approveEvent(event)
                }))
            }).then(events => {
                return mod.getModerationQueueEvents()
            }).then(events => {
                expect(events).to.have.lengthOf(0);
                return client.getEventManager().getUpdates()
            }).then((events) => {
                expect(events).to.have.lengthOf(1)
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
