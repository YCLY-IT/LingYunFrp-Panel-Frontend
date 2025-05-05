import { UserApiRespond } from "./user";

export interface ApiRespondBase {
    code: number,
    message?: string
};

export type ApiRespond = UserApiRespond;
