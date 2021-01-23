import * as mocha from 'mocha';
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

// @ts-ignore
const userCreationLimit = process.env.USER_CREATION_LIMIT || 100;
let counter = 0;

function sendMessages(client): Promise<void> {
    let counter = 0;
    return new Promise((resolve, reject) => {
        const timeout = setInterval(function() {
            client.executeChatCommand(`${client.getCurrentUser().userid} - This is a chat command`);
            counter = counter++
            if(counter>10) {
                resolve();
                clearInterval(timeout);
            }
        }, 100)
    })
}

async function spawnClient(user, room) {
    const client = ChatClient.init(config)
    client.setEventHandlers({
        onChatEvent: (e)=>{console.log(e.body)}
    })
    client.setUser(user);
    await client.joinRoomByCustomId(room)
    console.log(`Joined - ${user.userid}`);
    client.startListeningToEventUpdates();
    if(Math.random()<0.1) {
        console.log('sending');
        return sendMessages(client);
    }
}

export async function joinRoomAndEmitChatLoadTest(room:ChatRoomResult) {
    const users: User[] = [];
    const clients = [];
    const userPromises:Promise<void>[] = [];
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
        const user=users[j];
        userPromises.push(spawnClient(user, room));
    }
    return Promise.all(userPromises);
}

describe('Join Room loadtest', ()=> {
    it(`Joins a new room ${userCreationLimit} times`, async ()=>{
        const room = {
            name: "Test room",
            customid: "chat-test-room" + new Date().getTime(),
        }
        const roomresult = await RM.createRoom(room);
        console.log(roomresult);
        try {
            await joinRoomAndEmitChatLoadTest(roomresult)
        }catch(e) {
            RM.deleteRoom(roomresult);
        }

    })
})

