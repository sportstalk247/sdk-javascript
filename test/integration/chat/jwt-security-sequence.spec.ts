import { ChatClient } from '../../../src/impl/ChatClient';
import * as chai from 'chai';
import {RestfulChatRoomService} from "../../../src/impl/REST/chat/RestfulChatRoomService";
import * as dotenv from 'dotenv';
import {Kind, SportsTalkConfig} from "../../../src/models/CommonModels";
import {API_SUCCESS_MESSAGE} from "../../../src/impl/constants/api";
import {EventResult, Event} from "../../../src/models/ChatModels";
import {createUserToken} from '../../util'

dotenv.config();

/**
 * To setup these tests, create a secured organization and secure an app. Then inject the appropriate keys using .env file
 */

const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {
    apiToken:process.env.SECURE_KEY || process.env.TEST_KEY,
    appId: process.env.SECURE_APP_ID || "",
    endpoint: process.env.SECURE_ENDPOINT || 'https://api.sportstalk247.com/api/v3'
};

// @ts-ignore
const userToken = createUserToken({  userid: 'testuser1'}, process.env.APP_SECRET || '1234567', {audience: config.appId});


//
// describe('Security Tests', function() {
//     const user1config: SportsTalkConfig = {...config,
//         userToken,
//         user: {
//             userid: 'testuser1',
//             handle: 'handle1'
//         }};
//
//     const user2config: SportsTalkConfig = {
//         ...config,
//         user: {
//             userid: 'testuser2',
//             handle: 'handle2'
//         }
//     }
//
//     const client:ChatClient = ChatClient.init(user1config);
//     const client2:ChatClient = ChatClient.init(user2config);
//
//     let theRoom;
//     describe('Signed User', function () {
//         it('Joins room', function (done) {
//             client.createRoom({
//                 name: "Test room",
//                 customid: "chat-test-room"+new Date().getTime(),
//             }).then(room => {
//                 theRoom = room;
//                 return client.joinRoom(room)
//             }).then(async (resp) => {
//                 expect(resp.room.id).to.be.not.null;
//                 await client.executeChatCommand("Sending a message");
//                 done()
//             }).catch(e=>{
//                 done(e);
//             })
//         })
//     });
//     describe('Unsigned user', function(){
//         it("Fails to join room", function(done){
//             client2.joinRoom(theRoom).then(res=>{
//                     done(new Error("Should not be able to access room"))
//                 }
//             ).catch(e=>{
//                 expect(e.message.contains("401"));
//                 done()
//             })
//         })
//     })
//
//     describe('User chats', function () {
//         it('Lets users speak', function (done) {
//             Promise.all([
//                 client.executeChatCommand("Hello!"),
//             ]).then(results => {
//                 done();
//             }).catch(done);
//         })
//     })
//
//     describe('Notificaitons', function() {
//         it('Lists notifications', async ()=> {
//             const notifications = await client.listUserNotifications();
//             expect(notifications);
//         });
//     })
//
//     describe("leave room", function(){
//         it("Leaves the room", async function() {
//             const exit = await client.exitRoom();
//             expect(exit).to.equal(API_SUCCESS_MESSAGE);
//         })
//     })
//
//     describe('Kill test room', function () {
//         it('Test room can be deleted', function (done) {
//             client.deleteRoom(theRoom)
//                 .then(success => {
//                     expect(success.kind).to.be.equal(Kind.deletedroom);
//                     done()
//                 }).catch(done);
//         })
//     })
// });
