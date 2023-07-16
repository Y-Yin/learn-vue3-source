import {effect} from '../effect';
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
        expect(foo).toBe(12);
        expect(runner()).toBe("foo");
     })


     it('scheduler',()=>{
        // 1. 通过 effect 的第二个参数给定的 一个  scheduler 的 fn
        // 2. effect 第一次执行的时候 还会执行 fn
        // 3. 当 响应式对象 set update  不会执行  fn 而是执行 scheduler
        
     })
})