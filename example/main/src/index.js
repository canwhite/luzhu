import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { registerMicroApps, start,initGlobalState } from '../../../dist'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)


//初始化状态
const actions = initGlobalState({a:"123"});
actions.onGlobalStateChange((state, prev) => {
  // state: 变更后的状态; prev 变更前的状态
  console.log("s,p",state, prev);
});
actions.setGlobalState({a:"467"});



const appList = [
  {
    name: 'vue',
    activeRule: '/vue',
    container: '#micro-container',
    entry: 'http://localhost:8080',
  },
]



/* let actions = new EventCenter();

// //将actions信息挂载在app信息上
appList.forEach((item)=>{
   item.actions = actions;
}) 

actions.on("test",(data)=>{
  console.log("test",data);
})
 */

registerMicroApps(appList)
start()
