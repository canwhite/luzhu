# luzhu（卤煮）
front-micro，微前端框架，"一碗卤煮"

## des

* 路由劫持
* 生命钩子
* 资源加载
* 沙箱
* 全局通信


## install

```
yarn add qluzhu
```

## use


```
---------------
1.主应用中
---------------

import { registerMicroApps, start,initGlobalState } from 'qluzhu'

...

//初始化全局状态
const actions = initGlobalState({a:"123"});
actions.onGlobalStateChange((state, prev) => {
  // state: 变更后的状态; prev 变更前的状态
  console.log("s,p",state, prev);
});
actions.setGlobalState({a:"467"});


//注册子应用
const appList = [
  {
    name: 'vue',
    activeRule: '/vue',
    container: '#micro-container',
    entry: 'http://localhost:8080',
  },
]

registerMicroApps(appList)
start()


---------------
2.子应用中
---------------

let app

export const bootstrap = () => {
  app = new Vue({
    render: (h) => h(App),
  })
}

export const mount = (data ) => {
  app.$mount('#app')
  //子应用更改状态，主应用监听
  data.actions.setGlobalState({a:"1789"})
}

export const unmount = () => {
  app.$destroy()
}

```

## todos

其它细节填充


