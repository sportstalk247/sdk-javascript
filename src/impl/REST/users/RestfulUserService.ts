import {AxiosRequestConfig} from "axios";
import {stRequest} from "../../network";
import {DELETE, GET, POST} from "../../constants/api";
import {buildAPI, forceObjKeyOrString, formify, getJSONHeaders} from "../../utils";
import {
    ListRequest,
    NotificationListRequest,
    ReportType,
    RestApiResult,
    SportsTalkConfig,
    User,
    UserDeletionResponse,
    UserListResponse,
    UserModerationListRequest,
    UserResult,
    UserSearchType
} from "../../../models/CommonModels";
import {EventType} from '../../../models/ChatModels';
import {SettingsError} from "../../errors";
import {IUserService} from "../../../API/Users";

/**
 * Class for handling user management via REST.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
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
     * User Management
     */

    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @return user a User
     * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
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
     * @param user || userid
     * @param isBanned
     */
    setBanStatus = (user: User | string, isBanned: boolean): Promise<UserResult> => {
        // @ts-ignore
        const userid = user.userid || user;
        const url = buildAPI(this._config,`${this._apiExt}/${userid}/ban`);
        return stRequest({
            method: POST,
            url: url,
            headers: this._jsonHeaders,
            data: {banned: ""+isBanned}
        }).then(result=>result.data);
    }

    /**
     * Shadowbans (Mutes) a user.  A shadowbanned user's messages will be ignored by the **ChatClient** unless the userid matches the sender.
     *
     * @param user
     * @param isShadowBanned
     * @param expireseconds
     */
    setShadowBanStatus = (user:User | String, isShadowBanned: boolean, expireseconds?: number): Promise<UserResult> => {
        // @ts-ignore
        const userid = user.userid || user;
        const url = buildAPI(this._config,`${this._apiExt}/${userid}/shadowban`);
        const data:any = {
            shadowban: ""+isShadowBanned
        }
        if(expireseconds && isShadowBanned) {
            data.expireseconds = Math.floor(expireseconds)
        }

        return stRequest({
            method: POST,
            url: url,
            headers: this._jsonHeaders,
            data
        }).then(result=>result.data);
    }

    /**
     * Search users for this application
     * @param search
     * @param type
     */
    searchUsers = (search:string, type: UserSearchType): Promise<UserListResponse> => {
        const url = buildAPI(this._config,`user/search`);
        const data:any = {
            type: type,
        }
        if(!type || type === UserSearchType.handle) {
            data.handle = search;
        }
        if(type=== UserSearchType.userid)  {
            data.userid = search;
        }
        if(type === UserSearchType.name) {
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
                return response.data
            });
    }

    /**
     * Delete a user
     * @param user
     */
    deleteUser = (user:User | string):Promise<UserDeletionResponse> => {
        // @ts-ignore
        const id = user.userid || user;
        const config:AxiosRequestConfig = {
            method: DELETE,
            url: buildAPI(this._config,`${this._apiExt}/${id}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config).then(response=>response.data);
    }

    /**
     * Returns a list of users.  You can provide a ListRequest object to customize the query.
     * @param request a ListRequest
     */
    listUsers = (request?: ListRequest): Promise<UserListResponse> => {
        let query = "?";
        if(request) {
            query = query+ formify(request);
        }
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config,`${this._apiExt}/${query}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config).then(response=>{
            return response.data;
        });
    }

    /**
     * Returns a user.
     * @param user either a UserResult or a string representing a userid.  Typically used when you only have the userid.
     */
    getUserDetails = (user: User | string): Promise<UserResult> => {
        const id = forceObjKeyOrString(user, 'userid');
        const config:AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config,`${this._apiExt}/${id}`),
            headers: this._jsonHeaders,
        };
        return stRequest(config).then(response=>{
            return response.data;
        });
    }

    reportUser = (userToReport: User | string, reportedBy: User | string, reportType: ReportType = ReportType.abuse): Promise<UserResult> => {
        const id = forceObjKeyOrString(userToReport, 'userid');
        const reporter = forceObjKeyOrString(reportedBy, 'userid');
        const data = {
            userid: reporter,
            reporttype: reportType
        }
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `user/users/${id}/report`),
            headers: this._jsonHeaders,
            data: data
        }
        return stRequest(config).then(response=>response.data);
    }

    listUsersInModerationQueue = (request: UserModerationListRequest): Promise<RestApiResult<UserResult>> => {
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `user/moderation/queues/reportedusers`),
            headers: this._jsonHeaders,
            data: request
        }
        return stRequest(config).then(response=>response.data);
    }

    listUserNotifications = (request: NotificationListRequest): Promise<RestApiResult<any>> => {
        const defaults: Partial<NotificationListRequest> = {
            limit: 20,
            includeread: false,
            filterNotificationTypes: [EventType.speech, EventType.reply, EventType.reaction]
        }
        const finalRequest:NotificationListRequest = Object.assign(defaults, request);
        if(!finalRequest.userid) {
            throw new SettingsError("Must include userid to request notifications");
        }
        if(!finalRequest.filterNotificationTypes || !finalRequest.filterNotificationTypes.length) {
            throw new SettingsError("Must include at least one notification type");
        }
        let typeString = '';
        finalRequest.filterNotificationTypes.map((type:EventType)=>{
            typeString = `${typeString}&filterNotificationTypes=${type}`;
        });
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `${this._apiExt}/${finalRequest.userid}/notifications/list?userid=${finalRequest.userid}${typeString}&limit=${finalRequest.limit}&includeread=${finalRequest.includeread}`)
        }
        return stRequest(config).then(response=>response.data);
    }
}
