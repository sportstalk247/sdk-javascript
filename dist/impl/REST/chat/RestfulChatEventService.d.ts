import { AdvertisementOptions, ChatUpdatesResult, CommandOptions, CommandResponse, EventHandlerConfig, EventResult, EventType, GoalOptions, QuoteCommandOptions, EventSearchParams, ChatEventsList, TimestampRequest } from "../../../models/ChatModels";
import { RestApiResult, Reaction, UserTokenRefreshFunction, MessageResult, ErrorResult, ChatClientConfig } from "../../../models/CommonModels";
import { IChatEventService } from "../../../API/chat/IEventService";
import { ChatRoom, ChatRoomResult } from "../../../models/chat/ChatRoom";
import { User, UserResult } from "../../../models/user/User";
import { ReportReason } from "../../../models/Moderation";
/**
 * This class manages polling for chat events and routing those events to the appropriate callbacks.
 * You probably do not want this class, you want the ChatClient.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export declare class RestfulChatEventService implements IChatEventService {
    private _config;
    private _polling;
    private _apiHeaders;
    private _jsonHeaders;
    private _fetching;
    private _currentRoom;
    private _updatesApi;
    private _eventHandlers;
    private _roomApi;
    private _commandApi;
    private _ignoreList;
    private _smoothEventUpdates;
    private _tokenExp;
    private request;
    private _user;
    private lastTimestamp;
    private lastCursor;
    private oldestCursor;
    private lastMessageId;
    private firstMessageId;
    private firstMessageTime;
    _keepAliveFunction: Function;
    _keepAliveInterval: any;
    private _maxEventsPerUpdateLimit;
    private _maxEventBufferSize;
    private NetworkRequest;
    /**
     * How often to poll for updates. can be set by ENV variable of SPORTSTALK_POLL_FREQUENCY on the server side.
     * Can also be set with setUpdateSpeed()
     * @private
     */
    private _pollFrequency;
    /**
     * Only used if event smoothing is enabled.
     * Keeps a list of messages we already rendered so we can ignore them in getUpdates
     * @private
     */
    private _preRenderedMessages;
    /**
     * Only used if event smoothing is enabled;
     * @private
     */
    private _eventSpacingMs;
    /**
     * @param config The SportsTalkConfig object
     * @param eventHandlers A set of event handlers that will deal with chat events received from polling.
     * @constructor
     */
    constructor(config: ChatClientConfig, eventHandlers?: EventHandlerConfig);
    /**
     * Manually set the cursor used to grab new updates.
     * You may want to use this and setPreviousEventsCursor if you are scrolling through a large number of messages
     * and wish to limit the number of events somehow to improve UI responsiveness.
     * @param cursor
     */
    setUpdatesCursor: (cursor: string) => void;
    /**
     * Manually set the cursor holding the oldest event known, for scrollback.
     * You may need to use this if you scroll back a lot
     * @param cursor
     */
    setPreviousEventsCursor: (cursor: string) => void;
    /**
     * Set event handler callbacks
     * @param eventHandlers
     */
    setEventHandlers: (eventHandlers: EventHandlerConfig) => void;
    /**
     * Get current event handler callback functions
     */
    getEventHandlers: () => EventHandlerConfig;
    /**
     * Set the user
     * @param user
     */
    setUser: (user: User) => void;
    getTokenExp: () => number;
    /**
     * Get the user
     * @return User
     */
    getCurrentUser: () => User;
    setUserToken: (token: string) => void;
    getUserToken: () => Promise<string>;
    setUserTokenRefreshFunction: (refreshFunction: UserTokenRefreshFunction) => void;
    refreshUserToken: () => Promise<string>;
    /**
     * Set the config
     * @param config
     */
    setConfig: (config: ChatClientConfig) => void;
    /**
     * Set event smoothing directly.
     * @param smoothing
     */
    setEventSmoothingMs: (smoothing: number) => void;
    _getKeepAlive: () => Function;
    /**
     * Kills previous keep-alive api calls and creates a new keep alive request function
     * @param roomid
     * @param userid
     */
    _resetKeepAlive: (roomid: any, userid: any) => void;
    /**
     *
     * @param roomid
     * @param userid
     */
    _startKeepAlive: (roomid: any, userid: any) => void;
    /**
     * Ends keepAlive.
     */
    _endKeepAlive: () => void;
    /**
     * Get current room, if set.
     * @return ChatRoomResult
     */
    getCurrentRoom: () => ChatRoomResult | null;
    /**
     * Set current room, reset chat polling if a new room.
     * Will trigger onRoomChange() if new and old rooms are different
     * @param room
     * @return ChatRoomResult or null
     */
    setCurrentRoom: (room: ChatRoomResult) => ChatRoom | null;
    /**
     * Set how often we poll for events, defaults to 800ms
     * @param frequency poll frequency in milliseconds
     */
    setUpdateSpeed: (frequency: number) => void;
    /**
     * Start the chat polling
     */
    startEventUpdates: (updatesLimit?: number | undefined) => void;
    /**
     * Fetch updates and trigger callbacks.  Exposed as public for debug and forced manual re-polling, if needed.
     * However, marked with a starting underscore to emphasize that you are probably doing something wrong if you need this for
     * non-debug reasons.
     */
    _fetchUpdatesAndTriggerCallbacks: () => Promise<void>;
    /**
     * Stop event polling
     */
    stopEventUpdates: () => void;
    /**
     * Get the latest events.
     */
    getUpdates: (cursor?: string, limit?: number) => Promise<ChatUpdatesResult>;
    private _handleUpdate;
    /**
     * Used if message smoothing is enabled.
     * Spaces out the events so that we see a stream instead of an huge change all at once.
     * @param event
     * @param index
     */
    private _spacedUpdate;
    /**
     * Route the updates to appropriate handers.
     * @param update
     * @private
     */
    handleUpdates: (update: ChatEventsList) => Promise<void>;
    /**
     * ROOM COMMANDS SECTION
     */
    /**
     * Evaluate admin commands
     * @param command
     * @param response
     * @private
     */
    private _evaluateCommandResponse;
    /**
     * Send a chat command
     * @param command
     * @param options
     */
    executeChatCommand: (user: User, command: string, options?: CommandOptions | undefined) => Promise<MessageResult<CommandResponse> | ErrorResult>;
    /**
     * Send a reply to a chat event.
     * @param user
     * @param message
     * @param replyto
     * @param options
     */
    sendThreadedReply: (user: User, message: string, replyto: EventResult | string, options?: CommandOptions | undefined) => Promise<MessageResult<EventResult>>;
    /**
     * Send a quoted reply to a chat event.
     * @param user
     * @param message
     * @param replyto
     * @param options
     */
    sendQuotedReply: (user: User, message: string, replyto: EventResult | string, options?: QuoteCommandOptions | undefined) => Promise<MessageResult<EventResult>>;
    /**
     * Report an event for breaking community rules
     * @param event
     * @param reason
     */
    reportMessage: (event: EventResult | string, reason: ReportReason) => Promise<RestApiResult<null>>;
    /**
     * Send a reaction
     * @param user
     * @param reaction
     * @param reactToMessage
     * @param options
     */
    reactToEvent: (user: User, reaction: Reaction, reactToMessage: EventResult | string, options?: CommandOptions | undefined) => Promise<MessageResult<CommandResponse>>;
    /**
     * Send an advertisement event, using SportsTalk custom events.
     * @param user
     * @param options
     */
    sendAdvertisement: (user: User, options: AdvertisementOptions) => Promise<MessageResult<CommandResponse>>;
    /**
     * Send a goal event.
     * @param user
     * @param img
     * @param message
     * @param options
     */
    sendGoal: (user: User, img: string, message?: string | undefined, options?: GoalOptions | undefined) => Promise<MessageResult<CommandResponse>>;
    /**
     * Removes an event from the server.  This cannot be reversed.  This can leave some content orphaned if there are replies.
     * Typically, you should use the `flagEventLogicallyDeleted` method instead, with `permanentIfNoReplies` set to `true`
     * @param user
     * @param event
     */
    permanetlyDeleteEvent: (user: UserResult | string, event: EventResult | string) => Promise<RestApiResult<null>>;
    /**
     * Flags an event as deleted so it is not sent in updates or scrollback, however the content is kept on the server.
     * @param user
     * @param event
     * @param permanentIfNoReplies if true, this becomes a permanent delete if there are no replies.
     */
    flagEventLogicallyDeleted: (user: UserResult | string, event: EventResult | string, permanentIfNoReplies?: boolean) => Promise<RestApiResult<null>>;
    /**
     * Lists events going backwards in time.
     * @param cursor
     * @param limit
     */
    listPreviousEvents: (cursor?: string, limit?: number) => Promise<ChatUpdatesResult>;
    /**
     * This is used for bulk export.  Typically not used in real-time application
     * This will return all events regardless of active/inactive status.
     * @param cursor
     * @param limit
     */
    listEventsHistory: (cursor?: string, limit?: number) => Promise<ChatUpdatesResult>;
    searchEventHistory: (params: EventSearchParams) => Promise<ChatEventsList>;
    listEventsByType: (type: EventType) => Promise<ChatEventsList>;
    updateChatEvent: (event: EventResult | string, body: string, user?: string | User | undefined) => Promise<EventResult>;
    listEventsByTimestamp: (query: TimestampRequest) => Promise<ChatEventsList>;
}
