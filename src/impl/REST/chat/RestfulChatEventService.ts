import {
    AdvertisementOptions,
    ChatUpdatesResult,
    CommandOptions,
    CommandResponse,
    EventHandlerConfig,
    EventResult,
    EventType,
    GoalOptions,
    QuoteCommandOptions,
    CustomEventTypes,
    ChatOptionsEventType,
    EventSearchParams, ChatEventsList, TimestampRequest, ChatEventsListResult
} from "../../../models/ChatModels";
import {DEFAULT_CONFIG, DELETE, GET, POST, PUT} from "../../constants/api";
import {buildAPI, forceObjKeyOrString, getJSONHeaders, getUrlEncodedHeaders} from "../../utils";
import {SettingsError} from "../../errors";
import {NO_HANDLER_SET, NO_ROOM_SET, REQUIRE_ROOM_ID, THROTTLE_ERROR} from "../../constants/messages";
import {stRequest, NetworkRequest, bindJWTUpdates} from '../../network'
import {
    RestApiResult,
    Reaction,
    SportsTalkConfig,
    UserTokenRefreshFunction,
    MessageResult, ErrorResult, ChatClientConfig
} from "../../../models/CommonModels";
import {AxiosRequestConfig} from "axios";
import {IChatEventService} from "../../../API/chat/IEventService";
import {ChatRoom, ChatRoomResult} from "../../../models/chat/ChatRoom";
import {User, UserResult} from "../../../models/user/User";
import {ReportReason, ReportType} from "../../../models/Moderation";
const INVALID_POLL_FREQUENCY = "Invalid poll _pollFrequency.  Must be between 250ms and 5000ms"

