import {IPollService} from "../../../API/polls/IPollService";
import {MayHaveCustomId, SportsTalkConfig} from "../../../models/CommonModels";
import {HasPollId, Poll, PollChoice, PollSettings, PollStanding, UserPollChoice, HasPollChoiceId} from "../../../models/polls/Poll";
import {HasUserId, User, UserResult} from "../../../models/user/User";
import decode from "jwt-decode";
import {buildAPI, forceObjKeyOrString, getJSONHeaders} from "../../utils";
import {AxiosRequestConfig} from "axios";
import {DELETE, GET, POST, PUT} from "../../constants/api";
import {stRequest} from "../../network";

export class RestfulPollService implements IPollService {
    private _config: SportsTalkConfig;
    private _jsonHeaders = {}
    private _user;
    private _tokenExpiry: number | void;

    getTokenExp(): number | void {
        return this._tokenExpiry;
    }

    setUser(user: User): void {
        this._user = user;
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

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    createOrUpdatePollResponse(poll: string | HasPollId, pollChoice: string | HasPollChoiceId, user: string | HasUserId | undefined) {
        const pollid = forceObjKeyOrString(poll, 'pollid');
        if(!pollid) {
            throw new Error("Require a pollid in order to register a poll choice response")
        }
        const choiceid = forceObjKeyOrString(pollChoice, 'choiceid');
        if(!choiceid) {
            throw new Error("Requires a choiceid in order to register a poll choice response");
        }
        const userid = forceObjKeyOrString(user, 'userid');
        if(!userid) {
            throw new Error("Require a userid to register a poll choice response");
        }
        const data = {
            "pollid": pollid,
            "userid": userid,
            "choiceid": choiceid
        }
        const config: AxiosRequestConfig = {
            method: POST,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/response`),
            data: data
        }
        return stRequest(config).then(response=>response.data);
    }


    createOrUpdatePollChoice(poll: HasPollId | string, pollChoice: PollChoice) {
        const pollid = forceObjKeyOrString(poll, 'pollid');
        const config: AxiosRequestConfig = {
            method: POST,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/choice`),
            data: pollChoice
        }
        return stRequest(config).then(response=>response.data);
    }

    createOrUpdatePoll(poll: PollSettings): Promise<Poll> {
        const config: AxiosRequestConfig = {
            method: POST,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/create`),
            data: poll
        }
        return stRequest(config).then(response=>{
            return response.data
        })
    }

    getPollDetails(poll: HasPollId | string): Promise<Poll> {
        const pollid = forceObjKeyOrString(poll, 'pollid');
        if(!pollid) {
            throw new Error("Must supply a pollid to retrieve Poll")
        }
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `/poll/poll/${pollid}`),
            data: poll
        }
        return stRequest(config).then(response=>response.data);
    }

    getPollDetailsByCustomId(poll: MayHaveCustomId | string) {
        const pollid = forceObjKeyOrString(poll, 'customid');
        if(!pollid) {
            throw new Error("Must supply a customid for a Poll to retrieve Poll by custom ID")
        }
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/pollbycustomid/${pollid}`),
        }
        return stRequest(config).then(response=>response.data);
    }

    getPollStandings(poll: HasPollId | string): Promise<Array<PollStanding>> {
        const pollid = forceObjKeyOrString(poll, 'pollid');
        if(!pollid) {
            throw new Error("Must supply a poll id for a Poll to retrieve Poll Standings")
        }
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/standings`),
        }
        return stRequest(config).then(response=>response.data);
    }

    listChoicesForPoll(poll: HasPollId | string, limit?): Promise<Array<PollChoice>> {
        const pollid = forceObjKeyOrString(poll, 'pollid');
        if(!pollid) {
            throw new Error("Must supply a poll id for a Poll to retrieve Poll choices")
        }
        const max_responses = limit || 100;
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/choices?limit=${max_responses}`),
        }
        return stRequest(config).then(response=>response.data);
    }

    /**
     * Lists polls available for the application.
     * @param cursor
     * @param limit
     */
    listPolls(cursor?:string, limit?:number): Promise<Array<Poll>> {
        const max_responses =  limit || 200;
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll?${cursor ? `cursor=${cursor}&` : '' }limit=${max_responses}`),
        }
        return stRequest(config).then(response=>response.data);
    }

    /**
     * Lists the responses of a specific user for a poll.
     * @param poll can either be a poll object, an object with just a pollid, or a string representing the pollid for convenience.
     * @param user can be either a User object witha userid, any object with a userid property, or a string representing the userid.
     */
    listResponsesByUser(poll: HasPollId | string, user: HasUserId | string): Promise<Array<UserPollChoice>> {
        const pollid = forceObjKeyOrString(poll, 'pollid');
        const userid = forceObjKeyOrString(user, 'userid');
        if(!pollid) {
            throw new Error("Must supply a poll id for the Poll to retrieve poll responses by a user")
        }
        if(!userid) {
            throw new Error("Must supply a userid to list poll responses by a user");
        }
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/responses/user/${userid}`),
        }
        return stRequest(config).then(response=>response.data);
    }

    resetPoll(poll: HasPollId | string): Promise<Poll> {
        const pollid = forceObjKeyOrString(poll, 'pollid');
        if(!pollid) {
            throw new Error("Must supply a poll id for a Poll reset that Poll")
        }
        const config: AxiosRequestConfig = {
            method: PUT,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/reset`),
        }
        return stRequest(config).then(response=>response.data);
    }

    deletePoll(poll: HasPollId | string): Promise<Poll> {
        const pollid = forceObjKeyOrString(poll, 'pollid');
        if(!pollid) {
            throw new Error("Must supply a poll id for a Poll to delete the poll")
        }
        const config: AxiosRequestConfig = {
            method: DELETE,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}`),
        }
        return stRequest(config).then(response=>response.data);
    }


}