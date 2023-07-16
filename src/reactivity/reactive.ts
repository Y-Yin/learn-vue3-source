import { track,trigger } from "./effect";


/**
 * Reflect : 是 ES6 为了操作对象而提供的新 API
 * */ 
export function reactive(raw){

    return new Proxy(raw,{
        get(target,key){
            const res = Reflect.get(target,key);
            // TODO 依赖收集
            track(target,key)
            return res;
        },
        set(target,key,value){
            const res =  Reflect.set(target,key,value);
            // TODO 触发依赖
            trigger(target,key)
            return res
        }
    })
}