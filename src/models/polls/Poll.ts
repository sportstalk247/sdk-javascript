import {MayHaveCustomId} from "../CommonModels";

export interface HasPollId {
    pollid: string
}
export interface HasPollChoiceId {
    choiceid: string
}

export interface MayHavePollId{
    pollid?: string
}

export interface PollSettings extends MayHavePollId, MayHaveCustomId {
    ownerid: string,
    title: string,
    description?: "Vote for your favorite color",
    sortanswers?:string,
    maxtotalresponsesperuser?: number,
    allowmultiplechoicesperuser?: boolean,
    maxresponsesperchoiceperuser?:number,
    maxtotalvotesperuser?: number
}

export interface Poll extends PollSettings, HasPollId {
    pollid: string
}
export interface PollChoice extends HasPollChoiceId {
    position: number
    title: string
}
export interface PollStanding {

}
export interface UserPollChoice {

}