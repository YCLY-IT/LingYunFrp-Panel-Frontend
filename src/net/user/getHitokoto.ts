import {defaultError, defaultFailure, get } from "../base";
import { Window } from '../../types'

declare const window: Window;

// 导出一个函数，用于获取一句名言
export function getHitokoto(headers: Record<string, string>, success: Function, failure = defaultFailure, error = defaultError) {
    // 发送GET请求，获取名言
    get("https://v1.hitokoto.cn/?c=i&encode=text", headers, (data: any) => {
        success(data);
    },(message) => {
        failure(message);
    },(err) => {
        error(err);
    });
}