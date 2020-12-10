================
Backing Services
================

**Common Services:**

* UserService
* WebhookService

**Chat Services:**

* ChatEventService
* ChatRoomService
* ChatModeration Service

**Comment Services:**

* CommentService
* ConversationService
* CommentModerationService

The Chat and Comment clients are powered by a set of backing services that make calls to the REST API. There may be cases where you want more "raw" access to the REST API.  In these cases you can load and initialize these services directly.

Common Services
---------------

:: _UserService:

User Service
~~~~~~~~~~~~

The user service handles user creation and management including banning users.

To instantiate a User Service:

.. code-block:: javascript
    const sdk = require('sportstalk-sdk');
    const userService = new sdk.services.UserService({appId, apiToken});

Create a User
+++++++++++++

.. code-block:: javascript
    const sdk = require('sportstalk-sdk');
    const userService = new sdk.services.UserService({appId, apiToken});

    const user = userService.createOrUpdateUser({ userid: 'user-123415', handle: 'myUserHandle' });

Webhook Service
~~~~~~~~~~~~~~~
The webhook service governs the creation and management of webhooks.  The Chat and Comment clients do not provide access to this functionality.
To instantiate the Webhook service:

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.WebhookService({appId, apiToken});
    const hooks =  await service.listWebhooks()


Create a new webhook
++++++++++++++++++++

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.WebhookService({appId, apiToken});

    const newHook = await service.createWebhook({
        label: 'A user friendly label',
        url: 'http://www.your-hook-endpoint.com/endpoint',
        enabled: true,
        type: 'post', //can also be pre
        events: ['chatspeech','chatreply']
    });
    // if successful your hook was created.


Delete a webhook
++++++++++++++++

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.WebhookService({appid, apitoken});

    const newHook = await service.deleteWebhook('id-of-previously-created-webhook');
    // if successful your hook was created.




Update a webhook
++++++++++++++++

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.WebhookService({appId: 'your-app-id', apiToken: 'your-api-token'});
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


If successful your hook was updated.  The new settings will replace the old ones, so be sure to configure anything you want to differ from the defaults.


Chat Services
---------------

Chat Event Service
~~~~~~~~~~~~~~~~~~

The chat event service encapsulates event management inside a room.
It's duties include receiving and filtering new events, and then deciding which callbacks should be triggered based on each event.
To create a ChatEventService:

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ChatEventService({appId: 'your-app-id', apiToken: 'your-api-token'});

    async function eventServiceExample() {
        // Argument is a Room object with an ID that has been created.  See the RoomService
        const eventService =  await service.setCurrentRoom({...});
        // This will start the chat, but without callbacks nothing will happen.  See the ChatClient documentation.
        eventService.startListeningToEventUpdates(); // will begin receiving events from the room.
    }



Chat Room Service
~~~~~~~~~~~~~~~~~

The chat room service can be used for Chat Room creation and managment for an app.  In most cases, you do not need to use this service as the ChatClient interface provides the same functionality.

To create a RoomService:

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ChatRoomService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function listRoomsExample() {
        const chatRooms =  await service.listRooms()
    }

Creating a chat room
++++++++++++++++++++

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ChatRoomService({appId: 'your-app-id', apiToken: 'your-api-token'});
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



Closing a chat room
+++++++++++++++++++

You can close a room by ID.

.. code-block:: javascript

    const service = new sdk.Services.ChatRoomService({appId: 'your-app-id', apiToken: 'your-api-token'});({appId, apiToken});
    const sdk = require('sportstalk-sdk');
    async function closeRoomExample() {
        const chatRoom =  await service.closeRoom('roomid');
    }


Opening a chat room
+++++++++++++++++++

You can close a room by ID.

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ChatRoomService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function openRoomExample() {
        const chatRoom =  await service.openRoom('roomid');
    }


Deleting a chat room
++++++++++++++++++++

If you are done with a room, you can delete it.

**WARNING:** this cannot be undone. All messages in the room will be destroyed as well.

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ChatRoomService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function deleteRoomExample() {
        const chatRoom =  await service.deleteRoom('roomid');
    }

Chat Moderation Service
-----------------------
If you are creating a moderation UI for chat, this is the class you need.
To instantiate the Chat Moderation service and get the moderation queue:

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ChatModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function moderationExample() {
        const queue =  await service.getModerationQueue();
        // queue has events awaiting moderation
    }


