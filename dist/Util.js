"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
exports.createUserToken = function (user, secret, options) {
    if (options === void 0) { options = {}; }
    var userid = user.userid, role = user.role;
    var iat = options.iat, exp = options.exp, applicationid = options.applicationid;
    var jwtSettings = {
        iat: iat || Date.now() / 1000,
        iss: applicationid,
        exp: exp
    };
    if (!exp) {
        delete jwtSettings.exp;
    }
    if (!applicationid) {
        delete jwtSettings.iss;
    }
    return jsonwebtoken_1.sign({ userid: userid, role: role }, secret, jwtSettings);
};
//# sourceMappingURL=Util.js.map