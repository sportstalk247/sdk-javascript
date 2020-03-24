
import {EventResult} from "../../../models/ChatModels";
import {Promise} from "es6-promise";
import axios from "axios";
import {GET, POST} from "../../../constants";
import {formify, getUrlEncodedHeaders} from "../../../utils";
import {IUserManager} from "../../../API/ChatAPI";
import {ApiResult, SportsTalkConfig, User, UserResult} from "../../../models/CommonModels";


export class RestfulUserManager implements IUserManager {
    _config: SportsTalkConfig;
    _apiHeaders: {};

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    setConfig = (config: SportsTalkConfig) => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiKey)
    }

    /**
     * UserResult Management
     */
    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @param user a UserResult model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
     */
    createOrUpdateUser = (user: User): Promise<UserResult> => {
        return axios({
            method: POST,
            url: `${this._config.endpoint}/user/${user.userid}`,
            headers: this._apiHeaders,
            data: formify({
                userid: user.userid,
                handle: user.handle,
                displayname: user.displayname,
                pictureurl: user.pictureurl,
                profileurl: user.profileurl
            })
        }).then(response=>response.data.data);
    }

    listUserMessages = (user:User | string, cursor?: string, limit?: number): Promise<Array<EventResult>> => {
        // @ts-ignore
        const url = `${this._config.endpoint}/user/${user.userid || user.id || user}/?limit=${limit}&cursor=${cursor}`;
        return axios({
            method: GET,
            url: url,
            headers: this._apiHeaders
        }).then(result=>{
            return result.data.data
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
        const url = `${this._config.endpoint}/user/${userid}/ban`;
        return axios({
            method: POST,
            url: url,
            headers: this._apiHeaders,
            data: formify({banned: isBanned})
        }).then(response=>response.data);
    }
}
