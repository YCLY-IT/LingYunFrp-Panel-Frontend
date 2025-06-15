import { api, defaultError, defaultFailure } from "../base";
import { Window } from '@/types'

declare const window: Window;

export function getHitokoto(headers: Record<string, string>, success: Function, failure = defaultFailure, error = defaultError) {
    api.get("https://v1.hitokoto.cn/?encode=json", {
        headers: headers
    }).then(({ data }) => {
        success(data);
    }).catch(err => error(err));
}