import {AppStatus} from "./enum"
//interface 一般是方法和对象
export interface IAppInfo{
    name:string;
    entry:string;
    container:string;
    activeRule:string
}

//因为有了lifeStyle，在原有的子应用信息的基础上进行拓展
//子应用的钩子
export interface IInternalAppInfo extends IAppInfo{
    status:AppStatus,
    bootstrap?:LifeCycle,
    mount?:LifeCycle,
    unmount?:LifeCycle,
    proxy:any,
    actions:any
   
}


//生命周期，主应用的钩子
export interface ILifeCycle{
    //?号表示这个钩子是一个可选钩子
    beforeLoad?:LifeCycle | LifeCycle[]
    mounted?:LifeCycle | LifeCycle[]
    unmounted?:LifeCycle | LifeCycle[]
}

//注意lifeCycle是一个fn，正常钩子就是一个fn，且返回了Promise
export type LifeCycle = (app:IAppInfo) => Promise<any>



//type基本数据类型和联合
export type EventType = "hashchange" |  "popstate"


//给微前端框架加状态管理
/*------------------------------------
PS1:Record
这是一个很有意思的类型
一个例子：
type studentScore = { [ name:string]:number }
--------
上边的索引签名示例，也可以用Record类型来表示
type studentScore = Record<string, number>

Record最主要的作用：用联合字符串限定属性范围
type roles = 'tester' | 'developer' | 'manager'
const staffCount: Record<roles, number> = {
  tester: 10,
  developer: 20,
  manager: 1
}

PS2: 索引签名
//数字索引
//约束:只有一种类型，key值必须是number类型，value值必须是string
interface numberIndex{
    [index:number]:string
}
var numberTest: numberIndex=['1','2','3']
console.log('数字索引的第一个值'+numberTest[0])//输出数字下标


//字符串索引
interface strIndex{
    [index:string]:string
}
var strTest:strIndex={
    name:"looper--->字符串索引",
    age:"12------>字符串索引",
    sex:"男------>字符串索引"
}//strTest的类型是strIndex,约束了对象类型，并且是string
console.log("字符串索引的名字是"+strTest.name)

以上都是一种对数据类型的组合包装的方式，可以优先选择Record

-------------------------------------*/

export type OnGlobalStateChangeCallback = (state:Record<string,any>,prevState:Record<string,any>)=>any;

export type MicroAppStateActions = {
    onGlobalStateChange:(callback:OnGlobalStateChangeCallback,fireImmediately?:boolean)=>void;
    setGlobalState:()=>boolean;
    offGlobalStateChange:()=>boolean
}

export type Func = (props:any)=>any