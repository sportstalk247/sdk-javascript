import * as cluster from 'cluster';
import * as dotenv from 'dotenv';
import {RestfulChatRoomService} from '../../src/impl/REST/chat/RestfulChatRoomService'
import {ChatClient} from "../../src";
import {ChatRoomResult} from "../../src/models/ChatModels";
import {User} from "../../src/models/CommonModels";
import {UserResult} from "../../src/models/CommonModels";
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
const userCreationLimit = Math.ceil((parseInt(process.env.USER_CREATION_LIMIT || '2000', 10) / numCPUs));
// Percentage of users that will start sending chat commands
const speakerPercentage = parseFloat(process.env.SPEAKING_USER_LEVEL || '0.05');
// For the users that send chat commands, this is how often they will send a message.
const speakerEmitFrequency = parseInt(process.env.SPEAKING_FREQUENCY || '4000'); // in milliseconds. 1000 = one message/second
// How many messages a user will emit before quieting down
const numberMessagesToEmit = parseInt(process.env.SPEAKING_EVENTS || '500');

// JOIN Timeframe - Over what amount of time should users join.  User joins will be evenly distributed over this timeframe.
const joinTimeframe = parseInt(process.env.JOIN_TIMEFRAME || '240000');
const launchTime = new Date();

function printConfig() {
    console.log(config);
    console.log(`Master ${process.pid} is running`);
    console.log(`Max threads is ${numCPUs}`);
    console.log(`Max users is ${numCPUs * userCreationLimit}`);
    console.log(`Speaking users is ${speakerPercentage * 100}%`);
    console.log(`Each speaking user will emit ${numberMessagesToEmit} chat commands, at a frequency of one per ${speakerEmitFrequency} ms`);
    console.log(`Users will join the room over ${joinTimeframe} ms`);
}

let counter = 0;
function sendMessages(client): Promise<void> {
    // console.log(`${process.pid} is a speaker`);
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
        onChatEvent: (e)=>{
           // console.log('User (' + user.userid + ') received event: "'+e.body+ '" from '+e.userid)
        },
        onNetworkError: (error: Error) => {
            // @ts-ignore
            console.log(`Network error on getUpdates`, error);
            return {};
        }
    })
    client.setUser(user);
    // console.log(`User ${user.userid} starts trying to join the room`);
    const time = new Date();
    const joined = await client.joinRoomByCustomId(room).catch(e=>{
        console.log(`${user.userid} Could not join room`, room);
        console.log(e);
    })
    const timeTaken = (new Date().getTime() - time.getTime())/1000;
    messages.send('joined', {
        timeTaken
    })
    //console.log(`Joined - ${user.userid}, took ${(new Date().getTime() - time.getTime())/1000} seconds. Time elapsed is ${(new Date().getTime() - launchTime.getTime())/1000}s`);
    client.startListeningToEventUpdates();
    if(Math.random()<=speakerPercentage) {
        // console.log('Worker ' + process.pid + ' is a speaker');
        return sendMessages(client);
    }
    // console.log(`${process.pid} is a listener`);
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
    // console.log(`Worker ${process.pid} has created ${users.length} users.`);
    for(var j=0; j<userCreationLimit; j++) {
        const user=users[j];
        userPromises.push(new Promise((resolve) => {
            const timeout = Math.ceil(Math.random() * joinTimeframe);
            // console.log(`Timeout: ${timeout}`);
            // console.log(`Join timeout: ${timeout}`);
            setTimeout(function () {
                //console.log(`Spawning client`);
                resolve(spawnClient(user, room));
            }, timeout)
        }));
    }
    return Promise.all(userPromises);
}



async function runMasterNode() {
    printConfig();
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
    // let roomresult: any | ChatRoomResult = {
    //     kind: 'chat.room',
    //     id: '60124c429638270ef86e0a25',
    //     appid: '600d35f1a0ba130bf4733b93',
    //     ownerid: null,
    //     name: 'Test room2021-01-28T05:30:53.828Z',
    //     description: null,
    //     pictureurl: '',
    //     customtype: '',
    //     customid: 'chat-test-room1611811853828',
    //     custompayload: '',
    //     customtags: [],
    //     customfield1: '',
    //     customfield2: '',
    //     enableactions: false,
    //     enableenterandexit: false,
    //     open: true,
    //     inroom: 0}
    try {
        if(!roomresult) {
            roomresult = await RM.createRoom(room);
        }
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
    let joined = 0;
    const times = []
    let maxJoinTime = 0;
    messages.on('joined', function(msg) {
        joined = joined+1;
        if(msg.timeTaken > maxJoinTime) {
            maxJoinTime = msg.timeTaken;
        }
        // @ts-ignore
        times.push(msg.timeTaken)
        const totalTime = times.reduce((previous, value) => {
           return previous+value;
        }, 0);
        console.log(`Max join time: ${maxJoinTime}s, Total Joined: ${times.length}, Average join time: ${Math.ceil((totalTime/times.length)*100)/100}s. Last: ${msg.timeTaken}s`);
    })
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