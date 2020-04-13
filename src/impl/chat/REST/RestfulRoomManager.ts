import {IRoomManager} from "../../../API/ChatAPI";
import {EventResult, Room, RoomResult, RoomUserResult, DeletedRoomResponse} from "../../../models/ChatModels";
import axios, {AxiosRequestConfig} from "axios";
import {GET, DELETE, POST} from "../../../constants/api";
import {buildAPI, getJSONHeaders, getUrlEncodedHeaders} from "../../utils";
import {ApiResult, SportsTalkConfig, User, UserResult} from "../../../models/CommonModels";
import {MISSING_ROOM} from "../../../constants/messages";

export class RestfulRoomManager implements IRoomManager {
    private _config: SportsTalkConfig;
    private _knownRooms: Room[] = [];
    private _apiHeaders = {};
    private _jsonHeaders = {}
    private _apiExt = 'chat/rooms';

    constructor(config:SportsTalkConfig) {
        this.setConfig(config);
    }

    setConfig = (config: SportsTalkConfig) => {
        this._config = config;
        this._knownRooms = []
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken);
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
    }

    /**
     * RoomResult Handling
     */
    listRooms = (): Promise<Array<Room>> => {
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, this._apiExt),
            headers: this._apiHeaders,
        };
        return axios(config).then(result=>{
            this._knownRooms = result.data.data;
            return this._knownRooms;
        }).catch(e=>{
            throw e;
        })
    }

    getKnownRooms = async (): Promise<Array<Room>> => {
        if(!this._knownRooms) {
            const rooms = await this.listRooms();
            this._knownRooms = rooms;
            return this._knownRooms
        }
        return this._knownRooms;
    }

    deleteRoom = (room: Room | string): Promise<DeletedRoomResponse> => {
        // @ts-ignore
        const id =  room.id || room;
        const config:AxiosRequestConfig = {
            method: DELETE,
            url: buildAPI(this._config,`${this._apiExt}/${id}`),
            headers: this._jsonHeaders
        };
        // @ts-ignore
        return axios(config).then(result=>{
            return result.data.data
        }).catch(e=>{
            throw e;
        })
    }



    createRoom = (room: Room): Promise<RoomResult> => {
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, this._apiExt),
            headers: this._jsonHeaders,
            data: room
        };
        return axios(config).then(result=>{
            return result.data.data;
        }).catch(e=>{
            throw e;
        })
    }

    // @ts-ignore
    listUserMessages = (user:User | string, room: Room | string, cursor: string = "", limit: number = 100): Promise<Array<EventResult>> => {
        // @ts-ignore
        const url = buildAPI(this._config,`${this._apiExt}/${room.id || room}/messagesbyuser/${user.userid || user.id || user}/?limit=${limit}&cursor=${cursor}`);
        return axios({
            method: GET,
            url: url,
            headers: this._jsonHeaders
        }).then(result=>{
            return result.data.data.events
        })
    }


    /*
    * @param cursor
    * @param maxresults
    */
    listParticipants = (room: Room, cursor?: string, maxresults: number = 200): Promise<Array<UserResult>> => {
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config,`${this._apiExt}/${room.id}/participants?cursor=${cursor}&maxresults=${maxresults}`),
            headers: this._apiHeaders
        };
        return axios(config).then(result=>result.data.data);
    }


    joinRoom = (user: User, room: RoomResult | string): Promise<RoomUserResult> => {
        // @ts-ignore
        const roomId = room.id || room;
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`${this._apiExt}/${roomId}/join`),
            headers: this._jsonHeaders,
            data:{
                userId: user.userid,
                handle: user.handle,
                displayname: user.displayname || "",
                pictureurl: user.pictureurl || "",
                profileurl: user.profileurl || "",
            }
        }
        return axios(config).then(response => {
            return response.data.data;
        });
    }

    exitRoom = (user: User | string, room: Room | string): Promise<RoomUserResult> => {
        // @ts-ignore
        const roomId = room.id || room;
        // @ts-ignore
        const userId = user.userid || user;
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`${this._apiExt}/${roomId}/exit`),
            headers: this._jsonHeaders,
            data: {
                userid: userId
            }
        };
        return axios(config).then(response => {
            return response.data.data;
        });
    }
}
