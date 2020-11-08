=============================
Sportstalk 247 Javascript SDK
=============================
My using this SDK you agree to the license located in LICENSE.md

STATUS: STABLE BETA
This SDK is used in production successfully and is considered stable.  At the same time, the SDK is under active development and improvement. We are also very open to feedback if you experience pain points while using the SDK.

.. toctree::
   :maxdepth: 2

   /js-sdk.rst

   :caption: Data Models
   /chat/models/chat-models.rst

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
        endpoint: 'custom-endpoint' // OPTIONAL Use this to set a proxy on the web, or if you have an on-prem install of sportstalk at a custom location.
    }


If you are using a proxy, the only mandatory data for a SportstalkConfig object is the `appId` and `endpoint`. Otherwise you will need to provide the `appId` and `apiToken`

Creating Client Objects
-----------------------

Using Typescript (recommended)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
~~~~~~~~~~~~~

You can use require as well.

.. code-block:: javascript
  
    const sdk = require('sportstalk-sdk');
    const commentClient = sdk.CommentClient.init({appId..., apiToken...});
    const chatClient = sdk.ChatClient.init(({appId..., apiToken...});


You will need to register with SportsTalk and get an API Key in order to use sportstalk functions.


Using the SDK on the Web
------------------------
To use directly, we host the web SDK on our website.

* Latest version: https://www.sportstalk247.com/dist/sdk/latest/web-sdk.js
* Latest minified version: https://www.sportstalk247.com/dist/sdk/latest/web-sdk.min.js
 
You can also look inside the Sportstalk package at `/dist/web-sdk.js` or use the minified version at `/dist/web-sdk.min.js`


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

===================
Copyright & License
===================

Copyright (c) 2020 Sportstalk247
