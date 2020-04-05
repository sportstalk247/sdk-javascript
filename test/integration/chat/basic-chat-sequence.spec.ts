import { ChatClient } from '../../../src/impl/ChatClient';
import * as chai from 'chai';
import {RestfulRoomManager} from "../../../src/impl/chat/REST/RestfulRoomManager";
import * as dotenv from 'dotenv';
import {SportsTalkConfig} from "../../../src/models/CommonModels";
dotenv.config();

let client;
let mod;
const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiKey:process.env.TEST_KEY, appId: process.env.TEST_APP_ID || "", endpoint: process.env.TEST_ENDPOINT};
describe('BASIC Chat Sequence', function() {
    const user1config: SportsTalkConfig = {...config,user: {
            userid: 'testuser1',
            handle: 'handle1'
        }};

    const user2config: SportsTalkConfig = {
        ...config,

        user: {
            userid: 'testuser2',
            handle: 'handle2'
        }
    }
    const client = ChatClient.create(user1config);
    const client2 = ChatClient.create(user2config);
    const rm = new RestfulRoomManager({
       ...config
    });
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
            }).then((resp) => {
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
    describe("leave room", function(){
        it("Leaves the room", async function() {
            await client.exitRoom();
            await client2.exitRoom();
        })
    })
    describe('Kill test room', function () {
        it('can be deleted', function (done) {
            rm.deleteRoom(theRoom)
                .then(success => {
                    done()
                }).catch(done);
        })
    })
});
