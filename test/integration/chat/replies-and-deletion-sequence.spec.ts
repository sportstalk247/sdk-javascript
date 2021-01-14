import { ChatClient } from '../../../src/impl/ChatClient';
import * as chai from 'chai';
import {RestfulChatRoomService} from "../../../src/impl/REST/chat/RestfulChatRoomService";
import * as dotenv from 'dotenv';
import {Kind, SportsTalkConfig} from "../../../src/models/CommonModels";
import {EventResult} from "../../../src/models/ChatModels";
dotenv.config();

let client;
let mod;
const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};
const delay = function(timer) {
    return new Promise(function(accept, reject){
        const timeout = setTimeout(accept, timer)
    })
}
describe('REPLY & DELETE Chat Sequence', function() {
    const client = <ChatClient> ChatClient.init({
        ...config,
        user: {
            userid: 'testuser1',
            handle: 'handle1'
        }
    });
    const client2 = <ChatClient> ChatClient.init({
        ...config,
        user: {
            userid: 'testuser2',
            handle: 'handle2'
        }
    });
    const rm = new RestfulChatRoomService(config);
    const em1 = client.getEventService();
    const em2 = client2.getEventService();

    let theRoom;
    describe('User 1', function () {
        it('Joins room', function (done) {
            const custom = "chat-test-room-replies";
            rm.createRoom({
                name: "Test room",
                customid: custom
            }).then(room => {
                theRoom = room;
                return client.joinRoomByCustomId(custom)
            }).then((resp) => {
                expect(resp.room.customid).to.be.equal(custom);
                done()
            }).catch(done)
        })
    });
    describe('User 2', function () {
        it('Joins room', function (done) {
            client2.joinRoom(theRoom).then(() => {
                done()
            }).catch(done)
        })
    })
    describe('Users chat', function () {
        it('Lets users speak', function (done) {
            Promise.all([
                client.executeChatCommand("Hello!"),
                client2.executeChatCommand("This is me!")
            ]).then(results => {
                expect(results).to.have.lengthOf(2);
                done()
            }).catch(done);
        })
    })
    describe('GetUpdates with messages', function () {
        it('Shows the same to users, sends reply', function () {
            this.timeout(5000);
            return Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(async chatHistories => {
                    const replyText = "This is my reply"
                    expect(chatHistories[0].events).to.have.lengthOf(2);
                    expect(chatHistories[1].events).to.have.lengthOf(2);
                    const reply = await client.sendQuotedReply(replyText, chatHistories[0].events[0].id);

                    // @ts-ignore
                    expect(reply.data.body).to.be.equal(replyText);
                    // @ts-ignore
                    expect(reply.data.eventtype).to.be.equal("quote")
                    const otherreply = await client.sendThreadedReply(replyText, chatHistories[0].events[0])
                    // @ts-ignore
                    expect(otherreply.data.body).to.be.equal(replyText);
                    const event = await client.getEventById(chatHistories[0].events[0].id);
                    expect(event.id).to.be.equal(chatHistories[0].events[0].id);
                    await delay(1000); // clear internal updates cache.
                    const updates = await em1.getUpdates();
                    expect(updates.events.length).to.be.equal(3);
                });
        })
    });
    describe('GetUpdates QuotedReply, Threaded Reply sequence', function () {
        let toDelete:EventResult;
        let toFlag: EventResult;
        let threadedReplyTargetId: string;
        it('Shows Quoted reply', function (done) {

            Promise.all([em1.getUpdates(), em2.getUpdates()])
                .then(async (chatHistories) => {

                    expect(chatHistories[0].events).to.have.lengthOf(chatHistories[0].itemcount);
                    expect(chatHistories[1].events).to.have.lengthOf(chatHistories[1].itemcount);
                    const quote = chatHistories[0].events.find(event=>event.eventtype==='quote');
                    try {
                        expect(quote).to.be.not.null;
                        expect(quote).to.be.not.undefined;
                    }catch(e) {
                        console.log(chatHistories);
                        throw e;
                    }
                    // @ts-ignore
                    expect(quote.eventtype).to.be.equal('quote');
                    done();
                })
                .catch(done)
        })
        it('Threads a reply', async ()=>{
            const updates = await em1.getUpdates();
            if(updates.events.length) {
                const reply = await client.sendThreadedReply("Threaded reply", updates.events[updates.events.length - 1].id)
                // expect(reply.data.kind).to.be.equal(Kind)
            } else {
                throw new Error("No updates");
            }
        });
        it("deletes first event", async ()=>{
            const updates = await em1.getUpdates();
            const deletion = await client.deleteEvent(updates.events[0]);
            await delay(1000);
            // expect(deletion.data.kind).to.be.equal(Kind.deletedcomment);
        });
        it("Flags an event for deletion", async()=>{
            try {
                const updates = await em1.getUpdates();
                const flagged = await client.flagEventLogicallyDeleted(updates.events[0]);
            }catch(e){
                console.log(e);
            }
            // expect(flagged.data.kind).to.be.equal(Kind.deletedcomment);
        })
    });

    describe('Kill test room', function () {
        it('can be deleted', function (done) {
            rm.deleteRoom(theRoom)
                .then(success => {
                    expect(success.kind).to.be.equal(Kind.deletedroom)
                    done()
                }).catch(done);
        })
    })
});
