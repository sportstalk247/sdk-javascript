import * as cluster from 'cluster';
import * as dotenv from 'dotenv';
import {RestfulChatRoomService} from '../../src/impl/REST/chat/RestfulChatRoomService'
import {ChatClient} from "../../src";
import {ChatRoomResult} from "../../dist/models/ChatModels";
import {User} from "../../src/models/CommonModels";
let ClusterMessages = require('cluster-messages');
let messages = new ClusterMessages();

dotenv.config();

const config = {
    apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID,
    endpoint: process.env.TEST_ENDPOINT,
};
const numCPUs = require('os').cpus().length;
const userCreationLimit = Math.ceil((parseInt(process.env.USER_CREATION_LIMIT || '1000', 10) / numCPUs));

function sendMessages(client): Promise<void> {
    console.log(`${process.pid} is a speaker`);
    let counter = 0;
    return new Promise((resolve, reject) => {
        const timeout = setInterval(function() {
            // const date = new Date().toISOString()
            client.executeChatCommand(`${client.getCurrentUser().userid} - This is a chat command`);
            counter = counter++
            if(counter>100) {
                resolve();
                clearInterval(timeout);
            }
        }, 1000)
    })
}

async function spawnClient(user, room) {
    const client = ChatClient.init(config)
    client.setEventHandlers({
        onChatEvent: (e)=>{},
        onNetworkError: (error: Error) => {
            // @ts-ignore
            console.log(`Network error on getUpdates`, error);
            return {};
        }
    })
    client.setUser(user);
    const joined = await client.joinRoomByCustomId(room).catch(e=>{
        console.log('Could not join room', room);
        console.log(e);
    })
    console.log(`Joined - ${user.userid}`);
    client.startListeningToEventUpdates();

    if(Math.random()<0.1) {
        console.log('sending');
        return sendMessages(client);
    }
    console.log(`${process.pid} is a listener`);
    return client;
}

export async function joinRoomAndEmitChatLoadTest(room:ChatRoomResult) {
    const users: User[] = [];
    const clients = [];
    const userPromises:Promise<ChatClient | void>[] = [];
    for(var i=0; i < userCreationLimit; i++) {
        const userid = Math.random().toString().substr(2, 12);
        const User = {
            userid,
            handle: userid,
            displayname: userid
        }
        users.push(User);
    }
    console.log(`Worker ${process.pid} has created ${users.length} users.`);
    for(var j=0; j<userCreationLimit; j++) {
        const user=users[j];
        userPromises.push(spawnClient(user, room));
    }
    console.log(`Worker ${process.pid} has created ${userPromises.length} Clients.`);
    return Promise.all(userPromises);
}



async function runMasterNode() {
    console.log(`Master ${process.pid} is running`);
    const RM = new RestfulChatRoomService(config);
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    const room = {
        name: "Test room",
        customid: "chat-test-room" + new Date().getTime(),
    }

    let roomresult;
    try {
        roomresult = await RM.createRoom(room);
    }catch(e) {
        console.log("Could not create the room, canceling workers...");
        cluster.disconnect(function(){
            process.exit(1);

        })
        return;
    }
    if(roomresult) {
        console.log(roomresult);
        messages.send('roomcreated', {
            type: 'roomcreated',
            roomresult
        })
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
}

if (cluster.isMaster) {
   runMasterNode()
}
if (cluster.isWorker) {
    console.log('Worker ' + process.pid + ' has started.');
    messages.on('roomcreated', async function(message) {
        if (message.type === 'roomcreated' && message.roomresult) {
            const roomresult = message.roomresult
            await joinRoomAndEmitChatLoadTest(roomresult)
        }
        console.log('Worker ' + process.pid + ' received message from master.', message);
    });

}