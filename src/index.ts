export { registerMicroApps, start } from './start'
//工具的目的是收集行为然后自己运行
//initGlobalState里边有一个尾调用，返回需要实现的回调，然后再我们lifestyle运行的时候以并运行
//const actions: MicroAppStateActions = initGlobalState(state);
/* export {initGlobalState} from "./globalState" */
/* export {EventCenterForBaseApp} from "./data" */
export {EventCenter} from "./data"