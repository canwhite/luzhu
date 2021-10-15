import { match } from "path-to-regexp";
import { getAppList } from "./appList";
import { IInternalAppInfo } from "./types";
import { AppStatus } from "./enum";
import { importEntry } from "import-html-entry";

/* 在lifeCycle里我们加载资源，两种方案
1.JS Entry
2.HTML Entry
前者是通过 JS 加载所有静态资源，后者则通过 HTML 加载所有静态资源。
js entry性能消耗比较大，而html entry则不然
这里我们只需调用原生fetch就能拿到东西了
 */

export const fetchResource= async (url:string) =>{
    return await fetch(url).then(
        async (res) => await res.text()
    )
}

//拼接资源路径
export function getCompletionURL(src:string | null,baseURI:string){
    if(!src) return src;
    //如果url已经是协议开头的，就直接返回
    if (/^(https|http)/.test(src)) return src
    //通过原生方法拼接url,new URL()
    return new URL(src,getCompletionBaseURL(baseURI)).toString()
}

//获取baseURL
//因为用户再注册应用的entry里边可能填入可//xxx或者https://xxx这种格式的URL
export function getCompletionBaseURL(url:string){
    return url.startsWith("//")?`${location.protocol}${url}`:url
}
export const getAppListStatus = ()=>{
    //需要渲染的应用列表
    const actives : IInternalAppInfo[] = [];
    //需要卸载的应用列表
    const unmounts: IInternalAppInfo[] = [];
    //获取注册的子应用列表
    const list = getAppList() as IInternalAppInfo[]
    list.forEach((app)=>{
        //这一步利用path-to-regexp匹配路由,直接从location里去路径判断是否和app.activeRule匹配
        //const isActive = match(app.activeRule,{end:false})(location.href);
        //一开始用了上边的数据，内有加载到对应内容
        //so：这里说明下location.href和location.pathname的区别
        /*
        我们子应用注册的时候
        {
            name: 'vue',
            activeRule: '/vue',
            container: '#micro-container',
            entry: 'http://localhost:8080',
        },
        匹配的是activeRule
        .pathname	首个 / 开始的路径名称
        .href	完整网址

        其它属性：
        window.location	返回值
        .origin	协议 + 主机名 + 端口号
        .protocol	协议，例如(http: 或 https:)
        .host	域名 + 端口
        .port	端口号
        .pathname	首个 / 开始的路径名称
        .search	?开始的参数字符串
        .hash	#后跟随的锚点或是片段标识符
        */


        const isActive = match(app.activeRule, { end: false })(location.pathname)
        //研究一下这两者的区别
        //判断应用状态
        switch(app.status){
            case AppStatus.NOT_LOADED:
            case AppStatus.LOADING:
            case AppStatus.LOADED:
            case AppStatus.BOOTSTRAPPING:
            //如果是初次加载
            case AppStatus.NOT_MOUNTED:
                //如果匹配上了就往actives里边添加内容
                isActive && actives.push(app);
                break;
            //如果是切换新的子应用,就需要先把之前的卸载
            case AppStatus.MOUNTED:
                !isActive && unmounts.push(app);
                break;
        }
    })
    //循环里边封装好actives和unmounts，然后最后返回
    return {
        actives,
        unmounts
    }
}



//yarn install 注入@types/requestidlecallback
export const prefetch = async (app: IInternalAppInfo) => {
    requestIdleCallback(async () => {
      const { getExternalScripts, getExternalStyleSheets } = await importEntry(
        app.entry
      )
      requestIdleCallback(getExternalStyleSheets)
      requestIdleCallback(getExternalScripts)
    })
}