Approving a Chat Event
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ChatModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function moderationApproveExample() {
        const queue =  await service.getModerationQueue();
        const event = queue.events[0]; // this assumes there is at least one event.
        const result = service.approveEvent(event);
    }


Reject a Chat Event
~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ChatModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function moderationApproveExample() {
        const queue =  await service.getModerationQueue();
        const event = queue.events[0]; // this assumes there is at least one event.
        const result = service.rejectEvent(event);
    }


Commenting Services
-------------------

Commenting features are backed by the Conversation, Commenting, and Comment Moderation services.

Conversation Service
~~~~~~~~~~~~~~~~~~~~

The conversation service is used to create, list, and update converations.  In most cases, you do not need this class, but should use the CommentingClient.

To create a ConversationService do the following:

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ConversationService({appId: 'your-app-id', apiToken: 'your-api-token'});


Create a new conversation
+++++++++++++++++++++++++

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ConversationService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function createConversationServiceExample() {
        const conversation =  await service.createConversation({
             conversationid: "a-unique-id-you-create",
             property: "a-property-string-check-dashboard", //property ids are defined by your organization.
             moderation: "pre", // or 'post'
             title: "A conversation title"
        })
    }

Delete a conversation
+++++++++++++++++++++

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ConversationService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function deleteConversationServiceExample() {
        const deletionResponse =  await service.deleteConversation("a-unique-id-you-create"});
    }


Update a conversation
+++++++++++++++++++++

You can use the service to update a conversation you've already created by passing in new values. You cannot change the ID after creation.

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ConversationService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function updateConversationServiceExample() {
        const conversation =  await service.createConversation({
             conversationid: "your-unique-id",
             title: "An updated title"
        })
    }

List available conversations
++++++++++++++++++++++++++++

You can list all the available conversations for your app.

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.ConversationService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function updateConversationServiceExample() {
        const listResponse =  await service.listConversations(); // contains the list of conversations and a cursor.
        const conversationArray = listresponse.conversations; // conversation array is now an object of type Conversation[]
    }


CommentService
~~~~~~~~~~~~~~
You probably don't want to use this service, but instead the CommentingClient which will handle conversation and user state for you.
The comment service manages comments **for a specific conversation**.  You need to set a conversation before using most operations.
To create a CommentService do the following:

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.CommentService({appId: 'your-app-id', apiToken: 'your-api-token'});
    service.setConversation({id: 'yourConverationId'})


Create a comment
++++++++++++++++

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.CommentService({appId: 'your-app-id', apiToken: 'your-api-token'});
    service.setConversation({id: 'yourConverationId'})
    async function createCommentExample() {
        const user = {userid:"a-user-id", handle:"a-user-handle"};
        const comment = await service.createComment('this is my comment', user);
    }


Delete a commment
+++++++++++++++++

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.CommentService({appId: 'your-app-id', apiToken: 'your-api-token'});
    service.setConversation({id: 'yourConverationId'})
    async function deleteCommentExample() {
        const user = {userid:"a-user-id", handle:"a-user-handle"};
        // specify the comment, the user asking for the deletion, and whether or not that deletion is permanent.
        const comment = await service.delete({id: 'a-comment-id'}, user, true);
    }


Comment Moderation Service
~~~~~~~~~~~~~~~~~~~~~~~~~~
The comment moderation service is useful for creating custom moderation UIs.

To create a CommentModerationService do the following:

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.CommentModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function getCommentModerationQueueExample() {
        const queue = service.listCommentsInModerationQueue();
    }

Approve a comment
+++++++++++++++++

Approving a comment makes it available to users in the conversation.

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.CommentModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function approveCommentExample() {
        const queue = service.listCommentsInModerationQueue();
        const queuedComment = queue.comments[0]; // Assumes that the list has at least one comment in it.
        const approvedComment =  await service.approveComment(queuedComment);
    }


Reject a comment
++++++++++++++++

Rejecting a comment makes it unavailable to users in the conversation.

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const service = new sdk.Services.CommentModerationService({appId: 'your-app-id', apiToken: 'your-api-token'});
    async function approveCommentExample() {
        const queue = service.listCommentsInModerationQueue();
        const queuedComment = queue.comments[0]; // Assumes that the list has at least one comment in it.
        const rejectedComment = await service.rejectComment(queuedComment);
    }

