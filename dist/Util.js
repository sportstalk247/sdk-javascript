"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
exports.createUserToken = function (user, secret, options) {
    if (options === void 0) { options = {}; }
    var userid = user.userid, role = user.role;
    var expiresIn = options.expiresIn, audience = options.audience;
    var jwtSettings = {
        audience: audience,
        expiresIn: expiresIn
    };
    if (!audience) {
        delete jwtSettings.audience;
    }
    if (!expiresIn) {
        delete jwtSettings.expiresIn;
    }
    return jsonwebtoken_1.sign({ userid: userid, role: role }, secret, jwtSettings);
};
//# sourceMappingURL=util.js.map