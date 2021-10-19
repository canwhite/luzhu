
// 发布订阅系统
export class EventCenter {
    // 缓存数据和绑定函数
    eventList = new Map()
    /**
     * 绑定监听函数
     * @param name 事件名称
     * @param f 绑定函数
     */
    on (name:any, f:any) {
      let eventInfo = this.eventList.get(name)
      // 如果没有缓存，则初始化
      if (!eventInfo) {
        eventInfo = {
          data: {},
          callbacks: new Set(),
        }
        // 放入缓存
        this.eventList.set(name, eventInfo)
      }
  
      // 记录绑定函数
      eventInfo.callbacks.add(f)
    }
  
    // 解除绑定
    off (name:any, f:any) {
      const eventInfo = this.eventList.get(name)
      // eventInfo存在且f为函数则卸载指定函数
      if (eventInfo && typeof f === 'function') {
        eventInfo.callbacks.delete(f)
      }
    }
  
    // 发送数据
    dispatch (name:any, data:any) {
      const eventInfo = this.eventList.get(name)
      // 当数据不相等时才更新
      if (eventInfo && eventInfo.data !== data) {
        eventInfo.data = data
        // 遍历执行所有绑定函数
        for (const f of eventInfo.callbacks) {
          f(data)
        }
      }
    }
  }
  
  // 创建发布订阅对象
  /* const eventCenter = new EventCenter()
  export  eventCenter; */
