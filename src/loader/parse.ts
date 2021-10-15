import { getCompletionURL } from "../utils";
import { IInternalAppInfo } from "../types";

const scripts:string[] = [];
const links:string[] = [];
const inlineScript:string[] = [];


//先加载后解析
export const parseHTML =  (parent:HTMLElement,app:IInternalAppInfo)=>{
    //从html里边拿到children
    const children = Array.from(parent.children) as HTMLElement[];
    children.length && children.forEach((item)=>parseHTML(item,app))
    for(const dom of children){
        if(/^(link)$/i.test(dom.tagName)){
            //处理link，link是外部资源链接元素
            //<link rel="icon" href="favicon.ico">
            const data = parseLink(dom, parent, app)
            data && links.push(data)
            
        }else if(/^(script)$/i.test(dom.tagName)){
            //处理script
            const data = parseScript(dom,parent,app);
            data.text && inlineScript.push(data.text) 
            data.url && inlineScript.push(data.url)

        }else if(/^(img)$/i.test(dom.tagName) && dom.hasAttribute("src")){
            //处理图片，如果图片资源用相对路径肯定也是404
            //给图片子元素属性设置完整路径
            dom.setAttribute(
                "src",
                getCompletionURL(dom.getAttribute('src')!, app.entry)!)
        }
        //关于叹号，放在成员前边是作为一元运算符，取反
        //放在成员后边表示强调非空
        //放在set即点语法前表示强制链式调用
        return {scripts,links,inlineScript}
    }
}
//处理 link 标签时，我们只需要处理 CSS 资源，
//其它 preload / prefetch 的这些资源直接替换 href 就行。
const parseLink = (
    link:HTMLElement,
    parent:HTMLElement,
    app:IInternalAppInfo
)=>{
    const rel = link.getAttribute("rel");
    const href = link.getAttribute("href");
    let comment: Comment | null;
    //如果链接的是css资源就单独处理，拼接转成完整路径
    if(rel === 'stylesheet' && href){
        comment = document.createComment(`link replace by micro`);
        // @ts-ignore
        comment && parent.replaceChild(comment,href);
        return getCompletionURL(href,app.entry)
    }else if(href){
        link.setAttribute("href",getCompletionURL(href,app.entry)!);
    }
}


//处理script，我们需要区别是js文件还是行内代码,前者还需要fetch一次获取内容
const parseScript = (
    script:HTMLElement,
    parent:HTMLElement,
    app:IInternalAppInfo
)=>{
    let comment :Comment | null;
    const src = script.getAttribute("src");
    //有src说明是js文件，没有src说明是inline script，
    //也就是js代码直接写在标签里
    if(src){
        comment = document.createComment('script replaced by micro')
    }else if(script.innerHTML){
        comment = document.createComment('inline script replaced by micro')
    }
    //replace用新节点替换旧得节点parentNode.replaceChild(newChild, oldChild);
    // @ts-ignore
    comment && parent.replaceChild(comment,script);
    return {
        url:getCompletionURL(src,app.entry),
        text:script.innerHTML
    }
}
