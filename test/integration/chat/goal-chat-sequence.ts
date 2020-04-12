import { ChatClient } from '../../../src/impl/ChatClient';
import * as chai from 'chai';
import {RestfulRoomManager} from "../../../src/impl/chat/REST/RestfulRoomManager";
import * as dotenv from 'dotenv';
dotenv.config();

let client;
let mod;
const { expect } = chai;

describe('GOAL Chat Sequence', function() {
    // @ts-ignore
    const client = ChatClient.create({
        apiKey:process.env.TEST_KEY,
        endpoint: process.env.TEST_ENDPOINT,
        appId: process.env.TEST_APP_ID,
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    });
    const image = "https://res.cloudinary.com/sportstalk247/image/upload/v1575821595/goal_l6ho1d.jpg";
    client.setDefaultGoalImage(image);
    // @ts-ignore
    const client2 = ChatClient.create({
        apiKey:process.env.TEST_KEY,
        endpoint: process.env.TEST_ENDPOINT,
        appId: process.env.TEST_APP_ID,
        user: {
            userid: 'testuser2',
            handle: 'handle2'
        }
    });
    // @ts-ignore
    const rm = new RestfulRoomManager({
        apiKey:process.env.TEST_KEY,
        endpoint: process.env.TEST_ENDPOINT,
        appId: process.env.TEST_APP_ID,
    });
    const em1 = client.getEventManager();
    const em2 = client2.getEventManager();

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
            rm.createRoom({
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
        it('Shows the same to users', function (done) {
            Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(chatHistories => {
                    expect(chatHistories[0]).to.have.lengthOf(2);
                    expect(chatHistories[1]).to.have.lengthOf(2);
                    done();
                }).catch(done)
        })
    });
    describe('GOAL', function () {
        it('Lets user1 send a goal', function (done) {
            Promise.all([
                client.sendGoal("GOAL!!"),
                client2.sendCommand("That was amazing!")
            ]).then(results => {
                done()
            }).catch(done);
        })
    })
    describe('GetUpdates fires', function () {
        it('Shows the goal', function (done) {
            Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(chatHistories => {
                    const goal = chatHistories[0].find(item=>item.customtype=="goal")
                    expect(goal).to.be.not.null;
                    // @ts-ignore
                    expect(goal.custompayload).to.be.not.null;
                    // @ts-ignore
                    const payload = JSON.parse(goal.custompayload);
                    expect(payload.img).to.be.equal(image)
                    expect(chatHistories[0]).to.have.lengthOf(4);
                    expect(chatHistories[1]).to.have.lengthOf(4);
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
