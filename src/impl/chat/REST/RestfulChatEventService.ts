import {
    AdvertisementOptions, ChatUpdatesResult,
    CommandOptions, CommandResponse,
    EventHandlerConfig,
    EventResult,
    EventType, GoalOptions, Room, RoomResult
} from "../../../models/ChatModels";
import {DEFAULT_CONFIG, DELETE, GET, POST} from "../../constants/api";
import {IChatEventService} from "../../../API/ChatAPI";
import {buildAPI, getJSONHeaders, getUrlEncodedHeaders} from "../../utils";
import {SettingsError} from "../../errors";
import {NO_HANDLER_SET, NO_ROOM_SET, REQUIRE_ROOM_ID} from "../../constants/messages";
import {stRequest} from '../../network'
import {
    RestApiResult,
    Reaction,
    ReportReason,
    SportsTalkConfig,
    User,
    MessageResult
} from "../../../models/CommonModels";
import {AxiosRequestConfig} from "axios";
const INVALID_POLL_FREQUENCY = "Invalid poll _pollFrequency.  Must be between 250ms and 5000ms"

/**
 * This class manages polling for chat events and routing those events to the appropriate callbacks.
 * You probably do not want this class, you want the ChatClient.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 */
export class RestfulChatEventService implements IChatEventService {
    private _config: SportsTalkConfig = {appId: ""};
    private _polling: any; // set interval id;
    private _apiHeaders = {}
    private _jsonHeaders = {}
    private _currentRoom: RoomResult;
    private _updatesApi: string;
    private eventHandlers:EventHandlerConfig = {}
    // api endpoints
    private _roomApi: string | null;
    private _commandApi: string;

    private _user: User = {userid: "", handle: ""};

    // poll management
    lastCursor:number | undefined; // timestamp
    lastMessageId:string | undefined;
    firstMessageId:string | undefined;
    firstMessageTime: number | undefined;

    _pollFrequency: number =  800;

    constructor(config: SportsTalkConfig, eventHandlers: EventHandlerConfig = {}) {
        this.setConfig(config);
        this.setEventHandlers(eventHandlers);
        try {
            const frequency  = process.env.SPORTSTALK_POLL_FREQUENCY ? parseInt(process.env.SPORTSTALK_POLL_FREQUENCY): 800;
            this._pollFrequency = frequency
        } catch (e) {
            console.log(e);
            this._pollFrequency = 800;
        }
    }

    /**
     * Set event handler callbacks
     * @param eventHandlers
     */
    setEventHandlers = (eventHandlers: EventHandlerConfig) => {
        this.eventHandlers = eventHandlers;
    }

    /**
     * Get current event handler callback functions
     */
    getEventHandlers(): EventHandlerConfig {
        return this.eventHandlers || {};
    }

    /**
     * Set the user
     * @param user
     */
    setUser = (user: User) => {
        this._config.user = Object.assign(this._user, user);
        this._user = this._config.user;
    }

    /**
     * Get the user
     */
    getUser = () => {
        return this._user;
    }

