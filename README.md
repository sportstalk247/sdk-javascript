# Sportstalk 247 Javascript SDK

## STATUS: BETA
This SDK is under active development and improvement. We are also very open to feedback if you experience pain points while using the SDK.
## GETTING STARTED: Setting up the SDK
#### Install via NPM
```
npm install sportstalk-sdk --save
```

### App Id and api Tokens
Clients and services require a SportsTalkConfig object, which looks like so: 
```javascript
{
    appId: 'yourappID-from-the-dashboard',
    apiToken: 'yourApiToken-from-the-dashboard', // NOTE: you should use a proxy to hide your token and restrict behavior to specific domains on the web.
    endpoint: 'custom-endpoint' // OPTIONAL Use this to set a proxy on the web, or if you have an on-prem install of sportstalk at a custom location.
}
```

If you are using a proxy, the only mandatory data for a SportstalkConfig object is the `appId` and `endpoint`. Otherwise you will need to provide the `appId` and `apiToken`

### Creating Client Objects
#### Using Typescript (recommended)
If you are using typescript, we provide typescript definitions for all objects.  It's as simple as:
##### Commenting Client
 ```
 import { CommentClient } from 'sportstalk-sdk'
 const commentClient = CommentClient.init({appId: ... , apiToken: ....}); 
```
##### Chat Client
 ```
import { ChatClient } from 'sportstalk-sdk'
const chatClient = ChatClient.init({appId: ... , apiToken: ....}); 
 ```
 
 
#### Using require
You can use require as well.

```
const sdk = require('sportstalk-sdk');
const commentClient = sdk.CommentClient.init({appId..., apiToken...});
const chatClient = sdk.ChatClient.init(({appId..., apiToken...});
```

You will need to register with SportsTalk and get an API Key in order to use sportstalk functions.


## Using the SDK on the Web
To use directly, we host the web SDK on our website.

* Latest version: https://www.sportstalk247.com/dist/sdk/latest/web-sdk.js
* Latest minified version: https://www.sportstalk247.com/dist/sdk/latest/web-sdk.min.js
 
You can also look inside the Sportstalk package at `/dist/web-sdk.js` or use the minified version at `/dist/web-sdk.min.js`


## A Note on Promises
Almost all SDK functions require communication with a server.  Therefore, most methods will return a Promise.  Promises are very common but you need to be familiar with them to use the SportStalk SDK.

Here are some ways that you can use promises.

```javascript
commentsClient.listConversations()
    .then(function(response) {
      const conversations = response.conversations;
      // handle UI functions here.
    }).catch(function(e){
      // catch an error and handle it here.
    })
```

You can also use comments in async/await blocks (preferred).  

```javascript
async function yourFunction() {
    const response = await commentsClient.listConversations();
    const conversations = response.conversations;
    // handle ui using conversations here.
}
```

For more reading, please see this article: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

## A note on Typescript
The SDK is written in Typescript which provides type checking and the ability to declare and describe objects similar to typed languages such as Java.
This is very helpful when describing parameters or models because you can reference all the possible members of an object ahead of time.

You **do not** need to write your project in typescript to use this SDK.  This SDK provides full JS compatibility and most examples are shown in standard JS (Node).
However, understanding basic typescript notation is still helpful for understanding the data models returned by the API.

There is a 5 min primer on typescript and you can get started with typescript here: https://www.typescriptlang.org/docs/home.html

# Key Chat Operations
All examples are shown with promises to be used in-browser.  You can also use async/await if using node.js or react.

*Before executing any of these operations, create the client like so:*

Javascript:
```javascript
const sdk = require('sportstalk-sdk');
const chatClient = sdk.ChatClient.init({appId:'yourAppId', apiToken:'yourApiToken'});
```

Typescript:
 ```typescript
import { ChatClient } from 'sportstalk-sdk'
const chatClient = ChatClient.init({appId:'yourAppId', apiToken:'yourApiToken'}); 
 ```

## Create or Update Room
```javascript
chatClient.createRoom({ 
    name: "Your room name",
    customid: "your-custom-id",
    moderation: "post"                     
}).then(function(room){
    // your room is ready.
    const roomid = room.id
})
```

To update a room, just call `updateRoom()` with the ID already set:

```javascript
chatClient.updateRoom({ 
    id: 'generated-id-value',
    name: "Your NEW room name", // updated
    customid: "your-custom-id",
    moderation: "post"                     
}).then(function(room){
    // your room is ready.
})
```
## Get room details

