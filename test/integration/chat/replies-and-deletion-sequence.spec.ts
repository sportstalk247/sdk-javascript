import { ChatClient } from '../../../src/impl/ChatClient';
import * as chai from 'chai';
import {RestfulChatRoomService} from "../../../src/impl/REST/chat/RestfulChatRoomService";
import * as dotenv from 'dotenv';
import {Kind, SportsTalkConfig} from "../../../src/models/CommonModels";
import {EventResult} from "../../../src/models/ChatModels";
dotenv.config();

let client;
let mod;
const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};

describe('REPLY & DELETE Chat Sequence', function() {
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
    const em1 = client.getEventService();
    const em2 = client2.getEventService();

    let theRoom;
    describe('User 1', function () {
        it('Joins room', function (done) {
            const custom = "chat-test-room-replies";
            rm.createRoom({
                name: "Test room",
                customid: custom
            }).then(room => {
                theRoom = room;
                return client.joinRoomByCustomId(custom)
            }).then((resp) => {
                expect(resp.room.customid).to.be.equal(custom);
                done()
            }).catch(done)
        })
    });
    describe('User 2', function () {
        it('Joins room', function (done) {
            client2.joinRoom(theRoom).then(() => {
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
    describe('GetUpdates with messages', function () {
        it('Shows the same to users, sends reply', function (done) {
            Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(async chatHistories => {
                    expect(chatHistories[0].events).to.have.lengthOf(2);
                    expect(chatHistories[1].events).to.have.lengthOf(2);
                    const reply = await client2.sendQuotedReply("This is my reply", chatHistories[0].events[0].id);
                    done();
                }).catch(done)
        })
    });
    describe('GetUpdates QuotedReply, Threaded Reply sequence', function () {
        let toDelete:EventResult;
        let toFlag: EventResult;
        let threadedReplyTargetId: string;
        it('Shows Quoted reply', function (done) {
            Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(async (chatHistories) => {
                    expect(chatHistories[0].events).to.have.lengthOf(chatHistories[0].itemcount);
                    expect(chatHistories[1].events).to.have.lengthOf(chatHistories[1].itemcount);
                    expect(chatHistories[0].events[chatHistories[0].events.length-1].eventtype).to.equal("quote");
                    expect(chatHistories[0].events[chatHistories[0].events.length-1].replyto).to.haveOwnProperty('userid');
                    expect(chatHistories[0].events[chatHistories[0].events.length-1].body).to.equal('This is my reply')
                    threadedReplyTargetId = chatHistories[0].events[chatHistories[0].events.length-1].id;
                    return chatHistories[0];
                }).then(chat=>{
                    toDelete = chat.events[0];
                    toFlag = chat.events[1];
                    done();
                })
                .catch(done)
        })
        it('Threads a reply', async ()=>{
            const reply = await client.sendThreadedReply("Threaded reply", threadedReplyTargetId)
            expect(reply)
        });
        it("deletes first event", async ()=>{
            const deletion = await client.permanetlyDeleteEvent(toDelete);
        });
        it("Flags an event for deletion", async()=>{
            const flagged = await client.flagEventLogicallyDeleted(toFlag);
        })
    });

    describe('Kill test room', function () {
        it('can be deleted', function (done) {
            rm.deleteRoom(theRoom)
                .then(success => {
                    expect(success.kind).to.be.equal(Kind.deletedroom)
                    done()
                }).catch(done);
        })
    })
});
