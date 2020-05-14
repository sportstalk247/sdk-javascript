import {
    AdvertisementOptions,
    CommandOptions,
    GoalOptions,
    EventHandlerConfig,
    RoomResult,
    Room,
    RoomUserResult,
    EventResult,
    DeletedRoomResponse,
    CommandResponse,
    RoomExitResult,
    ChatUpdatesResult,
    RoomListResponse
} from "../models/ChatModels";
import {DEFAULT_CONFIG} from "./constants/api";
import {IRoomService, IChatEventService, IChatClient} from "../API/ChatAPI";
import {SettingsError} from "./errors";
import {RestfulChatEventService} from "./chat/REST/RestfulChatEventService"
import {RestfulChatRoomService} from "./chat/REST/RestfulChatRoomService";
import {RestfulUserService} from "./common/REST/RestfulUserService";
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

/**
 * The ChatClient is the primary class you will want to use if you are creating a chat application.
 * Common chat operations are abstracted through this class.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 */
export class ChatClient implements IChatClient {

    // Configuration settings
    private _config: SportsTalkConfig = {appId: ""};
    // User
    private _user: User = {userid: "", handle: ""};

    // Room state tracking
    private _currentRoom: RoomResult;

    // Default goal image URL for sending goal events
    private _defaultGoalImage: string | undefined;

    // These hold the services that APIs are delegated through
    private _eventService: IChatEventService;
    private _roomService: IRoomService;
    private _userService: IUserService;

    // A debug method for dumping the entire object tree if needed.
    getDebug = () => {
        return JSON.stringify(this);
    }

    /**
     * Configures and creates a ChatClient
     * @param config
     * @param eventHandlers
     * @return SportsTalkClient.  Currently only a REST based client is supported.  Future SDK versions will implement other options such as firebase messaging and websockets
     */
    static init = (config: SportsTalkConfig = {appId: ""}, eventHandlers?: EventHandlerConfig): IChatClient => {
        const client = new ChatClient();
        client.setConfig(config);
        if(eventHandlers) {
            client.setEventHandlers(eventHandlers);
        }
        return client;
    }

    /**
     * Sets the config and creates (if needed) the internal services used to power the Chat.
     * @param config
     */
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

        this._eventService = this._eventService || new RestfulChatEventService(this._config);
        this._roomService = this._roomService || new RestfulChatRoomService(this._config);
        this._userService = this._userService || new RestfulUserService(this._config);

