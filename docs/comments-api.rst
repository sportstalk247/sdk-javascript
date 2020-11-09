==================
Comment Client API
==================

Getting Started
---------------
If you are looking to build a custom conversation, you will the need the `CommentClient`, which you can get by:

**Typescript imports:**

.. code-block:: typescript

    import { CommentClient } from 'sportstalk-sdk'
    const commentClient = CommentClient.init({appId:..., apiToken:...});

**Using Require:**

.. code-block:: javascript

    const sdk =  require('sportstalk-sdk')
    const commentClient = sdk.CommentClient.init({appId:..., apiToken:...});


Creating a user
---------------
One of the first things you might need to do in Sportstalk is init a :ref:`user`. Users are shared between chat and commenting in the same application.
To create a user, you can use either the chat or comment clients, or a UserService (advanced).

.. code-block:: javascript

    const commentClient = sdk.CommentClient.init({...});
    commentClient.createOrUpdateUser({userid: "definedByYourSystem-MustBeUnique", handle: "Must-Be-Unique-String"})
        .then(function(user) {
            // user has been created.
        }).catch(function(error) {
            // make sure to catch and handle errors.
            // It is possible to have network or settings errors.
            // For instance if you do not set a unique handle you will get an error.
        })


Finding and joining a conversation
----------------------------------
Most users will want to just find and join a conversation created by an admin in the sportstalk dashboard.

To list conversations, use the `listConversations()` method of the CommentsClient, like so:

.. code-block:: javascript

    const response = commentClient.listsConversations();
    const conversations = response.conversations; // Array of Conversation objects
    const cursor = response.cursor; // used for scrolling through long lists of conversations.


Powering your UI with this data is up to you, but you might do something like so (in pug template format):

.. code-block:: pug

    h3 Conversations
    ul
      each conversation in conversations
        li= conversation.title
          span.id= conversation.id


To join a conversation, you will need a user, please see the section above about creating a user first.
Once you have a user, joining a conversation is simple:

.. code-block:: javascript

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


Comment Client
--------------

Creating a CommentClient
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const commentClient = sdk.CommentClient.init({appId, apiToken});



setConfig()
~~~~~~~~~~~

Updates the client configuration. Usually you should just create a new client.

.. code-block:: javascript

    commentClient.setConfig({appId: 'newAppId', apiToken: 'newApiToken', endpoint: 'https://www.yourproxy.server'});




getConfig(): SportsTalkConfig
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Returns the current configuration object

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const client = sdk.CommentClient.init({ appId: 'yourappid', apiToken: token});
    const config = client.getConfig();
    // config will hold { appId: 'yourappid', apiToken: token, endpoint: 'https://api.sportstalk247.com/api/v3' }


createConversation (conversation: Conversation, setDefault: boolean)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

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


Create a new conversation that others can join and add comments.


createOrUpdateUser (user: User, setDefault?:boolean): Promise(User)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Create a new user or update an existing one.   You need a user to be set for some operations.
By default, setDefault is TRUE, meaning that if you create or update a user, that will be the user used for commenting.

.. code-block:: javascript

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


setCurrentConversation(conversation)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Set the current conversation for commenting.
The parameter can either be a conversation object or just a conversation ID.

You can see the Conversation and Comments models in this file:
https://gitlab.com/sportstalk247/sdk-javascript/-/blob/master/src/models/CommentsModels.ts

.. code-block:: javascript

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


getCurrentConversation(): Conversation | null | undefined
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Gets the current conversation.  Will be null or undefined if there is no current conversation.

.. code-block:: javascript

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



getConversation(conversation: Conversation | string): Promise<Conversation>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Retrieves data about a specific conversation from the server.

.. code-block:: javascript

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


deleteConversation(conversation: Conversation | string)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Deletes a conversation

.. code-block:: javascript

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


makeComment(comment: string, replyto?: Comment | string)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Make a comment on the current conversation. Will throw an error if a conversation is not set.

.. code-block:: javascript

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


getComment(comment: Comment | string): Promise<Comment | null>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Retrieves a specific comment. The param can either be a comment object with an id or just the id.

.. code-block:: javascript

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


deleteComment(comment:Comment | string, final: boolean): Promise<CommentDeletionResponse>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Deletes a comment

updateComment(comment:Comment)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Updates a comment

reactToComment(comment:Comment | string, reaction:Reaction)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Reacts to a comment

voteOnComment(comment:Comment | string, vote:Vote)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Vote a comment up or down

reportComment(comment:Comment | string, reportType: ReportType)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Report a comment for violating community rules.

getCommentReplies(comment:Comment, request?: CommentRequest)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Get replies to a comment

getComments(request?: CommentRequest, conversation?: Conversation)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Gets the latest comments for the default conversation.

listConversations(filter?: ConversationRequest)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

List conversations that are available to comment.
