=============
Global Models
=============

Global models are object definitions used across Sportstalk services.  For instance, our ``User`` definition is shared across Commenting, Chat, and Match Commentary Features.

Lists
-----

.. _target ListResponse:
List Response
~~~~~~~~~~~~~

Many API methods return lists of objects.  For instance, lists of rooms or users.  All of these API responses have the same general structure, the ``ListResponse``.
Many models inherit from ``ListResponse``, e.g. ``UserListResponse``.

.. code-block:: typescript

    export interface ListResponse {
        cursor?: string,
        more?: boolean
        itemcount?: number
    }

List Request
~~~~~~~~~~~~

List APIs use cursoring.  A List request provides the ``cursor`` and the ``limit`` to control the result set.

.. code-block:: typescript

    interface ListRequest {
        cursor?: string, // should be a cursor value supplied by API.
        limit?: number // must be an integer
    }

User Models
-----------

 A User is someone able to chat in chatrooms and make comments in conversations.
 Users must be created before they can make comments or chat, and they must choice a chat room before they can participate.

.. _User:

User
~~~~

.. code-block:: typescript

    interface User {
        userid: string, // Unique ID, defined by client application to use native IDs.
        handle: string, // Allowed Characters:  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_"
        handlelowercase?: string, // an all lowercase version of the handle
        displayname?: string, // A friendly display name.  E.g. a user has a handle "jjsmithyperson" and their display name "John J. Smith"
        pictureurl?: string, // a full URL to a profile photo.
        profileurl?: string, // a full URL to a profile url or personal webpage.
        banned?: boolean // Only set by the server.  If true the user is currently banned.
    }

User Search Data
~~~~~~~~~~~~~~~~

.. code-block:: typescript

    /**
     * Used only for searching users by API.
     */
    export enum UserSearchType {
        handle = 'handle',
        name = 'name',
        userid = 'userid'
    }

User Lists
~~~~~~~~~~
Any API which produces a list of users will take the form of a ``UserListResponse``

.. code-block:: typescript

    interface UserListResponse extends ListResponse {
        kind: Kind.userlist
        users: UserResult[]
    }

User Deletion
~~~~~~~~~~~~~

API responses to User Deletion will wrap a ``UserDeletionResponse``

.. code-block:: typescript

    interface UserDeletionResponse {
        user: UserResult,
        kind: Kind.deleteduser
    }

.. _ClientConfig:
.. _SportsTalkConfig:


Configuration Models
--------------------


Client Configuration
~~~~~~~~~~~~~~~~~~~~

All Sportstalk Client and Services objects accept a ClientConfig or subclass to connect with Sportstalk247

.. code-block:: typescript
    export interface ClientConfig {
        appId?: string,
        apiToken?: string,
        endpoint?: string,
    }

It's also possible to set a default User as part of a ClientConfig for most services.  Services which do not need a user will ignore this data.

.. code-block:: typescript

    interface SportsTalkConfig extends ClientConfig {
        user?: User,
    }


API Objects
-----------

Message Result
~~~~~~~~~~~~~~

General structure describing responses from the API server

.. code-block:: typescript

    interface MessageResult<T> {
        message: string, // "Success"
        errors: object,
        data: T
    }

Rest Api Result
~~~~~~~~~~~~~~~

RestApiResults extend MessageResult and are the form of all API responses from the Rest server.
In the future Sportstalk may use other connection methods than REST.

.. code-block:: typescript

    interface RestApiResult<T> extends MessageResult<T> {
        kind: Kind.api,
        code: number,  //e.g. 200, 400
    }

Kind
~~~~

Many objects have a ``kind`` property.  This can be used to identify the model to be used in JSON adaptations in different langauges.
Below is the enumeration of possible values of the ``kind`` property across sportstalk services

