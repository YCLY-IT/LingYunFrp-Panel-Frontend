import { ApiRespondBase } from "./base";

export interface UserLoginApiRespond extends ApiRespondBase {
    data: {
        username: string,
		role:   string,
		token:         string,
		avatar:        string,
		Authorization: string,
		expire:        string,
		nickname:      string,
    }
}

export interface UserRegisterApiRespond extends ApiRespondBase {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    data: {}
}


export type UserApiRespond = UserLoginApiRespond | UserRegisterApiRespond;