import {
    ListResponse,
    MayHaveCustomFields,
    MayHaveCustomId,
    MayHaveCustomPayload,
    MayHaveCustomTags,
    MayHaveCustomType
} from "../CommonModels";
import {HasUserId} from "../user/User";

export interface HasPollId {
    pollid: string
}

export interface HasPollChoiceId {
    choiceid: string
}
export interface MayHavePollChoiceId {
    choiceid?: string
}


export interface PollSettings extends MayHaveCustomId, MayHaveCustomPayload,  MayHaveCustomType, MayHaveCustomTags, MayHaveCustomFields {
    ownerid: string,
    title: string,
    /** @deprecated The API field is `sortchoices`; this is kept for backward compatibility only. */
    sortanswers?:string,
    /** How choices are ordered, e.g. "random". Replaces the legacy `sortanswers`. */
    sortchoices?: string,
    maxtotalresponsesperuser?: number,
    allowmultiplechoicesperuser?: boolean,
    maxresponsesperchoiceperuser?:number,
    maxtotalvotesperuser?: number
    embedcontenttop?:string,
    /** @deprecated The API field is `embedcontentbotton` (note spelling); kept for backward compatibility. */
    embedcontentbottom?:string,
    /** Matches the API field name (note the spelling). Replaces the legacy `embedcontentbottom`. */
    embedcontentbotton?: string,
    videoid?: string,
    subtitle?: string,
    pictureurl?: string,
    whenpollpublish?: string,
    whenpollopens?: string,
    whenpollcloses?: string,
    whenpollexpires?:string,
    allowanonymouspolling?: boolean,
    status?: string,
    displayresults?:string,
    posterurl?:string,
    description?:string,

    // Lead capture
    leadcaptureenabled?: boolean,
    leadcapturerequired?: boolean,
    leadcapturename?: boolean,
    leadcapturetitle?: string,
    leadcapturedescription?: string,
    leadcaptureprompt?: string,

    // Social share
    socialshareenable?: boolean,
    socialhandlefacebook?: string,
    socialhandlex?: string,
    socialhandletiktok?: string,
    socialhandlewhatsapp?: string,
    socialcardtitle?: string,
    socialcardimageurl?: string,
    socialcardurl?: string,
}

export interface Poll extends PollSettings {
    kind?: "poll.poll"
    id: string
}

export interface PollChoiceUpdate {
    id?: string,
    title: string

}

export interface PollVoteResponse {
    kind: "poll.response"
    userid: string,
    itemcount: number,
    responses: Array<PollResponseVote>
}

export interface PollResponseVote extends HasPollId, HasUserId, HasPollChoiceId {
    id: string,
    kind: "poll.response",
    added: string,
    appid: string
}

export interface CreatePollChoiceRequest {
    id?:string,
    "position": number,
    "title"?: string,
    "subtitle"?: string,
    "imageurl"?: string,
    "videoid"?: string,
    "embedcode"?: string,
    "customtype"?: string,
    "customid"?: string,
    "custompayload"?: any,
    "customtags"?: Array<string>
    "customfield1"?: string,
    "customfield2"?: string
}

export interface PollChoice extends CreatePollChoiceRequest {
    "kind": "poll.choice",
    "id": string,
    "appid": string,
    "pollid": string,
    "position": number,
    "title": string,
    "subtitle": string,
    "imageurl": string,
    "videoid": string,
    "embedcode": string,
    "customtype": string,
    "customid": string,
    "custompayload": any,
    "customtags": Array<string>
    "customfield1": string,
    "customfield2": string
}



export interface PollStanding {

}
export interface UserPollChoice {

}

/** Body for capturing a lead against a poll. `firstname`/`email` may be required by the poll's settings. */
export interface CreatePollLeadRequest {
    firstname?: string,
    lastname?: string,
    email?: string,
}

/** A lead captured for a poll. */
export interface PollLead extends HasPollId {
    kind: "poll.lead",
    id: string,
    appid: string,
    email: string,
    firstname: string,
    lastname: string,
    added: string,
}

/** A single recorded vote/response on a poll. */
export interface PollResponse extends HasPollId, HasUserId, HasPollChoiceId {
    kind: "poll.response",
    id: string,
    appid: string,
    added: string,
}

/** Cursor-paged list of leads (`GET .../{pollid}/leads`). */
export interface PollLeadListResponse extends ListResponse {
    kind: "list.poll.leads",
    leads: Array<PollLead>,
}

/** Cursor-paged list of responses (`GET .../{pollid}/responses`). */
export interface PollResponseListResponse extends ListResponse {
    kind: "list.poll.responses",
    responses: Array<PollResponse>,
}