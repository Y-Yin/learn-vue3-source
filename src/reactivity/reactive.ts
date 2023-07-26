import { track,trigger } from "./effect";

function createGetter(isReadonly = false){
    return function get(target,key){
        const res = Reflect.get(target,key);

        if(!isReadonly){
            // TODO 依赖收集
            track(target,key)
        }
        return res;
    }
}

function createSetter(){
    return  function set(target,key,value){
        const res =  Reflect.set(target,key,value);
        // TODO 触发依赖
        trigger(target,key)
        return res
    }
}

/**
 * Reflect : 是 ES6 为了操作对象而提供的新 API
 * */ 
export function reactive(raw){

    return new Proxy(raw,{
        get:createGetter(),
        set:createSetter()
    })
}


export function readonly(raw){
    return new Proxy(raw,{
        get:createGetter(true),
        set(target,key:any,value){
            console.warn(`key:${key} set 失败 因为target 是readonly`,target)
            return true;
        }
    })
}