    /**
     * Set the config
     * @param config
     */
    setConfig = (config:SportsTalkConfig) => {
        this._config = Object.assign(DEFAULT_CONFIG, config);
        this._user = Object.assign(this._user, this._config.user);
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken);
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
    }

    /**
     * Get current room, if set.
     */
    getCurrentRoom = (): RoomResult | null => {
        return this._currentRoom;
    }

    /**
     * Set current room, reset chat polling if a new room.
     * Will trigger onRoomChange() if new and old rooms are different
     * @param room
     */
    setCurrentRoom = (room: RoomResult): Room | null => {
        const oldRoom = this._currentRoom;
        if(!room || !room.id) {
            throw new SettingsError(REQUIRE_ROOM_ID);
        }
        if(!this._currentRoom || (this._currentRoom.id !== room.id)) {
            this.lastCursor = undefined;
            this.lastMessageId = undefined;
            this.firstMessageId = undefined;
            this.firstMessageTime = undefined;
            this._currentRoom = room;
            if(this.eventHandlers.onRoomChange) {
                this.eventHandlers.onRoomChange(oldRoom, this._currentRoom);
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
     * @param frequency
     */
    setPollFrequency = (frequency:number) => {
        this._pollFrequency = frequency;
    }

    /**
     * Start the chat polling
     */
    startChat = () => {
        if(this._polling) {
            console.warn("ALREADY CONNECTED TO TALK");
            return;
        }
        if(this.eventHandlers.onChatStart) {
            this.eventHandlers.onChatStart();
        }
        if(!this._updatesApi || !this._currentRoom) {
            throw new SettingsError(NO_ROOM_SET)
        }
        if(!this.eventHandlers.onChatEvent && !this.eventHandlers.onNetworkResponse) {
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
        this._polling = setInterval(this._fetchUpdatesAndTriggerCallbacks, this._pollFrequency || 800);
    }

    /**
     * Fetch updates and trigger callbacks.  Exposed as public for debug and forced manual re-polling, if needed.
     * However, marked with a starting underscore to emphasize that you are probably doing something wrong if you need this for
     * non-debug reasons.
     */
    public _fetchUpdatesAndTriggerCallbacks = async () =>{
        return this.getUpdates().then(apiResult=>{
            this._handleUpdates(apiResult);
        }).catch(error=> {
            if(this.eventHandlers && this.eventHandlers.onNetworkError) {
                this.eventHandlers.onNetworkError(error)
            } else {
                console.log(error);
            }
        });
    }

    /**
     * Stop event polling
     */
    public stopChat = () => {
        if(this._polling) {
            clearInterval(this._polling);
        }
    }

    /**
     * Get the latest events.
     */
    public getUpdates = (): Promise<ChatUpdatesResult> => {
        if(!this._roomApi) {
            throw new SettingsError("No room selected");
        }
        return stRequest({
            method: GET,
            url: this._updatesApi,
            headers: this._apiHeaders
        }).then((result) => {
            if(this.eventHandlers && this.eventHandlers.onNetworkResponse) {
                // @ts-ignore
                this.eventHandlers.onNetworkResponse(result);
            }
            return result.data;
        });
    }

    /**
     * Route the updates to appropriate handers.
     * @param update
     * @private
     */
    private _handleUpdates = (update: ChatUpdatesResult) => {
        if(!update) {
            return;
        }
        const events: Array<EventResult> = update.events;
        if(events && events.length) {
            for (var i = 0; i < events.length; i++) {
                const event: EventResult = events[i];
                const ts = event.ts;
                if (!this.lastCursor || ts > this.lastCursor) {
                    this.lastCursor = ts;
                    this.lastMessageId = event.id;
                } else {
                    if (!this.firstMessageTime || ts < this.firstMessageTime) {
                        this.firstMessageTime = ts;
                        this.firstMessageId = event.id;
                    }
                    continue;
                }
                if (event.eventtype == EventType.purge && this.eventHandlers.onPurgeEvent) {
                    this.eventHandlers.onPurgeEvent(event);
                    continue;
                }
                if (event.eventtype == EventType.reply && this.eventHandlers.onReply) {
                    this.eventHandlers.onReply(event);
                    continue;
                }
                if (event.eventtype == EventType.reaction && this.eventHandlers.onReaction) {
                    this.eventHandlers.onReaction(event);
                    continue;
                }
                if (this.eventHandlers.onChatEvent) {
                    this.eventHandlers.onChatEvent(event);
                    continue;
                }
                console.log("Unknown chat event:", event);
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
    private _evaluateCommandResponse = (command: string, response: RestApiResult<CommandResponse> ): RestApiResult<CommandResponse> => {
        if(command.startsWith('*')) {
            const onHelp = this.eventHandlers.onHelp;
            if( command.startsWith('*help') && onHelp  && onHelp instanceof Function ) {
                onHelp(response);
                return response;
            }
            const adminCommand = this.eventHandlers.onAdminCommand;
            if (adminCommand && adminCommand instanceof Function) {
                // @ts-ignore
                adminCommand(response);
            }
        }
        return response;
    }
    /**
     * Send a chat command
     * @param command
     * @param options
     */
    sendCommand = (user: User, command: string, options?: CommandOptions): Promise<MessageResult<CommandResponse>> => {
        const data = Object.assign({
            command,
            userid: user.userid
        }, options);
        const config: AxiosRequestConfig = {
            method: POST,
            url: this._commandApi,
            headers: this._jsonHeaders,
            data: data
        };
        // @ts-ignore
        return stRequest(config).then(response=>{
            return this._evaluateCommandResponse(command, response)
        });
    }

    /**
     * Send a reply to a chat event.
     * @param user
     * @param message
     * @param replyto
     * @param options
     */
    sendReply = (user: User, message: string, replyto: EventResult |string, options?: CommandOptions): Promise<MessageResult<CommandResponse>> => {
        // @ts-ignore
        const id = replyto.id || replyto;
        const data = Object.assign({
            command: message,
            userid: user.userid,
            replyto: id,
        }, options);
        const config:AxiosRequestConfig = {
            method: POST,
            url: this._commandApi,
            headers:this._jsonHeaders,
            data: data
        }
        return stRequest(config).catch(e=>{
            throw e;
        });
    }

    /**
     * Report an event for breaking community rules
     * @param event
     * @param reason
     */
    reportEvent = (event: EventResult | string, reason: ReportReason): Promise<RestApiResult<null>> => {
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
    sendReaction = (user: User,  reaction: Reaction, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>> => {
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
        });
    }

    /**
     * Send an advertisement event, using SportsTalk custom events.
     * @param user
     * @param options
     */
    sendAdvertisement = (user: User, options: AdvertisementOptions): Promise<MessageResult<CommandResponse>> => {
        const data = Object.assign({
            command: options.message || EventType.advertisement,
            customtype: EventType.advertisement,
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
            customtype: EventType.goal,
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
     * Delete an event on the server.  Will not clear it from clients that have already displayed it.
     * @param event
     */
    deleteEvent = (event: EventResult | string): Promise<RestApiResult<null>> => {
        if(!event) {
            throw new Error("Cannot delete a null or undefined event")
        }
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
        return stRequest(config).catch(e=>{
            throw e;
        });
    }
}
