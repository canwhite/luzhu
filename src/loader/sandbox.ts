//在沙箱里放了很多的工具
/* import {EventCenterForMicroApp} from "../data" */
export class ProxySandbox {
    proxy: any
    running = false
    appName:string
    constructor(appName:string) {
      const fakeWindow = Object.create(null)
      this.appName = appName;
      const proxy = new Proxy(fakeWindow, {
        set: (target: any, p: string, value: any) => {
          if (this.running) {
            target[p] = value
          }
          return true
        },
        get(target: any, p: string): any {
          switch (p) {
            case 'window':
            case 'self':
            case 'globalThis':
              return proxy
          }
          //fakeWindowm没有，但是window有的数据，指向window，让window返回
          if (
            !window.hasOwnProperty.call(target, p) &&
            window.hasOwnProperty(p)
          ) {
            // @ts-ignore
            const value = window[p]
            if (typeof value === 'function') return value.bind(window)
            return value
          }
          return target[p]
        },
        has() {
          return true
        },
      })
      this.proxy = proxy
      
    }
    active() {
      //创建数据通信对象
      /* this.proxy.microApp = new EventCenterForMicroApp(this.appName) */
      this.running = true
    }
    inactive() {
      /* this.proxy.microApp.removeDataListener(()=>{
        console.log("remove sub listener")
      }); */
      this.running = false
    }
  }
  