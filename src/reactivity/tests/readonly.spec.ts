import { isReadonly, readonly, shallowReadonly } from "../reactive";
describe("readonly",()=>{
    it("should make nested values readonly",()=>{
        const original = { foo:1, bar: { baz:2} };
        const wrappd = readonly(original);
        expect(wrappd).not.toBe(original);
        expect(isReadonly(wrappd)).toBe(true);
        expect(isReadonly(original)).toBe(false);
        expect(wrappd.foo).toBe(1);
    })


    it("测试shallowReadonly方法是否只讲最外层转换为Readonly",()=>{
        const props = shallowReadonly({n:{foo:1}});
        expect(isReadonly(props)).toBe(true);
        expect(isReadonly(props.n)).toBe(false);
    })


    it('should call console.warn when set',()=>{
        // console.warn()
        // mock
        console.warn = jest.fn()
        const user = readonly({
            age:10
        })

        user.age = 11
        expect(console.warn).toBeCalled();

    })


})