import {ListRequest} from "./CommonModels";

export enum ModerationType {
    pre = "pre",
    post = "post"
}

export enum ReportType {
    abuse = 'abuse',
    spam = "spam",
}

export interface ReportReason {
    reporttype?: ReportType
    reason?: ReportType,
    userid: string
}

export interface ChatModerationQueueListRequest extends ListRequest {
    roomId?: string // RoomID to restrict items expecting moderation.
}