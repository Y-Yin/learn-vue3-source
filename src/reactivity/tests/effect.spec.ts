import {effect , stop} from '../effect';
import {reactive} from '../reactive';
describe('effect',()=>{
    //  测试核心逻辑， 依赖收集 ， 以及依赖触发
    it('happy path',()=>{
        const user = reactive({
            age:10
        })
        let nextAge;
        effect(()=>{
            nextAge = user.age + 1;
        })

        expect(nextAge).toBe(11);


        // update
        user.age++;
        expect(nextAge).toBe(12);
    })

     it('当调用effect的时候,需要返回runner 函数 和 runner函数的返回值',()=>{
        // 1. effect => function(runner)  => fn  => return 
        let foo = 10;
        const runner = effect(()=>{
            foo++;
            return "foo"
        });

        expect(foo).toBe(11);
        expect(runner()).toBe("foo");
        expect(foo).toBe(12);
     })


     // 调度程序 
     it('scheduler',()=>{
        // 1. 通过 effect 的第二个参数给定的 一个  scheduler 的 fn
        // 2. effect 第一次执行的时候 还会执行 fn
        // 3. 当 响应式对象 set update  不会执行  fn 而是执行 scheduler
        // 4. 如果当执行 runner 的时候， 会再次执行 fn
        let dummy;
        let run:any;
        // 用于创建一个模拟函数（mock function）   const mockFn = jest.fn();
        const scheduler  = jest.fn(()=>{
            run = runner;
        })
        const obj = reactive({foo:1});
        const runner = effect(
            ()=>{
                dummy = obj.foo;
            },
            {scheduler}
        );
        // toHaveBeenCalled 用于验证一个模拟函数（mock function）是否被调用过
        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        // should be called on first trigger
        obj.foo++ ;
        expect(scheduler).toHaveBeenCalledTimes(1);
        // should not run yet
        expect(dummy).toBe(1);
        run();
        // should have run 
        expect(dummy).toBe(2);
     })

     // 当调用 effect stop 的时候， 该依赖fn , 会停止触发,  更新
     it('effect stop',()=>{
        let dummy;
        const obj = reactive({prop:1});
        const runner = effect(()=>{
            dummy = obj.prop
        })

        obj.prop = 2;
        expect(dummy).toBe(2);
        stop(runner);

        // 这里还需要考虑一个问题就是， obj.prop++
        // 当我们stop清空掉收集的依赖以后， obj.prop++ 会先触发一次get，此时依赖又被收集了
        // 

        obj.prop = 3;
        expect(dummy).toBe(2);
     })

     //  effect的时候，可以传入一个onStop函数，当stop函数被执行的时候， onStop会被回调执行 
     it('onStop',()=>{
        const obj  = reactive({
            foo:1
        })
        const onStop = jest.fn();
        let dummy;
        const runner = effect(
            ()=>{
                dummy = obj.foo
            },
            {
                onStop
            }
        );
        stop(runner)
        expect(onStop).toBeCalledTimes(1)
     })
})