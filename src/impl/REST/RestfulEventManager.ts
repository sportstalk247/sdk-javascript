import {
    AdvertisementOptions,
    ApiResult,
    CommandOptions,
    EventHandlerConfig,
    EventResult,
    EventType, GoalOptions, Reaction,
    Room,
    SportsTalkConfig,
    User
} from "../../DataModels";
import {DEFAULT_CONFIG, GET, POST} from "../../constants";
import {IEventManager} from "../../api";
import {formify, getApiHeaders} from "../../utils";
import {SettingsError} from "../../errors";
import {NO_HANDLER_SET, NO_ROOM_SET} from "../../messages";
import axios, {AxiosPromise} from "axios";
import {Promise} from "es6-promise";
const INVALID_POLL_FREQUENCY = "Invalid poll _pollFrequency.  Must be between 250ms and 5000ms"

export class RestfulEventManager implements IEventManager{
    private _config: SportsTalkConfig = {};
    private _polling: any; // set interval id;
    private _apiHeaders = {}
    private _currentRoom: Room | null;
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

    setEventHandlers = (eventHandlers: EventHandlerConfig) => {
        this.eventHandlers = eventHandlers;
    }

    getEventHandlers(): EventHandlerConfig {
        return this.eventHandlers || {};
    }

    setUser = (user: User) => {
        this._config.user = Object.assign(this._user, user);
        this._user = this._config.user;
    }

    setConfig = (config:SportsTalkConfig) => {
        this._config = Object.assign(DEFAULT_CONFIG, config);
        this._user = Object.assign(this._user, this._config.user);
        this._apiHeaders = getApiHeaders(this._config.apiKey)
    }

    getCurrentRoom = ():Room | null => {
        return this._currentRoom;
    }

    setCurrentRoom = (room: Room | null): Room | null => {
        this.lastCursor = undefined;
        this.lastMessageId = undefined;
        this.firstMessageId = undefined;
        this.firstMessageTime = undefined;
        this._currentRoom = room;
        if(this._currentRoom) {
            this._roomApi = `${this._config.endpoint}/room/${this._currentRoom.id}`
        }else {
            this._roomApi = null;
        }
        this._commandApi = `${this._roomApi}/command`;
        this._updatesApi = `${this._roomApi}/updates`;
        return room
    }

    setPollFrequency = (frequency:number) => {
        this._pollFrequency = frequency;
    }

    startTalk = () => {
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
        this._polling = setInterval(()=>{
            this.getUpdates().then(apiResult=>{
                this._handleUpdates(apiResult);
            }).catch(error=> {
                if(this.eventHandlers.onNetworkError) {
                    this.eventHandlers.onNetworkError(error)
                } else {
                    console.log(error);
                }
            });
        }, this._pollFrequency || 800);
    }

    public stopTalk = () => {
        if(this._polling) {
            clearInterval(this._polling);
        }
    }

    public getUpdates = (): Promise<EventResult[]> => {
        if(!this._roomApi) {
            throw new SettingsError("No room selected");
        }
        return axios({
            method: GET,
            url: this._updatesApi,
            headers: this._apiHeaders
        }).then((result) => {
            if(this.eventHandlers.onNetworkResponse) {
                // @ts-ignore
                this.eventHandlers.onNetworkResponse(result);
            }
            return result.data.data;
        });
    }

    private _handleUpdates = (update: EventResult[]) => {
        const events: Array<EventResult> = update;
        for(var i = 0; i < events.length;  i++) {
            const event: EventResult = events[i];
            const date = event.added;
            if (!this.lastCursor || date > this.lastCursor) {
                this.lastCursor = date;
                this.lastMessageId = event.id;
            } else {
                if (!this.firstMessageTime || date < this.firstMessageTime) {
                    this.firstMessageTime = date;
                    this.firstMessageId = event.id;
                }
                continue;
            }
            if(event.eventtype == EventType.purge && this.eventHandlers.onPurgeEvent) {
                this.eventHandlers.onPurgeEvent(event);
                continue;
            }
            if(event.eventtype == EventType.reply && this.eventHandlers.onReply) {
                this.eventHandlers.onReply(event);
                continue;
            }
            if(event.eventtype == EventType.reaction && this.eventHandlers.onReaction) {
                this.eventHandlers.onReaction(event);
                continue;
            }
            if(this.eventHandlers.onChatEvent) {
                this.eventHandlers.onChatEvent(event);
                continue;
            }
            console.log("Unknown chat event:", event);
        }
    }

    /**
     * ROOM COMMANDS SECTION
     */
    /**
     *
     * @param command
     * @param options
     */
    sendCommand = (user: User, room: Room, command: string, options?: CommandOptions): Promise<ApiResult<null | Event>> => {
        const data = Object.assign({
            command,
            userid: user.userid
        }, options);
        return axios({
            method: POST,
            url: this._commandApi,
            headers: this._apiHeaders,
            data: formify(data)
        }).then(response=>response);
    }

    sendReply = (user: User, room: Room, message: string, replyto: Event |string, options?: CommandOptions): Promise<ApiResult<null>> => {
        // @ts-ignore
        const id = replyto.id || replyto;
        const data = Object.assign({
            command: message,
            userid: user.userid,
            replyto,
        }, options);

        return axios({
            method: POST,
            url: this._commandApi,
            headers:this._apiHeaders,
            data: formify(data)
        }).then(response=>response.data.data);
    }

    sendReaction = (user: User, room:Room, reaction: Reaction, reactToMessage: Event | string, options?: CommandOptions): Promise<ApiResult<null>> => {
        // @ts-ignore
        const source = reactToMessage.id || reactToMessage;
        const data = Object.assign({
            command: "",
            userid: user.userid,
            reacted: true,
            reaction
        }, options);

        return axios({
            method: POST,
            url:`${this._roomApi}/react/${source}`,
            headers: this._apiHeaders,
            data: formify(data)
        }).then(response=>{
            return response.data
        });
    }

    sendAdvertisement = (user: User, room: Room, options: AdvertisementOptions): Promise<ApiResult<null>> => {
        const data = Object.assign({
            command: 'advertisement',
            customtype: 'advertisement',
            userid: user.userid,
            custompayload: JSON.stringify(options)
        });
        return axios({
            method: POST,
            headers: this._apiHeaders,
            data: formify(data),
            url: this._commandApi,
        }).then(response=>response.data.data);
    }

    sendGoal = (user: User, room: Room, img: string, message?:string, options?: GoalOptions): Promise<ApiResult<null>> => {
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
            customtype: 'goal',
            userid: user.userid,
            custompayload: JSON.stringify(Object.assign(defaultOptions, options))
        });
        return axios({
            method: POST,
            url: this._commandApi,
            headers: this._apiHeaders,
            data: formify(data)
        }).then(response=>response.data.data);
    }
}
