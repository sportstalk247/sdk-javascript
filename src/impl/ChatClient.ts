import {
    AdvertisementOptions,
    CommandOptions,
    GoalOptions,
    EventHandlerConfig,
    RoomResult,
    Room,
    RoomUserResult, EventResult
} from "../models/ChatModels";
import {DEFAULT_TALK_CONFIG, MISSING_ROOM} from "../constants/api";
import {IRoomManager, IEventManager, IChatClient} from "../API/ChatAPI";
import {SettingsError} from "./errors";
import {RestfulEventManager} from "./chat/REST/RestfulEventManager"
import {RestfulRoomManager} from "./chat/REST/RestfulRoomManager";
import {RestfulUserManager} from "./common/REST/RestfulUserManager";
import {
    ApiResult,
    Reaction,
    ReportReason,
    ReportType,
    SportsTalkConfig,
    User,
    UserResult
} from "../models/CommonModels";
import {MUST_SET_USER} from "../constants/messages";
import {IUserManager} from "../API/CommonAPI";


export class ChatClient implements IChatClient {

    private _config: SportsTalkConfig = {appId: ""};
    //User
    private _user: User = {userid: "", handle: ""};

    // Track polling.
    private _currentRoom: RoomResult;

    // EventResult handlers

    private _defaultGoalImage: string | undefined;
    private _eventManager: IEventManager;
    private _roomManager: IRoomManager;
    private _userManager: IUserManager;

    getDebug = () => {
        return JSON.stringify(this);
    }
    /**
     * Configures and creates a ChatClient
     * @param config
     * @param eventHandlers
     * @return SportsTalkClient.  Currently only a REST based client is supported.  Future SDK versions will implement other options such as firebase messaging and websockets
     */
    static create = (config: SportsTalkConfig = {appId: ""}, eventHandlers?: EventHandlerConfig): ChatClient => {
        const client = new ChatClient();
        client.setConfig(config);
        if(eventHandlers) {
            client.setEventHandlers(eventHandlers);
        }
        return client;
    }

    setConfig = (config:SportsTalkConfig) => {
        this._config = Object.assign(DEFAULT_TALK_CONFIG, config);

        if(this._eventManager) {
            this._eventManager.setConfig(this._config);
        }

        if(this._roomManager) {
            this._roomManager.setConfig(this._config);
        }

        if(this._userManager) {
            this._userManager.setConfig(this._config);
        }

        this._eventManager = this._eventManager || new RestfulEventManager(this._config);
        this._roomManager = this._roomManager || new RestfulRoomManager(this._config);
        this._userManager = this._userManager || new RestfulUserManager(this._config);

        if(this._config.user){
            Object.assign(this._user, this._config.user);
        }
    }

    setDefaultGoalImage = (url: string) => {
        this._defaultGoalImage = url;
    }

    setEventHandlers = (eventHandlers: EventHandlerConfig) => {
        this._eventManager.setEventHandlers(eventHandlers);
    }

    getEventManager = () => {
        return this._eventManager;
    }

    getRoomManager = () => {
        return this._roomManager;
    }

    startTalk = () => {
        this._eventManager.startTalk();
    }

    stopTalk = () => {
        this._eventManager.stopTalk();
    }
    /**
     * RoomResult Handling
     */
    listRooms = (): Promise<Array<Room>> => {
        return this._roomManager.listRooms();
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
        return this._roomManager.listParticipants(this._currentRoom, cursor, maxresults);
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
    createOrUpdateUser = (user: User): Promise<User> => {
        return this._userManager.createOrUpdateUser(user)
    }

    joinRoom = (room: RoomResult | string): Promise<RoomUserResult> => {
        if(!this._user || !this._user.userid) {
            throw new SettingsError(MUST_SET_USER);
        }
        return this._roomManager.joinRoom(this._user, room).then(response => {
            this._currentRoom = response.room;
            this._eventManager.setCurrentRoom(this._currentRoom);
            return response;
        });
    }



    report = (event: EventResult | string, type: ReportType) => {
        const reason: ReportReason = {
            reporttype: type,
            userid: this._user.userid
        }
        return this._eventManager.reportEvent(event, reason);
    }

    exitRoom = (): Promise<RoomUserResult> => {
        if(!this._eventManager.getCurrentRoom()) {
            throw new SettingsError("Cannot exit if not in a room!");
        }
        return this._roomManager.exitRoom(this._user, this._currentRoom).then(response=>{
            this._eventManager.setCurrentRoom(null);
            return response;
        }).catch(e=>{
            throw e;
        })
    }

    createRoom = (room: Room): Promise<RoomResult> => {
        return this._roomManager.createRoom(room);
    }

    deleteRoom = (room: Room | string): Promise<ApiResult<null>> => {
        return this._roomManager.deleteRoom(room);
    }

    /**
     * Gets currently set room.  Returns the current room or undefined if a room has not been joined.
     */
    getCurrentRoom = (): Room | null => {
        return this._eventManager.getCurrentRoom();
    }

    setCurrentRoom = (room: RoomResult) => {
        this._currentRoom = room;
        this._eventManager.setCurrentRoom(room);
    }

    /**
     * ROOM COMMANDS SECTION
     */
    /**
     *
     * @param command
     * @param options
     */
    sendCommand = (command: string, options?: CommandOptions): Promise<ApiResult<null | Event>> => {
        return this._eventManager.sendCommand(this._user, command, options).then(response=>{
            if(command.startsWith('*')) {
                const onHelp = this._eventManager.getEventHandlers().onHelp;
                if( command.startsWith('*help') && onHelp  && onHelp instanceof Function ) {
                    onHelp(response);
                } else {
                    const adminCommand = this._eventManager.getEventHandlers().onAdminCommand;
                    if (adminCommand && adminCommand instanceof Function) {
                        // @ts-ignore
                        adminCommand(response);
                    }
                }
            }
            return response;
        })
    }

    sendReply = (message: string, replyto: Event |string, options?: CommandOptions): Promise<ApiResult<null>> => {
        return this._eventManager.sendReply(this._user, message, replyto, options);
    }

    sendReaction = (reaction: Reaction, reactToMessage: Event | string, options?: CommandOptions): Promise<ApiResult<null>> => {
        return this._eventManager.sendReaction(this._user, reaction, reactToMessage, options);
    }

    sendAdvertisement = (options: AdvertisementOptions): Promise<ApiResult<null>> => {
        return this._eventManager.sendAdvertisement(this._user, options);
    }

    sendGoal = (message?:string, img?: string, options?: GoalOptions): Promise<ApiResult<null>> => {
       return this._eventManager.sendGoal(this._user,img || this._defaultGoalImage || '', message, options)
    }

}


