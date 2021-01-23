
import * as dotenv from 'dotenv';
import {ChatClient} from "../../src";
import {User} from "../../src/models/CommonModels";
import {RestfulChatRoomService} from "../../dist/impl/REST/chat/RestfulChatRoomService";
import {ChatRoomResult} from "../../dist/models/ChatModels";

dotenv.config();

const config = {
    apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID,
    endpoint: process.env.TEST_ENDPOINT,
};



console.log(config);

const RM = new RestfulChatRoomService(config);

const userCreationLimit:number = parseInt(process.env.USER_CREATION_LIMIT || '1000');
let counter = 0;

async function loadTest(room:ChatRoomResult) {
    const users: User[] = [];
    const userCreationPromises:Promise<User | void>[] = [];
    for(var i=0; i < userCreationLimit; i++) {
        const userid = Math.random().toString().substr(2, 12);
        const User = {
            userid,
            handle: userid,
            displayname: userid
        }
        users.push(User);
    }
    for(var j=0; j<userCreationLimit; j++) {
        const rm = new RestfulChatRoomService(config);
        const user = users[j];
        userCreationPromises.push(rm.joinRoomByCustomId(room, user).then(u=>{
            console.log(user);
        }).catch(e=>{
            console.log(e);
        }));
    }
    return Promise.all(userCreationPromises);
}
describe('Join Room Load Test', ()=> {
    it(`Joins a new room ${userCreationLimit} times`, async ()=>{
        const room = {
            name: "Test room",
            customid: "chat-test-room" + new Date().getTime(),
        }
        const roomresult = await RM.createRoom(room);

        return loadTest(roomresult);
    })
})

