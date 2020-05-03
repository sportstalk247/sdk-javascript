import {ChatClient} from '../../../src/impl/ChatClient';
import {EventResult} from "../../../src/models/ChatModels";
import * as chai from 'chai';
import {RestfulChatModerationService} from "../../../src/impl/chat/REST/RestfulChatModerationService";
import * as dotenv from 'dotenv';
import {ModerationType, ReportType, SportsTalkConfig} from "../../../src/models/CommonModels";
import {RestfulChatRoomService} from "../../../src/impl/chat/REST/RestfulChatRoomService";

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

describe('Post moderation Sequence', function() {
    let roomid;
    let eventlength = 1;

    client = ChatClient.create(config)
    client2 = ChatClient.create(config)
    client3 = ChatClient.create(config)
    mod = new RestfulChatModerationService(config);
    const rm = new RestfulChatRoomService(config);

    it('Can create a room, and users', (done) => {
        rm.createRoom({
            enableprofanityfilter: false,
            name: "post moderation test room",
            slug: "post-test-room" + new Date().getTime(),
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
           return client.sendCommand('Test message')
       }).then((message)=>{
         //  console.log("SENT message")
           return mod.getModerationQueue();
       }).then(resp=> {
        //   console.log("GOT Moderation queue")
           expect(resp.events.length).to.be.equal(0);
       }).then(()=>{
           return client.getEventService().getUpdates()
       }).then((result)=>{
        //   console.log("GOT EVENTS");
           const list: Array<EventResult> =  result.events || [];
           eventlength = list.length;
           return Promise.all(list.map(async function(event) {
               await client.report(event, ReportType.abuse);
               await client2.report(event, ReportType.abuse);
               await client3.report(event, ReportType.abuse);
           }))
       }).then(events=> {
           return delay(1000);
       }).then(()=>{
          // console.log("REPORTED all events");
           return mod.getModerationQueue()
       }).then(resp=> {
           expect(resp.events.length).to.be.greaterThan(0);
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

