import {IRoomService} from "../../../API/ChatAPI";
import {
    EventResult,
    ChatRoom,
    ChatRoomResult,
    JoinChatRoomResponse,
    DeletedChatRoomResponse,
    ChatRoomExitResult, ChatRoomListResponse, EventListResponse, BounceUserResult
} from "../../../models/ChatModels";
import {stRequest} from '../../network';
import {GET, DELETE, POST, API_SUCCESS_MESSAGE} from "../../constants/api";
import {buildAPI, forceObjKeyOrString, getJSONHeaders, getUrlEncodedHeaders} from "../../utils";
import {RestApiResult, SportsTalkConfig, User, UserResult} from "../../../models/CommonModels";
import {AxiosRequestConfig} from "axios";

/**
 * This room uses REST to manage sportstalk chat rooms.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export class RestfulChatRoomService implements IRoomService {
    private _config: SportsTalkConfig;
    private _knownRooms: ChatRoom[] = [];
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
        this._knownRooms = []
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken);
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
    }

    /**
     * RoomResult Handling
     */
    listRooms = (): Promise<ChatRoomListResponse> => {
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, this._apiExt),
            headers: this._jsonHeaders,
        };
        return stRequest(config).then(result=>{
            this._knownRooms = result.data.rooms
            return result.data;
        });
    }

    /**
     * Get the list of known rooms.  Used as a cache after first query to speed up UI.
     * use listRooms() to get a fresh set.
     */
    getKnownRooms = async (): Promise<Array<ChatRoom>> => {
        if(!this._knownRooms) {
            const response = await this.listRooms();
            this._knownRooms = response.rooms;
            return this._knownRooms
        }
        return this._knownRooms;
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

    // @ts-ignore
    listUserMessages = (user: User | string, room: ChatRoom | string, cursor: string = "", limit: number = 100): Promise<EventListResponse> => {
        // @ts-ignore
        const roomid = forceObjKeyOrString(room);
        const userid = forceObjKeyOrString(user, 'userid');
        const url = buildAPI(this._config, `${this._apiExt}/${roomid}/messagesbyuser/${userid}/?limit=${limit}&cursor=${cursor}`);
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
            url: buildAPI(this._config,`${this._apiExt}/${room.id}/participants?cursor=${cursor}&maxresults=${maxresults}`),
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
     * Exit a room.
     * @param user
     * @param room
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

    getRoomDetails = (room:ChatRoomResult | string): Promise<ChatRoomResult | null> => {
        const roomId = forceObjKeyOrString(room);
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config,`${this._apiExt}/${roomId}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config)
    }

    getRoomDetailsByCustomId = (room: ChatRoomResult | string): Promise<ChatRoomResult | null> => {
        const roomId = forceObjKeyOrString(room, 'customid');
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config,`chat/roomsbycustomid/${roomId}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config)
    }

    purgeUserMessagesFromRoom = (room: ChatRoomResult | string, user: User | string): Promise<RestApiResult<BounceUserResult>> => {
        const roomId = forceObjKeyOrString(room, 'userid');
        const userId = forceObjKeyOrString(user, 'userid');
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`chat/rooms/${roomId}/commands/purge/${userId}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config)
    }

    bounceUserFromRoom = (room: ChatRoomResult | string, user: UserResult | string, message?: string): Promise<RestApiResult<BounceUserResult>> => {
        const roomId = forceObjKeyOrString(room);
        const userId = forceObjKeyOrString(user, 'userid');
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${roomId}/bounce`),
            headers: this._jsonHeaders,
            data: {
                "userid": userId,
                "bounce": "true",
                "announcement": message || `The bouncer shows ${userId} the way out.`
            }
        }
        return stRequest(config);
    }
    unbounceUserFromRoom = (room: ChatRoomResult | string, user: UserResult | string, message?: string): Promise<RestApiResult<BounceUserResult>> => {
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
}
