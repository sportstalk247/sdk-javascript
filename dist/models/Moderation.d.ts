import { ListRequest } from "./CommonModels";
export declare enum ModerationType {
    pre = "pre",
    post = "post"
}
export declare enum ReportType {
    abuse = "abuse",
    spam = "spam"
}
export interface ReportReason {
    reporttype?: ReportType;
    reason?: ReportType;
    userid: string;
}
export interface ChatModerationQueueListRequest extends ListRequest {
    roomId?: string;
}