### By Room ID
To get the details about a room, use `getRoomDetails()`

```javascript 1.8
chatClient.getRoomDetails('your-room-id').then(function(room){  
    // your room is ready.
 })
```

### By Room Custom ID
To get the details about a room, use `getRoomDetailsByCustomId()`

```javascript
chatClient.getRoomDetailsByCustomId ('your-custom-room-id').then(function(room){  
    // your room is ready.
 })
```

## Join a room
### Anonymous
You can join a room anonymously

```javascript
chatClient.joinRoom('a-room-id').then(function(roomDetailsAndUpdates){
    // the response will include room details and also the latest chat events.
})
```

### Authenticated
To join a room as an authenticated user, set the current user for the client.  This user will be used by default for all updates and chat events.
```javascript
chatClient.setUser({userid: 'a-user-id', handle:'user-handle'});
chatClient.joinRoom('a-room-id').then(function(roomDetailsAndUpdates){
    // the response will include room details and also the latest chat events.
})
```

## Register event handlers
Once you have joined a chat room, you need to be able to handle incoming events. 
Only one handler, `onChatEvent`, is necessary:
```javascript
chatClient.setEventHandlers({
    onChatEvent: function(event){ 
        // handle the events here 
    }
})
```

## Start/Subscribe to room updates
Once you have joined a room and set your event handler, you can begin recieving new events using `startListeningToEventUpdates()`
```javascript
chatClient.startListeningToEventUpdates()
```

## Stop updates
When you want to stop recieving new events, you can stop your room subscription with `stopChat()`
```javascript
chatClient.stopListeningToEventUpdates()
```

## Executing a chat command / Sending a message
When you want to send a message, you should first set a user and then use 
```javascript
chatClient.setUser({userid: 'a-user-id', handle:'user-handle'});
chatClient.executeChatCommand('A simple chat message').then(function(serverResponse){
    // The result will be the raw server response in JSON to 'executeChatCommand'
})
```

## Send a reply
```javascript
chatClient.setUser({userid: 'a-user-id', handle:'user-handle'});
chatClient.sendQuotedReply('A reply', originalMessageIdOrObject).then(function(serverResponse){
    // The result will be the raw server response in JSON.
})
```
## Send a Reaction
```javascript
chatClient.setUser({userid: 'a-user-id', handle:'user-handle'});
chatClient.reactToEvent('like', originalMessageIdOrObject).then(function(serverResponse){
    // The result will be the raw server response in JSON.
})
```

## Delete a message (logical delete)
```javascript
chatClient.flagEventLogicallyDeleted(eventObject).then(function(deletionResponse){
    // on success, message has been deleted
}).catch(function(e){
  // something went wrong, perhaps it was already deleted or you have the wrong ID.
})
```

## Report a message for abuse
```javascript
chatClient.reportMessage('event ID', 'abuse').then(function(result){ 
    // event has been reported.
  })
```


# Understanding the SDK

## Key concepts
CHAT: This is a real-time experience designed to make a user feel like other people are present with that person.  The state of a chat room updates in real time, and you receive notifications that update the state.  In general, chat content is disposable: It is enjoyed in the moment but in the future its rare for people to go back and look at past conversation information. Chat messages are also often short and don’t necessarily add a thought to the conversation. Chat drives engagement in the moment by keeping your attention and is best used with live events because its no fun to be in a chat room by yourself. 

COMMENTS: A comment is something you post on an article or video or other context.  Unlike chat, comments are often read long after they are posted, and are more likely to be longer messages that contain a more thoughtful point. They are intended to add to the value of the thing on which the comment appears. Use comments when you don’t real time responses, people will see your comment later.

CONVERSATION: This is a commenting context, such as an article or video that people are commenting on. Comments are created within the context of a conversation.

ROOM: A chat “room” is a virtual space in which people can chat.  Events occur in the room, such as a person entering the room, saying something, or exiting the room.  If a user reacts to something by liking it, this also generates an event.  The SDK listens for new events, processes events, raises call backs for you, and updates the state of the room in memory, so it’s less work for the developer.

## Client Objects
The SDK is broken up into 2 Clients and a set of backing services.
For most user-facing operations you'll want one of the clients:

* Chat Client -  `const chatClient = require('sportstalk-sdk').ChatClient.create({appId, apiToken});`
* Commenting Client  `const commentClient = require('sportstalk-sdk').CommentClient.create({appId, apiToken});`

