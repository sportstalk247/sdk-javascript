"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModeration = exports.Vote = exports.ListSortDirection = exports.CommentSortMethod = exports.CommentType = exports.ModerationType = exports.Kind = void 0;
var CommonModels_1 = require("./CommonModels");
Object.defineProperty(exports, "Kind", { enumerable: true, get: function () { return CommonModels_1.Kind; } });
var Moderation_1 = require("./Moderation");
Object.defineProperty(exports, "ModerationType", { enumerable: true, get: function () { return Moderation_1.ModerationType; } });
var CommentType;
(function (CommentType) {
    CommentType["comment"] = "comment";
})(CommentType = exports.CommentType || (exports.CommentType = {}));
var CommentSortMethod = /** @class */ (function () {
    function CommentSortMethod() {
    }
    CommentSortMethod.reaction = function (type) { return "reaction-" + type; };
    return CommentSortMethod;
}());
exports.CommentSortMethod = CommentSortMethod;
var ListSortDirection;
(function (ListSortDirection) {
    ListSortDirection["forward"] = "forward";
    ListSortDirection["backward"] = "backward";
})(ListSortDirection = exports.ListSortDirection || (exports.ListSortDirection = {}));
var Vote;
(function (Vote) {
    Vote["up"] = "up";
    Vote["down"] = "down";
    Vote["none"] = "";
})(Vote = exports.Vote || (exports.Vote = {}));
var CommentModeration;
(function (CommentModeration) {
    CommentModeration["flagged"] = "flagged";
    CommentModeration["rejected"] = "rejected";
    CommentModeration["approved"] = "approved";
})(CommentModeration = exports.CommentModeration || (exports.CommentModeration = {}));
//# sourceMappingURL=CommentsModels.js.map