        if(this._config.user){
            Object.assign(this._user, this._config.user);
        }
    }

    /**
     * Sets the default goal image
     * @param url a full URL, e.g. https://yourserver.com/some/image/url.png
     */
    setDefaultGoalImage = (url: string):string => {
        this._defaultGoalImage = url;
        return this._defaultGoalImage;
    }

    /**
     * Set the event handlers to receive chat events
     * @param eventHandlers
     */
    setEventHandlers = (eventHandlers: EventHandlerConfig) => {
        this._eventService.setEventHandlers(eventHandlers);
    }

    /**
     * Gets the current event handlers
     */
    getEventHandlers = ():EventHandlerConfig => {
        return this._eventService.getEventHandlers();
    }

    /**
     * Get the current event service
     */
    getEventService = ():IChatEventService => {
        return this._eventService;
    }

    /**
     * Get the current room service.
     */
    getRoomService = ():IRoomService => {
        return this._roomService;
    }

    /**
     * Start the "talk".  This will being retrieving events from sportstalk servers.
     */
    startChat = () => {
        this._eventService.startChat();
    }

    /**
     * Stop the talk.  No new events will be retrieved.  However, if there are events still in a queue that queue may continue until empty.
     */
    stopChat = () => {
        this._eventService.stopChat();
    }
    /**
     * Retrieve available rooms for this chat app.
     */
    listRooms = (): Promise<RoomListResponse> => {
        return this._roomService.listRooms();
    }
    /**
     * List all participants in a room.  Must have joined a room first.
     * @param cursor The cursor, used if you need to scroll through all users and there are over <maxresults> in the room.
     * @param maxresults The maximum number of results, defaults to 200.
     */
    listParticipants = (cursor?: string, maxresults: number = 200): Promise<Array<UserResult>> => {
        if(!this._currentRoom) {
            throw new SettingsError(MISSING_ROOM);
        }
        return this._roomService.listParticipants(this._currentRoom, cursor, maxresults);
    }

    /**
     * Set the chat user.
     * @param user
     */
    setUser = (user:User):User => {
       this._user = user;
       return this._user;
    }

    /**
     * Get the current user.
     */
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

    /**
     * Get the latest events from the server.  You probably want to use 'startTalk' instead.
     * This method will poll the server a single time for latest events.
     */
    public getLatestEvents = (): Promise<ChatUpdatesResult> => {
        return this._eventService.getUpdates()
    }

    /**
     * Join a chat room
     * @param room
     */
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



    /**
     * Exit a room.
     */
    exitRoom = (): Promise<RoomExitResult> => {
        if(!this._eventService.getCurrentRoom()) {
            throw new SettingsError("Cannot exit if not in a room!");
        }
        return this._roomService.exitRoom(this._user, this._currentRoom).then(response=>{
            return response;
        });
    }

    /**
     * Gets currently set room.  Returns the current room or undefined if a room has not been joined.
     */
    getCurrentRoom = (): RoomResult | null => {
        return this._eventService.getCurrentRoom();
    }

    /**
     * Set the current room state.
     * @param room
     */
    setCurrentRoom = (room: RoomResult) => {
        this._currentRoom = room;
        this._eventService.setCurrentRoom(room);
    }

    /**
     * ROOM COMMANDS SECTION
     */

    /**
     * Send a chat command.  Usually only the first param is needed.
     * @param command the chat string, which can also include admin or action commands by starting with `/` or `*`
     * @param options the custom parameters.  See CommandOptions interface for details.
     */
    sendCommand = (command: string, options?: CommandOptions): Promise<MessageResult<CommandResponse>> => {
        return this._eventService.sendCommand(this._user, command, options);
    }


    /**
     * Reply to an event
     * @param message the text that will make up the reply
     * @param replyto the Event that is being replied to or the event ID as a string
     * @param options custom options, will depend on your chat implementation
     */
    sendReply = (message: string, replyto: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse | null>> => {
        return this._eventService.sendReply(this._user, message, replyto, options);
    }

    /**
     * React to an event
     * @param reaction
     * @param reactToMessage
     * @param options
     */
    sendReaction = (reaction: Reaction, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>> => {
        return this._eventService.sendReaction(this._user, reaction, reactToMessage, options);
    }

    /**
     * Send an advertisement custom event
     * @param options
     */
    sendAdvertisement = (options: AdvertisementOptions): Promise<MessageResult<null | CommandResponse>> => {
        return this._eventService.sendAdvertisement(this._user, options);
    }

    /**
     * Send a goal event.
     * This is a convenience wrapper around custom messagings, if a default image is set, no further parameters are needed.
     *
     * @param message The message to be sent with the goal.  Defaults to GOAL!!!
     * @param img The full url of the image to send as part of the goal, e.g. https://....
     * @param options other custom options to send.
     */
    sendGoal = (message?:string, img?: string, options?: GoalOptions): Promise<MessageResult<CommandResponse>> => {
       return this._eventService.sendGoal(this._user,img || this._defaultGoalImage || '', message, options)
    }

    /**
     * Delete an event
     * @param event the event to be deleted.
     * @return the result of the API call.
     */
    deleteEvent = (event: EventResult | string) =>{
        return this._eventService.deleteEvent(event);
    }

    /**
     * Report a chat event for violating community policy.
     * @param event
     * @param type
     */
    report = (event: EventResult | string, type: ReportType) => {
        const reason: ReportReason = {
            reporttype: type,
            userid: this._user.userid
        }
        return this._eventService.reportEvent(event, reason);
    }

    /**
     * Create a new chatroom
     * @param room the Room object describing the room
     * @return the Room created on the server, with a roomID.
     */
    createRoom = (room: Room): Promise<RoomResult> => {
        return this._roomService.createRoom(room);
    }

    /**
     * Update a room that's been created.
     * @param room An already created room with a roomId.
     * @return the updated room information.
     */
    updateRoom = (room:RoomResult): Promise<RoomResult> => {
        return this._roomService.updateRoom(room);
    }

}


