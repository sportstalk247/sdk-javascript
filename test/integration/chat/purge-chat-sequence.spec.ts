import { ChatClient } from '../../../src/impl/ChatClient';
import * as chai from 'chai';
import * as sinon from 'sinon';
import {RestfulChatRoomService} from "../../../src/impl/REST/chat/RestfulChatRoomService";
import * as dotenv from 'dotenv';
import {SportsTalkConfig} from "../../../src/models/CommonModels";
import {RestfulChatEventService} from "../../../src/impl/REST/chat/RestfulChatEventService";
dotenv.config();

const onPurgeEvent = sinon.fake();
const onChatEvent = sinon.fake();
const delay = function(timer) {
    return new Promise(function(accept, reject){
        const timeout = setTimeout(accept, timer)
    })
}
const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};

describe('PURGE Chat Sequence', function() {
    const client = <ChatClient> ChatClient.init({
        ...config,
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    });
    const client2 = <ChatClient> ChatClient.init({
        ...config,
        user: {
            userid: 'testuser2',
            handle: 'handle2'
        }
    });
    const rm = new RestfulChatRoomService(config);
    client.setEventHandlers({
        onPurgeEvent,
        onChatEvent,
    });
    const em1 = client.getEventService();
    client2.setEventHandlers({
        onPurgeEvent,
        onChatEvent
    });
    const em2 = client2.getEventService();
    const roomDef = {
        name: "Test room",
        customid: "chat-test-room"+new Date().getTime(),
    }

    let theRoom;
    describe('User 1', function () {
        it('Joins room', function (done) {
            rm.createRoom(roomDef).then(room => {
                theRoom = room;
                return client.joinRoom(room)
            }).then(() => {
                done()
            }).catch(done)
        })
    });
    describe('User 2', function () {
        it('Joins room', function (done) {
            client2.joinRoom(theRoom).then(() => {
                client.startListeningToEventUpdates()
                client2.startListeningToEventUpdates()
                done()
            }).catch(done)
        })
    })
    describe('Users chat', function () {
        it('Lets users speak', function (done) {
            Promise.all([
                client.executeChatCommand("Hello!"),
                client2.executeChatCommand("This is me!")
            ]).then(results => {
                done()
            }).catch(done);
        })
    })
    describe('GetUpdates fires', function () {
        it('Shows the same to users, sends reply', function (done) {
            Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(async chatHistories => {
                    expect(chatHistories[0].events).to.have.lengthOf(2);
                    expect(chatHistories[1].events).to.have.lengthOf(2);
                    await client2.sendQuotedReply("This is my reply", chatHistories[0].events[0].id);
                    done();
                }).catch(done)
        })
    });

    describe('GetUpdates shows purge', function () {
        it('Fires onPurge',  async function () {
            await delay(500);
            const purge =  await client.executeChatCommand("*purge "+process.env.PURGE+" handle2");
            await client.getUpdates();
            await delay(100);
            const updates:RestfulChatEventService = <RestfulChatEventService>client.getEventService();
            await updates._fetchUpdatesAndTriggerCallbacks();
            await delay(100);
            const handlers = updates.getEventHandlers();
            // @ts-ignore
            expect(handlers.onPurgeEvent.callCount).to.be.greaterThan(0);
        })
    });
    describe('Kill test room', function () {
        it('can be deleted', function (done) {
            rm.deleteRoom(theRoom)
                .then(success => {
                    client.stopListeningToEventUpdates();
                    client2.stopListeningToEventUpdates();
                    done()
                }).catch(done);
        })
    })
});
