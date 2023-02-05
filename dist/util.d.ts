import { User } from "./models/user/User";
export interface IUserJwtOptions {
    expiresIn?: number;
}
export declare const createUserToken: (user: User, secret: string, options?: IUserJwtOptions) => any;
