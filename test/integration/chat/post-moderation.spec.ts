import { ChatClient } from '../../../src/impl/ChatClient';
import {EventResult} from "../../../src/models/ChatModels";
import * as chai from 'chai';
import {RestfulChatModerationManager} from "../../../src/impl/chat/REST/RestfulChatModerationManager";
import * as dotenv from 'dotenv';
import {ModerationType, SportsTalkConfig} from "../../../src/models/CommonModels";
import {RestfulRoomManager} from "../../../src/impl/chat/REST/RestfulRoomManager";
dotenv.config();

let client;
let mod;
const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiKey:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};
const delay = function(timer) {
    return new Promise(function(accept, reject){
        const timeout = setTimeout(accept, timer)
    })
}

describe('Post moderation Sequence', function() {
    let roomid;
    let eventlength = 1;

    client = ChatClient.create(config)
    mod = new RestfulChatModerationManager(config);
    const rm = new RestfulRoomManager(config);

    it('Can create a room, join the room, moderate messages, kill room', (done) => {
       rm.createRoom({
           name: "post moderation test room",
           slug: "post-test-room",
           moderation: ModerationType.post,
       }).then(room=>{
        //  console.log('POST Created room');
           roomid = room.id;
           expect(room.moderation).to.be.equal(ModerationType.post)
           return room;
       }).then(room=> {
           return client.createOrUpdateUser({
               userid: 'testsequence',
               handle: 'test'
           });
       }).then((resp)=>{
           client.setUser(resp);
         //  console.log("POST created user")
           return client.joinRoom(roomid)
       }).then((room)=>{
         //  console.log("JOINED room")
           return client.sendCommand('Test message')
       }).then((message)=>{
         //  console.log("SENT message")
           return mod.getModerationQueue();
       }).then(events=> {
        //   console.log("GOT Moderation queue")
           expect(events.length).to.be.equal(0);
       }).then(()=>{
           return client.getEventManager().getUpdates()
       }).then((events)=>{
        //   console.log("GOT EVENTS");
           const list: Array<EventResult> =  events || [];
           eventlength = list.length;
           return Promise.all(list.map(function(event) {
               return client.report(event, 'abuse').then()
           }))
       }).then(events=> {
           return delay(1000);
       }).then(()=>{
          // console.log("REPORTED all events");
           return mod.getModerationQueue()
       }).then(events=> {
           expect(events.length).to.be.equal(eventlength)
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

