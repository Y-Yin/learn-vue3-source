/**
 *  Map() 方法： 以键值对的形式作为基本的数据结构  new Map([['Michael', 95], ['Bob', 75], ['Tracy', 85]])
 *      对象也是以键值对形式存储数据有何不同： Map的键可以存储任意类型的数据，包括但不限于数组，对象
 * 
 *  Set() 方法： 和Map() 类似，都是集合，但不存储value , 并且只能存储不重复的key  Set([1, 2, 3])
 * 
 *  所有响应式对象， key, 以及依赖收集的方法 之间的关系
 *  
 *  targetMap =>  key => dep方法
 * 
   New Map[
	[obj1,   new Map[  
		[  key ,  new Set( fn1 ,fn2, fn3  )  ],
        [  key2 , new Set( fn1 ,fn2, fn3  )  ]
      ]   
    ],
    obj2…….
   ]
 * */ 

let activeEffect; 
let shouldTrack; 

class ReactiveEffect {
    _fn: any;
    deps = [];
    active = true;
    onStop?:()=>void;
    constructor(fn, public scheduler?){
        this._fn = fn;
    }
    run(){
        // 1.会收集依赖
        // shouldTrack 来做区分
        if(!this.active){
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;

        const result = this._fn();

        // reset
        shouldTrack = false;
        return result
    }
    stop(){
        // 避免每次都清空， 影响性能，我们设置一个变量记录是否清空过
        if(this.active){
            cleanupEffect(this)
            if(this.onStop){
                this.onStop()
            }
            this.active = false;
        }
        
    }
}


function cleanupEffect(effect){
    effect.deps.forEach((dep:any)=>{
        dep.delete(effect)
    })
}

const targetMap = new Map();
//  依赖收集
export function track(target,key){

    // activeEffect=false &&  shouldTrack=false 正在收集中的状态
    if(!activeEffect)return;
    if(!shouldTrack)return;


    let depsMap = targetMap.get(target); // 获取target 当前对象有无对应的value
    if( !depsMap ){  
        depsMap = new Map();
        targetMap.set(target,depsMap)  // 如果没有，则添加一个以这个对象为key , 值为Map类型 的 targetMap 项
    }

    //  如果这个 depsMap 也没有对应属性，则创建出一个不重复的key
    //  * 每个响应式对象的每个key , 都需要有一个依赖收集的容器
    let deps = depsMap.get(key); 
    if(!deps){
        deps = new Set();
        depsMap.set(key,deps)
    }
    // track 是依赖收集， 但是只是单纯的获取的话， 并没有effect, 此时activeEffect.deps会报错
    // deps.add(activeEffect);
    // activeEffect.deps.push(deps);

    deps.add(activeEffect);
    activeEffect.deps.push(deps);

}

// 依赖触发
export function trigger(target,key){
    let depsMap = targetMap.get(target)
    let deps  = depsMap.get(key)
    
    for(const effect of deps){
        if(effect.scheduler){
            effect.scheduler()
        }else{
            effect.run()
        }
        
    }
}



/**
 * effect的作用就是让我们传入的函数发生作用
 * */ 
export function effect(fn, options:any = {}){
    // fn
    const _effect = new ReactiveEffect(fn,options.scheduler);
    // options  将options的参数赋值给effect
    Object.assign(_effect,options)

    _effect.run();

    // 以当前的实例，作为他的 this 指向
    const runner:any =  _effect.run.bind(_effect)

    runner.effect = _effect;

    return runner
}



export function stop(runner){
    runner.effect.stop();
}