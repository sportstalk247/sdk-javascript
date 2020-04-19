import { ChatClient } from '../../../src/impl/ChatClient';
import * as chai from 'chai';
import {RestfulRoomService} from "../../../src/impl/chat/REST/RestfulRoomService";
import * as dotenv from 'dotenv';
import {Kind, SportsTalkConfig} from "../../../src/models/CommonModels";
import {EventResult} from "../../../src/models/ChatModels";
dotenv.config();

let client;
let mod;
const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};

describe('REPLY Chat Sequence', function() {
    const client = <ChatClient> ChatClient.create({
        ...config,
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    });
    const client2 = <ChatClient> ChatClient.create({
        ...config,
        user: {
            userid: 'testuser2',
            handle: 'handle2'
        }
    });
    const rm = new RestfulRoomService(config);
    const em1 = client.getEventService();
    const em2 = client2.getEventService();

    let theRoom;
    describe('User 1', function () {
        it('Joins room', function (done) {
            rm.createRoom({
                name: "Test room",
                slug: "chat-test-room",
            }).then(room => {
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
                done()
            }).catch(done)
        })
    })
    describe('Users chat', function () {
        it('Lets users speak', function (done) {
            Promise.all([
                client.sendCommand("Hello!"),
                client2.sendCommand("This is me!")
            ]).then(results => {

                done()
            }).catch(done);
        })
    })
    describe('GetUpdates fires', function () {
        it('Shows the same to users, sends reply', function (done) {
            Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(async chatHistories => {
                    expect(chatHistories[0]).to.have.lengthOf(2);
                    expect(chatHistories[1]).to.have.lengthOf(2);
                    const reply = await client2.sendReply("This is my reply", chatHistories[0][0].id);
                    done();
                }).catch(done)
        })
    });
    describe('GetUpdates reply sequence', function () {
        let toDelete:EventResult;
        it('Shows reply', function (done) {
            Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(chatHistories => {
                    expect(chatHistories[0]).to.have.lengthOf(3);
                    expect(chatHistories[1]).to.have.lengthOf(3);
                    expect(chatHistories[0][chatHistories[0].length-1].eventtype).to.equal("reply");
                    expect(chatHistories[0][chatHistories[0].length-1].replyto).to.haveOwnProperty('userid');
                    expect(chatHistories[0][chatHistories[0].length-1].body).to.equal('This is my reply')
                    return chatHistories[0];
                }).then(events=>{
                    toDelete = events[0];
                    done();
                })
                .catch(done)
        })
        it("deletes first event", async ()=>{
            const deletion = await client.deleteEvent(toDelete);
        });
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
