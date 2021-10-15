/*
1.一些思想：
如何监听路由的变化来判断渲染那个子应用？
这里需要声明，在SPA架构下，路由变化是不会引发刷新的
因此我们需要一个方式知晓路由的变化
从而判断是否需要切换子应用或者什么事儿都不干

2.实现目标
(1)重写 pushState 以及 replaceState 方法，
    在方法中调用原有方法后执行如何处理子应用的逻辑
(2)监听 hashchange 及 popstate 事件，
    事件触发后执行如何处理子应用的逻辑
(3)重写监听 / 移除事件函数，
如果应用监听了hashchange及popstate 事件就将回调函数保存起来以备后用


3.路由劫持优化

实现应用生命周期以后，我们现在就能来完善先前路由劫持中没有做的「如何处理子应用」的这块逻辑。

这块逻辑在我们做完生命周期之后其实很简单，可以分为以下几步：

(1).判断当前 URL 与之前的 URL 是否一致，如果一致则继续

(2).利用当前 URL 去匹配相应的子应用，此时分为几种情况：

•初次启动微前端，此时只需渲染匹配成功的子应用
•未切换子应用，此时无需处理子应用
•切换子应用，此时需要找出之前渲染过的子应用做卸载处理，然后渲染匹配成功的子应用

主要实现了reroute和getAppListStatus

*/

import {EventType} from "../types"
import {getAppListStatus} from "../utils"
//路由切换，要启动新的应用，走对应钩子
import {
    runBoostrap,
    runBeforeLoad,
    runMounted,
    runUnmounted,
  } from '../lifeCycle'


let historyEvent:PopStateEvent | null=null;
let lastUrl : string |null = null;

//保存原有方法
const originalPush = window.history.pushState;
const originalReplace = window.history.replaceState;

export const hijackRoute = ()=>{
    //(1)重写pushState和replaceState方法，处url改变逻辑
    //关于args，第一个参数是state，第二个参数是title，第三个参数是可选的url
    window.history.pushState = (...args)=>{
        //继承一下
        originalPush.apply(window.history,args);
        //url改变逻辑，实际是如何处理子应用
        //给historyEvent赋值作为标识，然后执行和popstate一样的事件
        historyEvent = new PopStateEvent("popstate")
        args[2] && reroute(args[2])

        
    }
    window.history.replaceState = (...args)=>{
        //继承一下
        originalReplace.apply(window.history,args);
        //新增实现,更改url，子应用逻辑
        historyEvent = new PopStateEvent("popstate")
        args[2] && reroute(args[2])

    }

    //(2)监听 hashchange及popstate事件,处理url改变逻辑
    window.addEventListener("hashchange",handleUrlChange)
    window.addEventListener("popstate",handleUrlChange);
    
    //(3)重写重写监听/移除事件函数，
    //监听到hashchange 及 popstate 事件就将回调函数保存起来以备后用
    window.addEventListener = hijackEventListener(window.addEventListener);
    window.removeEventListener = hijackEventListener(window.removeEventListener);


}

//对应(3),准备一个保存数组
const capturedListeners: Record<EventType, Function[]> = {
    hashchange: [],
    popstate: [],
}

//对应capturedListeners，判断数组中是否已经存在对应回调
const hasListener = (name:EventType,fn:Function)=>{
    return capturedListeners[name].filter((listener)=>listener===fn).length;
}


//对add和remove，EvnetListener的重写
const hijackEventListener = (func:Function):any =>{

    return function(name:string,fn:Function){
        if(name === "hashchange" || name === "popstate"){
            if(!hasListener(name,fn)){
                //(2)add的时候就会添加进来，这里边保存的就是第二步add的回调
                //add的回调被拿出来，放进了captureListeners，
                //然后在callCapturedListeners中会被调用
                capturedListeners[name].push(fn);
                return;
            }   
            else{
                capturedListeners[name] = capturedListeners[name].filter(
                    //如果是已经有了，再次执行，就是remove了
                    (listener) => listener !== fn 
                )
            }
        }
        //其它的还是走原来方法
        return func.apply(window,arguments);
    }
}

//这里主要是按顺序执行生命周期函数，
export const reroute = (url:string) =>{
    //如果路径变更
    if(url != lastUrl){
        //匹配路由，找到符合条件的子路由
        const {actives,unmounts} = getAppListStatus();
        //concat拼接两个数组
        Promise.all(
            unmounts.map(async (app)=>{
                await runUnmounted(app);
            })
            .concat(
                actives.map(async (app)=>{
                    await runBeforeLoad(app);
                    await runBoostrap(app);
                    await runMounted(app)
                })
            )
        ).then(()=>{
            //执行add回调，add回调又是它自己
            callCapturedListeners()
        })
    }
    lastUrl = url || location.href;
}


const handleUrlChange = ()=>{
    reroute(location.href);
}



//captureListener里边存的只有hashchanfe和popstate，这里是执行它
//@ts-ignore来忽略下一行错误。
export function callCapturedListeners(){

    //如果是history事件，pop类型
    if(historyEvent){
        Object.keys(capturedListeners).forEach((eventName)=>{
            //将数组取出
            const listeners = capturedListeners[eventName as EventType];
            //pop的时候，如果栈里边放的有内容
            if(listeners.length){
                listeners.forEach((listeners)=>{
                    // @ts-ignore
                    listeners.call(this,historyEvent)
                })
            }
        })
        historyEvent = null;
    }
}


