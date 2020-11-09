===============
Chat Client API
===============

Getting Started with Chat
-------------------------
This Sportstalk SDK is meant to power custom chat applications.  Sportstalk does not enforce any restricitons on your UI design, but instead empowers your developers to focus on the user experience without worrying about the underlying chat behavior.

Sportstalk is an EVENT DRIVEN API. When new talk events occur, the SDK will trigger appropriate callbacks, if set.
The only mandatory callback is ```onChatEvent```.  However, at minimum, you will want to set 5 callbacks:

* ``onChatStart``
* ``onChatEvent``
* ``onPurgeEvent``
* ``onReaction``
* ``onAdminCommand``

See a simple WEB example below.  To use this, you will need to get the web sdk under `/dist/web-sdk.js` or `/dist/web-sdk.min.js`

.. code-block:: javascript

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
      return client.joinRoom(list.rooms[0]);
    }).then(client.startEventUpdates);

You can also use the client in node.

.. code-block:: typescript

    import { ChatClient } from 'sportstalk-sdk'
    const client = ChatClient.init({apiToken:'YourApiKeyHere', appId: 'yourAppId'}, {...EventHandlerConfig});


Events Callbacks
----------------
Sportstalk uses callback functions to handle events.  These callbacks are specified with the `EventHandlerConfig`:

.. code-block:: typescript

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

**It's important** to handle at least `onChatEvent`, `onPurgeEvent` and `onAdminCommand`.  These callbacks are the general minimum to create a chat application.

Callback function overview
--------------------------

onChatStart()
~~~~~~~~~~~~~
This callback is triggered once whenever ```client.startListeningToEventUpdates()``` is called.  You can use this to remove loading screens, hide advertisements, and so on.

onNetworkResponse(response: any)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
This is called every time there is any network response.  Most of the time you do **NOT** want to use this callback but it can be useful for diagnostic information as it receives raw response data.  The format of this data is currently the result of a REST api call, but this is **not guaranteed**.  Future versions of the sportstalk sdk may use other transsport mechanisms such as websockets and/or firebase messaging.  In this case this callback would receive the raw socket or firebase message data.

onChatEvent
~~~~~~~~~~~

**Parameters:**

* event: :ref:`EventResult`

This is the most critical callback. Each **new** chat event seen by the sdk client instance will be passed to this callback.  It is possible to render the entire chat experience with just this callback, and mosst other callbacks (such as onGoalEvent) are just convenience wrappers for the Sportstalk custom event system.

Please take a loook at the different eventtype keys in `src/models/ChatModels.ts` in interface `EventType`.  Your code should be preparred to accept any of these events and render appropriately.

Your UI solution should accept each chat event and render it.  This callback could also be used to trigger push notifications.

onGoalEvent
~~~~~~~~~~~

**Parameters:**

* event: :ref:`EventResult`

This is a **convenience wrapper** that only works with the built-in SDK `sendGoal`.  These methods make use of the custom event types exposed by the sportstalk REST api and are purely to make creating sports experiences simpler. The REST SportsTalk api does not understand a 'goal' event, but utilizes custom event types.  This call back should **only** be used if you are also using the defaults provided by `client.sendGoal()`.
**Note that if this callback is registered, these custom goal events will NOT be sent to `onChatEvent`**

onAdEvent
~~~~~~~~~

**Parameters:**

* event: :ref:`EventResult`

All the caveats of `onGoalEvent` apply to `onAdEvent`.  These callbacks are just convenience wrappers for the custom event system exposed by the sportstalk REST api to make building typical sports applications easier.

onReply
~~~~~~~

**Parameters:**

* event: :ref:`EventResult`

If both are set, `onReply` will be called **instead of** `onChatEvent` for reply events.

onReaction
~~~~~~~~~~

**Parameters:**

* event: :ref:`EventResult`

If both are set, `onReaction` will be called **instead of** `onChatEvent` for reply events.

onPurgeEvent(event: EventResult)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Clients should implement `onPurgeEvent()` if there is any moderation.  Purge events are used by the sportstalk SDK to let clients to know to remove messages that have been moderated as harmful or against policies and should be removed from the UI.

onAdminCommand(response: ApiResult)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`onAdminCommand` will be triggered on a successful server response when an admin command **is sent**.  Admin commands often do not result in updates to getUpdates() so it's necessary to handle what happens based on API response. For instance, if an admin sends a purge command, `onAdminCommand` will be triggered when the purge command is sent, and `onPurgeEvent` will be triggered with the purge message is sent from the API.

Note that if `onHelp` is set it will be triggered instead of onAdminCommand because there may be special considerations - loading a different screen, navigating to a website, etc.

onHelp(response:ApiResult)
~~~~~~~~~~~~~~~~~~~~~~~~~~

`onHelp` will be triggered only when there is a successful API response for *sending* the `*help` command.  Use this callback to display a help screen.  If not set, the help API response will be sent to `onAdminCommand`

onNetworkError(error: Error)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

`onNetworkError` will be called if there are issues retrieving messages from the SportsTalk server. It is NOT called if there is an issue sending a specific message.  `onNetworkError` is intended for monitoring background communications to show messages like "Chat may be unavailable, please check your network connectivity".

You can use `onNetworkError` and `onNetworkReponse` to show/hide such message connectivity errors.

Chat Client Operations
-------------------
All examples are shown with promises to be used in-browser.  You can also use async/await if using node.js or react.

*Before executing any of these operations, create the client like so:*

