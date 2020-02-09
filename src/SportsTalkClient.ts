import {
    AdvertisementOptions,
    ApiResult,
    CommandOptions,
    GoalOptions,
    EventHandlerConfig,
    Reaction,
    RoomResult,
    SportsTalkConfig,
    UserResult,
    Room,
    User, RoomUserResult
} from "./DataModels";
import {Promise} from "es6-promise";
import {DEFAULT_CONFIG, MISSING_ROOM} from "./constants";
import {IRoomManager, IEventManager, ISportsTalkClient, IUserManager} from "./API";
import {SettingsError} from "./errors";
import {RestfulEventManager} from "./impl/REST/RestfulEventManager"
import {RestfulRoomManager} from "./impl/REST/RestfulRoomManager";
import {RestfulUserManager} from "./impl/REST/RestfulUserManager";


export class SportsTalkClient implements ISportsTalkClient {

    private _config: SportsTalkConfig;
    //User
    private _user: User = {userid: "", handle: ""};

    // Track polling.
    private _currentRoom: RoomResult;

    // API setup for current room.
    private _updatesApi: string;
    private _commandApi: string;
    private _roomApi: string;

    // EventResult handlers

    private _defaultGoalImage: string | undefined;
    private _eventManager: IEventManager;
    private _roomManager: IRoomManager;
    private _userManager: IUserManager;

    getDebug = () => {
        return JSON.stringify(this);
    }
    /**
     * Configures and creates a SportsTalkClient
     * @param config
     * @param eventHandlers
     * @return SportsTalkClient.  Currently only a REST based client is supported.  Future SDK versions will implement other options such as firebase messaging and websockets
     */
    static create = (config: SportsTalkConfig = {}, eventHandlers?: EventHandlerConfig): SportsTalkClient => {
        const client = new SportsTalkClient();
        client.setConfig(config);
        if(eventHandlers) {
            client.setEventHandlers(eventHandlers);
        }
        return client;
    }

    setConfig = (config:SportsTalkConfig) => {
        this._config = Object.assign(DEFAULT_CONFIG, config);

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
    listRooms = (): Promise<Array<RoomResult>> => {
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
        return this._roomManager.joinRoom(this._user, room).then(response => {
            this._currentRoom = response.room;
            this._roomApi = `${this._config.endpoint}/room/${this._currentRoom.id}`
            this._commandApi = `${this._roomApi}/command`;
            this._updatesApi = `${this._roomApi}/updates`;
            this._eventManager.setCurrentRoom(this._currentRoom);
            return response;
        });
    }

    exitRoom = (): Promise<RoomUserResult> => {
        if(!this._currentRoom) {
            throw new SettingsError("Cannot exit if not in a room!");
        }
        return this._roomManager.exitRoom(this._user, this._currentRoom).then(response=>{
            this._eventManager.setCurrentRoom(null);
            return response;
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

    /**
     * ROOM COMMANDS SECTION
     */
    /**
     *
     * @param command
     * @param options
     */
    sendCommand = (command: string, options?: CommandOptions): Promise<ApiResult<null | Event>> => {
        return this._eventManager.sendCommand(this._user, this._currentRoom, command, options).then(response=>{
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
        return this._eventManager.sendReply(this._user, this._currentRoom, message, replyto, options);
    }

    sendReaction = (reaction: Reaction, reactToMessage: Event | string, options?: CommandOptions): Promise<ApiResult<null>> => {
        return this._eventManager.sendReaction(this._user, this._currentRoom, reaction, reactToMessage, options);
    }

    sendAdvertisement = (options: AdvertisementOptions): Promise<ApiResult<null>> => {
        return this._eventManager.sendAdvertisement(this._user, this._currentRoom, options);
    }

    sendGoal = (message?:string, img?: string, options?: GoalOptions): Promise<ApiResult<null>> => {
       return this._eventManager.sendGoal(this._user, this._currentRoom, img || this._defaultGoalImage || '', message, options)
    }

}