These clients handle most common operation while hiding the backing APIs and simplifying some operations and will manage state for you.

However, you may want to use the APIs directly, in which case there are a set of backing REST services that you can use:

Common Services:
- UserService
- WebhookService

Chat Services:
- ChatEventService
- ChatRoomService
- ChatModeration Service

Comment Services:
- CommentService
- ConversationService
- CommentModerationService


You can  see the details for each under **'Backing Services'** section

## Data Models
Models are broken up into 3 groups:
* Chat specific models (https://gitlab.com/sportstalk247/sdk-javascript/-/blob/master/src/models/ChatModels.ts)
* Commenting specific models (https://gitlab.com/sportstalk247/sdk-javascript/-/blob/master/src/models/CommentsModels.ts)
* Common Models such as users or webhooks (https://gitlab.com/sportstalk247/sdk-javascript/-/blob/master/src/models/CommonModels.ts)

The models are defined using typescript notation (https://www.typescriptlang.org/).
You don't have to be an expert on Typescript to use these models, as they just describe JSON objects.

For instance:
```typescript
export interface Example {
    id?: string
}
```
This describes a type `Example` with a single property `id` which may or may not be present.
The following are all valid `Example` objects:
```javascript
const example1 = {} // id is optional, and undefined.
const example2 = {id:null} // id property is present but null
const example3 = {id: "123412351235"} // id is a string
```
However this is not a valid `Example` object:
```javascript
const badExample = {
    id:{
        members: []
    }
}
```
Nor is this:
```javascript
const badExample2 = {
    id:1231 // id property is there but is a number and not a string. This is not allowed.
}
```

These typescript definitions help you be certain about the data you will get from the API and allow you to write code with confidence about the data you will or will not receive.

       
# Comments API

## Getting Started
If you are looking to build a custom conversation, you will the need the `CommentClient`, which you can get by:

#### Typescript
 ```typescript
import { CommentClient } from 'sportstalk-sdk'
const commentClient = CommentClient.create({appId:..., apiToken:...});
 ```

#### Require
 ```javascript
const sdk =  require('sportstalk-sdk')
const commentClient = sdk.CommentClient.init({appId:..., apiToken:...});
 ```

## Creating a user
One of the first things you might need to do in Sportstalk is.init a user. Users are shared between chat and commenting in the same application.
To create a user, you can use either the chat or comment clients, or a UserService (advanced). 

```javascript
const commentClient = sdk.CommentClient.init({...});
commentClient.init({userid: "definedByYourSystem-MustBeUnique", handle: "Must-Be-Unique-String"})
    .then(function(user) {
        // user has been created.
    }).catch(function(error) {
        // make sure to catch and handle errors.  
        // It is possible to have network or settings errors. 
        // For instance if you do not set a unique handle you will get an error. 
    })
```

## Finding and joining a conversation
Most users will want to just find and join a conversation created by an admin in the sportstalk dashboard.

To list conversations, use the `listConversations()` method of the CommentsClient, like so:
```javascript
    const response = commentClient.listsConversations();
    const conversations = response.conversations; // Array of Conversation objects
    const cursor = response.cursor; // used for scrolling through long lists of conversations.
```

Powering your UI with this data is up to you, but you might do something like so (in pug template format):
```
h3 Conversations
ul
  each conversation in conversations
    li= conversation.title
      span.id= conversation.id 
```

To join a conversation, you will need a user, please see the section above about creating a user first.
Once you have a user, joining a conversation is simple:

```javascript
async function showJoinConversation() {

    const user = await commentClient.createOrUpdateUser({userid: "definedByYourSystem-MustBeUnique", handle: "Must-Be-Unique-String"})
    // this will automatically set the user, but you can also set the user manually
    commentClient.setUser(user);

    const list = await commentClient.listConversations();
    const conversations =  list.conversations;

    // Let's join the first conversation in the list
    commentClient.setCurrentConversation(conversations[0]); // you should ensure there are conversations first to avoid a null error

    // You are now able to get a list of recent comments
    let comments =  await commentClient.getComments();
    
    // let's make our own comment!
    const mycomment = await commentClient.comment("This is my comment on this conversation!");

    // let's see the comment in the list
    comments = await commentClient.getComments(); // my comment will be included unlesss there was an error
}

```

## CommentClient API
#### setConfig() 
Updates the client configuration. Usually you should just create a new client.
```javascript

const sdk = require('sportstalk-sdk');
const client = sdk.CommentClient.init({ appId: 'yourappid', apiToken: token});
client.setConfig({appId: 'newAppId', apiToken: 'newApiToken', endpoint: 'https://www.yourproxy.server'});

```


#### getConfig(): SportsTalkConfig;
Returns the current configuration object
```javascript

const sdk = require('sportstalk-sdk');
const client = sdk.CommentClient.init({ appId: 'yourappid', apiToken: token});
const config = client.getConfig();
// config will hold { appId: 'yourappid', apiToken: token, endpoint: 'https://api.sportstalk247.com/api/v3' }

```

#### createConversation (conversation: Conversation, setDefault: boolean)

```javascript
const sdk = require('sportstalk-sdk');
const client = sdk.CommentClient.init({ appId: 'your-app-id', apiToken: 'your-api-token'});
async function createConversation() {
      
        try {
            const conversation = await client.createConversation({
                title: "My conversation",
                property: "Optional-property-string", 
                moderation: "pre", // can also be 'post
                maxreports: 3, // can be as low as 0.
                open: true, //set to false if you don't want comments until a future point.
            });
        } catch(e) {
            // Network error, permissions error, etc.  The error message will tell you what is wrong.
        }
        // conversation will be created or an error will be thrown.
}
```

Create a new conversation that others can join and add comments.


#### createOrUpdateUser (user: User, setDefault?:boolean): Promise(User)
Create a new user or update an existing one.   You need a user to be set for some operations.
By default, setDefault is TRUE, meaning that if you create or update a user, that will be the user used for commenting.

```javascript
async function createOrUpdateUserExampleFunction() {
    const client = sdk.CommentClient.init({ appId: 'your-app-id', apiToken: 'your-api-token'});
    const user = await client.createOrUpdateUser({
            userid: "UniqueStringId", 
            handle:"UniqueButReadable",
            displayname: "A pretty string purely for display.",
            pictureurl: "A full url to an image to be used by chat applications for an avatar, e.g. https://...."
            profileurl: "A full url to a user's profile or webpage"
    });
    // user will be created.  if the userid already exists that user will be updated.
}
```

#### setCurrentConversation(conversation)
Set the current conversation for commenting.
The parameter can either be a conversation object or just a conversation ID.

You can see the Conversation and Comments models in this file: 
https://gitlab.com/sportstalk247/sdk-javascript/-/blob/master/src/models/CommentsModels.ts

```javascript
async function setCurrentConversationExampleFunction() {
    const client = sdk.CommentClient.init({ appId: 'your-app-id', apiToken: 'your-api-token'});
    const conversation = await client.createConversation({
        conversationid: 'my-conversation-id',
        property: 'TEST',
        moderation: 'pre',
        maxreports: 3,
        title: 'Demo conversation',
        open: true,
    }, false);
    // can also do it this way.
    
   let currentConversation = client.getCurrentConversation();
   // currentConversation is Null
   client.setCurrentConversation(conversation);
   currentConversation = client.getCurrentConversation();
     
   if(currentConversation === conversation) {
     console.log("They are the same!") // this will print.
   }
}
```

#### getCurrentConversation(): Conversation | null | undefined;
Gets the current conversation.  Will be null or undefined if there is no current conversation.

```javascript
async function getCurrentConversationExampleFunction() {
    const client = sdk.CommentClient.init({ appId: 'your-app-id', apiToken: 'your-api-token'});
    const conversation = await client.createConversation({
        conversationid: 'my-conversation-id',
        property: 'TEST',
        moderation: 'pre',
        maxreports: 3,
        title: 'Demo conversation',
        conversationisopen: true,
    }, true);
    // can also do it this way.
    
   const theSameConversation = client.getCurrentConversation();
   if(theSameConversation === conversation) {
     console.log("They are the same!") // this will print.
   }
}
```


#### getConversation(conversation: Conversation | string): Promise<Conversation>
Retrieves data about a specific conversation from the server.

```javascript
async function getConversationExampleFunction() {
    const client = sdk.CommentClient.init({ appId: 'your-app-id', apiToken: 'your-api-token'});
    const conversation = await client.createConversation({
        conversationid: 'my-conversation-id',
        property: 'TEST',
        moderation: 'pre',
        maxreports: 3,
        title: 'Demo conversation',
        conversationisopen: true,
    }, false);
    // can also do it this way.
    
   const conversationFromServer = client.getConversation('my-conversation-id');
}
```

#### deleteConversation(conversation: Conversation | string);
Deletes a conversation

```javascript
const sdk = require('sportstalk-sdk');

async function deleteConversationExampleFunction() {
    const client = sdk.CommentClient.init({ appId: 'your-app-id', apiToken: 'your-api-token'});
    const conversation = await client.createConversation({
        conversationid: 'my-conversation-id',
        property: 'TEST',
        moderation: 'pre',
        maxreports: 3,
        title: 'Demo conversation',
        conversationisopen: true,
    }, false);
    // can also do it this way.
    
    const deletionResponse = await client.deleteConversation(conversation);
}
```

#### makeComment(comment: string, replyto?: Comment | string)
Make a comment on the current conversation. Will throw an error if a conversation is not set.
```javascript
const sdk = require('sportstalk-sdk');

async function createCommentExampleFunction() {
    const client = sdk.CommentClient.init({ appId: 'your-app-id', apiToken: 'your-api-token'});
    const conversation = await client.createConversation({
        conversationid: 'my-conversation-id',
        property: 'TEST',
        moderation: 'pre',
        maxreports: 3,
        title: 'Demo conversation',
        conversationisopen: true,
    }, true); // second parameter sets this as default
    // can also do it this way.
    client.setCurrentConversation(conversation);
    const user = await client.createOrUpdateUser({ userid: 'someuserid', handle: 'testuser' });
    const comment = client.makeComment('This is a comment');
}
```

#### getComment(comment: Comment | string): Promise<Comment | null>;
Retrieves a specific comment. The param can either be a comment object with an id or just the id.
```javascript
const sdk = require('sportstalk-sdk');

async function getCommentExampleFunction() {
    const client = sdk.CommentClient.init({ appId: 'yourappId', apiToken: 'your-api-token' });
    const conversation = await client.createConversation({
        conversationid: 'my-conversation-id',
        property: 'TEST',
        moderation: 'pre',
        maxreports: 3,
        title: 'Demo conversation',
        conversationisopen: true,
    }, true); // second parameter sets this as default
    // can also do it this way.
    client.setCurrentConversation(conversation);
    const user = await client.createOrUpdateUser({ userid: 'someuserid', handle: 'testuser' });
    const comment = client.makeComment('This is a comment');
}
```

#### deleteComment(comment:Comment | string, final: boolean): Promise<CommentDeletionResponse>
Deletes a comment

#### updateComment(comment:Comment)
Updates a comment

#### reactToComment(comment:Comment | string, reaction:Reaction)
Reacts to a comment

#### voteOnComment(comment:Comment | string, vote:Vote)
Vote a comment up or down

#### reportComment(comment:Comment | string, reportType: ReportType)
Report a comment for violating community rules.

#### getCommentReplies(comment:Comment, request?: CommentRequest)
Get replies to a comment

#### getComments(request?: CommentRequest, conversation?: Conversation)
Gets the latest comments for the default conversation.

#### listConversations(filter?: ConversationRequest)
List conversations that are available to comment.


# Chat
## GETTING STARTED: How to use the SDK
This Sportstalk SDK is meant to power custom chat applications.  Sportstalk does not enforce any restricitons on your UI design, but instead empowers your developers to focus on the user experience without worrying about the underlying chat behavior.

Sportstalk is an EVENT DRIVEN API. When new talk events occur, the SDK will trigger appropriate callbacks, if set.
At minimum, you will want to set 5 callbacks:
* onChatStart
* onChatEvent
* onPurgeEvent
* onReaction
* onAdminCommand

See a simple WEB example below.  To use this, you will need to get the web sdk under `/dist/web-sdk.js` or `/dist/web-sdk.min.js`

```javascript
// first create a client
const client = ChatClient.init({apiToken:'YourApiTokenHere'},  {...EventHandlerConfig});

// You can set the event handlers as part of the factory or with the setEventhandlers method.
client.setEventHandlers({
          onChatStart: clearLoadScreenFn,
          onChatEvent: onChatEventFn,
          onPurgeEvent: onPurgeFn,
          onReaction: onReactionFn,
          onAdminCommand: onAdminCommandFn,
        });

// For goals, you can set a default image or send it as part of each goal API call.
client.setDefaultGoalImage("https://res.cloudinary.com/sportstalk247/image/upload/v1575821595/goal_l6ho1d.jpg");

// Set the user, if logged in.
client.setUser({
  userid:UserId,
  handle:Handle
});

// List rooms, join a room, and then start talking!
client.listRooms().then(function(list){
  return client.joinRoom(lisy.rooms[0]);
}).then(client.startEventUpdates);

```
For use of these events in action, see the demo page: https://www.sportstalk247.com/demo.html

You can also use the client in node.

```typescript
import { ChatClient } from 'sportstalk-sdk'
const client = ChatClient.init({apiToken:'YourApiKeyHere', appId: 'yourAppId'}, {...EventHandlerConfig});
```

## Events Callbacks
Sportstalk uses callback functions to handle events.  These callbacks are specified with the `EventHandlerConfig`:

```typescript
interface EventHandlerConfig {
    onChatStart?: Function;
    onNetworkResponse?(response: EventResult[]);
    onChatEvent?(event: EventResult),
    onGoalEvent?(event: EventResult),
    onAdEvent?(event: EventResult),
    onReply?(event: EventResult),
    onReaction?(event:EventResult),
    onPurgeEvent?(event:EventResult),
    onAdminCommand?(response: ApiResult<Kind.api>),
    onHelp?(result:ApiResult<any>),
    onNetworkError?: Function
}
``` 
**It's important** to handle at least `onChatEvent`, `onPurgeEvent` and `onAdminCommand`.  These callbacks are the general minimum to create a chat application. 

## Callback function overview
### onChatStart()
This callback is triggered once whenever 'client.startTalk()' is called.  You can use this to remove loading screens, hide advertisements, and so on.

### onNetworkResponse(response: eventResult[])
This is called every time there is any network response.  Most of the time you do **NOT** want to use this callback but it can be useful for diagnostic information as it receives raw response data.  The format of this data is currently the result of a REST api call, but this is **not guaranteed**.  Future versions of the sportstalk sdk may use other transsport mechanisms such as websockets and/or firebase messaging.  In this case this callback would receive the raw socket or firebase message data.

### onChatEvent(event: EventResult)
This is the most critical callback. Each **new** chat event seen by the sdk client instance will be passed to this callback.  It is possible to render the entire chat experience with just this callback, and mosst other callbacks (such as onGoalEvent) are just convenience wrappers for the Sportstalk custom event system.  

Your UI solution should accept each chat event and render it.  This callback could also be used to trigger push notifications.

### onGoalEvent(event: EventResult)
This is a **convenience wrapper** that only works with the built-in SDK `sendGoal`.  These methods make use of the custom event types exposed by the sportstalk REST api and are purely to make creating sports experiences simpler. The REST SportsTalk api does not understand a 'goal' event, but utilizes custom event types.  This call back should **only** be used if you are also using the defaults provided by `client.sendGoal()`.  
**Note that if this callback is registered, these custom goal events will NOT be sent to `onChatEvent`**

### onAdEvent(event: EventResult)
All the caveats of `onGoalEvent` apply to `onAdEvent`.  These callbacks are just convenience wrappers for the custom event system exposed by the sportstalk REST api to make building typical sports applications easier.      

### onReply(event: EventResult)
If both are set, `onReply` will be called **instead of** `onChatEvent` for reply events.  

### onReaction(event: EventResult)
If both are set, `onReaction` will be called **instead of** `onChatEvent` for reply events.  

### onPurgeEvent(event: EventResult)
Clients should implement `onPurgeEvent()` if there is any moderation.  Purge events are used by the sportstalk SDK to let clients to know to remove messages that have been moderated as harmful or against policies and should be removed from the UI.        

### onAdminCommand(response: ApiResult)
`onAdminCommand` will be triggered on a successful server response when an admin command **is sent**.  For instance, if an admin sends a purge command, `onAdminCommand` will be triggered when the purge command is sent, and `onPurgeEvent` will be triggered with the purge message is sent from the API.

Note that if `onHelp` is set it will be triggered instead of onAdminCommand because there may be special considerations - loading a different screen, navigating to a website, etc.

### onHelp(response:ApiResult)

`onHelp` will be triggered only when there is a successful API response for *sending* the `*help` command.  Use this callback to display a help screen.  If not set, the help API response will be sent to `onAdminCommand`

### onNetworkError(error: Error) 
`onNetworkError` will be called if there are issues retrieving messages from the SportsTalk server. It is NOT called if there is an issue sending a specific message.  `onNetworkError` is intended for monitoring background communications to show messages like "Chat may be unavailable, please check your network connectivity".

You can use `onNetworkError` and `onNetworkReponse` to show/hide such message connectivity errors.
 
## The Bare Minimum
The only critical events that you need to handle are `onChatEvent` which will be called for each new chat event, `onAdminCommand` which will handle messages from administrators, `onPurgeEvent` which will be called when purge commands are issued to clear messages that violate content policy.

You will probably also want to use `onChatStart` to show/hide any loading messages.

The easiest way to see how these event works is to see the demo page: https://www.sportstalk247.com/demo.html

# Chat Application Best Practices
* Do not 'fire and forget' chat messages.  Most chat applications require some level of moderation.  Your UI should make sure to keep track of message metadata such as:
    * Message ID
    * User Handle for each message.
    * User ID for each message.  In the event of moderation or purge events,  your app will need to be able to find and remove purged messages.
    * Timestamp
* Use the promises from sendCommand, sendReply, etc, to show/hide some sort of indication that the message is being sent.
* Make sure you handle errors for sending messages in case of network disruption.   For instance, `client.sendCommand('message').catch(handleErrorInUiFn)`

# Backing Services
## Common Services
### User Service
The user service handles user creation and management including banning users.

To instantiate a User Service:
```javascript
const sdk = require('sportstalk-sdk');
const userService = new sdk.services.UserService({appId, apiToken});
const list = userService.listUsers();
```

### Webhook Service
The webhook service governs the creation and management of webhooks.  The Chat and Comment clients do not provide access to this functionality.
To instantiate the Webhook service:

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.WebhookService({appId, apiToken});
const hooks =  await service.listWebhooks()
```

#### Create a new webhook

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.WebhookService({appId, apiToken});
const newHook = await service.createWebhook({
    label: 'A user friendly label',
    url: 'http://www.your-hook-endpoint.com/endpoint',
    enabled: true,
    type: 'post', //can also be pre
    events: ['chatspeech','chatreply']
});
// if successful your hook was created.  
```

#### Delete a webhook
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.WebhookService({appid, apitoken});
const newHook = await service.deleteWebhook('id-of-previously-created-webhook');
// if successful your hook was created.  
```

#### Update a webhook
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.WebhookService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function updateWebhookExample() {
    const newHook = await service.updateWebhook({
            id: 'id-of-previously-crated-hook', 
            label: 'A user friendly label',
            url: 'http://www.your-hook-endpoint.com/endpoint',
            enabled: true,
            type: 'post', //can also be pre
            events: ['chatspeech','chatreply']
        });
}
```

If successful your hook was updated.  The new settings will replace the old ones, so be sure to configure anything you want to differ from the defaults.

## Chat Services
### Chat Event Service
The chat event service encapsulates event management inside a room. 
It's duties include receiving and filtering new events, and then deciding which callbacks should be triggered based on each event.
To create a ChatEventService:

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ChatEventService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function eventServiceExample() {
    // Argument is a Room object with an ID that has been created.  See the RoomService
    const eventService =  await service.setCurrentRoom({...});
    // This will start the chat, but without callbacks nothing will happen.  See the ChatClient documentation.
    eventService.startListeningToEventUpdates(); // will begin receiving events from the room.
}
```


### Chat Room Service
The chat room service can be used for Chat Room creation and managment for an app.  In most cases, you do not need to use this service as the ChatClient interface provides the same functionality.

To create a RoomService:

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ChatRoomService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function listRoomsExample() {
    const chatRooms =  await service.listRooms()
}
```

#### Creating a chat room
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ChatRoomService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function createRoomExample() {
    const chatRoom =  await service.createRoom({
        name: "Room name",
        description: "Optional description",
        moderation: "post", // can be 'pre' as well
        slug: "readable-slug",
        enableprofanityfilter: true, //optional
        delaymessageseconds:0, // optional, should usually be zero
        enableactions: false, //disable action commands.
        roomisopen: true, // allows people to chat inside the room.
        maxreports: 1, // defaults to 3. The number of flags it takes to add a comment to the moderation queue.
        enableenterAndexit: true, // allows people to join room
    })
}
```


#### Closing a chat room
You can close a room by ID.
```javascript
const service = new sdk.services.ChatRoomService({appId: 'your-app-id', apiToken: 'your-api-token'});({appId, apiToken});
const sdk = require('sportstalk-sdk');
async function closeRoomExample() {
    const chatRoom =  await service.closeRoom('roomid');
}
```

#### Opening a chat room
You can close a room by ID.
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ChatRoomService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function openRoomExample() {
    const chatRoom =  await service.openRoom('roomid');
}
```

#### Deleting a chat room
If you are done with a room, you can delete it.

**WARNING:** this cannot be undone. All messages in the room will be destroyed as well.

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ChatRoomService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function deleteRoomExample() {
    const chatRoom =  await service.deleteRoom('roomid');
}
``` 

### Chat Moderation Service
If you are creating a moderation UI for chat, this is the class you need.
To instantiate the Chat Moderation service and get the moderation queue:
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ChatModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function moderationExample() {
    const queue =  await service.getModerationQueue();
    // queue has events awaiting moderation
}
```

#### Approving a Chat Event - allow in chat.
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ChatModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function moderationApproveExample() {
    const queue =  await service.getModerationQueue();
    const event = queue.events[0]; // this assumes there is at least one event.
    const result = service.approveEvent(event);
}
```

#### Reject a Chat Event - remove from chat 
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ChatModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function moderationApproveExample() {
    const queue =  await service.getModerationQueue();
    const event = queue.events[0]; // this assumes there is at least one event.
    const result = service.rejectEvent(event);
}
```

## Commenting Services
### Conversation Service
The conversation service is used to create, list, and update converations.  In most cases, you do not need this class, but should use the CommentingClient.

To create a ConversationService do the following:

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ConversationService({appId: 'your-app-id', apiToken: 'your-api-token'});
```

#### Create a new conversation
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ConversationService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function createConversationServiceExample() {
    const conversation =  await service.createConversation({
         conversationid: "a-unique-id-you-create",
         property: "a-property-string-check-dashboard", //property ids are defined by your organization.
         moderation: "pre", // or 'post'
         title: "A conversation title"
    })
}
```
#### Delete a conversation
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ConversationService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function deleteConversationServiceExample() {
    const deletionResponse =  await service.deleteConversation("a-unique-id-you-create"});
}
```

#### Update a conversation
You can use the service to update a conversation you've already created by passing in new values. You cannot change the ID after creation.
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ConversationService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function updateConversationServiceExample() {
    const conversation =  await service.createConversation({
         conversationid: "your-unique-id",
         title: "An updated title"
    })
}
```
#### List available conversations
You can list all the available conversations for your app.
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.ConversationService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function updateConversationServiceExample() {
    const listResponse =  await service.listConversations(); // contains the list of conversations and a cursor.
    const conversationArray = listresponse.conversations; // conversation array is now an object of type Conversation[]
}
```

### CommentService
You probably don't want to use this service, but instead the CommentingClient which will handle conversation and user state for you.
The comment service manages comments **for a specific conversation**.  You need to set a conversation before using most operations.
To create a CommentService do the following:

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.CommentService({appId: 'your-app-id', apiToken: 'your-api-token'});
service.setConversation({id: 'yourConverationId'})
```

#### Create a comment
```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.CommentService({appId: 'your-app-id', apiToken: 'your-api-token'});
service.setConversation({id: 'yourConverationId'})
async function createCommentExample() {
    const user = {userid:"a-user-id", handle:"a-user-handle"};
    const comment = await service.createComment('this is my comment', user);
}
```

#### Delete a commment

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.CommentService({appId: 'your-app-id', apiToken: 'your-api-token'});
service.setConversation({id: 'yourConverationId'})
async function deleteCommentExample() {
    const user = {userid:"a-user-id", handle:"a-user-handle"};
    // specify the comment, the user asking for the deletion, and whether or not that deletion is permanent.
    const comment = await service.delete({id: 'a-comment-id'}, user, true);
}
```

### Comment Moderation Service
The comment moderation service is useful for creating custom moderation UIs.

To create a CommentModerationService do the following:

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.CommentModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function getCommentModerationQueueExample() {
    const queue = service.listCommentsInModerationQueue();
}
```
#### Approve a comment
Approving a comment makes it available to users in the conversation.

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.CommentModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function approveCommentExample() {
    const queue = service.listCommentsInModerationQueue();
    const queuedComment = queue.comments[0]; // Assumes that the list has at least one comment in it.
    const approvedComment =  await service.approveComment(queuedComment);
}
```

#### Reject a comment
Rejecting a comment makes it unavailable to users in the conversation.

```javascript
const sdk = require('sportstalk-sdk');
const service = new sdk.services.CommentModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
async function approveCommentExample() {
    const queue = service.listCommentsInModerationQueue();
    const queuedComment = queue.comments[0]; // Assumes that the list has at least one comment in it.
    const rejectedComment = await service.rejectComment(queuedComment);
}
```

# Copyright & License

Copyright (c) 2020 Sportstalk247
