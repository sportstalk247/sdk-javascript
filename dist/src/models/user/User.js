"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSearchType = exports.UserRole = exports.UserModerationState = void 0;
exports.UserModerationState = {
    Flagged: 'flagged',
    Approved: 'approved',
    Rejected: 'rejected'
};
var UserRole;
(function (UserRole) {
    UserRole["admin"] = "admin";
    UserRole["moderator"] = "moderator";
    UserRole["user"] = "user";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
/**
 * Used only for searching users by API.  A sear
 */
var UserSearchType;
(function (UserSearchType) {
    UserSearchType["handle"] = "handle";
    UserSearchType["name"] = "name";
    UserSearchType["userid"] = "userid";
})(UserSearchType = exports.UserSearchType || (exports.UserSearchType = {}));
//# sourceMappingURL=User.js.map