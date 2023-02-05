import decode from "jwt-decode"
import {
    SportsTalkConfig,
    UserTokenRefreshFunction
} from "../../../models/CommonModels";
import {buildAPI, forceObjKeyOrString, formify, getJSONHeaders} from "../../utils";
import {EventType} from "../../../models/ChatModels";
import {SettingsError} from "../../errors";
import {AxiosRequestConfig} from "axios";
import {DELETE, GET, PUT} from "../../constants/api";
import {stRequest} from "../../network";
import {INotificationService} from "../../../API/users/INotificationService";
import {UserResult, User} from "../../../models/user/User";
import {
    Notification,
    NotificationListRequest,
    NotificationListResult,
    NotificationReadRequest
} from "../../../models/user/Notifications";

export class RestfulNotificationService implements INotificationService {
    private _config: SportsTalkConfig;
    private _jsonHeaders = {}
    private _user;
    private _tokenExpiry: number | void;

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    getTokenExp(): number | void {
        return this._tokenExpiry;
    }

    setUser(user: User): void {
        this._user = user;
    }

    getCurrentUser = () => {
        return this._user;
    }

    setUserToken = (token:string) => {
        const decoded = decode(token);
        // @ts-ignore
        if(decoded.exp) {
            // @ts-ignore
            this._tokenExpiry = decoded.exp;
        } else {
            this._tokenExpiry = undefined;
        }
        this._config.userToken = token;

        this.setConfig(this._config);
    }

    getUserToken = async () => {
        return this._config.userToken || "";
    }

    refreshUserToken = async (): Promise<string> => {
        if(!this._config.userToken) {
            throw new Error('You must set a user token before you can refresh it.  Also ensure that you set a refresh function');
        }
        if(!this._config.userTokenRefreshFunction) {
            throw new Error('You must set a refresh function in order to refresh a userToken. Also ensure that the user token JWT is properly set.')
        }
        const newToken = await this._config.userTokenRefreshFunction(this._config.userToken);
        this.setUserToken(newToken);
        return newToken;
    }


    /**
     * Sets the config
     * @param config
     */
    setConfig = (config: SportsTalkConfig) => {
        this._config = config;
        this._jsonHeaders = getJSONHeaders(this._config.apiToken, this._config.userToken);
    }

    /**
     * Sets a refreshFunction for the user's JWT token.
     * @param refreshFunction
     */
    public setUserTokenRefreshFunction = (refreshFunction: UserTokenRefreshFunction) => {
        this._config.userTokenRefreshFunction = refreshFunction;
        this.setConfig(this._config);
    }

    listUserNotifications = (request: NotificationListRequest): Promise<NotificationListResult> => {
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
            url: buildAPI(this._config, `user/users/${finalRequest.userid}/notification/listnotifications?${typeString}&limit=${finalRequest.limit}&includeread=${finalRequest.includeread}`)
        }
        return stRequest(config).then(response=>response.data);
    }

    setNotificationReadStatus = (notificationid: string, userid: string, read:boolean = true): Promise<Notification> => {
        const finalRequest:NotificationReadRequest = {
            notificationid,
            userid,
            read:!!read
        };
        if(!finalRequest.notificationid) {
            throw new Error("Must set notification ID to update notificaiton");
        }
        const params:string = formify(finalRequest)
        const url = buildAPI(this._config, `/user/users/${finalRequest.userid}/notification/notifications/${finalRequest.notificationid}/update?${params}`);
        const config:AxiosRequestConfig = {
            method: PUT,
            headers: this._jsonHeaders,
            url
        }
        return stRequest(config).then(response=>response.data);
    }

    private _validateNotificationRequest = (request) =>{
        if(!request.userid){
            throw new Error("Must specify userid to set notification status");
        }
        if(!request.notificationid && !request.eventid) {
            throw Error("Must set either notificationid or eventid to delete a notification")
        }
        if(request.notificationid && request.eventid) {
            throw Error("Set either notificationid or eventid, not both")
        }
    }

    setNotificationReadStatusByChatEventId = (chateventid: string, userid: string, read:boolean=true): Promise<Notification> => {
        const finalRequest:NotificationReadRequest = {
            chateventid,
            userid,
            read:!!read
        };
        this._validateNotificationRequest(finalRequest)
        const params:string = formify(finalRequest)
        let url;
        if(finalRequest.chateventid) {
            url = buildAPI(this._config, `/user/users/${finalRequest.userid}/notification/notifications/${finalRequest.chateventid}/update?${params}`);
        } else {
            throw new Error("Must include chateventid to set read status");
        }
        const config:AxiosRequestConfig = {
            method: PUT,
            headers: this._jsonHeaders,
            url
        }
        return stRequest(config).then(response=>response.data);
    }

    markAllNotificationsAsRead = (user: UserResult | string, deleteAll: boolean = true) => {
        const userid = forceObjKeyOrString(user, 'userid');
        const config: AxiosRequestConfig = {
            method: PUT,
            headers: this._jsonHeaders,
            url: buildAPI(this._config, `/user/users/${userid}/notification/notifications_all/markread?delete=${deleteAll}`)
        }
        return stRequest(config).then(response=>response.data)
    }

    deleteNotification = async (notificationid: string, userid: string): Promise<Notification> => {
        const url = buildAPI(this._config, `/user/users/${userid}/notification/notifications/${notificationid}`);
        const config:AxiosRequestConfig = {
            method: DELETE,
            headers: this._jsonHeaders,
            url: url
        }
        return stRequest(config).then(response=>response.data);
    }

    deleteNotificationByChatEventId = async (chateventid: string, userid: string): Promise<Notification> => {
        const url = buildAPI(this._config,`/user/users/${userid}/notifications/notificationsbyid/chateventid/${chateventid}`);
        const config:AxiosRequestConfig = {
            method: DELETE,
            headers: this._jsonHeaders,
            url: url
        }
        return stRequest(config).then(response=>response.data);
    }


}