/**
 * This class manages polling for chat events and routing those events to the appropriate callbacks.
 * You probably do not want this class, you want the ChatClient.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export class RestfulChatEventService implements IChatEventService {
    private _lastCommand: string | null = null;
    private _lastCommandTime: number = 0;
    private _lastCommandTimeoutDuration = 3000;
    private _config: ChatClientConfig = {appId: ""};
    private _polling: any; // holds the timer reference.
    private _apiHeaders = {} // holds the API headers
    private _jsonHeaders = {}
    private _fetching: boolean = false; // used to prevent a queue of requests if network is down.
    private _currentRoom: ChatRoomResult; // holds the current chat room.
    private _updatesApi: string; // caches the string computation of the updates API path.
    private _eventHandlers:EventHandlerConfig = {} // holds the event handler function references.
    // api endpoints
    private _roomApi: string | null; // holds the string of the room path
    private _commandApi: string; // holds the string of the chat command path.
    // Holds a set of ignored userIDs.
    private _ignoreList: Set<string> = new Set();
    private _smoothEventUpdates: boolean;
    private _tokenExp: number;
    private request: NetworkRequest = bindJWTUpdates(this);

    private _user: User = {userid: "", handle: ""}; // current user.

    // poll management
    private lastTimestamp:number | undefined; // timestamp
    private lastCursor: string | undefined = undefined; //holds the cursor for the most recent message received in current room
    // for scrollback
    private oldestCursor: string | undefined = undefined; // holds the oldest cursor known
    private lastMessageId:string | undefined; // holds the ID of the lasts received event
    private firstMessageId:string | undefined;
    private firstMessageTime: number | undefined;

    // Maintain room connection.
    _keepAliveFunction: Function;
    _keepAliveInterval;
    _keepAliveTimeInterval = 10000;

    // Holds the size of the updates we we will request.
    private _maxEventsPerUpdateLimit:number = 100;

    // Holds the size of the event buffer we will accept before displaying everything in order to catch up.
    private _maxEventBufferSize:number = 30;
    private NetworkRequest:NetworkRequest = bindJWTUpdates(this);
    /**
     * How often to poll for updates. can be set by ENV variable of SPORTSTALK_POLL_FREQUENCY on the server side.
     * Can also be set with setUpdateSpeed()
     * @private
     */
    private _pollFrequency: number =  800;

    /**
     * Only used if event smoothing is enabled.
     * Keeps a list of messages we already rendered so we can ignore them in getUpdates
     * @private
     */
    private _preRenderedMessages: Set<string>= new Set<string>();
    /**
     * Only used if event smoothing is enabled;
     * @private
     */
    private _eventSpacingMs: number = 100;

    /**
     * @param config The SportsTalkConfig object
     * @param eventHandlers A set of event handlers that will deal with chat events received from polling.
     * @constructor
     */
    constructor(config: ChatClientConfig, eventHandlers: EventHandlerConfig = {}) {
        this.setConfig(config);
        this.setEventHandlers(eventHandlers);
        
    }

    /**
     * Manually set the cursor used to grab new updates.
     * You may want to use this and setPreviousEventsCursor if you are scrolling through a large number of messages
     * and wish to limit the number of events somehow to improve UI responsiveness.
     * @param cursor
     */
    setUpdatesCursor = (cursor: string) => {
        this.lastCursor = cursor || '';
    }

    /**
     * Manually set the cursor holding the oldest event known, for scrollback.
     * You may need to use this if you scroll back a lot
     * @param cursor
     */
    setPreviousEventsCursor = (cursor:string) =>{
        this.oldestCursor = cursor || '';
    }

    /**
     * Set event handler callbacks
     * @param eventHandlers
     */
    setEventHandlers = (eventHandlers: EventHandlerConfig) => {
        this._eventHandlers = eventHandlers;
    }

    /**
     * Get current event handler callback functions
     */
    getEventHandlers = (): EventHandlerConfig => {
        return this._eventHandlers || {};
    }

    /**
     * Set the user
     * @param user
     */
    setUser = (user: User) => {
        if(!user) {
            throw new Error("Must set a user");
        }
        this._config.user = Object.assign(this._user, user);
        this._user = this._config.user;
    }

    getTokenExp = ()=>{
        return this._tokenExp;
    }

    /**
     * Get the user
     * @return User
     */
    getCurrentUser = () => {
        return this._user;
    }

    setUserToken = (token:string) => {
        this._config.userToken = token;
        this.setConfig(this._config);
    }

    getUserToken = async () => {
        return this._config.userToken || "";
    }

    setUserTokenRefreshFunction = (refreshFunction:UserTokenRefreshFunction) => {
        this._config.userTokenRefreshFunction=refreshFunction;
    }

    refreshUserToken = async (): Promise<string> => {
        if(!this._config.userToken) {
            throw new Error('You must set a user token before you can refresh it.  Also ensure that you set a refresh function');
        }
        if(!this._config.userTokenRefreshFunction) {
            throw new Error('You must set a refresh function in order to refresh a userToken. Also ensure that the user token JWT is properly set.')
        }
        const newToken = await this._config.userTokenRefreshFunction(this._config.userToken);
        this.setUserToken(newToken);
        return newToken;
    }

    /**
     * Set the config
     * @param config
     */
    setConfig = (config:ChatClientConfig) => {
        this._config = Object.assign({}, DEFAULT_CONFIG, config);
        this._user = Object.assign({}, this._user, this._config.user);
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken, this._config.userToken);
        this._jsonHeaders = getJSONHeaders(this._config.apiToken, this._config.userToken);
        this._smoothEventUpdates = !!(this._config.smoothEventUpdates || this._smoothEventUpdates);
        this._maxEventBufferSize = this._config.maxEventBufferSize || this._maxEventBufferSize;
        try {
            const frequency  = process.env.SPORTSTALK_POLL_FREQUENCY ? parseInt(process.env.SPORTSTALK_POLL_FREQUENCY): 800;
            this._pollFrequency = frequency
        } catch (e) {
            console.log(e);
            this._pollFrequency = config.chatEventPollFrequency || 800;
        }
        this._eventSpacingMs = config.updateEmitFrequency || Math.floor(this._pollFrequency/100)
    }

    /**
     * Set event smoothing directly.
     * @param smoothing
     */
    setEventSmoothingMs = (smoothing: number) => {
        if(smoothing && typeof smoothing === "number") {
            this._eventSpacingMs = smoothing
        }
    }

    _getKeepAlive = () => {
        return this._keepAliveFunction
    }
    /**
     * Kills previous keep-alive api calls and creates a new keep alive request function
     * @param roomid
     * @param userid
     */
    _resetKeepAlive = (roomid, userid) => {
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `chat/rooms/${roomid}/sessions/${userid}/touch`),
            headers: this._jsonHeaders
        }
        this._keepAliveFunction = () => {
            const touch = stRequest(config);
            if(this._eventHandlers.onTouch) {
                this._eventHandlers.onTouch(touch);
            }
            return touch;
        }
        this._endKeepAlive();
    }
    /**
     *
     * @param roomid
     * @param userid
     */
    _startKeepAlive = (roomid, userid) => {
        this._resetKeepAlive(roomid, userid);
        this._keepAliveInterval = setInterval(this._keepAliveFunction, this._keepAliveTimeInterval);
    }

    /**
     * Ends keepAlive.
     */
    _endKeepAlive = () => {
        if(this._keepAliveInterval) {
            clearInterval(this._keepAliveInterval);
        }
    }

    /**
     * Get current room, if set.
     * @return ChatRoomResult
     */
    getCurrentRoom = (): ChatRoomResult | null => {
        return this._currentRoom;
    }

    /**
     * Set current room, reset chat polling if a new room.
     * Will trigger onRoomChange() if new and old rooms are different
     * @param room
     * @return ChatRoomResult or null
     */
    setCurrentRoom = (room: ChatRoomResult): ChatRoom | null => {
        const oldRoom = this._currentRoom;
        if(!room || !room.id) {
            throw new SettingsError(REQUIRE_ROOM_ID);
        }
        if(!this._currentRoom || (this._currentRoom.id !== room.id)) {
            this.lastTimestamp = undefined;
            this.lastCursor = undefined;
            this.lastMessageId = undefined;
            this.firstMessageId = undefined;
            this.firstMessageTime = undefined;
            this._currentRoom = room;
            if(this._eventHandlers.onRoomChange) {
                this._eventHandlers.onRoomChange(this._currentRoom, oldRoom);
            }
            if (this._currentRoom) {
                this._roomApi = buildAPI(this._config, `chat/rooms/${this._currentRoom.id}`);
            } else {
                this._roomApi = null;
            }
            this._commandApi = `${this._roomApi}/command`;
            this._updatesApi = `${this._roomApi}/updates`;
        } else {
            this._currentRoom = room;
        }

        return room;
    }

    /**
     * Set how often we poll for events, defaults to 800ms
     * @param frequency poll frequency in milliseconds
     */
    setUpdateSpeed = (frequency:number) => {
        this._pollFrequency = frequency;
    }

    /**
     * Start the chat polling
     */
    startEventUpdates = (updatesLimit?: number) => {
        this._startKeepAlive(this._currentRoom.id, this._user.userid || "anonymous");
        if(updatesLimit) {
            this._maxEventsPerUpdateLimit = updatesLimit
        }

        if(this._polling) {
            // console.log("ALREADY CONNECTED TO TALK");
            return;
        }

        if(!this._updatesApi || !this._currentRoom) {
            throw new SettingsError(NO_ROOM_SET)
        }

        if (this._eventHandlers.onChatStart) {
            this._eventHandlers.onChatStart();
        }

        if(!this._eventHandlers.onChatEvent && !this._eventHandlers.onNetworkResponse) {
            throw new SettingsError(NO_HANDLER_SET)
        }
        
        if (
            !this._pollFrequency ||
            isNaN(this._pollFrequency) ||
            this._pollFrequency < 250 ||
            this._pollFrequency > 5000
        ) {
            throw new SettingsError(INVALID_POLL_FREQUENCY);
        }
        this._polling = setInterval(this._fetchUpdatesAndTriggerCallbacks, this._pollFrequency || 500);
        this._fetchUpdatesAndTriggerCallbacks();
    }

    /**
     * Fetch updates and trigger callbacks.  Exposed as public for debug and forced manual re-polling, if needed.
     * However, marked with a starting underscore to emphasize that you are probably doing something wrong if you need this for
     * non-debug reasons.
     */
    public _fetchUpdatesAndTriggerCallbacks = () => {
        if(this._fetching) {
            return Promise.resolve();
        }
        const cursor = this.lastCursor
        this._fetching = true;
        return this.getUpdates(cursor, this._maxEventsPerUpdateLimit).then(this.handleUpdates).catch(error=> {
            if(this._eventHandlers && this._eventHandlers.onNetworkError) {
                this._eventHandlers.onNetworkError(error)
            } else {
                console.log(error);
            }
            this._fetching = false;
        });
    }

    /**
     * Stop event polling
     */
    public stopEventUpdates = () => {
        this._endKeepAlive();
        if(this._polling) {
            clearInterval(this._polling);
        }
    }

    /**
     * Get the latest events.
     */
    public getUpdates = (cursor: string = '', limit:number=100): Promise<ChatUpdatesResult> => {
        if(!this._roomApi) {
            throw new SettingsError("No room selected");
        }
        const request: AxiosRequestConfig =  {
            method: GET,
            url: `${this._updatesApi}?limit=${limit}&cursor=${cursor}`,
            headers: this._jsonHeaders
        };
        return stRequest(request).then((result) => {
            if(this._eventHandlers && this._eventHandlers.onNetworkResponse) {
                // @ts-ignore
                this._eventHandlers.onNetworkResponse(result);
            }
            if(result.data && result.data.cursor) {
                this.lastCursor = result.data.cursor;
            }
            return result.data;
        });
    }

    private _handleUpdate = (event) => {
        // ignore if shadowbanned.
        if(event.shadowban && (event.userid !== this._user.userid || !this._user)) {
            return;
        }
        if(event.eventtype == EventType.speech) {
            if(this._eventHandlers.onSpeech) {
                this._eventHandlers.onSpeech(event);
                return;
            }
            if(this._eventHandlers.onChatEvent) {
                this._eventHandlers.onChatEvent(event);
                return;
            }
        }
        if (event.eventtype == EventType.reply && this._eventHandlers.onReply) {
            this._eventHandlers.onReply(event);
            return;
        }
        if (event.eventtype == EventType.reaction && this._eventHandlers.onReaction) {
            this._eventHandlers.onReaction(event);
            return;
        }
        if(event.eventtype == EventType.replace && this._eventHandlers.onReplace) {
            this._eventHandlers.onReplace(event);
            return;
        }
        if(event.eventtype == EventType.remove && this._eventHandlers.onRemove) {
            this._eventHandlers.onRemove(event);
            return;
        }
        if (event.eventtype == EventType.bounce && this._eventHandlers.onBounce) {
            this._eventHandlers.onBounce(event);
            return;
        }
        if(event.eventtype == EventType.banned && this._eventHandlers.onBanned) {
            this._eventHandlers.onBanned(event)
            return;
        }
        if (event.eventtype == EventType.purge && this._eventHandlers.onPurgeEvent) {
            this._eventHandlers.onPurgeEvent(event);
            return;
        }
        if(this._eventHandlers.onAnnouncement && (event.eventtype == EventType.announcement || event.customtype == EventType.announcement)) {
            this._eventHandlers.onAnnouncement(event);
            return
        }
        if (this._eventHandlers.onChatEvent) {
            this._eventHandlers.onChatEvent(event);
            return;
        }
    }

    /**
     * Used if message smoothing is enabled.
     * Spaces out the events so that we see a stream instead of an huge change all at once.
     * @param event
     * @param index
     */
    private _spacedUpdate = (event: EventResult, index:number, updateFunction: Function, frequency?: number): Promise<boolean> => {
        const speed = frequency || this._eventSpacingMs;
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                updateFunction(event)
                resolve(true)
            }, index * speed)
        })
    }


    /**
     * Route the updates to appropriate handers.
     * @param update
     * @private
     */
    public handleUpdates = async (update: ChatEventsList) => {
        this._fetching = false;
        if(!update) {
            return;
        }
        if(update.cursor) {
            this.lastCursor = update.cursor;
        }
        const events: Array<EventResult> = update.events;
        if(events && events.length) {
            for (var i = 0; i < events.length; i++) {
                const event: EventResult = events[i];
                // We already rendered this on send.
                if(this._preRenderedMessages.has(event.id)) {
                    this._preRenderedMessages.delete(event.id);
                    continue;
                }
                const ts = event.ts;
                if (!this.lastTimestamp || ts > this.lastTimestamp) {
                    this.lastTimestamp = ts;
                    this.lastMessageId = event.id;
                } else {
                    if (!this.firstMessageTime || ts < this.firstMessageTime) {
                        this.firstMessageTime = ts;
                        this.firstMessageId = event.id;
                    }
                }
                /**
                 * Handle event conditions.
                 */
                // skip if user is ignored.
                if(this._ignoreList.has(event.userid)) continue;

                // If smoothing is enabled, render events with some spacing.
                // However, if we have a massive batch, we want to catch up, so we do not put spacing and just jump ahead.
                if(this._smoothEventUpdates && events.length < this._maxEventBufferSize) {
                   await this._spacedUpdate(event, i, this._handleUpdate).catch(error=>{
                       if(this._eventHandlers && this._eventHandlers.onNetworkError) {
                           return this._eventHandlers.onNetworkError(error)
                       }
                       console.log(error);
                   })
                } else {
                    this._handleUpdate(event);
                }
            }
        }
    }

    /**
     * ROOM COMMANDS SECTION
     */

    /**
     * Evaluate admin commands
     * @param command
     * @param response
     * @private
     */
    private _evaluateCommandResponse = async (command: string, response: RestApiResult<CommandResponse> ): Promise<RestApiResult<CommandResponse>> => {
        if(command.startsWith('*')) {
            const onHelp = this._eventHandlers.onHelp;
            if( command.startsWith('*help') && onHelp  && onHelp instanceof Function ) {
                onHelp(response);
                return response;
            }
            const adminCommand = this._eventHandlers.onAdminCommand;
            if (adminCommand && adminCommand instanceof Function) {
                // @ts-ignore
                adminCommand(response);
            }
        }
        if(response.data.speech) {
            if(this._smoothEventUpdates) {
                await this.handleUpdates({events: [response.data.speech]})
                this._preRenderedMessages.add(response.data.speech.id)
            }
        }
        return response;
    }

    /**
     * Send a chat command
     * @param command
     * @param options
     */
    executeChatCommand = (user: User, command: string, options?: CommandOptions): Promise<MessageResult<CommandResponse> | ErrorResult> => {
        this._throttle(command);
        const data = Object.assign(options || {}, {
            command,
            userid: user.userid
        });
        const config: AxiosRequestConfig = {
            method: POST,
            url: this._commandApi,
            headers: this._jsonHeaders,
            data: data
        };
        const errorHandler =  this._eventHandlers && this._eventHandlers.onNetworkError;
        return stRequest(config, errorHandler).then(response=>{
            return this._evaluateCommandResponse(command, response)
        }).catch(e=>{
            throw new Error(`${e.response.status} ${e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText} - ${e.message}`);
        })
    }


    private _throttle = (command: string) => {
        if(command == this._lastCommand && (new Date().getTime()-this._lastCommandTime) < this._lastCommandTimeoutDuration) {
            const throttleError = new Error(THROTTLE_ERROR);
            // @ts-ignore
            throttleError.code = 405;
            throw throttleError;
        } else {
            this._lastCommandTime = new Date().getTime();
            this._lastCommand = command
        }
    }

    /**
     * Send a reply to a chat event.
     * @param user
     * @param message
     * @param replyto
     * @param options
     */
    sendThreadedReply = (user: User, message: string, replyto: EventResult |string, options?: CommandOptions): Promise<MessageResult<EventResult>> => {
        // @ts-ignore
        const id = replyto.id || replyto;
        const data = Object.assign({
            body: message,
            userid: user.userid,
        }, options);
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `chat/rooms/${this._currentRoom.id}/events/${id}/reply`),
            headers:this._jsonHeaders,
            data: data
        }
        return stRequest(config).catch(e=>{
            throw e;
        });
    }

    /**
     * Send a quoted reply to a chat event.
     * @param user
     * @param message
     * @param replyto
     * @param options
     */
    sendQuotedReply = (user: User, message: string, replyto: EventResult |string, options?: QuoteCommandOptions): Promise<MessageResult<EventResult>> => {
        // @ts-ignore
        const id = replyto.id || replyto;
        const data = Object.assign({
            body: message,
            userid: user.userid,
        }, options);
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `chat/rooms/${this._currentRoom.id}/events/${id}/quote`),
            headers:this._jsonHeaders,
            data: data
        }
        return stRequest(config).then(result=>{
            return result;
        }).catch(e=>{
            throw e;
        });
    }

    /**
     * Report an event for breaking community rules
     * @param event
     * @param reason
     */
    reportMessage = (event: EventResult | string, reason: ReportReason): Promise<RestApiResult<null>> => {
        // @ts-ignore
        const id = event.id || event;
        const config:AxiosRequestConfig =  {
            method: POST,
            url: buildAPI(this._config, `chat/rooms/${this._currentRoom.id}/events/${id}/report`),
            headers: this._jsonHeaders,
            data: reason
        };
        // @ts-ignore
        return stRequest(config).then(result => result).catch(e=>{
            throw e;
        })
    }

    /**
     * Send a reaction
     * @param user
     * @param reaction
     * @param reactToMessage
     * @param options
     */
    reactToEvent = (user: User, reaction: Reaction, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>> => {
        // @ts-ignore
        const source = reactToMessage.id || reactToMessage;
        const data = Object.assign({
            command: "",
            userid: user.userid,
            reacted: true,
            reaction
        }, options);
        const config: AxiosRequestConfig = {
            method: POST,
            url:`${this._roomApi}/events/${source}/react`,
            headers: this._jsonHeaders,
            data: data
        }
        return stRequest(config).then((response)=>{
            return response.data
        }).catch((e)=>{
            throw e;
        })
    }

    /**
     * Send an advertisement event, using SportsTalk custom events.
     * @param user
     * @param options
     */
    sendAdvertisement = (user: User, options: AdvertisementOptions): Promise<MessageResult<CommandResponse>> => {
        const data = Object.assign({
            command: options.message || "advertisement",
            eventtype: ChatOptionsEventType.custom,
            customtype: ChatOptionsEventType.ad,
            userid: user.userid,
            custompayload: JSON.stringify(options)
        });
        const config: AxiosRequestConfig = {
            method: POST,
            headers: this._jsonHeaders,
            data: data,
            url: this._commandApi,
        };
        return stRequest(config).then(response=>response.data);
    }

    /**
     * Send a goal event.
     * @param user
     * @param img
     * @param message
     * @param options
     */
    sendGoal = (user: User, img: string, message?:string, options?: GoalOptions): Promise<MessageResult<CommandResponse>> => {
        const defaultOptions = {
            "img": img,
            "link":""
        }
        // Allow safe 'then' when an object or event is passed into the function call.
        if(message  && typeof message !== 'string') {
            message = 'GOAL!'
        }
        const data = Object.assign({
            command: message || 'GOAL!',
            eventtype: ChatOptionsEventType.custom,
            customtype: CustomEventTypes.goal,
            userid: user.userid,
            custompayload: JSON.stringify(Object.assign(defaultOptions, options))
        });
        return stRequest({
            method: POST,
            url: this._commandApi,
            headers: this._jsonHeaders,
            data: data
        }).then(response=>{
            return response;
        })
    }

    /**
     * Removes an event from the server.  This cannot be reversed.  This can leave some content orphaned if there are replies.
     * Typically, you should use the `flagEventLogicallyDeleted` method instead, with `permanentIfNoReplies` set to `true`
     * @param user
     * @param event
     */
    permanetlyDeleteEvent = (user: UserResult | string, event: EventResult | string):Promise<RestApiResult<null>> => {
        if(!event) {
            throw new Error("Cannot delete a null or undefined event")
        }
        // @ts-ignore
        const userid = user.userid || user;
        // @ts-ignore
        const id = event.id || event;
        if(!id) {
            throw new Error("Cannot delete an event without an id")
        }
        const config:AxiosRequestConfig =  {
            method: DELETE,
            url: buildAPI(this._config, `chat/rooms/${this._currentRoom.id}/events/${id}`),
            headers: this._jsonHeaders,
        };
        // @ts-ignore
        return stRequest(config).then(result=>{
            return result;
        }).catch(e=>{
            throw new Error(`${e.response.status} ${e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText} - ${e.message}`);
        })
    }

    /**
     * Flags an event as deleted so it is not sent in updates or scrollback, however the content is kept on the server.
     * @param user
     * @param event
     * @param permanentIfNoReplies if true, this becomes a permanent delete if there are no replies.
     */
    flagEventLogicallyDeleted = (user: UserResult | string, event:EventResult | string, permanentIfNoReplies: boolean=false):Promise<RestApiResult<null>> => {
        if(!event) {
            throw new Error("Cannot delete a null or undefined event")
        }
        // @ts-ignore
        const userid = user.userid || user;
        // @ts-ignore
        const id = event.id || event;
        if(!id) {
            throw new Error("Cannot delete an event without an id")
        }
        const config: AxiosRequestConfig = {
            method: PUT,
            headers: this._jsonHeaders,
            url: buildAPI(this._config, `chat/rooms/${this._currentRoom.id}/events/${id}/setdeleted?userid=${userid}&deleted=true&permanentifnoreplies=${permanentIfNoReplies}`)
        }
        // @ts-ignore
        return stRequest(config).then(result=>{
            return result;
        }).catch(e=>{
            throw new Error(`${e.response.status} ${e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText} - ${e.message}, config:${JSON.stringify(config)}`);
        })
    }

    /**
     * Lists events going backwards in time.
     * @param cursor
     * @param limit
     */
    listPreviousEvents = (cursor:string = '', limit: number = 100): Promise<ChatUpdatesResult> => {
        if(!this._roomApi) {
            throw new SettingsError("No room selected");
        }
        const previousCursor = cursor || this.oldestCursor || '';
        return stRequest({
            method: GET,
            url: `${this._roomApi}/listpreviousevents?cursor=${previousCursor? previousCursor : ''}&limit=${limit ? limit : 100}`,
            headers: this._jsonHeaders
        }).then((result) => {
            if(!cursor) {
                this.oldestCursor = result.data ? result.data.cursor : this.oldestCursor;
            }
            return result.data;
        });
    }

    /**
     * This is used for bulk export.  Typically not used in real-time application
     * This will return all events regardless of active/inactive status.
     * @param cursor
     * @param limit
     */
    listEventsHistory = (cursor:string='', limit: number=100): Promise<ChatUpdatesResult> => {
        if(!this._roomApi) {
            throw new SettingsError("No room selected");
        }
        return stRequest({
            method: GET,
            url: `${this._roomApi}/listeventshistory?cursor=${cursor ? cursor: ''}&limit=${limit ? limit : 100}`,
            headers: this._jsonHeaders
        }).then((result) => {
            return result.data;
        });
    }

    searchEventHistory = (params: EventSearchParams): Promise<ChatEventsList> => {
        if(params.fromhandle && params.fromuserid) {
            throw new SettingsError("Search for ID or Handle, not both");
        }
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `chat/searchevents`),
            headers: this._jsonHeaders,
            data: params
        }
        return stRequest(config).then(result=>result.data);
    }

    listEventsByType = (type:EventType): Promise<ChatEventsList> =>  {
        return stRequest({
            method: GET,
            url: `${this._roomApi}/listeventsbytype?eventtype=${type}`,
            headers: this._jsonHeaders
        }).then(result=>result.data);
    }

    updateChatEvent = (event: EventResult | string, body: string, user?: string | User): Promise<EventResult> => {
        //@ts-ignore
        const userid = user ? user.userid || user : this._user.userid;
        const eventid = forceObjKeyOrString(event, 'id');
        if(!userid) {
            throw new Error("Require a valid userid to update a Chat Event.");
        }
        const config:AxiosRequestConfig = {
            method: PUT,
            url: buildAPI(this._config, `chat/rooms/${this._currentRoom.id}/events/${eventid}`),
            headers: this._jsonHeaders,
            data:{
                userid,
                body
            }
        }
        return stRequest(config).then(result=>result.data);
    }

    listEventsByTimestamp = (query: TimestampRequest): Promise<ChatEventsList> => {
        if(!query || !query.ts) {
            throw new Error("Must provide a timestamp value to list events");
        }
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `/chat/rooms/${this._currentRoom.id}}/eventsbytimestamp/list/${query.ts}?limitolder=${query.limitolder? query.limitolder:0}&limitnewer=${query.limitnewer ? query.limitnewer:0}`),
            headers: this._jsonHeaders,
        }
        return stRequest(config).then(result=>result.data);
    }


}
