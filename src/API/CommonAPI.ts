import {ClientConfig, SportsTalkConfig, User} from "../models/CommonModels";

export interface ISportsTalkConfigurable {
    setConfig(config: SportsTalkConfig)
}

export interface IConfigurable {
    setConfig(config: ClientConfig)
}

export interface IUserConfigurable {
    setUser(user: User)
}