import {IPollService} from "../../../API/polls/IPollService";
import {MayHaveCustomId, SportsTalkConfig} from "../../../models/CommonModels";
import {
    HasPollId,
    Poll,
    CreatePollChoiceRequest,
    PollSettings,
    PollStanding,
    UserPollChoice,
    PollVoteResponse, PollChoice,
    CreatePollLeadRequest,
    PollLead,
    PollResponse,
    PollLeadListResponse,
    PollResponseListResponse
} from "../../../models/polls/Poll";
import {HasUserId, User, UserResult} from "../../../models/user/User";
import decode from "jwt-decode";
import {buildAPI, forceObjKeyOrString, getJSONHeaders} from "../../utils";
import {AxiosRequestConfig} from "axios";
import {DELETE, GET, POST, PUT} from "../../constants/api";
import {stRequest} from "../../network";

export class RestfulPollService implements IPollService {
    private _config!: SportsTalkConfig;
    private _jsonHeaders = {}
    private _user!:User;
    private _tokenExpiry!: number | void;

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

    createPollResponse(poll: string | Poll, pollChoice: string | CreatePollChoiceRequest, user: string | HasUserId | undefined): Promise<PollVoteResponse> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Require a pollid in order to register a poll choice response")
        }
        const choiceid = forceObjKeyOrString(pollChoice, 'id');
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
        return stRequest(config).then((response:any)=>response.data);
    }


    createOrUpdatePollChoice(poll: Poll | string, pollChoice: CreatePollChoiceRequest): Promise<Array<PollChoice>> {
        const pollid = forceObjKeyOrString(poll, 'id');
        const config: AxiosRequestConfig = {
            method: POST,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/choice`),
            data: pollChoice
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    /**
     * Deletes a single choice from a poll. This also cascades to delete every response recorded for that
     * choice, so it is a destructive operation (requires the same permission as deleting a poll).
     */
    deletePollChoice(poll: Poll | string, pollChoice: PollChoice | string): Promise<PollChoice> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a poll id to delete a poll choice")
        }
        const choiceid = forceObjKeyOrString(pollChoice, 'id');
        if(!choiceid) {
            throw new Error("Must supply a choice id to delete a poll choice")
        }
        const config: AxiosRequestConfig = {
            method: DELETE,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/choice/${choiceid}`),
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    createOrUpdatePoll(poll: PollSettings): Promise<Poll> {
        const config: AxiosRequestConfig = {
            method: POST,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/create`),
            data: poll
        }
        return stRequest(config).then((response:any)=>{
            return response.data
        })
    }

    /**
     * Updates an existing poll by id. Only fields present on `settings` are changed; omitted fields are
     * left untouched (send `""` to explicitly clear a string field).
     */
    updatePoll(poll: Poll | string, settings: PollSettings): Promise<Poll> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a poll id to update a Poll")
        }
        const config: AxiosRequestConfig = {
            method: PUT,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/update`),
            data: settings
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    getPollDetails(poll: Poll | string): Promise<Poll> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a pollid to retrieve Poll")
        }
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            // No leading slash (it produced ".../{appId}//poll/...") and no body on a GET.
            url: buildAPI(this._config, `poll/poll/${pollid}`),
        }
        return stRequest(config).then((response:any)=>response.data);
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
        return stRequest(config).then((response:any)=>response.data);
    }

    getPollStandings(poll: Poll | string): Promise<Array<PollStanding>> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a poll id for a Poll to retrieve Poll Standings")
        }
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/standings`),
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    listChoicesForPoll(poll: Poll | string, limit?:number): Promise<Array<PollChoice>> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a poll id for a Poll to retrieve Poll choices")
        }
        const max_responses = limit || 100;
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/choices?limit=${max_responses}`),
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    /**
     * Lists polls available for the application.
     * @param cursor
     * @param limit
     * @param includeUnpublished when true, polls not yet published are also returned.
     */
    listPolls(cursor?:string, limit?:number, includeUnpublished?:boolean): Promise<Array<Poll>> {
        const max_responses =  limit || 200;
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll?${includeUnpublished ? `IncludeUnpublished=true&` : '' }${cursor ? `cursor=${encodeURIComponent(cursor)}&` : '' }limit=${max_responses}`),
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    /**
     * Lists the responses of a specific user for a poll.
     * @param poll can either be a poll object, an object with just a pollid, or a string representing the pollid for convenience.
     * @param user can be either a User object witha userid, any object with a userid property, or a string representing the userid.
     */
    listResponsesByUser(poll: Poll | HasPollId | string, user: HasUserId | string): Promise<Array<UserPollChoice>> {
        // Accept a Poll (which has `id`), a {pollid} object, or a raw id string — the
        // docstring promises all three. Every other poll method keys on `id`; this one
        // read only `pollid`, so passing a Poll object (no `pollid`) threw. Resolve from
        // whichever identifier is present.
        const pollid = typeof poll === 'string' ? poll : ((poll as any).id || (poll as any).pollid);
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
        return stRequest(config).then((response:any)=>response.data);
    }

    resetPoll(poll: Poll | string): Promise<Poll> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a poll id for a Poll reset that Poll")
        }
        const config: AxiosRequestConfig = {
            method: PUT,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/reset`),
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    deletePoll(poll: Poll | string): Promise<Poll> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a poll id for a Poll to delete the poll")
        }
        const config: AxiosRequestConfig = {
            method: DELETE,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}`),
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    /**
     * Returns all responses for a poll. If the poll hides results until a user has voted, pass the
     * requesting user so the server can enforce that rule.
     */
    getResponses(poll: Poll | string, requestingUser?: HasUserId | string): Promise<Array<PollResponse>> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a poll id to list poll responses")
        }
        const userid = requestingUser ? forceObjKeyOrString(requestingUser, 'userid') : '';
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/responses/all${userid ? `?UserId=${userid}` : ''}`),
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    /**
     * Cursor-paged list of all responses for a poll.
     */
    listResponses(poll: Poll | string, limit?: number, cursor?: string): Promise<PollResponseListResponse> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a poll id to list poll responses")
        }
        const max_responses = limit || 200;
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/responses?${cursor ? `cursor=${cursor}&` : '' }limit=${max_responses}`),
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    /**
     * Captures a lead against a poll. Lead capture must be enabled on the poll; depending on its settings
     * the firstname and/or email may be required (the server enforces this).
     */
    createLead(poll: Poll | string, lead: CreatePollLeadRequest): Promise<PollLead> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a poll id to capture a lead")
        }
        const config: AxiosRequestConfig = {
            method: POST,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/lead`),
            data: lead
        }
        return stRequest(config).then((response:any)=>response.data);
    }

    /**
     * Cursor-paged list of leads captured for a poll.
     */
    listLeads(poll: Poll | string, limit?: number, cursor?: string): Promise<PollLeadListResponse> {
        const pollid = forceObjKeyOrString(poll, 'id');
        if(!pollid) {
            throw new Error("Must supply a poll id to list poll leads")
        }
        const max_responses = limit || 200;
        const config: AxiosRequestConfig = {
            method: GET,
            headers:this._jsonHeaders,
            url: buildAPI(this._config, `poll/poll/${pollid}/leads?${cursor ? `cursor=${cursor}&` : '' }limit=${max_responses}`),
        }
        return stRequest(config).then((response:any)=>response.data);
    }


}