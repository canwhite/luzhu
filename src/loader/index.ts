import { IInternalAppInfo } from '../types'
import { importEntry } from 'import-html-entry'
import { ProxySandbox } from './sandbox'
import { getMicroAppStateActions } from '../globalState'

export const loadHTML = async (app: IInternalAppInfo) => {
  const { container, entry} = app;

  const { template, getExternalScripts, getExternalStyleSheets } =
    await importEntry(entry)
  const dom = document.querySelector(container)

  if (!dom) {
    throw new Error('容器不存在')
  }

  dom.innerHTML = template

  await getExternalStyleSheets()
  const jsCode = await getExternalScripts()

  jsCode.forEach((script) => {
    //这里的lifeCycle是子项目自己实现的钩子，被loader进来了
    //然后将钩子的实现和app里边定义的钩子挂载一起，开始执行
    const lifeCycle = runJS(script, app)
    if (lifeCycle) {
      app.bootstrap = lifeCycle.bootstrap
      app.mount = lifeCycle.mount
      app.unmount = lifeCycle.unmount
    }
  })

  return app
}

const runJS = (value: string, app: IInternalAppInfo) => {


  const {name} = app;
  const appInstanceId = `${name}_${+new Date()}_${Math.floor(Math.random() * 1000)}`;
  //如果需要的话，再给unmounted传一个值
  console.log(appInstanceId);
  const actions: Record<string, CallableFunction> =
  getMicroAppStateActions(appInstanceId);
  //在挂载沙箱的时候同步挂载actions
  if(!app.actions){
    app.actions = actions;
  } 

  //将名字挂载在沙盒上
  if (!app.proxy) {
    //在runjs的时候把ProxySandBox给放上去了
    app.proxy = new ProxySandbox(name)
    
    // @ts-ignore
    window.__CURRENT_PROXY__ = app.proxy.proxy
  }
  app.proxy.active()
  const code = `
    return (window => {
      ${value}
      return window['${app.name}']
    })(window.__CURRENT_PROXY__)
  `
  return new Function(code)()
}
