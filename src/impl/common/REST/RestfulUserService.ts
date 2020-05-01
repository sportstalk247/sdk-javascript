import {AxiosRequestConfig} from "axios";
import {stRequest} from "../../network";
import {DELETE, POST} from "../../constants/api";
import {buildAPI, getJSONHeaders, getUrlEncodedHeaders} from "../../utils";
import {RestApiResult, SearchType, SportsTalkConfig, User, UserResult} from "../../../models/CommonModels";
import {IUserService} from "../../../API/CommonAPI";

/**
 * Class for handling user management via REST.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 */
export class RestfulUserService implements IUserService {
    private _config: SportsTalkConfig;
    private _jsonHeaders: {};
    private _apiExt = 'user/users';

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    /**
     * Sets the config
     * @param config
     */
    setConfig = (config: SportsTalkConfig) => {
        this._config = config;
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
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
            url: buildAPI(this._config,`${this._apiExt}/${user.userid}`),
            headers: this._jsonHeaders,
            data: {
                userid: user.userid,
                handle: user.handle,
                displayname: user.displayname,
                pictureurl: user.pictureurl,
                profileurl: user.profileurl
            }
        };
        return stRequest(config).then(response=>response.data);
    }

    /**
     * Bans or unbans a user.  If isBanned = true the user will be banned (global).  This same command with isBanned = false will unban them.
     * @param user
     * @param isBanned
     */
    setBanStatus = (user: User | string, isBanned: boolean): Promise<RestApiResult<UserResult>> => {
        // @ts-ignore
        const userid = user.userid || user;
        const url = buildAPI(this._config,`${this._apiExt}/${userid}/ban`);
        return stRequest({
            method: POST,
            url: url,
            headers: this._jsonHeaders,
            data: {banned: ""+isBanned}
        });
    }

    /**
     * Search users for this application
     * @param search
     * @param type
     */
    searchUsers = (search:string, type: SearchType): Promise<Array<UserResult>> => {
        const url = buildAPI(this._config,`user/search`);
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
        return stRequest(config)
            .then(response=>{
                return response.data.users;
            });
    }

    /**
     * Delete a user
     * @param user
     */
    deleteUser = (user:User | string):Promise<UserResult> => {
        // @ts-ignore
        const id = user.userid || user;
        const config:AxiosRequestConfig = {
            method: DELETE,
            url: buildAPI(this._config,`${this._apiExt}/${id}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config).then(response=>response.data.user);
    }
}
