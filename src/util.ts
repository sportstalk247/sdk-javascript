import {User} from "./models/user/User";
import {sign} from 'jsonwebtoken';

export interface IUserJwtOptions {
    audience?: string | string[], // application id for the user. Leave blank to allow for all applications
    expiresIn?: number,  // a number is seconds.
}

export const createUserToken = function(user: User, secret:string, options: IUserJwtOptions = {}) {
    const {userid, role} = user;
    const { expiresIn, audience} = options
    const jwtSettings = {
        audience,
        expiresIn
    }
    if(!audience) {
        delete jwtSettings.audience
    }
    if(!expiresIn) {
        delete jwtSettings.expiresIn
    }
    return sign({userid, role}, secret, jwtSettings);
}