.. code-block:: typescript

    export enum Kind {
        chat = "chat.event",
        room = "chat.room",
        bounce = "chat.bounceuser",
        user = "app.user",
        api = "api.result",
        webhook = "webhook.webhook",
        webhooklogs = "list.webhook.logentries",
        webhookcommentpayload = "webhook.payload.comment",
        chatcommand = "chat.executecommand",
        conversation = "comment.conversation",
        deletedconversation = "delete.conversation",
        comment = "comment.comment",
        deletedcomment ="delete.comment",
        deletedroom = "deleted.room",
        deleteduser = "deleted.appuser",
        conversationlist = "list.commentconversations",
        chatlist = "list.chatevents",
        eventlist = "list.events",
        roomlist = "list.chatrooms",
        userlist = "list.users",
        repliesbyparentidlist = "list.repliesbyparentid",
        commentreplygrouplist = "list.commentreplygroup"
    }


Moderation
----------


.. code-block:: typescript

    export enum ReportType {
        abuse = 'abuse'
    }

.. code-block:: typescript
    export interface ReportReason {
        reporttype?: ReportType
        reason?: ReportType,
        userid: string
    }


Webhook Models
--------------

Webhook
~~~~~~~

.. code-block:: typescript

    interface Webhook {
        id?: string,
        kind?: Kind.webhook,
        label: string,
        url: string,
        enabled: boolean,
        type: WebhookType,
        events: WebhookEvent[]
    }


Webhook Type
~~~~~~~~~~~~

.. code-block:: typescript

    enum WebhookType {
        prepublish = "prepublish",
        postpublish = "postpublish"
    }

Webhook Event
~~~~~~~~~~~~~

.. code-block:: typescript

    enum WebhookEvent {
        chatspeech = "chatspeech",
        chatcustom = "chatcustom",
        chatreply = "chatreply",
        chatreaction = "chatreaction",
        chataction = "chataction",
        chatenter = "chatenter",
        chatexit = "chatexit",
        chatquote = "chatquote",
        chatroomopened = "chatroomopened",
        chatroomclosed = "chatroomclosed",
        chatpurge = "chatpurge",
        commentspeech = "commentspeech",
        commentreaction = "commentreaction",
        commentconversationreaction = "commentconversationreaction",
        commentreply = 'commentreply'
    }

Webhook List
~~~~~~~~~~~~

.. code-block:: typescript
    interface WebhookListResponse extends ListResponse {
        webhooks: Webhook[]
    }

Webhook Payload
~~~~~~~~~~~~~~~

Different types of webhooks send different payloads. This is the general structure all payloads inherit from.

.. code-block:: typescript

    export interface WebhookPayload {
        "kind": Kind.webhookcommentpayload,
        "appid": string,
    }

Webhook Comment Payload
~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: typescript
    export interface WebhookCommentPayload extends WebhookPayload {
        conversationid: string,
        commentid: string
        comment: Comment
    }

Webhook Logs
~~~~~~~~~~~~

All webhook actions produce ``WebhookLog`` items.

.. code-block:: typescript

    interface WebhookLog {
        id: string,
        appid: string,
        added: string,
        ellapsedtimems: number,
        type: WebhookType,
        eventtype: WebhookEvent, // Move to common models
        webhook: Webhook,
        completedrequest: boolean,
        statuscode: WebStatusCode,
        status: WebStatusString,
        payload: Comment
    }

An API response will return a list of these logs:

.. code-block:: typescript

    interface WebhookLogResponse extends ListResponse {
        logentries: Array<WebhookLog>
    }


Other Models
------------

.. code-block:: typescript

    export interface ISO8601DATE {

    }

.. code-block:: typescript

    export enum Reaction {
        like = 'like'
    }

.. code-block:: typescript

    export enum WebStatusCode {
        OK = 200,
        NOT_FOUND = 404,
        SERVER_ERROR= 500
    }

.. code-block:: typescript

    export enum WebStatusString {
        OK = "OK",
    }


.. code-block:: typescript

    export enum ModerationType {
        pre = "pre",
        post = "post"
    }

.. code-block:: typescript

    export interface ApiHeaders {
        'Content-Type'?: string,
        'x-api-token'?: string
    }