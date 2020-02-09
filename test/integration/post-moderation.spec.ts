import { SportsTalkClient } from '../../src/SportsTalkClient';
import {EventResult, ModerationType} from "../../src/DataModels";
import * as chai from 'chai';
import {RestfulModerationManager} from "../../src/impl/REST/RestfulModerationManager";

let client;
let mod;
const { expect } = chai;
const config = {
    apiKey:process.env.TEST_KEY,
    endpoint: process.env.TEST_ENDPOINT,
}

describe('Post moderation Sequence', function() {
    let roomid;
    let eventlength = 1;

    client = SportsTalkClient.create(config)
    mod = new RestfulModerationManager(config);

    it('Can create a room, join the room, moderate messages, kill room', (done) => {
       client.createRoom({
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
         //  console.log("POST created user")
           return client.joinRoom(roomid)
       }).then((room)=>{
         //  console.log("JOINED room")
           return client.sendCommand('Test message')
       }).then((message)=>{
         //  console.log("SENT message")
           return mod.getModerationQueueEvents()
       }).then(events=> {
        //   console.log("GOT Moderation queue")
           expect(events.length).to.be.equal(0);
       }).then(()=>{
           return client.getEventManager().getUpdates()
       }).then((events)=>{
        //   console.log("GOT EVENTS");
           const list: Array<EventResult> =  events || [];
           eventlength = list.length;
          // console.log(`Reporting ${eventlength} events`);
           return Promise.all(list.map(function(event) {
               return mod.reportEvent(event)
           }))
       }).then(events=>{
          // console.log("REPORTED all events");
           return mod.getModerationQueueEvents()
       }).then(events=> {
           expect(events.length).to.be.equal(eventlength)
       }).then(()=>{
            client.deleteRoom(roomid);
            done();
       }).catch(async e=>{
           try {
               await client.deleteRoom(roomid);
           } catch(err) {
               console.log("Could not cleanly delete test room");
           }
           console.log(e);
           done(e);
       });
    })
});

