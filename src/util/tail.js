#!/usr/bin/env node
const sdk = require('../index');

// Read command line parameters
const args = require('yargs')
    .usage('Usage: $0 --appid=<YOUR-APPID> --token=<YOUR-TOKEN> --roomcustomid=<ROOM-CUSTOMID>')
    .describe('appid', 'APPID from dasboard')
    .describe('token', 'APP TOKEN from dashboard')
    .describe('roomcustomid', 'CUSTOMID of room to tail')
    .describe('userid', 'userid of user to enter room with')
    .demandOption(['appid','token','roomcustomid','userid'])
    .default('userid', 'tailbot').argv;

const gl_token = args.token;
const gl_appid = args.appid;
const gl_roomcustomid = args.roomcustomid;
const gl_stendpoint = args.endpoint;

let handle = args.handle || 'tailbot' ;
let userid = args.userid || 'tailbot';
let displayname = args.displayname || 'chattailbot';

// Our event handler
var onHandleEvent = async function(ev) {
    switch (ev.eventtype) {
        case "speech":
        case "quote":
        case "reply":
            console.log(`(${ev.eventtype}) ${ev.user.handle}: ${ev.body}`);
            break;
        case "action":
            console.log(`(${ev.eventtype}) ${ev.user.handle} ${ev.body}`);
            break;
        case "replace":
            console.log(`(${ev.eventtype}) [id=${ev.id} parentid=${ev.parentid}]:`);
            console.log(ev);
            break;
        default: {
            console.log(`(${ev.eventtype}) [id=${ev.id} parentid=${ev.parentid}]`);
        }
    }
}

// When we join a room we get the recent event history for the room
var catchupOnJoin = async function(events) {
    for(let loop = 0; loop < events.length; loop++) {
        // Process event
        onHandleEvent(events[loop]);
    }
}

var go = async function() {
    // Initialize SportsTalk247 Chat Client
    const config = { appId : gl_appid, apiToken: gl_token }
    if(gl_stendpoint) {
        config.endpoint=gl_stendpoint
    }
    const chatClient = sdk.ChatClient.init(config);

    // Register event handlers
    chatClient.setEventHandlers({
        onChatEvent: function(event){
            // handle the events here
            onHandleEvent(event);
        }
    })

    // Define the user we want to use
    chatClient.setUser({ userid: userid, handle: handle, displayname: displayname });

    // Join the room
    chatClient.joinRoomByCustomId(gl_roomcustomid).then(function(roomDetailsAndUpdates){
        // The response will include room details and also a list of recent chat events.
        // Non-displayable event types will not be in the list (purge,remove,replace,react) for example
        // JOIN will automatically call your events handler for each of the events in the above list
        // JOIN will set the cursor for listening to future events in the stream, starting when you start listening.
        console.log(`Joined room ${roomDetailsAndUpdates.room.name} as @${handle}`);

        // Start listening for updates
        chatClient.startListeningToEventUpdates();
    }).catch(function(result) {
        if(result.response && result.response.data) {
            console.error(`${result.response.data.code} | ${result.response.data.message}`);
        }else  {
            console.error(result);
        }

    });

}

go();