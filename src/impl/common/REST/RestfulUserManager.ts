import {Promise} from "es6-promise";
import axios, {AxiosRequestConfig} from "axios";
import {DELETE, POST} from "../../../constants/api";
import {buildAPI, getJSONHeaders, getUrlEncodedHeaders} from "../../utils";
import {ApiResult, SearchType, SportsTalkConfig, User, UserResult} from "../../../models/CommonModels";
import {IUserManager} from "../../../API/CommonAPI";


export class RestfulUserManager implements IUserManager {
    _config: SportsTalkConfig;
    _jsonHeaders: {};

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    setConfig = (config: SportsTalkConfig) => {
        this._config = config;
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

    searchUsers = (search:string, type: SearchType): Promise<Array<UserResult>> => {
        const url = buildAPI(this._config,`/user/users/search`);
        const data:any = {
            type: type,
        }
        if(!type || type === SearchType.handle) {
            data.handle = search;
        }
        if(type=== SearchType.userid)  {
            data.userid = search;
        }
        if(type === SearchType.name) {
            data.name = search;
        }
        const config:AxiosRequestConfig = {
            method: POST,
            url: url,
            headers: this._jsonHeaders,
            data
        }
        return axios(config)
            .then(response=>{
                return response.data.data.users;
            })
            .catch(e=>{
                throw e;
            })
    }

    deleteUser = (user:User | string):Promise<UserResult> => {
        // @ts-ignore
        const id = user.userid || user;
        const config:AxiosRequestConfig = {
            method: DELETE,
            url: buildAPI(this._config,`user/users/${id}`),
            headers: this._jsonHeaders,
        };
        return axios(config).then(response=>response.data.data).catch(e=>{
            throw e;
        });
    }
}
