import { SportsTalkClient } from '../../src/SportsTalkClient';
import * as chai from 'chai';
import {RestfulRoomManager} from "../../src/impl/REST/RestfulRoomManager";
import * as dotenv from 'dotenv';
dotenv.config();

let client;
let mod;
const { expect } = chai;

describe('BASIC Chat Sequence', function() {
    const client = SportsTalkClient.create({
        apiKey:process.env.TEST_KEY,
        endpoint: process.env.TEST_ENDPOINT,
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    });
    const client2 = SportsTalkClient.create({
        apiKey:process.env.TEST_KEY,
        endpoint: process.env.TEST_ENDPOINT,
        user: {
            userid: 'testuser2',
            handle: 'handle2'
        }
    });
    const rm = new RestfulRoomManager({
        apiKey: process.env.TEST_KEY,
        endpoint: process.env.TEST_ENDPOINT,
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
