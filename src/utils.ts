import {User} from "./models/user/User";
import {sign} from 'jsonwebtoken';

export interface IUserJwtOptions {
    expiresIn?: number,  // a number is seconds.
}

export const createUserToken = function(user: User, secret:string, options: IUserJwtOptions = {}) {
    const {userid, role} = user;
    const { expiresIn } = options
    const jwtSettings = {
        algorithm: 'HS256',
        expiresIn
    }
    if(!expiresIn) {
        delete jwtSettings.expiresIn
    }
    return sign({userid, role}, secret, jwtSettings);
}