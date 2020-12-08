import { ChatClient } from '../../../src/impl/ChatClient';
import * as chai from 'chai';
import * as sinon from 'sinon';
import {RestfulChatRoomService} from "../../../src/impl/REST/chat/RestfulChatRoomService";
import * as dotenv from 'dotenv';
import {Kind, SportsTalkConfig} from "../../../src/models/CommonModels";
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
            client2.joinRoom(theRoom).then((room) => {
                done()
            }).catch(done)
        })
    })
    describe('Users chat', function () {
        it('Lets users speak', function (done) {
            Promise.all([
                client2.executeChatCommand("Hello!"),
                client2.executeChatCommand("This is me!")
            ]).then(results => {
                expect(results).to.have.lengthOf(2);
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
            try {
                const purge = await client.purgeUserMessagesFromRoom("testuser2")
                expect(purge.message).to.be.equal('The user\'s 3 messages were purged.');
            } catch(e) {
                const error = new Error(e);
                error.message = "Couldn't send command";
                throw error;
            }
            const updates:RestfulChatEventService = <RestfulChatEventService>client.getEventService();
            return updates._fetchUpdatesAndTriggerCallbacks().then(function(res){
                const handlers = updates.getEventHandlers();
                // @ts-ignore
                expect(handlers.onPurgeEvent.callCount).to.be.equal(1)

            })
        })
    });
    describe('Kill test room', function () {
        it('can be deleted', function (done) {
            rm.deleteRoom(theRoom)
                .then(success => {
                    expect(success.kind).to.be.equal(Kind.deletedroom);
                    // expect(success.deletedEventsCount).to.be.equal(3);
                    done()
                }).catch(done);
        })
    })
});