Javascript:

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const chatClient = sdk.ChatClient.init({appId:'yourAppId', apiToken:'yourApiToken'});


Typescript:

.. code-block:: javascript

    import { ChatClient } from 'sportstalk-sdk'
    const chatClient = ChatClient.init({appId:'yourAppId', apiToken:'yourApiToken'});



Creating a user
~~~~~~~~~~~~~~~
One of the first things you might need to do in Sportstalk is create a user. Users are shared between chat and commenting in the same application.
To create a user, you can use either the chat or comment clients, or a :ref:`user-service<UserService>` (advanced).

.. code-block:: javascript

    const chatClient = sdk.ChatClient.init({...});
    chatClient.createOrUpdateUser({userid: "definedByYourSystem-MustBeUnique", handle: "Must-Be-Unique-String"})
        .then(function(user) {
            // user has been created.
        }).catch(function(error) {
            // make sure to catch and handle errors.
            // It is possible to have network or settings errors.
            // For instance if you do not set a unique handle you will get an error.
        })


Create or Update a Chat Room
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    chatClient.createRoom({
        name: "Your room name",
        customid: "your-custom-id",
        moderation: "post"
    }).then(function(room){
        // your room is ready.
        const roomid = room.id
    })


To update a room, just call `updateRoom()` with the ID already set:

.. code-block:: javascript

    chatClient.updateRoom({
        id: 'generated-id-value',
        name: "Your NEW room name", // updated
        customid: "your-custom-id",
        moderation: "post"
    }).then(function(room){
        // your room is ready.
    })

Get room details
~~~~~~~~~~~~~~~~

By Room ID
++++++++++

To get the details about a room, use `getRoomDetails()`

.. code-block:: javascript

    chatClient.getRoomDetails('your-room-id').then(function(room){
        // your room is ready.
     })


By Room Custom ID
+++++++++++++++++

To get the details about a room, use `getRoomDetailsByCustomId()`

.. code-block:: javascript

    chatClient.getRoomDetailsByCustomId ('your-custom-room-id').then(function(room){
        // your room is ready.
     })


Join a room
~~~~~~~~~~~~~~~

Anonymous
+++++++++

You can join a room anonymously

.. code-block:: javascript

    chatClient.joinRoom('a-room-id').then(function(roomDetailsAndUpdates){
        // the response will include room details and also the latest chat events.
    })


Authenticated
+++++++++++++

To join a room as an authenticated user, set the current user for the client.  This user will be used by default for all updates and chat events.

.. code-block:: javascript

    chatClient.setUser({userid: 'a-user-id', handle:'user-handle'});
    chatClient.joinRoom('a-room-id').then(function(roomDetailsAndUpdates){
        // the response will include room details and also the latest chat events.
    })


Register event handlers
~~~~~~~~~~~~~~~~~~~~~~~

Once you have joined a chat room, you need to be able to handle incoming events.
Only one handler, `onChatEvent`, is necessary:

.. code-block:: javascript

    chatClient.setEventHandlers({
        onChatEvent: function(event){
            // handle the events here
        }
    })


Start/Subscribe to room updates
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Once you have joined a room and set your event handler, you can begin recieving new events using `startListeningToEventUpdates()`

.. code-block:: javascript

    chatClient.startListeningToEventUpdates()


Stop updates
~~~~~~~~~~~~

When you want to stop recieving new events, you can stop your room subscription with `stopListeningToEventUpdates()`

.. code-block:: javascript

    chatClient.stopListeningToEventUpdates()


Executing a chat command / Sending a message
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When you want to send a message, you should first set a user and then use

.. code-block:: javascript

    chatClient.setUser({userid: 'a-user-id', handle:'user-handle'});
    chatClient.executeChatCommand('A simple chat message').then(function(serverResponse){
        // The result will be the raw server response in JSON to 'executeChatCommand'
    })


Send a reply
~~~~~~~~~~~~

.. code-block:: javascript

    chatClient.setUser({userid: 'a-user-id', handle:'user-handle'});
    chatClient.sendQuotedReply('A reply', originalMessageIdOrObject).then(function(serverResponse){
        // The result will be the raw server response in JSON.
    })

Send a Reaction
~~~~~~~~~~~~~~~

.. code-block:: javascript

    chatClient.setUser({userid: 'a-user-id', handle:'user-handle'});
    chatClient.reactToEvent('like', originalMessageIdOrObject).then(function(serverResponse){
        // The result will be the raw server response in JSON.
    })


Delete a message (logical delete)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    chatClient.flagEventLogicallyDeleted(chatEvent).then(function(deletionResponse){
        // on success, message has been deleted
    }).catch(function(e){
      // something went wrong, perhaps it was already deleted or you have the wrong ID.
    })


Report a message for abuse
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    chatClient.reportMessage('event ID', 'abuse').then(function(result){
        // event has been reported.
      })


Bounce a user from a room
~~~~~~~~~~~~~~~~~~~~~~~~~
Bouncing/banning require you to check permissions inside your app as Sportstalk does not attach user permissions and instead depends on the host permissioning system.

.. code-block:: javascript

    chatClient.bounceUser('userID string or UserResult Object', 'optional message').then(function(result)) {
        // User will be bounced from the room.  Their ID will be added to the room's bounced users list.
        // A bounce event will be in the next getUpdates() call.
    }


Unbounce a user from a room
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    chatClient.unbounceUser('userID string or UserResult Object', 'optional message').then(function(result)) {
        // User will be unbounced from the room.  Their ID will be removed from the room's bounced users list.
    }

