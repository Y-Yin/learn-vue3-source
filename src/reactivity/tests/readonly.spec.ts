import { readonly } from "../reactive";
describe("readonly",()=>{
    it("happy path",()=>{
        const original = { foo:1, bar: { baz:2} };
        const wrappd = readonly(original);
        expect(wrappd).not.toBe(original);
        expect(wrappd.foo).toBe(1)
    })


    it('warn then call set',()=>{
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