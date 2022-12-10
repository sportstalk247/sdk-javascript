import {User} from "./models/user/User";
import {sign} from 'jsonwebtoken';
export interface IUserJwtOptions {
    applicationid?: string | string[], // application id for the user. Leave blank to allow for all applications
    exp?: number,  // Unix timestamp
    iat?: number, //unix timestamp,
}
export const createUserToken = function(user: User, secret:string, options: IUserJwtOptions = {}) {
    const {userid, role} = user;
    const {iat, exp, applicationid} = options
    const jwtSettings = {
        iat: iat || Date.now()/1000,
        iss: applicationid,
        exp: exp

    }
    if(!exp) {
       delete jwtSettings.exp;
    }
    if(!applicationid) {
       delete jwtSettings.iss
    }
    return sign({userid, role}, secret, jwtSettings);
}