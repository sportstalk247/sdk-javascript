import {CommentClient} from '../../src/impl/CommentClient';
import * as dotenv from 'dotenv';
import {ModerationType} from "../../src/models/CommonModels";
import {Comment} from "../../src/models/CommentsModels";
import {Conversation} from "../../src/models/CommentsModels";

dotenv.config();


const config = {
    apiToken:process.env.TEST_KEY,
    appId: process.env.TEST_APP_ID,
    endpoint: process.env.TEST_ENDPOINT,
};

console.log(config);

const client = CommentClient.init(config);
// @ts-ignore
let conversation: Conversation;
let counter = 0;
let interval;

async function createConversation() {
   if(conversation) {
       return conversation
   } else {
       conversation = await client.ensureConversation({
           conversationid: 'load-test-conversation',
           property: 'load-test',
           moderation: ModerationType.post,
       }).catch(e=>{
           console.log(e);
           return conversation
       })
       await client.createOrUpdateUser({userid:'loadtest', handle:'loadtest'});
       console.log(conversation);
       return conversation;
   }
}

async function createComments() {
    counter = counter+1;
    const text = "comment #"+counter
    //@ts-ignore
    const resp:Comment = await client.publishComment(text).catch(e=>{
        console.log(e);
    })
    console.log(resp.body);
}

async function loadTest() {
    await createConversation().then(()=>{
        interval = setInterval(createComments, 40);
    })
}
loadTest();

