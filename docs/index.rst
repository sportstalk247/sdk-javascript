=============================
Sportstalk 247 Javascript SDK
=============================
My using this SDK you agree to the license located in LICENSE.md

.. autoclass::
.. autofunction::
.. autoexception::

.. toctree::
    :hidden:
    :maxdepth: 1

    chat-api
    comments-api
    services

    :caption: Common Objects
    /models/common-models
    :caption: Chat Objects
    /models/chat-models
    :caption: Comment Objects




===================================
GETTING STARTED: Setting up the SDK
===================================

Install via NPM
---------------
  ``npm install sportstalk-sdk --save``


App Id and api Tokens
---------------------
Clients and services require a SportsTalkConfig object, which looks like so:

.. code-block:: javascript
  
    {
        appId: 'yourappID-from-the-dashboard',
        apiToken: 'yourApiToken-from-the-dashboard', // NOTE: you should use a proxy to hide your token and restrict behavior to specific domains on the web.
        userToken: 'user-specific-jwt', // OPTIONAL: this JWT must be generated using a shared secret on your server. It provides a higher level of security.
        endpoint: 'custom-endpoint' // OPTIONAL Use this to set a proxy on the web, or if you have an on-prem install of sportstalk at a custom location.
        userTokenRefreshFunction: 'http://your-refresh-endpoint' // OPTIONAL used to refresh a user token if it's going to expire.
    }


If you are using a proxy, the only mandatory data for a SportstalkConfig object is the `appId` and `endpoint`. Otherwise you will need to provide the `appId` and `apiToken`
We generally suggest creating a userToken JWT containing the `userid` with your SHARED_SECRET.  If you provide a userToken, you may also provide a refresh function. The SDK will call this function with the JWT as an argument if the userToken is within 10 seconds of expiration (with exp claim), in order to refresh the JWT.
Using userToken JWT and refresh functionis the most secure way of integrating with SportsTalk 24/7.

Using the SDK on the Web
------------------------
To use directly, pull directly from our Gitlab.

* Latest version: https://www.sportstalk247.com/dist/sdk/latest/web-sdk.js
* Latest minified version: https://www.sportstalk247.com/dist/sdk/latest/web-sdk.min.js

You can also look inside the Sportstalk package at `/dist/web-sdk.js` or use the minified version at `/dist/web-sdk.min.js`

=====================
Source Documentation
=====================

The Sportstalk SDK is open source with substantial comments.
You can see everything here: https://gitlab.com/sportstalk247/sdk-javascript/-/tree/master/src


=======================
Creating Client Objects
=======================

Using Typescript (recommended)
------------------------------

If you are using typescript, we provide typescript definitions for all objects.  It's as simple as:

Commenting Client
+++++++++++++++++

.. code-block:: javascript
  
    import { CommentClient } from 'sportstalk-sdk'
    const commentClient = CommentClient.init({appId: ... , apiToken: ....});

Chat Client
+++++++++++

.. code-block:: javascript
  
    import { ChatClient } from 'sportstalk-sdk'
    const chatClient = ChatClient.init({appId: ... , apiToken: ....});

 
 
Using require
-------------

You can use require as well.

.. code-block:: javascript
  
    const sdk = require('sportstalk-sdk');
    const commentClient = sdk.CommentClient.init({appId..., apiToken...});
    const chatClient = sdk.ChatClient.init(({appId..., apiToken...});


You will need to register with SportsTalk and get an API Key in order to use sportstalk functions.


A Note on Promises
------------------
Almost all SDK functions require communication with a server.  Therefore, most methods will return a Promise.  Promises are very common but you need to be familiar with them to use the SportStalk SDK.

Here are some ways that you can use promises.

.. code-block:: javascript
  
    commentsClient.listConversations()
        .then(function(response) {
          const conversations = response.conversations;
          // handle UI functions here.
        }).catch(function(e){
          // catch an error and handle it here.
        })


You can also use comments in async/await blocks (preferred).  

.. code-block:: javascript
  
    async function yourFunction() {
        const response = await commentsClient.listConversations();
        const conversations = response.conversations;
        // handle ui using conversations here.
    }


For more reading, please see this article: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

A note on Typescript
--------------------

The SDK is written in Typescript which provides type checking and the ability to declare and describe objects similar to typed languages such as Java.
This is very helpful when describing parameters or models because you can reference all the possible members of an object ahead of time.

You **do not** need to write your project in typescript to use this SDK.  This SDK provides full JS compatibility and most examples are shown in standard JS (Node).
However, understanding basic typescript notation is still helpful for understanding the data models returned by the API.

There is a 5 min primer on typescript and you can get started with typescript here: https://www.typescriptlang.org/docs/home.html


=====================
Understanding the SDK
=====================

Key concepts
------------
``CHAT``: This is a real-time experience designed to make a user feel like other people are present with that person.  The state of a chat room updates in real time, and you receive notifications that update the state.  In general, chat content is disposable: It is enjoyed in the moment but in the future its rare for people to go back and look at past conversation information. Chat messages are also often short and don’t necessarily add a thought to the conversation. Chat drives engagement in the moment by keeping your attention and is best used with live events because its no fun to be in a chat room by yourself.

``ROOM``: A chat “room” is a virtual space in which people can chat.  Events occur in the room, such as a person entering the room, saying something, or exiting the room.  If a user reacts to something by liking it, this also generates an event.  The SDK listens for new events, processes events, raises call backs for you, and updates the state of the room in memory, so it’s less work for the developer.

``COMMENTS``: A comment is something you post on an article or video or other context.  Unlike chat, comments are often read long after they are posted, and are more likely to be longer messages that contain a more thoughtful point. They are intended to add to the value of the thing on which the comment appears. Use comments when you don’t real time responses, people will see your comment later.

``CONVERSATION``: This is a commenting context, such as an article or video that people are commenting on. Comments are created within the context of a conversation.

Chats belong to Rooms and Comments belong in Conversations

Client Objects
--------------
The SDK is broken up into 2 Clients and a set of backing services.
For most user-facing operations you'll want one of the clients:

Chat Client
~~~~~~~~~~~

.. code-block:: javascript

    const chatClient = require('sportstalk-sdk').ChatClient.init({appId, apiToken});

Commenting Client
~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    const commentClient = require('sportstalk-sdk').CommentClient.init({appId, apiToken});

These clients handle most common operation while hiding the backing APIs and simplifying some operations and will manage state for you.

However, you may want to use the APIs directly, in which case there are a set of backing REST services that you can use:
