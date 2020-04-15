import {RestfulRoomService} from "../../../../src/impl/chat/REST/RestfulRoomService";
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {ModerationType, SportsTalkConfig} from "../../../../src/models/CommonModels";
dotenv.config();

const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};
let roomlist;
describe("RoomManager", function(){
    const RM = new RestfulRoomService(  config);
    it("Can create a room without moderation", done=>{
        const name = "ROOMMANAGER Test Room"
        const slug = "RM-test-room"
        let newRoom;
        RM.createRoom({
            name,
            slug
        }).then(room=>{
            newRoom = room;
            expect(room.name).to.be.equal(name);
            expect(room.slug).to.be.equal(slug);
        }).then(()=>{
            return RM.deleteRoom(newRoom);
        }).then(()=>{
            done();
        }).catch(done);
    })
    it("Can create a room with PRE moderation", done=>{
        const name = "ROOMMANAGER Test Room PRE"
        const slug = "RM-test-room-pre"
        let newRoom;
        RM.createRoom({
            name,
            slug,
            moderation: ModerationType.pre
        }).then(room=>{
            newRoom = room;
            expect(room.name).to.be.equal(name);
            expect(room.slug).to.be.equal(slug);
            expect(room.moderation).to.be.equal(ModerationType.pre);
        }).then(()=>{
            return RM.deleteRoom(newRoom);
        }).then(()=>{
            done();
        }).catch(done);
    })
    it("Can create a room with POST moderation", done=>{
        const name = "ROOMMANAGER Test Room POST"
        const slug = "RM-test-room-POST"
        let newRoom;
        RM.createRoom({
            name,
            slug,
            moderation: ModerationType.post
        }).then(room=>{
            newRoom = room;
            expect(room.name).to.be.equal(name);
            expect(room.slug).to.be.equal(slug);
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
                slug: "Room1-slug-list1234"
            }),
            RM.createRoom({
                name: "Room2-list",
                slug: "Room2-slug-list1234"
            }),
            RM.createRoom({
                name: "Room3-list",
                slug: "Room3-slug-list1234"
            }),
        ]).then(rooms=>{
            roomlist = rooms;
            expect(rooms).to.have.lengthOf(3);
            return RM.listRooms();
        }).then(rooms=>{
            // Other rooms might hang around because of other tests. But we should for sure have at least 3 now.
            expect(rooms.length).to.be.greaterThan(2);
            return Promise.all(roomlist.map(room => {
                return RM.deleteRoom(room);
            }))
        }).then(results=>{
            done();
        }).catch(e=>{
            RM.listRooms().then(roomlist=>{
                return Promise.all(roomlist.map(room => {
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
                    name: "ROOMMANAGER Test Room",
                    slug: "RM-test-room"
                });
                const userlist = await RM.listUserMessages({userid:'fake-user', handle:'fake-user'}, room).then(messages => {
                    expect(messages.length).to.be.equal(0);
                });
                const deleted = await RM.deleteRoom(room);
                return deleted;
            }catch(e) {
                console.log(e);
                throw e;
            }
        })
    })
})
