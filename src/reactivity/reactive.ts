import { isObject } from "../utils";
import { track,trigger } from "./effect";

export const enum ReactiveFlags {
    IS_REACTIVE =  "__v_isReactive",
    IS_READONLY =  "__v_isReadonly"
}

function createGetter(isReadonly = false, shallow = false){
    return function get(target,key){

        if(key === ReactiveFlags.IS_REACTIVE){
            return !isReadonly
        }else if(key === ReactiveFlags.IS_READONLY){
            return isReadonly
        }

        const res = Reflect.get(target,key);


        if(shallow){
            return res
        }

        // 看看res 是不是 object 
        if(isObject(res)){
           return  isReadonly ? readonly(res) : reactive(res);
        }

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

// 只讲最外层的对象转换为readonly
export function shallowReadonly(raw){
    return new Proxy(raw,{
        get:createGetter(true,true),
        set(target,key:any,value){
            console.warn(`key:${key} set 失败 因为target 是readonly`,target)
            return true;
        }
    })
}


export function isProxy(value){
    return isReactive(value) || isReadonly(value)
}

export function isReactive(value){
    // 执行对象的get操作， 从而判断是否是一个reactive
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value){
    return !!value[ReactiveFlags.IS_READONLY]
}


