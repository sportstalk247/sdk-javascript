import {
    Notification,
    NotificationListRequest,
    NotificationListResult, NotificationReadRequest,
    SportsTalkConfig, UserResult
} from "../../../models/CommonModels";
import {buildAPI, forceObjKeyOrString, formify, getJSONHeaders} from "../../utils";
import {EventType} from "../../../models/ChatModels";
import {SettingsError} from "../../errors";
import {AxiosRequestConfig} from "axios";
import {DELETE, GET, PUT} from "../../constants/api";
import {stRequest} from "../../network";
import {INotificationService} from "../../../API/users/INotificationService";

export class RestfulNotificationService implements INotificationService{
    private _config: SportsTalkConfig;
    private _jsonHeaders = {}

    constructor(config:SportsTalkConfig) {
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
            url: buildAPI(this._config, `/user/users/${finalRequest.userid}/notifications/list?userid=${finalRequest.userid}${typeString}&limit=${finalRequest.limit}&includeread=${finalRequest.includeread}`)
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
            url = buildAPI(this._config, `/user/users/${finalRequest.userid}/notifications/notificationsbyid/chateventid/${finalRequest.chateventid}/update?${params}`);
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