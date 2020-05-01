# Sportstalk 247 Javascript SDK


## Usage
The Sportstalk SDK is a helpful wrapper around the [Sportstalk API](https://apiref.sportstalk247.com/?version=latest)

The set of SDKs and source (iOS, Android, and JS) is here: https://gitlab.com/sportstalk247/

```
$ npm install sportstalk-sdk
```

## Using the SDK in Node.js

### Using Typescript (recommended)
If you are using typescript, we provide typescript definitions for all objects.  It's as simple as:
 ```
 import { CommentClient } from 'sportstalk-sdk'
 const commentClient = CommentClient.create({appId: ... , apiToken: ....}); 
```
 or
 ```
import { ChatClient } from 'sportstalk-sdk'
const chatClient = ChatClient.create({appId: ... , apiToken: ....}); 
 ```
 
 
### Using require
Using require is also simple.  

```
const sdk = require('sportstalk-sdk');
const commentClient = sdk.CommentClient.create({appId..., apiToken...});
const chatClient = sdk.ChatClient.create(({appId..., apiToken...});
```

You will need to register with SportsTalk and get an API Key in order to use sportstalk functions.


## Using the SDK on the Web
To use directly, we host the web SDK on our website.
* Latest version: https://www.sportstalk247.com/dist/sdk/latest/web-sdk.js
* Latest minified version: https://www.sportstalk247.com/dist/sdk/latest/web-sdk.min.js
 
You can also look inside the Sportstalk package at `/dist/web-sdk.js` or use the minified version at `/dist/web-sdk.min.js`

# Comments API

## Getting Started
If you are looking to build a custom conversation, you will the need the `CommentClient`, which you can get by:

#### Typescript
 ```
import { CommentClient } from 'sportstalk-sdk'
const commentClient = CommentClient.create({appId:..., apiToken:...});
 ```

#### Require
 ```
const sdk =  require('sportstalk-sdk')
const commentClient = sdk.CommentClient.create({appId:..., apiToken:...});
 ```

## Creating a user
One of the first things you might need to do in Sportstalk is create a user. Users are shared between chat and commenting in the same application.
To create a user, you can use either the chat or comment clients, or a UserService (advanced). 

```javascript
const commentClient = sdk.CommentClient.create({...});
commentClient.createUser({userid: "definedByYourSystem-MustBeUnique", handle: "Must-Be-Unique-String"})
    .then(function(user) {
        // user has been created.
    }).catch(function(error) {
        // make sure to catch and handle errors.  
        // It is possible to have network or settings errors. 
        // For instance if you do not set a unique handle you will get an error. 
    })
```
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

## Finding and joining a conversation
Most users will want to just find and join a conversation created by an admin in the sportstalk dashboard.

To list conversations, use the `listConversations()` method of the CommentsClient, like so:
```
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

    const user = await commentClient.createOrUpdateUsercreateUser({userid: "definedByYourSystem-MustBeUnique", handle: "Must-Be-Unique-String"})
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
#### getConfig(): SportsTalkConfig;
Returns the current configuration object

#### setConfig(config: SportsTalkConfig)
Updates the client configuration. Usually you should just create a new client.

#### createConversation (conversation: Conversation, setDefault: boolean): Promise<Conversation>
Create a new conversation that others can join and add comments.


#### createOrUpdateUser (user: User, setDefault?:boolean): Promise<User>;
Create a new user or update an existing one.   You need a user to be set for some operations.
By default, setDefault is TRUE, meaning that if you create or update a user, that will be the user used for commenting.


#### setCurrentConversation(conversation: Conversation | string): Conversation;
Set the current conversation for commenting.


#### getCurrentConversation(): Conversation | null | undefined;
Gets the current conversation.  Will be null or undefined if there is no current conversation.

#### getConversation(conversation: Conversation | string): Promise<Conversation>
Retrieves data about a specific conversation from the server.

#### deleteConversation(conversation: Conversation | string);
Deletes a conversation

#### makeComment(comment: string, replyto?: Comment | string)
Make a comment on the current conversation. Will throw an error if a conversation is not set.

#### getComment(comment: Comment | string): Promise<Comment | null>;
Retrieves a specific comment. The param can either be a comment object with an id or just the id.

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
const client = ChatClient.create({apiKey:'YourApiKeyHere'},  {...EventHandlerConfig});

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
client.listRooms().then(function(rooms){
  return client.joinRoom(rooms[0]);
}).then(client.startTalk);
 
...

```
For use of these events in action, see the demo page: https://www.sportstalk247.com/demo.html

You can also use the client in node.

```javascript
import { ChatClient } from 'sportstalk-js'
const client = ChatClient.create({apiKey:'YourApiKeyHere', appId: 'yourAppId'}, {...EventHandlerConfig});
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


# Copyright & License

Copyright (c) 2020 Sportstalk247
