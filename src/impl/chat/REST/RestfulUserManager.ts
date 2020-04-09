
import {EventResult, Room} from "../../../models/ChatModels";
import {Promise} from "es6-promise";
import axios, {AxiosRequestConfig} from "axios";
import {GET, POST} from "../../../constants";
import {buildAPI, formify, getJSONHeaders, getUrlEncodedHeaders} from "../../../utils";
import {IUserManager} from "../../../API/ChatAPI";
import {ApiResult, SportsTalkConfig, User, UserResult} from "../../../models/CommonModels";


export class RestfulUserManager implements IUserManager {
    _config: SportsTalkConfig;
    _apiHeaders: {};
    _jsonHeaders: {};

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    setConfig = (config: SportsTalkConfig) => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiKey)
        this._jsonHeaders = getJSONHeaders(this._config.apiKey);
    }

    /**
     * UserResult Management
     */
    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @param user a UserResult model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
     */
    createOrUpdateUser = (user: User): Promise<UserResult> => {
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config,`user/users/${user.userid}`),
            headers: this._jsonHeaders,
            data: {
                userid: user.userid,
                handle: user.handle,
                displayname: user.displayname,
                pictureurl: user.pictureurl,
                profileurl: user.profileurl
            }
        };
        return axios(config).then(response=>response.data.data).catch(e=>{
            throw e;
        });
    }

    // @ts-ignore
    listUserMessages = (user:User | string, room: Room | string, cursor: string = "", limit: number = 100): Promise<Array<EventResult>> => {
        // @ts-ignore
        const url = buildAPI(this._config,`/chat/rooms/${room.id || room}/messagesbyuser/${user.userid || user.id || user}/?limit=${limit}&cursor=${cursor}`);
        return axios({
            method: GET,
            url: url,
            headers: this._jsonHeaders
        }).then(result=>{
            return result.data.data.events
        })
    }

    /**
     * Bans or unbans a user.  If isBanned = true the user will be banned (global).  This same command with isBanned = false will unban them.
     * @param user
     * @param isBanned
     */
    setBanStatus = (user: User | string, isBanned: boolean): Promise<ApiResult<UserResult>> => {
        // @ts-ignore
        const userid = user.userid || user;
        const url = buildAPI(this._config,`/user/users/${userid}/ban`);
        return axios({
            method: POST,
            url: url,
            headers: this._jsonHeaders,
            data: {banned: ""+isBanned}
        }).then(response=>response.data).catch(e=>{
            throw e;
        })
    }
}
