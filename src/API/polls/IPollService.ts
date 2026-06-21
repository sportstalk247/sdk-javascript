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
import {
    CreatePollChoiceRequest,
    PollChoice,
    PollVoteResponse,
    CreatePollLeadRequest,
    PollLead,
    PollResponse,
    PollLeadListResponse,
    PollResponseListResponse
} from "../../models/polls/Poll";

/**
 * @interface
 */
export interface IPollService extends ISportsTalkConfigurable {
    resetPoll(poll: Poll | string): Promise<Poll>
    createOrUpdatePoll(poll: PollSettings):Promise<Poll>
    /** Update an existing poll by id (PUT). Only fields present on `settings` are changed. */
    updatePoll(poll: Poll | string, settings: PollSettings): Promise<Poll>
    createOrUpdatePollChoice(poll: Poll | string, pollChoice: CreatePollChoiceRequest): Promise<Array<CreatePollChoiceRequest>>
    /** Delete a single choice from a poll; cascades to delete every response recorded for it. */
    deletePollChoice(poll: Poll | string, pollChoice: PollChoice | string): Promise<PollChoice>
    createPollResponse(poll: string | Poll, pollChoice: string | CreatePollChoiceRequest, user: string | HasUserId | undefined): Promise<PollVoteResponse>
    listPolls(cursor?: string, limit?: number, includeUnpublished?: boolean):Promise<Array<Poll>>
    getPollStandings(poll:Poll | string): Promise<Array<PollStanding>>
    getPollDetails(poll:Poll| string): Promise<Poll>
    getPollDetailsByCustomId(poll: MayHaveCustomId | string): Promise<any>
    listChoicesForPoll(poll:Poll | string): Promise<Array<PollChoice>>

    /**
     *
     * @param user required if no default user is set.
     */
    listResponsesByUser(poll: HasPollId | string, user: HasUserId | string): Promise<Array<UserPollChoice>>
    /** All responses for a poll (the requesting user may be required if the poll hides results until you vote). */
    getResponses(poll: Poll | string, requestingUser?: HasUserId | string): Promise<Array<PollResponse>>
    /** Cursor-paged list of all responses for a poll. */
    listResponses(poll: Poll | string, limit?: number, cursor?: string): Promise<PollResponseListResponse>
    /** Capture a lead against a poll (lead capture must be enabled on the poll). */
    createLead(poll: Poll | string, lead: CreatePollLeadRequest): Promise<PollLead>
    /** Cursor-paged list of leads captured for a poll. */
    listLeads(poll: Poll | string, limit?: number, cursor?: string): Promise<PollLeadListResponse>
    deletePoll(poll: Poll | string): Promise<Poll>
}