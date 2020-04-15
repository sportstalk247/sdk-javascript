import {
    AdvertisementOptions,
    CommandOptions,
    GoalOptions,
    EventHandlerConfig,
    RoomResult,
    Room,
    RoomUserResult, EventResult, DeletedRoomResponse, CommandResponse, RoomExitResult
} from "../models/ChatModels";
import {DEFAULT_CONFIG} from "./constants/api";
import {IRoomService, IEventService, IChatClient} from "../API/ChatAPI";
import {SettingsError} from "./errors";
import {RestfulEventService} from "./chat/REST/RestfulEventService"
import {RestfulRoomService} from "./chat/REST/RestfulRoomService";
import {RestfulUserManager} from "./common/REST/RestfulUserManager";
import {
    Reaction,
    ReportReason,
    ReportType,
    SportsTalkConfig,
    User,
    UserResult, MessageResult
} from "../models/CommonModels";
import {MISSING_ROOM, MUST_SET_USER} from "./constants/messages";
import {IUserService} from "../API/CommonAPI";


export class ChatClient implements IChatClient {

    private _config: SportsTalkConfig = {appId: ""};
    //User
    private _user: User = {userid: "", handle: ""};

    // Track polling.
    private _currentRoom: RoomResult;

    // EventResult handlers

    private _defaultGoalImage: string | undefined;
    private _eventService: IEventService;
    private _roomService: IRoomService;
    private _userService: IUserService;

    getDebug = () => {
        return JSON.stringify(this);
    }
    /**
     * Configures and creates a ChatClient
     * @param config
     * @param eventHandlers
     * @return SportsTalkClient.  Currently only a REST based client is supported.  Future SDK versions will implement other options such as firebase messaging and websockets
     */
    static create = (config: SportsTalkConfig = {appId: ""}, eventHandlers?: EventHandlerConfig): IChatClient => {
        const client = new ChatClient();
        client.setConfig(config);
        if(eventHandlers) {
            client.setEventHandlers(eventHandlers);
        }
        return client;
    }

    setConfig = (config:SportsTalkConfig) => {
        this._config = Object.assign(DEFAULT_CONFIG, config);

        if(this._eventService) {
            this._eventService.setConfig(this._config);
        }

        if(this._roomService) {
            this._roomService.setConfig(this._config);
        }

        if(this._userService) {
            this._userService.setConfig(this._config);
        }

        this._eventService = this._eventService || new RestfulEventService(this._config);
        this._roomService = this._roomService || new RestfulRoomService(this._config);
        this._userService = this._userService || new RestfulUserManager(this._config);

        if(this._config.user){
            Object.assign(this._user, this._config.user);
        }
    }

    setDefaultGoalImage = (url: string):string => {
        this._defaultGoalImage = url;
        return this._defaultGoalImage;
    }

    setEventHandlers = (eventHandlers: EventHandlerConfig) => {
        this._eventService.setEventHandlers(eventHandlers);
    }

    getEventHandlers = ():EventHandlerConfig => {
        return this._eventService.getEventHandlers();
    }

    getEventService = ():IEventService => {
        return this._eventService;
    }

    getRoomService = ():IRoomService => {
        return this._roomService;
    }

    startTalk = () => {
        this._eventService.startTalk();
    }

    stopTalk = () => {
        this._eventService.stopTalk();
    }
    /**
     * RoomResult Handling
     */
    listRooms = (): Promise<Array<Room>> => {
        return this._roomService.listRooms();
    }
    /**
     *
     * @param cursor
     * @param maxresults
     */
    listParticipants = (cursor?: string, maxresults: number = 200): Promise<Array<UserResult>> => {
        if(!this._currentRoom) {
            throw new SettingsError(MISSING_ROOM);
        }
        return this._roomService.listParticipants(this._currentRoom, cursor, maxresults);
    }

    setUser = (user:User) => {
       this._user = user;
    }

    getUser = (): User | undefined => {
        return this._user;
    }

    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
     */
    createOrUpdateUser = (user: User, setDefault:boolean = true): Promise<User> => {
        return this._userService.createOrUpdateUser(user).then(user=>{
            if(setDefault) {
                this._user = user;
            }
            return user;
        })
    }

    public getLatestEvents = (): Promise<EventResult[]> => {
        return this._eventService.getUpdates()
    }

    joinRoom = (room: RoomResult | string): Promise<RoomUserResult> => {
        if(!this._user || !this._user.userid) {
            throw new SettingsError(MUST_SET_USER);
        }
        return this._roomService.joinRoom(this._user, room).then(response => {
            this._currentRoom = response.room;
            this._eventService.setCurrentRoom(this._currentRoom);
            return response;
        })
    }

    report = (event: EventResult | string, type: ReportType) => {
        const reason: ReportReason = {
            reporttype: type,
            userid: this._user.userid
        }
        return this._eventService.reportEvent(event, reason);
    }

    exitRoom = (): Promise<RoomExitResult> => {
        if(!this._eventService.getCurrentRoom()) {
            throw new SettingsError("Cannot exit if not in a room!");
        }
        return this._roomService.exitRoom(this._user, this._currentRoom).then(response=>{
            this._eventService.setCurrentRoom(null);
            return response;
        });
    }

    /**
     * Gets currently set room.  Returns the current room or undefined if a room has not been joined.
     */
    getCurrentRoom = (): RoomResult | null => {
        return this._eventService.getCurrentRoom();
    }

    setCurrentRoom = (room: RoomResult) => {
        this._currentRoom = room;
        this._eventService.setCurrentRoom(room);
    }

    /**
     * ROOM COMMANDS SECTION
     */
    /**
     *
     * @param command
     * @param options
     */
    sendCommand = (command: string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>> => {
        return this._eventService.sendCommand(this._user, command, options).then(response=>{
            if(command.startsWith('*')) {
                const onHelp = this._eventService.getEventHandlers().onHelp;
                if( command.startsWith('*help') && onHelp  && onHelp instanceof Function ) {
                    onHelp(response);
                } else {
                    const adminCommand = this._eventService.getEventHandlers().onAdminCommand;
                    if (adminCommand && adminCommand instanceof Function) {
                        // @ts-ignore
                        adminCommand(response);
                    }
                }
            }
            return response;
        })
    }

    sendReply = (message: string, replyto: Event |string, options?: CommandOptions): Promise<MessageResult<CommandResponse | null>> => {
        return this._eventService.sendReply(this._user, message, replyto, options);
    }

    sendReaction = (reaction: Reaction, reactToMessage: Event | string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>> => {
        return this._eventService.sendReaction(this._user, reaction, reactToMessage, options);
    }

    /* istanbul ignore next */
    sendAdvertisement = (options: AdvertisementOptions): Promise<MessageResult<null | CommandResponse>> => {
        return this._eventService.sendAdvertisement(this._user, options);
    }
    /* istanbul ignore next */
    sendGoal = (message?:string, img?: string, options?: GoalOptions): Promise<MessageResult<null | CommandResponse>> => {
       return this._eventService.sendGoal(this._user,img || this._defaultGoalImage || '', message, options)
    }
    deleteEvent = (event: EventResult | string) =>{
        return this._eventService.deleteEvent(event);
    }

}


