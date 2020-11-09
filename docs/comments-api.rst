==============
Commenting API
==============

Comment Client
-----------------

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
