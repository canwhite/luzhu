import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { registerMicroApps, start,EventCenter } from '../../../dist'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)


const appList = [
  {
    name: 'vue',
    activeRule: '/vue',
    container: '#micro-container',
    entry: 'http://localhost:8080',
  },
]

let actions = new EventCenter();

// //将actions信息挂载在app信息上
appList.forEach((item)=>{
   item.actions = actions;
}) 

actions.on("test",(data)=>{
  console.log("test",data);
})


registerMicroApps(appList)
start()
