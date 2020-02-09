import { SportsTalkClient } from '../../src/SportsTalkClient';
import * as chai from 'chai';
import {RestfulRoomManager} from "../../src/impl/REST/RestfulRoomManager";

let client;
let mod;
const { expect } = chai;
const config = {
    apiKey:process.env.TEST_KEY,
    endpoint: process.env.TEST_ENDPOINT,
}

describe('REPLY Chat Sequence', function() {
    const client = SportsTalkClient.create({
        ...config,
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    });
    const client2 = SportsTalkClient.create({
        ...config,
        user: {
            userid: 'testuser2',
            handle: 'handle2'
        }
    });
    const rm = new RestfulRoomManager(config);
    const em1 = client.getEventManager();
    const em2 = client2.getEventManager();

    let theRoom;
    describe('User 1', function () {
        it('Joins room', function (done) {
            client.createRoom({
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
            client2.createRoom({
                name: "Test room",
                slug: "chat-test-room",
            }).then(room => {
                return client2.joinRoom(room)
            }).then(() => {
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
                    await client2.sendReply("This is my reply", chatHistories[0][0].id);
                    done();
                }).catch(done)
        })
    });
    describe('GetUpdates shows reply', function () {
        it('Fires onReply', function (done) {
            Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(chatHistories => {
                    expect(chatHistories[0]).to.have.lengthOf(3);
                    expect(chatHistories[1]).to.have.lengthOf(3);
                    expect(chatHistories[0][chatHistories[0].length-1].eventtype).to.equal("reply");
                    expect(chatHistories[0][chatHistories[0].length-1].replyto).to.haveOwnProperty('userid');
                    expect(chatHistories[0][chatHistories[0].length-1].body).to.equal('This is my reply')
                    done();
                }).catch(done)
        })
    });
    describe('Kill test room', function () {
        it('can be deleted', function (done) {
            rm.deleteRoom(theRoom)
                .then(success => {
                    done()
                }).catch(done);
        })
    })
});
