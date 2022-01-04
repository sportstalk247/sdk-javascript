import {ChatClient} from '../../../src/impl/ChatClient';
import {EventResult} from "../../../src/models/ChatModels";
import * as chai from 'chai';
import {RestfulChatModerationService} from "../../../src/impl/REST/chat/RestfulChatModerationService";
import * as dotenv from 'dotenv';
import {SportsTalkConfig} from "../../../src/models/CommonModels";
import {RestfulChatRoomService} from "../../../src/impl/REST/chat/RestfulChatRoomService";
import {ModerationType, ReportType} from "../../../src/models/Moderation";

dotenv.config();

let client;
let client2;
let client3;
let mod;
const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};
const delay = function(timer) {
    return new Promise(function(accept, reject){
        const timeout = setTimeout(accept, timer)
    })
}

let moderationService;

describe('Room shadowban', function() {
    let roomid;
    let eventlength = 1;

    client = ChatClient.init(config)
    client2 = ChatClient.init(config)
    client3 = ChatClient.init(config)
    mod = new RestfulChatModerationService(config);
    const rm = new RestfulChatRoomService(config);

    it('Can create a room, and users', (done) => {
        rm.createRoom({
            enableprofanityfilter: false,
            name: "post moderation test room",
            customid: "post-test-room" + new Date().getTime(),
            maxreports: 0,
            moderation: ModerationType.post
        }).then(room => {
            //  console.log('POST Created room');
            roomid = room.id;
            expect(room.moderation).to.be.equal(ModerationType.post)
            return room;
        }).then(async (room) => {
            const user1 = await client.createOrUpdateUser({
                userid: 'testsequence',
                handle: 'test'
            });
            await client.setUser(user1);
            const user2 = await client2.createOrUpdateUser({
                userid: "testsequence2", handle: "tester"
            });
            client2.setUser(user2);
            const user3 = await client3.createOrUpdateUser({
                userid: "testsequence3", handle: "tester3"
            });
            client3.setUser(user3);
            done();
        })
    });

    it('Lets 3 clients join same room and chat', function(done) {
       Promise.all([client.joinRoom(roomid),client2.joinRoom(roomid), client3.joinRoom(roomid)]).then((rooms)=>{
         //  console.log("JOINED room")
           return client.executeChatCommand('Test message')
       }).then((message)=>{
         //  console.log("SENT message")
           return mod.listMessagesInModerationQueue()
       }).then(resp=> {
        //   console.log("GOT Moderation queue")
           expect(resp.events.length).to.be.equal(0);
           return client.setShadowBanStatus(client3.getCurrentUser(), {roomid, shadowban: true})
       }).then((resp)=> {
           moderationService = new RestfulChatModerationService(config);
           return moderationService.listRoomEffects(resp);
       }).then((resp)=> {
           //expect(resp.effects.length).to.be.eq(1);
           return client.setShadowBanStatus(client2.getCurrentUser(), {roomid, shadowban: true, expiryseconds: 500})
       }).then((resp)=>{
           expect(resp.shadowbannedusers).to.have.lengthOf(2);
       }).then(()=>{
            rm.deleteRoom(roomid);
            done();
       }).catch(async e=>{
           try {
               await rm.deleteRoom(roomid);
           } catch(err) {
               console.log("Could not cleanly delete test room");
           }
           done(e);
       });
    })
});

