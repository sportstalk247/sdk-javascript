import { ChatClient } from '../../../src/impl/ChatClient';
import * as chai from 'chai';
import {RestfulChatRoomService} from "../../../src/impl/REST/chat/RestfulChatRoomService";
import * as dotenv from 'dotenv';
import {Kind, SportsTalkConfig} from "../../../src/models/CommonModels";
import {API_SUCCESS_MESSAGE} from "../../../src/impl/constants/api";
import {EventResult, Event} from "../../../src/models/ChatModels";
dotenv.config();

const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {
    apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID || "",
    endpoint: process.env.TEST_ENDPOINT
};

describe('BASIC Chat Sequence', function() {
    const user1config: SportsTalkConfig = {...config, user: {
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

    const client:ChatClient = ChatClient.init(user1config);
    const client2:ChatClient = ChatClient.init(user2config);
    const rm = new RestfulChatRoomService({
       ...config
    });
    const em1 = client.getEventService();
    const em2 = client2.getEventService();

    let theRoom;
    describe('User 1', function () {
        it('Joins room', function (done) {
            rm.createRoom({
                name: "Test room",
                customid: "chat-test-room"+new Date().getTime(),
            }).then(room => {
                theRoom = room;
                return client.joinRoom(room)
            }).then(async (resp) => {
                expect(resp.room.id).to.be.not.null;
                await client.executeChatCommand("Sending a message");
                done()
            }).catch(e=>{
                done(e);
            })
        })
    });
    describe('User 2', function () {
        it('Joins room', function (done) {
            client2.joinRoom(theRoom, true)
                .then((resp) => {
                    expect(resp.room.id).to.be.not.null;
                    done()
                }).catch(e=>{
                    done(e);
                })
        })
    })
    describe('Users chat', function () {
        it('Lets users speak', function (done) {
            Promise.all([
                client.executeChatCommand("Hello!"),
                client2.executeChatCommand("This is me!")
            ]).then(results => {
                done();
            }).catch(done);
        })
    })
    describe('GetUpdates fires', function () {
        it('Shows the same to users', function (done) {
            let someEvent;
            Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(chatHistories => {
                    expect(chatHistories[0].events).to.have.lengthOf(3);
                    expect(chatHistories[1].events).to.have.lengthOf(3);
                    someEvent = chatHistories[0].events[0];
                }).then(()=>{
                    return client.updateChatEvent(someEvent, "Updated");
                }).then(async (event)=>{
                    // @ts-ignore
                    const newEvent: EventResult = await client.getEventById(event.id);
                    expect(newEvent.id).to.be.equal(someEvent.id);
                    expect(newEvent.body).to.be.equal("Updated");
                    done();
            }).catch((e)=>{
                done(e);
            })
        })
    });
    describe('Notificaitons', function() {
        it('Lists notifications', async ()=> {
            const notifications = await client.listUserNotifications();
            expect(notifications);
        });
    })
    // describe("Get help", function(){
    //     it("Lets user ask for help", async()=>{
    //         let helpcalled = false;
    //         let admincalled = false
    //         client.setEventHandlers({
    //             onHelp:function() {
    //                 helpcalled = true;
    //             }
    //         })
    //         const resp = await client.executeChatCommand("*help");
    //         expect(helpcalled).to.be.true;
    //     })
    //     it("Lets user issue admin command", async()=>{
    //
    //         let admincalled = false
    //         client.setEventHandlers({
    //             onAdminCommand: function() {
    //                 admincalled=true;
    //             }
    //         })
    //         const resp = await client.executeChatCommand("*ban");
    //         expect(admincalled).to.be.true;
    //     })
    // })
    describe("leave room", function(){
        it("Leaves the room", async function() {
            const exit = await client.exitRoom();
            const exit2 = await client2.exitRoom();
            expect(exit).to.equal(API_SUCCESS_MESSAGE);
        })
    })
    describe('Kill test room', function () {
        it('Test room can be deleted', function (done) {
            rm.deleteRoom(theRoom)
                .then(success => {
                    expect(success.kind).to.be.equal(Kind.deletedroom);
                    done()
                }).catch(done);
        })
    })
});
