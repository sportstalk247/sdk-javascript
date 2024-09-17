import {ISportsTalkConfigurable} from "../Configuration";
import {
    Poll,
    PollSettings,
    HasPollId,
    PollStanding,
    UserPollChoice,
    HasPollChoiceId
} from "../../models/PollModels"
import {MayHaveCustomId} from "../../models/CommonModels";
import {HasUserId} from "../../models/user/User";
import {CreatePollChoiceRequest, PollChoice, PollVoteResponse} from "../../models/polls/Poll";

/**
 * @interface
 */
export interface IPollService extends ISportsTalkConfigurable {
    resetPoll(poll: Poll | string): Promise<Poll>
    createOrUpdatePoll(poll: PollSettings):Promise<Poll>
    createOrUpdatePollChoice(poll: Poll | string, pollChoice: CreatePollChoiceRequest): Promise<Array<CreatePollChoiceRequest>>
    createPollResponse(poll: string | Poll, pollChoice: string | CreatePollChoiceRequest, user: string | HasUserId | undefined): Promise<PollVoteResponse>
    listPolls():Promise<Array<Poll>>
    getPollStandings(poll:Poll | string): Promise<Array<PollStanding>>
    getPollDetails(poll:Poll| string): Promise<Poll>
    getPollDetailsByCustomId(poll: MayHaveCustomId | string)
    listChoicesForPoll(poll:Poll | string): Promise<Array<PollChoice>>

    /**
     *
     * @param user required if no default user is set.
     */
    listResponsesByUser(poll: HasPollId | string, user: HasUserId | string): Promise<Array<UserPollChoice>>
    deletePoll(poll: Poll | string): Promise<Poll>
}