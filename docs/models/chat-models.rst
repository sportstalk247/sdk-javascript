===========
Chat Objects
===========

Chat Event
----------

All new posts and actions are of type ``Event``.

.. code-block:: javascript

    export interface Event {
        roomid: string, // The ID of the room to which the event was sent.
        added?: string, // ISO 8601 timestamp.  Can be sent to set it, otherwise set by server.
        ts: number, // a millisecond level timestamp. Used for evaluating relative times between events. Do not rely on this as a true time value, use added.
        body: string, // Chat text
        active?: boolean,
        moderation?: EventModerationState,
        eventtype: EventType, // speech, purge, etc. Can hold custom types beyond those in the enum. The enum contains only system types.
        userid: string // the ID of the user who created the event.
        user: UserResult // the User object who created the event
        customtype?:string, // a custom type set for the event, or empty string
        customid?:string, // a custom id for the event, or empty string.
        custompayload?:object, // a custom payload added to the event, may be stringified JSON
        replyto?: EventResult | object, // the ID of the event that this event is a reply to
        reactions?:Array<EventReaction> // the reactions that have happened to this event.
        shadowban: boolean
        mutedby: []
        reports?: Array<ReportReason>
    }


EventType
~~~~~~~~~

Every chat event has an ``EventType`` as part of the response.  A chat event's EventType will be used to select the callback function used to handle the event.
The following ``EventType`` values are supported:

.. code-block:: javascript

    export enum EventType  {
        speech = "speech",
        purge= "purge",
        bounce = "bounce",
        reaction= "reaction",
        replace="replace",
        remove="remove",
        roomClosed= "roomclosed",
        roomOpen="roomopen",
        action="action",
        reply="reply", // threaded replies
        quote= "quote",
        ad="ad",
        announcement="announcement",
        custom="custom"
    }

EventReaction
~~~~~~~~~~~~~

.. code-block:: javascript

    export interface EventReaction {
        type: Reaction | string,
        count: number,
        users: UserResult[]
    }

EventModeration Values
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    export enum EventModerationState {
        na = "na", // has not been moderated.
        approved = "approved", // Event was moderated and approved
        rejected = "rejected" // Event was moderated and rejected
    }

Report Reasons
~~~~~~~~~~~~~~

.. code-block:: javascript

    export enum EventModerationState {
        na = "na", // has not been moderated.
        approved = "approved", // Event was moderated and approved
        rejected = "rejected" // Event was moderated and rejected
    }


CustomTypes
-----------

Command Options EventType
~~~~~~~~~~~~~~~~~~~~~~~~~

Most EventTypes are set by the server. However, you can specify a few as part of the CommandOptions

.. code-block:: javascript

    export enum ChatOptionsEventType {
        announcement = "announcement",
        custom = "custom", // indicates use of customEventtype.  Needs to be set to use customttype field
        ad ="ad"
    }


.. code-block:: javascript

    export enum CustomEventTypes {
        "goal" = "goal", // custom type
    }





ChatRoom
________

A chatroom is where chats take place.  Items with ``?`` after them are optional and defaults will be used if omitted.

.. code-block:: javascript

    export interface ChatRoom {
        id?: string, // set by server on creation.
        name:string, //The name of the room
        description?: string, // optional room description
        moderation?: ModerationType, // 'pre' or 'post'
        slug?:string,// The room slug, migrated to customid
        customid?: string,
        enableprofanityfilter?: boolean, //Defaults to true, events in room will have profanity filtered (in English).
        delaymessageseconds?: number, // Delays messages, used for throttling. Defaults to zero and most of the time that's what you will want.
        enableactions?: boolean, // Whether or not users can utilize action commands.
        roomisopen?: boolean, // allows chat
        maxreports?: number, // defaults to 3. The number of flags it takes to add a comment to the moderation queue.
        enableenterAndexit?: boolean, // Whether the room allows people to enter.  This is different than being open.  A room that denies entry can still be open and therefore allow chat by existing room members.
        throttle?: number //(optional) Defaults to 0. This is the number of seconds to delay new incomming messags so that the chat room doesn't scroll messages too fast.
    }

=====================
Configuration Objects
=====================

EventHandlerConfig
------------------
This is the configuration object for the ChatClient and EventService.  It provides a set of callback functions that will be triggered when appropriate events are detected.
If no callback is sent, then ``onChatEvent()`` will be called instead.

Example: if no callback is set for ``onAnnouncement`` then events with the ``announcement`` EventType will be passed to ``onChatEvent()``;

