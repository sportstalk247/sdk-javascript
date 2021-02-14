import {IRoomService} from "../../../API/ChatAPI";
import {
    EventResult,
    ChatRoom,
    ChatRoomResult,
    JoinChatRoomResponse,
    DeletedChatRoomResponse,
    ChatRoomExitResult,
    ChatRoomListResponse,
    EventListResponse,
    BounceUserResult,
    ShadowbanUserApiData, MuteUserApiData
} from "../../../models/ChatModels";
import {stRequest} from '../../network';
import {GET, DELETE, POST, API_SUCCESS_MESSAGE} from "../../constants/api";
import {buildAPI, forceObjKeyOrString, getJSONHeaders, getUrlEncodedHeaders} from "../../utils";
import {ReportType, RestApiResult, SportsTalkConfig, User, UserResult} from "../../../models/CommonModels";
import {AxiosRequestConfig} from "axios";
import {SettingsError} from "../../errors";

/**
 * This room uses REST to manage sportstalk chat rooms.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export class RestfulChatRoomService implements IRoomService {
    private _config: SportsTalkConfig;
    private _apiHeaders = {};
    private _jsonHeaders = {}
    private _apiExt = 'chat/rooms';

    constructor(config:SportsTalkConfig) {
        this.setConfig(config);
    }

    /**
     * Set config
     * @param config
     */
    setConfig = (config: SportsTalkConfig) => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken);
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
    }

    /**
     * RoomResult Handling
     */
    listRooms = (cursor?: string, limit?: number): Promise<ChatRoomListResponse> => {
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}?cursor=${cursor ? cursor : ''}&limit=${ limit ? limit : 100}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config).then(result=>{
            return result.data;
        });
    }

    /**
     * Delete a room.
     * @param room
     */
    deleteRoom = (room: ChatRoom | string): Promise<DeletedChatRoomResponse> => {
        // @ts-ignore
        const id =  forceObjKeyOrString(room);
        const config:AxiosRequestConfig = {
            method: DELETE,
            url: buildAPI(this._config,`${this._apiExt}/${id}`),
            headers: this._jsonHeaders
        };
        // @ts-ignore
        return stRequest(config).then(result=>{
            return result.data;
        });
    }

    /**
     * Create a new room
     * @param room
     */
    createRoom = (room: ChatRoom): Promise<ChatRoomResult> => {
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, this._apiExt),
            headers: this._jsonHeaders,
            data: room
        };
        return stRequest(config).then(result=>{
            return result.data;
        });
    }

    /**
     *
     * @param user
     * @param room
     * @param cursor
     * @param limit
     */
    // @ts-ignore
    listUserMessages = (user: User | string, room: ChatRoom | string, cursor: string = "", limit: number = 100): Promise<EventListResponse> => {
        // @ts-ignore
        const roomid = forceObjKeyOrString(room);
        const userid = forceObjKeyOrString(user, 'userid');
        const url = buildAPI(this._config, `${this._apiExt}/${roomid}/messagesbyuser/${userid}/?limit=${limit ? limit: 100}&cursor=${cursor ? cursor : ''}`);
        return stRequest({
            method: GET,
            url: url,
            headers: this._jsonHeaders
        }).then(result => {
            return result.data
        });
    };


    /*
    * List the participants in a room
    * @param cursor
    * @param maxresults
    */
    listParticipants = (room: ChatRoom, cursor?: string, maxresults: number = 200): Promise<Array<UserResult>> => {
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config,`${this._apiExt}/${room.id}/participants?cursor=${cursor ? cursor : ''}&maxresults=${maxresults ? maxresults : 200}`),
            headers: this._jsonHeaders
        };
        return stRequest(config).then(result=>result.data);
    }

    /**
     * Join a room
     * @param user
     * @param room
     */
    joinRoom = (room: ChatRoomResult | string, user: User): Promise<JoinChatRoomResponse> => {
        // @ts-ignore
        const roomId = forceObjKeyOrString(room);
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`${this._apiExt}/${roomId}/join`),
            headers: this._jsonHeaders,
        }
        if(user && user.userid) {
            config.data = {
                userId: user.userid,
                handle: user.handle,
                displayname: user.displayname || "",
                pictureurl: user.pictureurl || "",
                profileurl: user.profileurl || "",
            }
        }
        return stRequest(config).then(response => {
            return response.data;
        })
    }

    /**
     * Join a room
     * @param user
     * @param room
     */
    joinRoomByCustomId(room: ChatRoom | string, user?: User): Promise<JoinChatRoomResponse> {
        // @ts-ignore
        const customId = forceObjKeyOrString(room, 'customid');
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`chat/roomsbycustomid/${customId}/join`),
            headers: this._jsonHeaders,
        }
        if(user) {
            config.data = {
                userId: user.userid,
                handle: user.handle,
                displayname: user.displayname || "",
                pictureurl: user.pictureurl || "",
                profileurl: user.profileurl || "",
            }
        }
        return stRequest(config).then(response => {
            return response.data;
        })
    }

    /**
     * Returns a specific event for the room
     * @param id
     * @param roomid OPTIONAL.  The room id for the room holding the event. Defaults to the current room. If no value passed and no room set, the method will throw an error.
     */
    getEventById = (eventid:string, roomid: string): Promise<EventResult> => {
        if(!roomid) {
            throw new SettingsError("Cannot retrieve event: No room selected");
        }
        if(!eventid) {
            throw new SettingsError("Cannot retrieve event: Invalid event ID");
        }
        const request: AxiosRequestConfig =  {
            method: GET,
            url: buildAPI(this._config,`${this._apiExt}/${roomid}/events/${eventid}`),
            headers: this._apiHeaders
        };
        return stRequest(request).then((result) => {
            return result.data;
        });
    }


    /**
     * Removes a user from a room.
     * @param user The user to exit from the room, or their ID.
     * @param room The chatroom to exit or it's ID.
     */
    exitRoom = (user: User | string, room: ChatRoom | string): Promise<ChatRoomExitResult> => {
        const roomId = forceObjKeyOrString(room);
        const userId = forceObjKeyOrString(user, 'userid');
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`${this._apiExt}/${roomId}/exit`),
            headers: this._jsonHeaders,
            data: {
                userid: userId
            }
        };
        return stRequest(config).then(response => {
            return <ChatRoomExitResult> response.message
        })
    }

    /**
     * Sets a room to be closed.
     * @param room The room to open
     */
    closeRoom = (room:ChatRoomResult | string): Promise<ChatRoomResult> => {
        const roomId = forceObjKeyOrString(room);
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`${this._apiExt}/${roomId}`),
            headers: this._jsonHeaders,
            data: {roomisopen: false}
        };
        return stRequest(config).then(response => {
            return <ChatRoomResult> response.message
        })
    }

    /**
     * Sets a room to be open.
     * @param room The room to open
     */
    openRoom = (room:ChatRoomResult | string): Promise<ChatRoomResult> => {
        const roomId = forceObjKeyOrString(room);
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`${this._apiExt}/${roomId}`),
            headers: this._jsonHeaders,
            data: {roomisopen: true}
        };
        return stRequest(config).then(response => {
            return <ChatRoomResult> response.message
        })
    }

    /**
     * Will update room settings
     * @param room A ChatRoomResult.  The room must already exist.  All settings sent will be overridden.
     */
    updateRoom = (room:ChatRoomResult): Promise<ChatRoomResult> => {
        const roomId = forceObjKeyOrString(room);
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`${this._apiExt}/${roomId}`),
            headers: this._jsonHeaders,
            data: room,
        };
        return stRequest(config).then(response => {
            return <ChatRoomResult> response.message
        })
    }

    /**
     * Will retrieve room details
     * @param room A ChatRoomResult object or a room id.
     */
    getRoomDetails = (room:ChatRoomResult | string): Promise<ChatRoomResult | null> => {
        const roomId = forceObjKeyOrString(room);
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config,`${this._apiExt}/${roomId}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config).then(result=>result.data);
    }

    /**
     * Will retrieve the room details.
     * @param room a customid for a room, or a ChatRoomResult with a customID set.
     */
    getRoomDetailsByCustomId = (room: ChatRoomResult | string): Promise<ChatRoomResult | null> => {
        const roomId = forceObjKeyOrString(room, 'customid');
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config,`chat/roomsbycustomid/${roomId}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config).then(result=>result.data);
    }

    /**
     * Will remove all of a user's messages from a room and send a purge event to clients.
     * @param room the ChatRoomResult or a room ID.
     * @param user the User or a userid string.
     */
    purgeUserMessagesFromRoom = (room: ChatRoomResult | string, user: User | string): Promise<RestApiResult<BounceUserResult>> => {
        const roomId = forceObjKeyOrString(room, 'id');
        const userId = forceObjKeyOrString(user, 'userid');
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`chat/rooms/${roomId}/commands/purge/${userId}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config)
    }

    /**
     * Removes a user from a room and prevents them from returning. Will add them to the 'bounced users' list on the room.
     * @param room ChatRoomResult or ChatRoom ID
     * @param user User or userid string.
     * @param message The message to show the user explaining the bounce/unbounce.
     */
    bounceUserFromRoom = (room: ChatRoomResult | string, user: User | string, message?: string): Promise<RestApiResult<BounceUserResult>> => {
        const roomId = forceObjKeyOrString(room, 'id');
        const userId = forceObjKeyOrString(user, 'userid');
        // @ts-ignore
        const announcement:string = message || `The bouncer shows ${user.handle || userId} the way out.`
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${roomId}/bounce`),
            headers: this._jsonHeaders,
            data: {
                "userid": userId,
                "bounce": "true",
                "announcement": announcement
            }
        }
        return stRequest(config);
    }
    /**
     * Removes a user from the room's bounce list
     * @param room ChatRoomResult or ChatRoom ID
     * @param user User or userid string.
     * @param message The message to show the user explaining the bounce/unbounce.
     */
    unbounceUserFromRoom = (room: ChatRoomResult | string, user: User | string, message?: string): Promise<RestApiResult<BounceUserResult>> => {
        const roomId = forceObjKeyOrString(room);
        const userId = forceObjKeyOrString(user, 'userid');
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${roomId}/bounce`),
            headers: this._jsonHeaders,
            data: {
                "userid": userId,
                "bounce": "false",
                "announcement": message || `The bouncer let ${userId} back in.`
            }
        }
        return stRequest(config);
    }

    setRoomShadowbanStatus = (user: User | string, room: ChatRoomResult | string, shadowban: boolean, expiresSeconds?: number): Promise<ChatRoomResult> => {
        const roomId = forceObjKeyOrString(room);
        const userId = forceObjKeyOrString(user, 'userid');
        const data:ShadowbanUserApiData = {
            applyeffect: !!shadowban,
            userid: userId
        }
        if(expiresSeconds && data.applyeffect) {
            data.expireseconds = expiresSeconds
        }
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${roomId}/shadowban`),
            headers: this._jsonHeaders,
            data
        }
        return stRequest(config).then(result=>result.data);
    }

    setRoomMuteStatus = (user: User | string, room: ChatRoomResult | string, mute: boolean, expiresSeconds?: number): Promise<ChatRoomResult> => {
        const roomId = forceObjKeyOrString(room);
        const userId = forceObjKeyOrString(user, 'userid');
        const data:MuteUserApiData = {
            applyeffect: !!mute,
            userid: userId
        }
        if(expiresSeconds && data.applyeffect) {
            data.expireseconds = expiresSeconds
        }
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${roomId}/mute`),
            headers: this._jsonHeaders,
            data
        }
        return stRequest(config).then(result=>result.data);
    }

    reportUser = (reported: User | string, reportedBy: User | string, reportType: ReportType = ReportType.abuse,  room?: ChatRoomResult | string): Promise<ChatRoomResult> => {
        const userid = forceObjKeyOrString(reported, 'userid');
        const reporterid = forceObjKeyOrString(reportedBy, 'userid');
        const roomid = forceObjKeyOrString(room, 'id');
        const config: AxiosRequestConfig = {
            method:POST,
            url: buildAPI(this._config, `/chat/rooms/${roomid}/users/${userid}/report`),
            headers: this._jsonHeaders,
            data: {
                userid: reporterid,
                reporttype: reportType
            }
        }
        return stRequest(config).then(result=>result.data);
    }
}
