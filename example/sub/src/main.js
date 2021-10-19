import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

let app

export const bootstrap = () => {
  app = new Vue({
    render: (h) => h(App),
  })
}

export const mount = (data) => {
  app.$mount('#app')
  /* console.log();
  data.actions.setGlobalState("user",{name:"123"})
  data.actions.onGlobalStateChange=((state,prev)=>{
    console.log("sub on",state,prev);
  }) */
  data.actions.dispatch("test",{a:"123"})
  
}

export const unmount = () => {
  app.$destroy()
}