.. code-block:: javascript

    /**
     * Also an optional member of the constructor.
     * Takes a full set of the possible event handlers.
     * Each handler can also be set individually.
     */
    export interface EventHandlerConfig {
        onChatStart?: Function;
        onNetworkResponse?(response: RestApiResult<any>);
        onChatEvent?(event: EventResult), // not mandatory but absolutely should be set in 99% of cases.
        onGoalEvent?(event: EventResult),
        onAdEvent?(event: EventResult),
        onAnnouncement?(event: EventResult),
        onReply?(event: EventResult),
        onReplace?(event: EventResult),
        onRemove?(event: EventResult),
        onReaction?(event:EventResult),
        onPurgeEvent?(event:EventResult),
        onAdminCommand?(response: RestApiResult<Kind.api>),
        onHelp?(result: MessageResult<Event | CommandResponse | null>),
        onNetworkError?(error: Error)
        onRoomChange?(newRoom?:ChatRoom,oldRoom?:ChatRoom)
    }



.. code-block:: javascript

    /**
     * Chat commands.
     */
    export interface CommandOptions {
        eventtype?: ChatCommandEventType,
        customtype?: string,
        customid?: string,
        replyto?: string,
        custompayload?: string,
    }

.. code-block:: javascript

    export interface QuoteCommandOptions extends CommandOptions {
        customfield1?: string,
        customfield2?: string,
        customtags?: string[]
    }

.. code-block:: javascript

    /**
     * Describes the options for the 'advertisement' custom type
     */
    export interface AdvertisementOptions {
        message?: string,
        img: string,
        link: string,
        id?: string,
    }

.. code-block:: javascript
    /**
     * Describes the options for the 'goal' custom type
     */
    export interface GoalOptions {
        score?: object, // An object representing the current score of the game.
        link?: string, // a full URL. How this will be used depends on the chat app implementaiton
        id?: string, // the goal ID, if relevant for your sport or your backend system
        commentary?: string, // A comment body on the goal, e.g. 'Eden executes an incredible kick and scores 1 against Arsenal`
        side?: string, // A string representation of which 'side' the goal is by.  Usage depends on chat implementation.
    }


==================
API Result Objects
==================

ChatRoomResult
--------------

The Model describing the API result of a created room. The key difference between a ChatRoom and a ChatRoomResult objects will always have an ID, whereas ChatRoom objects do not have this guarantee.

.. code-block:: javascript

    export interface ChatRoomResult extends ChatRoom {
        id: string,
        kind?: Kind.room,  // "chat.room" will always be there but is optional for APIs that require a ChatRoomResult
        ownerid?:string,
        appid?: string,
        bouncedusers?: string[], // will be a list of UserID strings.
        added?: string, // ISO Date
        inroom?:number,
        whenmodified?:string // ISO Date
    }


JoinChatRoomResponse
--------------------

This is the response from the JoinRoom API call.

.. code-block:: javascript

    export interface JoinChatRoomResponse {
        user: UserResult,
        room: ChatRoomResult
        eventscursor: ChatUpdatesResult
        previouseventscursor?: string
    }

ChatRoom List Response
----------------------

.. code-block:: javascript

    /**
     * The response for any room listing queries.
     */
    export interface ChatRoomListResponse extends ListResponse {
        kind: Kind.roomlist,
        rooms: Array<ChatRoomResult>,
    }

Event List Response
-------------------

.. code-block:: javascript

    /**
     * The response for any event listing queries.
     */
    export interface EventListResponse extends ListResponse {
        kind: Kind.eventlist,
        events: Array<EventResult>
    }



.. code-block:: javascript

    /**
     * An EventResult is created whenever a chat event is accepted by a server, and represents the event model returned by the API.
     */
    export interface EventResult extends Event {
        kind: Kind.chat, // Sent as part of API validation.  Generally no relevance for clients
        id: string, // The ID of a chat event. Generated by server
        censored: boolean,
        originalbody?: string,
        editedbymoderator: boolean
        whenmodified: string,
    }

.. code-block:: javascript

    /**
     * Result of getting chat updates.
     */
    export interface ChatUpdatesResult {
        kind: Kind.chatlist,
        cursor: string
        more: boolean
        itemcount: number
        room: ChatRoomResult,
        events: EventResult[]
    }

.. code-block:: javascript

    /**
     * EventResult will have eventtype === 'bounce'
     */
    export interface BounceUserResult {
        kind: Kind.bounce,
        event: EventResult,
        room: ChatRoomResult
    }

.. code-block:: javascript

    export interface JoinRoomResponse {
        room: ChatRoom,
        user: User
    }

.. code-block:: typescript

    export interface DeletedChatRoomResponse {
        kind: Kind.deletedroom,
        deletedEventsCount: number,
        room: ChatRoom
    }

.. code-block:: typescript

    export interface CommandResponse {
        kind: Kind.chatcommand,
        op: string,
        room?: ChatRoomResult,
        speech?: EventResult
        action?: any
    }

.. code-block:: javascript

    /**
     * The response messsages for a RoomExit action.
     */
    export enum ChatRoomExitResult {
        success = "Success"
    }
