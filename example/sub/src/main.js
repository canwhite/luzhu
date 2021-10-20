import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

let app

export const bootstrap = () => {
  app = new Vue({
    render: (h) => h(App),
  })
}

export const mount = (data ) => {
  app.$mount('#app')
  data.actions.setGlobalState({a:"1789"})
}

export const unmount = () => {
  app.$destroy()
}
