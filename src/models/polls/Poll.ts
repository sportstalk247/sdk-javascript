import {
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
    sortanswers:string,
    maxtotalresponsesperuser?: number,
    allowmultiplechoicesperuser?: boolean,
    maxresponsesperchoiceperuser?:number,
    maxtotalvotesperuser?: number
    embedcontenttop?:string,
    embedcontentbottom?:string,
    videoid?: string,
    whenpollopens?: string,
    whenpollcloses?: string,
    whenpollexpires?:string,
    status?: string,
    displayresults?:string,
    posterurl?:string,
    description?:string,

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