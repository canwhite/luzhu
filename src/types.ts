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
    proxy:any
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