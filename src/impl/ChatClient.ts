import {
    AdvertisementOptions,
    CommandOptions,
    GoalOptions,
    EventHandlerConfig,
    ChatRoomResult,
    ChatRoom,
    JoinChatRoomResponse,
    EventResult,
    DeletedChatRoomResponse,
    CommandResponse,
    ChatRoomExitResult,
    ChatUpdatesResult,
    ChatRoomListResponse,
    ChatOptionsEventType,
    BounceUserResult,
    EffectOptions,
    EventType,
    ChatEventsList,
    TimestampRequest, MuteOptions, UserEffectFlags
} from "../models/ChatModels";
import {DEFAULT_CONFIG} from "./constants/api";
import {IRoomService, IChatEventService, IChatClient, IChatModerationService} from "../API/ChatAPI";
import {SettingsError} from "./errors";
import {RestfulChatEventService} from "./REST/chat/RestfulChatEventService"
import {RestfulChatRoomService} from "./REST/chat/RestfulChatRoomService";
import {RestfulUserService} from "./REST/users/RestfulUserService";
import {
    Reaction,
    ReportReason,
    ReportType,
    SportsTalkConfig,
    User,
    UserResult,
    MessageResult,
    RestApiResult,
    UserSearchType,
    UserListResponse,
    ListRequest,
    UserDeletionResponse,
    ErrorResult, NotificationListRequest, Notification
} from "../models/CommonModels";
import {MISSING_ROOM, MUST_SET_USER, THROTTLE_ERROR} from "./constants/messages";
import {forceObjKeyOrString} from "./utils";
import {INotificationService, IUserService} from "../API/Users";
import {setTimeout} from "timers";
import {RestfulNotificationService} from "./REST/notifications/RestfulNotificationService";
import {RestfulChatModerationService} from "./REST/chat/RestfulChatModerationService";

