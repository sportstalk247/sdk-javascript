import * as cluster from 'cluster';
import * as dotenv from 'dotenv';
import {RestfulChatRoomService} from '../../src/impl/REST/chat/RestfulChatRoomService'
import {ChatClient} from "../../src";
import {ChatRoomResult} from "../../dist/models/ChatModels";
import {User} from "../../src/models/CommonModels";
import {UserResult} from "../../dist/models/CommonModels";
let ClusterMessages = require('cluster-messages');
let messages = new ClusterMessages();

dotenv.config();

const config = {
    apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID,
    endpoint: process.env.TEST_ENDPOINT,
};
// numCPUs will be used to split users across different processes to do simultaneous load.
// The more cores the more accurate to multiple users.
const numCPUs = require('os').cpus().length;
// The max number of users to simulate.  Will round up to make it a multiple of the # of cores you have.
const userCreationLimit = Math.ceil((parseInt(process.env.USER_CREATION_LIMIT || '400', 10) / numCPUs));
// Percentage of users that will start sending chat commands
const speakerPercentage = parseFloat(process.env.SPEAKING_USER_LEVEL || '0.1');
// For the users that send chat commands, this is how often they will send a message.
const speakerEmitFrequency = parseInt(process.env.SPEAKING_FREQUENCY || '1000'); // in milliseconds. 1000 = one message/second
// How many messages a user will emit before quieting down
const numberMessagesToEmit = parseInt(process.env.SPEAKING_EVENTS || '100');

let counter = 0;
function sendMessages(client): Promise<void> {
    console.log(`${process.pid} is a speaker`);
    return new Promise((resolve, reject) => {
        const timeout = setInterval(function() {
            // const date = new Date().toISOString()
            client.executeChatCommand(`${client.getCurrentUser().userid} - This is a chat command ${counter}`);
            counter = counter+1;
            if(counter>numberMessagesToEmit) {
                clearInterval(timeout);
                resolve();
            }
        }, speakerEmitFrequency)
    })
}

async function spawnClient(user:User, room:ChatRoomResult) {
    const client = ChatClient.init(config)
    client.setEventHandlers({
        onChatEvent: (e)=>{console.log('Received event: "'+e.body+ '" from '+e.userid)},
        onNetworkError: (error: Error) => {
            // @ts-ignore
            console.log(`Network error on getUpdates`, error);
            return {};
        }
    })
    client.setUser(user);
    console.log(`User ${user.userid} starts trying to join the room`);
    const time = new Date();
    const joined = await client.joinRoomByCustomId(room).catch(e=>{
        console.log(`${user.userid} Could not join room`, room);
        console.log(e);
    })
    console.log(`Joined - ${user.userid}, took ${(new Date().getTime() - time.getTime())/1000} seconds`);
    client.startListeningToEventUpdates();

    if(Math.random()<=speakerPercentage) {
        console.log('Worker ' + process.pid + ' is a speaker');
        return sendMessages(client);
    }
    console.log(`${process.pid} is a listener`);
    return client;
}

export async function joinRoomAndEmitChatLoadTest(room:ChatRoomResult) {
    const users: User[] = [];
    const clients = [];
    const userPromises:Promise<ChatClient | void>[] = [];
    console.log(`Thread is creating ${userCreationLimit} users and joining the room.`)
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
    console.log(`Max threads is ${numCPUs}`);
    console.log(`Max users is ${numCPUs * userCreationLimit}`);
    console.log(`Speaking % of users is ${speakerPercentage}`);
    console.log(`Each speaking user will emit ${numberMessagesToEmit} chat commands`);
    const RM = new RestfulChatRoomService(config);
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    const room = {
        name: "Test room" + new Date().toISOString(),
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
        console.log('Worker ' + process.pid + ' received "roomcreated" event from master.');
        if (message.type === 'roomcreated' && message.roomresult) {
            const roomresult = message.roomresult
            await joinRoomAndEmitChatLoadTest(roomresult)
        }

    });

}