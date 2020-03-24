# Sportstalk 247 Javascript SDK


## Usage
The Sportstalk SDK is a helpful wrapper around the [Sportstalk API](https://apiref.sportstalk247.com/?version=latest)

The set of SDKs and source (iOS, Android, and JS) is here: https://gitlab.com/sportstalk247/

```
$ npm install sportstalk-sdk
```


You will need to register with SportsTalk and get an API Key in order to use sportstalk functions.

## GETTING STARTED: How to use the SDK
This Sportstalk SDK is meant to power custom chat applications.  Sportstalk does not enforce any restricitons on your UI design, but instead empowers your developers to focus on the user experience without worrying about the underlying chat behavior.

Sportstalk is an EVENT DRIVEN API. When new talk events occur, the SDK will trigger appropriate callbacks, if set.
At minimum, you will want to set 5 callbacks:
* onChatStart
* onChatEvent
* onPurgeEvent
* onReaction
* onAdminCommand

See a simple example below:

```
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

```
import { ChatClient } from 'sportstalk-js'
const client = ChatClient.create({apiKey:'YourApiKeyHere'}, {...EventHandlerConfig});
```

## Events Callbacks
Sportstalk uses callback functions to handle events.  These callbacks are specified with the `EventHandlerConfig`:

```
export interface EventHandlerConfig {
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

Copyright (c) 2019 Sportstalk247