/**
 * ChatClient provides an interface to chat applications.
 * The ChatClient is the primary class you will want to use if you are creating a chat application.
 * Common chat operations are abstracted through this class.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export class ChatClient implements IChatClient {

    /**
     * Holds the configuration for the ChatClient and Backing services.
     * @private
     */
    private _config: SportsTalkConfig = {appId: ""};
    /**
     * Holds the current user for the client.
     * @private
     */
    private _user: User = {userid: "", handle: ""};

    private _lastCommand: string | null = null;
    private _lastCommandTime: number = 0;
    private _lastCommandTimeoutDuration = 3000;

    /**
     * Holds the currently active chat room being observed by the client.
     * A client can observe one room at a time.
     * @private
     */
    private _currentRoom: ChatRoomResult;

    /**
     * Convenience holder for a goal image for the goal API
     * @private
     */
    private _defaultGoalImage: string | undefined;

    /**
     * Holds an event service used by the ChatClient
     * @private
     */
    private _eventService: IChatEventService;

    /**
     * Holds the RoomService used by the ChatClient
     * @private
     */

    private _roomService: IRoomService;
    /**
     * Holds the UserService used by the ChatClient
     * @private
     */
    private _userService: IUserService;

    /**
     * Notification Service
     * @private
     */
    private _notificationServce: INotificationService

    private _moderationService: IChatModerationService

    /**
     * Debugging method to grab the internal state and help debug.
     */
    _getDebug = () => {
        return JSON.stringify(this);
    }

    private _throttle(command: string) {
        if(command == this._lastCommand && (new Date().getTime()-this._lastCommandTime) < this._lastCommandTimeoutDuration) {
            const throttleError = new Error(THROTTLE_ERROR);
            // @ts-ignore
            throttleError.code = 405;
        } else {
            this._lastCommandTime = new Date().getTime();
            this._lastCommand = command
        }
    }

    private constructor() {}

    /**
     * Configures and creates a ChatClient
     * @param config
     * @param eventHandlers
     * @return SportsTalkClient.  Currently only a REST based client is supported.  Future SDK versions will implement other options such as firebase messaging and websockets
     */
    static init = (config: SportsTalkConfig = {appId: ""}, eventHandlers?: EventHandlerConfig): ChatClient => {
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
        if(this._notificationServce) {
            this._notificationServce.setConfig(this._config);
        }
        if(this._moderationService) {
            this._moderationService.setConfig(this._config);
        }

        this._eventService = this._eventService || new RestfulChatEventService(this._config);
        this._roomService = this._roomService || new RestfulChatRoomService(this._config);
        this._userService = this._userService || new RestfulUserService(this._config);
        this._notificationServce = this._notificationServce || new RestfulNotificationService(this._config);
        this._moderationService = this._moderationService || new RestfulChatModerationService(this._config);
        if(this._config.user){
            Object.assign(this._user, this._config.user);
        }
    }

    /**
     * Returns a specific event for the room
     * @param id
     * @param roomid OPTIONAL.  The room id for the room holding the event. Defaults to the current room. If no value passed and no room set, the method will throw an error.
     */
    getEventById = (id:string, roomid?: string): Promise<EventResult> => {
        return this._roomService.getEventById(id, roomid || this._currentRoom.id);
    }

    /**
     * Sets the default goal image
     * @param url a full URL, e.g. https://yourserver.com/some/image/url.png
     * @return string The url that was set for the goal image.
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
     * Gets the event handlers
     * @return eventsHandlerconfig The configuration object for event handler functions.
     */
    getEventHandlers = ():EventHandlerConfig => {
        return this._eventService.getEventHandlers();
    }

    /**
     * @return IChatEventService The backing event service.
     */
    getEventService = ():IChatEventService => {
        return this._eventService;
    }

    /**
     * Get the current room service.
     * @return IRoomService
     */
    getRoomService = ():IRoomService => {
        return this._roomService;
    }

    /**
     * Start the "talk".  This will being retrieving events from sportstalk servers.
     * If you pass a room parameter, will join the room and then start listening to updates.
     */
    startListeningToEventUpdates = (room?: ChatRoomResult) => {
        if(room) {
            return this.joinRoom(room).then(()=>this.startListeningToEventUpdates())
        }
        this._eventService.startEventUpdates();
    }

    /**
     * Stop the talk.  No new events will be retrieved.  However, if there are events still in a queue that queue may continue until empty.
     */
    stopListeningToEventUpdates = () => {
        this._eventService.stopEventUpdates();
    }
    /**
     * Retrieve available rooms for this chat app.
     */
    listRooms = (cursor?: string, limit?: number): Promise<ChatRoomListResponse> => {
        return this._roomService.listRooms(cursor, limit);
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
    setUser = (user:User):ChatClient => {
       this._user = user;
       this._eventService.setUser(this._user);
       return this;
    }

    /**
     * Get the current user.
     */
    getCurrentUser = (user?: string): User |undefined => {
        return this._user;
    }

    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
     */
    createOrUpdateUser = (user: User, setDefault:boolean = true): Promise<UserResult> => {
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
    public getUpdates = (): Promise<ChatUpdatesResult> => {
        return this._eventService.getUpdates()
    }

    /**
     * Join a chat room
     * @param room
     */
    joinRoom = (room: ChatRoomResult | string, ignoreInitialMessages:  boolean = false): Promise<JoinChatRoomResponse> => {
        return this._roomService.joinRoom(room, this._user).then(async (response:JoinChatRoomResponse) => {
            this._currentRoom = response.room;
            this._eventService.setCurrentRoom(this._currentRoom);
            this._eventService.setPreviousEventsCursor(response.previouseventscursor || '');
            response.eventscursor.events.reverse();
            if(!ignoreInitialMessages) {
                await this._eventService.handleUpdates(response.eventscursor);
            }
            return response;
        })
    }

    /**
     * Join a room by it's customid
     * @param user
     * @param room
     */
    joinRoomByCustomId(room: ChatRoom | string, ignoreInitialMessages: boolean = false): Promise<JoinChatRoomResponse> {
        return this._roomService.joinRoomByCustomId(room, this._user).then(async (response:JoinChatRoomResponse) => {
            this._currentRoom = response.room;
            this._eventService.setCurrentRoom(this._currentRoom);
            this._eventService.setPreviousEventsCursor(response.previouseventscursor || '');
            if(!ignoreInitialMessages) {
                await this._eventService.handleUpdates(response.eventscursor);
            }
            return response;
        })
    }

    /**
     * Exit a room.
     */
    exitRoom = (): Promise<ChatRoomExitResult> => {
        if(!this._eventService.getCurrentRoom()) {
            throw new SettingsError("Cannot exit if not in a room!");
        }
        return this._roomService.exitRoom(this._user, this._currentRoom).then(response=>{
            return response;
        });
    }

    /**
     * Removes all user messages from a room.
     * @param user Optional.  A user whose messages to purge from room.
     * @param room Optional.  The room to purge messages from. Defaults to current room, if set.  Otherwise throws an error.
     */
    purgeUserMessagesFromRoom = (user?: UserResult | string, room?: ChatRoomResult | string): Promise<RestApiResult<null>> => {
        const theUser = user || this._user;
        const theRoom = room || this._currentRoom;
        if(!theRoom) {
            throw new SettingsError("Requires setting a room to issue purge");
        }
        return this._roomService.purgeUserMessagesFromRoom(theRoom, theUser);
    }

    /**
     * Gets currently set room.  Returns the current room or undefined if a room has not been joined.
     */
    getCurrentRoom = (): ChatRoomResult | null => {
        return this._eventService.getCurrentRoom();
    }

    /**
     * Set the current room state.
     * @param room
     */
    setCurrentRoom = (room: ChatRoomResult) => {
        this._currentRoom = room;
        this._eventService.setCurrentRoom(room);
    }

    getRoomDetails = (room:ChatRoomResult | string): Promise<ChatRoomResult | null> => {
       return this._roomService.getRoomDetails(room);
    }

    /**
     * Returns the ChatRoomResult for a given id.
     * @param room
     */
    getRoomDetailsByCustomId = (room: ChatRoomResult | string): Promise<ChatRoomResult | null> => {
        return this._roomService.getRoomDetailsByCustomId(room);
    }

    /**
     * Checks if a user is bounced from a room.  If forceRefresh is true, will always ask the server for fresh data.
     * Will also check the server if the current room is just an ID and not a full ChatRoomResult object.
     * @param user
     * @param forceRefresh will force a server update of the room before checking status.
     * @param room optional room, will use current room if not set.
     */
    isUserBouncedFromRoom = async (user: User | string, forceRefresh?: boolean, room?: ChatRoomResult | string): Promise<boolean> => {
        let chatroom: ChatRoomResult | string | null = room || this._currentRoom || null;
        if(!chatroom) {
            throw new Error("Invalid room, make sure the room has a valid ID");
        }
        // @ts-ignore
        let userid: string
        // @ts-ignore
        if(user) {
            // @ts-ignore
            userid = user.userid || user
        } else {
            throw new Error("Must provide a user or userid");
        }
        // Force refresh if room is an ID and not a room result.
        // @ts-ignore
        if(forceRefresh || !chatroom.id) {
            chatroom = await this.getRoomDetails(chatroom);
            if(chatroom && this._currentRoom && this._currentRoom.id) {
                if(chatroom.id === this._currentRoom.id) {
                    this._currentRoom = chatroom;
                }
            }
        }

        // @ts-ignore
        if(!chatroom || !chatroom.bouncedusers || chatroom.bouncedusers.length === 0) {
            return false;
        }
        // @ts-ignore
        if(chatroom && chatroom.bouncedusers && chatroom.bouncedusers.includes(userid)) {
            return true;
        }
        return false;
    }

    getUserEffects = async(user?: User | string, forceRefresh?: boolean, room?: ChatRoomResult | string): Promise<UserEffectFlags> =>{
        let chatroom: ChatRoomResult | string | null = room || this._currentRoom || null;
        let finalUser: User | string = user || this._user
        if(!chatroom) {
            throw new Error("Need to specify or join a chat room to check user effects");
        }
        if(!finalUser){
            throw new Error("Need to specify a user or set current user to get effects");
        }
        const userid:string = forceObjKeyOrString(finalUser, 'userid');
        return this._moderationService.listRoomEffects(chatroom).then(results=>{
            const activeEffects: UserEffectFlags = {
                mute: false,
                shadowban: false,
                flag: false
            }

            results?.effects?.map(effect=>{
                if(effect.user.userid == userid) {
                    if(effect.effect.effecttype === 'flag') {
                        activeEffects.flag = true
                        return;
                    }
                    if(effect.effect.effecttype === 'mute') {
                        activeEffects.mute = true;
                        return;
                    }
                    if(effect.effect.effecttype === 'shadowban') {
                        activeEffects.shadowban = true;
                        return;
                    }
                }
            });
            return activeEffects;
        })
    }

    /**
     * Checks if a user is bounced from a room.  If forceRefresh is true, will always ask the server for fresh data.
     * Will also check the server if the current room is just an ID and not a full ChatRoomResult object.
     * @param user
     * @param forceRefresh will force a server update of the room before checking status
     * @param room optional room, will use current room if not set.
     */
    isUserShadowbanned = async (user: User | string, forceRefresh?: boolean, room?: ChatRoomResult | string): Promise<boolean> => {
        let chatroom: ChatRoomResult | string | null = room || this._currentRoom || null;
        if(!chatroom) {
            throw new Error("Invalid room, make sure the room has a valid ID");
        }
        // @ts-ignore
        let userid: string
        // @ts-ignore
        if(user) {
            // @ts-ignore
            userid = user.userid || user
        } else {
            throw new Error("Must provide a user or userid");
        }
        // Force refresh if room is an ID and not a room result.
        // @ts-ignore
        if(forceRefresh || !chatroom.id) {
            chatroom = await this.getRoomDetails(chatroom);
            if(chatroom && this._currentRoom && this._currentRoom.id) {
                if(chatroom.id === this._currentRoom.id) {
                    this._currentRoom = chatroom;
                }
            }
        }

        // @ts-ignore
        if(!chatroom || !chatroom.shadowbannedusers || chatroom.shadowbannedusers.length === 0) {
            return false;
        }
        // @ts-ignore
        if(chatroom && chatroom.shadowbannedusers && chatroom.shadowbannedusers.includes(userid)) {
            return true;
        }
        return false;
    }


    /**
     * ROOM COMMANDS SECTION
     */

    /**
     * Send a chat command.  Usually only the first param is needed.
     * @param command the chat string, which can also include admin or action commands by starting with `/` or `*`
     * @param options the custom parameters.  See CommandOptions interface for details.
     */
    executeChatCommand = (command: string, options?: CommandOptions): Promise<MessageResult<CommandResponse> | ErrorResult> => {
        this._throttle(command);
        return this._eventService.executeChatCommand(this._user, command, options);
    }

    /**
     * Sends an announcement, forces the announcement eventType.  Convenience method around executeChatCommand.
     * @param command
     * @param options
     */
    sendAnnouncement = (command:string, options?: CommandOptions): Promise<MessageResult<CommandResponse> | ErrorResult> => {
        this._throttle(command);
        return this._eventService.executeChatCommand(this._user, command, Object.assign(options || {}, {eventtype: ChatOptionsEventType.announcement}))
    }


    /**
     * Reply to an event
     * @param message the text that will make up the reply
     * @param replyto the Event that is being replied to or the event ID as a string
     * @param options custom options, will depend on your chat implementation
     */
    sendQuotedReply = (message: string, replyto: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse | null>> => {
        this._throttle(message);
        return this._eventService.sendQuotedReply(this._user, message, replyto, options);
    }

    /**
     * Reply to an event
     * @param message the text that will make up the reply
     * @param replyto the Event that is being replied to or the event ID as a string
     * @param options custom options, will depend on your chat implementation
     */
    sendThreadedReply =(message: string, replyto: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse | null>> => {
        this._throttle(message);
        return this._eventService.sendThreadedReply(this._user, message, replyto, options);
    }

    /**
     * React to an event
     * @param reaction
     * @param reactToMessage
     * @param options
     */
    reactToEvent = (reaction: Reaction | string, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>> => {
        return this._eventService.reactToEvent(this._user, reaction, reactToMessage, options);
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
     * Flags an event as deleted
     * @param event the event to be deleted.
     * @return the result of the API call.
     */
    flagEventLogicallyDeleted = (event: EventResult | string, permamentifnoreplies=true): Promise<MessageResult<null>> =>{
        return this._eventService.flagEventLogicallyDeleted(this._user, event, permamentifnoreplies)
    }

    /**
     * Permanently deletes an event.
     * @param event the event to be deleted.
     * @return the result of the API call.
     */
    permanetlyDeleteEvent = (event: EventResult | string): Promise<MessageResult<null>> =>{
        return this._eventService.permanetlyDeleteEvent(this._user, event)
    }

    /**
     * Report a chat event for violating community policy.
     * @param event
     * @param type
     */
    reportMessage = (event: EventResult | string, type: ReportType):Promise<MessageResult<null>> => {
        const reason: ReportReason = {
            reporttype: type,
            userid: this._user.userid
        }
        return this._eventService.reportMessage(event, reason);
    }

    /**
     * Create a new chatroom
     * @param room the Room object describing the room
     * @return the Room created on the server, with a roomID.
     */
    createRoom = (room: ChatRoom): Promise<ChatRoomResult> => {
        return this._roomService.createRoom(room);
    }

    /**
     * Update a room that's been created.
     * @param room An already created room with a roomId.
     * @return the updated room information.
     */
    updateRoom = (room:ChatRoomResult): Promise<ChatRoomResult> => {
        return this._roomService.updateRoom(room);
    }

    deleteRoom = (room: ChatRoomResult): Promise<DeletedChatRoomResponse> => {
        return this._roomService.deleteRoom(room);
    }

    setBanStatus = (user: User | string, isBanned: boolean): Promise<UserResult> => {
        return this._userService.setBanStatus(user, isBanned);
    }

    /**
     * Adds or removes the shadowban status on the user.
     * This method is global.  If a room is specified in options it will be ignored.
     * @param user
     * @param options
     */
    setShadowBanStatus = (user: User | string, options: EffectOptions): Promise<UserResult | ChatRoomResult> => {
        if(options && options.roomid) {
            return this._roomService.setRoomShadowbanStatus(user, options.roomid || this._currentRoom, options.applyeffect, options.expireseconds)
        }
        return this._userService.setShadowBanStatus(user, options.applyeffect, options.expireseconds);
    }

    shadowBanUserFromRoom = (user: User | string, expireseconds: number, roomid?: string) => {
        return this._roomService.setRoomShadowbanStatus(user, roomid || this._currentRoom, true, expireseconds)
    }

    unShadowBanUserFromRoom = (user: User | string, expireseconds: number, roomid?: string) => {
        return this._roomService.setRoomShadowbanStatus(user, roomid || this._currentRoom, false, expireseconds)
    }

    muteUserInRoom = (user:User | string, mute: boolean, expireseconds?: number, room?: ChatRoomResult | string): Promise<ChatRoomResult> => {
        const targetRoom = room || this._currentRoom;
        return this._roomService.setRoomMuteStatus(user, targetRoom, mute, expireseconds)
    }

    searchUsers = (search: string, type: UserSearchType, limit?:number): Promise<UserListResponse> => {
        return this._userService.searchUsers(search, type, limit);
    }

    listUsers = (request?: ListRequest): Promise<UserListResponse> => {
        return this._userService.listUsers(request);
    }
    listEventsByType = (type:EventType): Promise<ChatEventsList> =>  {
        return this._eventService.listEventsByType(type);
    }

    /**
     * Requests user notifications.
     * Max limit is 100. Requests over this limit will return a maximum of 100 notifications.
     * Calling the API without any parameters will request 50 notifications for the current user.
     * if no user is set, will throw an error.
     * @param request {userid?:string, limit?:number, includeread?:boolean, cursor?: string}
     */
    listUserNotifications = (request: Partial<NotificationListRequest> = {}): Promise<any> => {
        const requestedNotifications:NotificationListRequest = Object.assign({
                limit : 50,
                userid: this._user ? this._user.userid : '',
                includeread: false,
            }, request);
        return this._notificationServce.listUserNotifications(requestedNotifications)
    }

    markAllNotificationsAsRead = (user?: User | string, deleteAll: boolean = true): Promise<any> => {
        const targetuser = user || this._user;
        return this._notificationServce.markAllNotificationsAsRead(targetuser, deleteAll);
    }

    setNotificationReadStatus = (notificationid: string, read?: boolean, userid?: string): Promise<Notification> => {
        const finaluserid = userid || this._user ? this._user.userid : ''
        return this._notificationServce.setNotificationReadStatus(notificationid, finaluserid, read);
    }

    setNotificationReadStatusByChatEventId(chateventid: string, read?: boolean, userid?: string): Promise<Notification> {
        const finaluserid = userid || this._user ? this._user.userid : ''
        return this._notificationServce.setNotificationReadStatusByChatEventId(chateventid, finaluserid, read)
    }

    deleteNotification = async (notificationid: string, userid?: string): Promise<Notification> => {
        const finaluserid = userid || this._user ? this._user.userid : ''
        return this._notificationServce.deleteNotification(notificationid, finaluserid)
    }

    deleteNotificationByChatEventId = (chateventid: string, userid?: string): Promise<Notification> => {
        const finaluserid = userid || this._user ? this._user.userid : ''
        return this._notificationServce.deleteNotificationByChatEventId(chateventid, finaluserid)
    }

    deleteUser = (user:User | string):Promise<UserDeletionResponse> => {
        return this._userService.deleteUser(user);
    }

    getUserDetails = (user: User | string): Promise<UserResult> => {
        return this._userService.getUserDetails(user);
    }

    /**
     * Checks if the current user has already reported a message.
     * If no current user set or provided, throws an error;
     * @param event the event to check.  Will evaluate if the given user or default user has reported it.
     * @param user optional. A user to check for reporting.
     * @return boolean true if reported by the given user.
     */
    messageIsReported = (event: EventResult, user?: User | string): Boolean => {
        const checkUser = user || this._user;
        const id = forceObjKeyOrString(checkUser, 'userid');
        if(id) {
            return false;
        }
        if(event && event.reports && event.reports.length) {
            const isReported = event.reports.find(report=>report.userid == id);
            return !!isReported;
        }
        return false;
    }

    /**
     * Checks if a message was reacted to by the current user.
     * @param event The event to evaluate.
     * @param reaction true or false.  Returns false if no user set.
     */
    messageIsReactedTo = (event: EventResult, reaction:Reaction | string): Boolean => {
        if(!this._user || !this._user.userid) {
            return false;
        }

        if(event && event.reactions && event.reactions.length) {
            const found = event.reactions.find(report=>report.type === reaction);
            if(found!==undefined) {
                const ourUser = found.users.find(user=>user.userid === this._user.userid)
                return !!ourUser;
            }
        }
        return false;
    }

    /**
     * Lists events older than a given cursor.  Will default to the last known cursor if updates have been triggered.
     * @param cursor
     * @param limit
     */
    listPreviousEvents = (cursor:string, limit:number=100):Promise<ChatUpdatesResult> => {
        return this._eventService.listPreviousEvents(cursor, limit);
    }
    /**
     * Bounces a user from a room, removing from room and banning them.
     *
     * @param user a UserResult (with id) or a string representing the userid
     * @param message the bounce reason.
     * @return BounceUserResult the result of the command from the server.
     */
    bounceUser = async (user: UserResult | string, message: string): Promise<BounceUserResult> => {
        const bounce: RestApiResult<BounceUserResult> = await this._roomService.bounceUserFromRoom( this._currentRoom , user, message);
        return bounce.data;
    }
    /**
     * Removes a user from the bounce list if they were bounced before. Allows them to rejoin chat.
     *
     * @param user a UserResult (with id) or a string representing the userid
     * @param message the bounce reason.
     * @return BounceUserResult the result of the command from the server.
     */
    unbounceUser = async (user: UserResult | string, message: string): Promise<BounceUserResult> => {
        const bounce: RestApiResult<BounceUserResult> = await this._roomService.unbounceUserFromRoom( this._currentRoom , user, message);
        return bounce.data;
    }

    /**
     * Manually set the cursor used to grab new updates.
     * You may want to use this and setPreviousEventsCursor if you are scrolling through a large number of messages
     * and wish to limit the number of events somehow to improve UI responsiveness.
     * @param cursor
     */
    setUpdatesCursor = (cursor: string) => {
        this._eventService.setUpdatesCursor(cursor);
    }

    /**
     * Manually set the cursor holding the oldest event known, for scrollback.
     * You may need to use this if you scroll back a lot
     * @param cursor
     */
    setPreviousEventsCursor = (cursor:string) =>{
        this._eventService.setPreviousEventsCursor(cursor);
    }

    /**
     * Reports a user.
     * @param userToReport the user who is causing problems
     * @param reportedBy The user who is reporting the bad behavior.
     * @param reportType The type of report, either 'abuse' or 'spam'
     * @param room if specified, will not report the user globally but only in the current room.
     */
    reportUser = (userToReport: User | string, reportedBy: User | string, reportType: ReportType = ReportType.abuse): Promise<User> => {
        return this._userService.reportUser(userToReport, reportedBy, reportType)
    }

    reportUserInRoom = (userToReport: User | string, reportedBy: User | string, reportType: ReportType = ReportType.abuse, room: ChatRoomResult | string): Promise<ChatRoomResult> => {
        return this._roomService.reportUser(userToReport, reportedBy, reportType, room)
    }
    updateChatEvent = (event: EventResult | string, body: string, user?: string | User): Promise<EventResult> => {
        return this._eventService.updateChatEvent(event, body, user);
    }
    listEventsByTimestamp = (query: TimestampRequest): Promise<ChatEventsList> => {
        return this._eventService.listEventsByTimestamp(query);
    }
}


