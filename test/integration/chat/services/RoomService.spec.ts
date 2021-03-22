import {RestfulChatRoomService} from "../../../../src/impl/REST/chat/RestfulChatRoomService";
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {Kind, ModerationType, SportsTalkConfig} from "../../../../src/models/CommonModels";
import {ChatRoomEntityNames} from "../../../../src/models/ChatModels";

dotenv.config();

const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};
let roomlist;
const name = "ROOMService Test Room";
const customid = "RM-test-room"
const name2 = "ROOMService Test Room PRE"
const slug2 = "RM-test-room-pre"
let newRoom;
describe("RoomService", function(){
    const RM = new RestfulChatRoomService(config);
    it("Can create a room without moderation", done=>{
        RM.createRoom({
            name,
            customid
        }).then(room=>{
            newRoom = room;
            const roomname = room.name
            expect(roomname).to.be.equal(name);
            expect(room.customid).to.be.equal(customid);
        }).then(()=>{
            return RM.deleteRoom(newRoom);
        }).then(()=>{
            done();
        }).catch(e=>{
            done(e);
        });
    })
    it("Can create a room with PRE moderation", done=>{
        let newRoom;
        RM.createRoom({
            name: name2,
            customid: slug2,
            moderation: ModerationType.pre
        }).then(room=>{
            newRoom = room;
            expect(room.name).to.be.equal(name2);
            expect(room.customid).to.be.equal(slug2);
            expect(room.moderation).to.be.equal(ModerationType.pre);
        }).then(()=>{
            return RM.deleteRoom(newRoom);
        }).then(()=>{
            done();
        }).catch(done);
    })
    it("Can create a room with POST moderation", done=>{
        const name = "ROOMService Test Room POST"
        const customid = "RM-test-room-POST"
        let newRoom;
        RM.createRoom({
            name,
            customid,
            moderation: ModerationType.post
        }).then(room=>{
            newRoom = room;
            expect(room.name).to.be.equal(name);
            expect(room.customid).to.be.equal(customid);
            expect(room.moderation).to.be.equal(ModerationType.post);
        }).then(()=>{
            return RM.deleteRoom(newRoom);
        }).then(()=>{
            done();
        }).catch(done);
    })
    it('Can list rooms', done=>{

        Promise.all([
            RM.createRoom({
                name: "Room1-list",
                customid: "Room1-slug-list1234"
            }),
            RM.createRoom({
                name: "Room2-list",
                customid: "Room2-slug-list1234"
            }),
            RM.createRoom({
                name: "Room3-list",
                customid: "Room3-slug-list1234"
            }),
        ]).then(rooms=>{
            roomlist = rooms;
            expect(rooms).to.have.lengthOf(3);
            return RM.listRooms();
        }).then(roomReply=>{
            // Other rooms might hang around because of other tests. But we should for sure have at least 3 now.
            expect(roomReply.rooms.length).to.be.greaterThan(2);
            return Promise.all(roomReply.rooms.map(room => {
                return RM.deleteRoom(room);
            }))
        }).then(results=>{
            done();
        }).catch(e=>{
            RM.listRooms().then(roomlist=>{
                return Promise.all(roomlist.rooms.map(room => {
                    return RM.deleteRoom(room);
                })).then(()=>{
                    done(e)
                })
            })
        });
    })
    describe("List", function(){
        it("Can list user messages", async ()=>{
            try {
                const room = await RM.createRoom({
                    name: "ROOMService Test Room",
                    slug: "RM-test-room"
                });
                const userlist = await RM.listUserMessages({userid:'fake-user', handle:'fake-user'}, room).then(messages => {
                    expect(messages.events.length).to.be.equal(0);
                });
                const deleted = await RM.deleteRoom(room);
                return deleted;
            }catch(e) {
                console.log(e);
                throw e;
            }
        })
    })
    describe("Bounce", function(){
        it("Can bounce a user from a room", async () => {
            try {
                const room = await RM.createRoom({
                    name: "ROOMService Test Room",
                    slug: "RM-test-room"
                });
                const user = {
                    userid: 'fakeUser',
                    handle: 'fakeUser'
                };
                const joined = await RM.joinRoom(room, user);
                const message = "custom message";
                const bounced = await RM.bounceUserFromRoom(room, user, message);
                expect(bounced.data.kind).to.be.equal(Kind.bounce);
                expect(bounced.data.event.kind).to.be.equal(Kind.chat)
                expect(bounced.data.room.kind).to.be.equal(Kind.room);
                expect(bounced.data.event.body).to.be.equal(message);
                const deleted = await RM.deleteRoom(room);
                return deleted;
            }catch(e) {
                console.log(e);
                throw e;
            }
        })
    })
    describe("DeBounce", function(){
        it("Can unbounce a user from a room", async () => {
            try {
                const room = await RM.createRoom({
                    name: "ROOMService Test Room",
                    slug: "RM-test-room"
                });
                const user = {
                    userid: 'fakeUser',
                    handle: 'fakeUser'
                };
                const joined = await RM.joinRoom(room, user);
                const bounced = await RM.bounceUserFromRoom(room, user, "custom message");
                const message = "Allowed back";
                const deBounce = await RM.unbounceUserFromRoom(room, user, message);
                expect(deBounce.data.kind).to.be.equal(Kind.bounce);
                expect(deBounce.data.event).to.be.null;
                expect(deBounce.data.room.kind).to.be.equal(Kind.room);
                const deleted = await RM.deleteRoom(room);
                return deleted;
            }catch(e) {
                console.log(e);
                throw e;
            }
        })
    })
    describe("Extended details", function() {
        it("Can get extended room details by id", async (done) =>{
            const room = await RM.createRoom({
                name: "ROOMService Test Room",
                slug: "RM-test-room"
            });
            try {
                const results = await RM.getRoomExtendedDetails({roomids:[room.id], entities:[ChatRoomEntityNames.lastmessagetime, ChatRoomEntityNames.numparticipants, ChatRoomEntityNames.room]})
                expect(results.details.length).to.be.equal(1);
                const details = results.details[0];
                expect(details.inroom).to.be.equal(0);
                expect(details.mostrecentmessagetime).to.be.null;
                expect(details.room).to.be.not.null;
                // @ts-ignore
                expect(details.room.id).to.be.equal(room.id)
                const deleted = await RM.deleteRoom(room);
                return deleted;
            }catch(e) {
                const deleted = await RM.deleteRoom(room);
                console.log(e);
                throw e;
            }
            done();
        })
    })
})
