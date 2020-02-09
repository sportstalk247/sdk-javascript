import {IConfigurable, IRoomManager} from "../../api";
import {Room, RoomResult, SportsTalkConfig, ApiResult, UserResult, User, RoomUserResult} from "../../DataModels";
import {Promise} from "es6-promise";
import axios from "axios";
import {GET, DELETE, POST, MISSING_ROOM} from "../../constants";
import {formify, getApiHeaders} from "../../utils";
import {SettingsError} from "../../errors";


export class RestfulRoomManager implements IRoomManager {
    private _config: SportsTalkConfig;
    private _knownRooms: Array<Room> = [];
    private _apiHeaders = {}

    constructor(config:SportsTalkConfig) {
        this.setConfig(config);
    }

    setConfig(config: SportsTalkConfig) {
        this._config = config;
        this._knownRooms = []
        this._apiHeaders = getApiHeaders(this._config.apiKey);
    }

    /**
     * RoomResult Handling
     */
    listRooms = (): Promise<Array<RoomResult>> => {
        return axios({
            method: GET,
            url: `${this._config.endpoint}/room`,
            headers: this._apiHeaders,
        }).then(result=>{
            this._knownRooms = result.data.data;
            return this._knownRooms;
        });
    }

    getKnownRooms = (): Array<Room> => {
        return this._knownRooms;
    }

    deleteRoom = (room: Room | string): Promise<ApiResult<null>> => {
        // @ts-ignore
        const id =  room.id || room;
        return axios({
            method: DELETE,
            url: `${this._config.endpoint}/room/${id}`,
            headers: this._apiHeaders,
        }).then(result=>result);
    }

    createRoom = (room: Room): Promise<RoomResult> => {
        return axios({
            method: POST,
            url: `${this._config.endpoint}/room`,
            headers: this._apiHeaders,
            data: formify(room)
        }).then(result=>{
            return result.data.data;
        })
    }

    /*
    * @param cursor
    * @param maxresults
    */
    listParticipants = (room: Room, cursor?: string, maxresults: number = 200): Promise<Array<UserResult>> => {
        return axios({
            method: GET,
            url: `${this._config.endpoint}/room/${room.id}/participants?cursor=${cursor}&maxresults=${maxresults}`,
            headers: this._apiHeaders
        }).then(result=>result.data.data);
    }

    joinRoom = (user: User, room: RoomResult | string): Promise<RoomUserResult> => {
        // @ts-ignore
        const roomId = room.id || room;
        return axios({
            method: POST,
            url: `${this._config.endpoint}/room/${roomId}/join`,
            headers: this._apiHeaders,
            data: formify({
                userId: user.userid,
                handle: user.handle,
                displayname: user.displayname || "",
                pictureurl: user.pictureurl || "",
                profileurl: user.profileurl || "",
            })
        }).then(response => {
            return response.data.data;
        });
    }

    exitRoom = (user: User | string, room: Room | string): Promise<RoomUserResult> => {
        // @ts-ignore
        const roomId = room.id || room;
        // @ts-ignore
        const userId = user.id || user;
        return axios({
            method: POST,
            url: `${this._config.endpoint}/room/${roomId}/exit`,
            headers: this._apiHeaders,
            data: formify({
                userId: userId
            })
        }).then(response => {
            return response.data.data;
        });
    }
}
