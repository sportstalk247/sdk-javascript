import {ISportsTalkConfigurable} from "../Configuration";
import {
    Poll,
    PollSettings,
    HasPollId,
    PollChoice,
    PollStanding,
    UserPollChoice,
    HasPollChoiceId
} from "../../models/PollModels"
import {MayHaveCustomId} from "../../models/CommonModels";
import {HasUserId} from "../../models/user/User";

/**
 * @interface
 */
export interface IPollService extends ISportsTalkConfigurable {
    resetPoll(poll: HasPollId | string): Promise<Poll>
    createOrUpdatePoll(poll: PollSettings)
    createOrUpdatePollChoice(poll: HasPollId | string, pollChoice:PollChoice)
    createOrUpdatePollResponse(poll: HasPollId | string, pollChoice: HasPollChoiceId | string, user?: HasUserId | string)
    listPolls():Promise<Array<Poll>>
    getPollStandings(poll:HasPollId | string): Promise<Array<PollStanding>>
    getPollDetails(poll:HasPollId | string): Promise<Poll>
    getPollDetailsByCustomId(poll: MayHaveCustomId | string)
    listChoicesForPoll(poll:HasPollId | string): Promise<Array<PollChoice>>

    /**
     *
     * @param user required if no default user is set.
     */
    listResponsesByUser(poll: HasPollId | string, user: HasUserId | string): Promise<Array<UserPollChoice>>
    deletePoll(poll: HasPollId | string): Promise<Poll>
}