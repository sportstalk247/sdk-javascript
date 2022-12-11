import { User } from "./models/user/User";
export interface IUserJwtOptions {
    applicationid?: string | string[];
    exp?: number;
    iat?: number;
}
export declare const createUserToken: (user: User, secret: string, options?: IUserJwtOptions) => any;
