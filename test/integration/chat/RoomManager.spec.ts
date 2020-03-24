import {RestfulRoomManager} from "../../../src/impl/chat/REST/RestfulRoomManager";
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {ModerationType} from "../../../src/models/CommonModels";
dotenv.config();

const { expect } = chai;

describe("RoomManager", function(){
    const RM = new RestfulRoomManager(  {
        apiKey:process.env.TEST_KEY,
        endpoint: process.env.TEST_ENDPOINT,
    })
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
        let roomlist;
        Promise.all([
            RM.createRoom({
                name: "Room1-list",
                slug: "Room1-slug-list"
            }),
            RM.createRoom({
                name: "Room2-list",
                slug: "Room2-slug-list"
            }),
            RM.createRoom({
                name: "Room3-list",
                slug: "Room3-slug-list"
            }),
        ]).then(rooms=>{
            roomlist = rooms;
            expect(rooms).to.have.lengthOf(3);
            return RM.listRooms();
        }).then(rooms=>{
            // Other rooms might hang around because of other tests. But we should for sure have at least 3 now.
            expect(rooms.length).to.be.greaterThan(2);
            return Promise.all(roomlist.map(room=>{
                return RM.deleteRoom(room);
            }))
        }).then(results=>{
            done();
        }).catch(done);
    })
})
