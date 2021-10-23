class Observer{
  constructor(data){
    this.walk(data)
  }
  walk(data){
    //1.判断data是否是对象
    if(!data||typeof data!=='object'){
      return 
    }
    //2.遍历data对象所有属性
    Object.keys(data).forEach(key=>{
      this.defineReactive(data,key,data[key])
    })
  }
  defineReactive(obj,key,val){
    let that = this 
    //负责收集依赖并发送通知
    let dep = new Dep()
    //如果val是对象，把val内部的属性也转换为响应式数据
    this.walk(val)
    Object.defineProperty(obj,key,{
      enumerable:true,
      configurable:true,
      get(){
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set(newValue){
        if(newValue===val){
          return 
        }
        val = newValue
        //重新设置值的时候，如果设置成对象，让对象也变成响应式数据
        //此处的this指向不再是Observer实例
        that.walk(newValue)
        //发送通知
        dep.notify()
      }
    })
  }
}