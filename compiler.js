/**
 * 作用：
 * 负责编译模板，解析指令/插值表达式
 * 负责页面的首次渲染
 * 当数据变化后重新渲染视图
 * 
 * nodeType和childNodes:
 * /<h3 id="h3">sfl</h3>
    var h3 = document.getElementById('h3')
    console.log(h3.nodeType)//1 元素节点
    console.log(h3.childNodes[0].nodeType)//3 文本节点
*/
class Compiler{
  constructor(vm){
    this.el = vm.$el
    this.vm = vm 
    this.compile(this.el)
  }
  //编译模板，处理文本节点和元素节点
  compile(el){
    let childNodes = el.childNodes 
    Array.from(childNodes).forEach(node=>{
      //处理文本节点
      if(this.isTextNode(node)){
        this.compileText(node)
      }else if(this.isElementNode(node)){
        //处理元素节点
        this.compileElement(node)
      }
      //判断node节点是否有子节点，如果有，递归调用compile
      if(node.childNodes&&node.childNodes.length){
        this.compile(node)
      }
    })
  }
  //编译元素节点，处理指令
  compileElement(node){
    //console.log(node.attributes)
    //遍历所有属性节点
    Array.from(node.attributes).forEach(attr=>{
      //判断是否是指令
      let attrName = attr.name 
      if(this.isDirective(attrName)){
        //v-text-->text 便于我们判断 
        attrName = attrName.substr(2)
        let key = attr.value
        this.update(node,key,attrName)
      }
    })
    
  }
  update(node,key,attrName){//避免指令过多时有过多判断语句
    let updateFn = this[attrName+'Updater']
    //此处的this是Compiler实例对象，如果不用call,调用textUpdater，内部this指向undefined
    updateFn && updateFn.call(this,node,this.vm[key],key)
  }
  //处理v-text指令
  textUpdater(node,value,key){
    node.textContent = value
    new Watcher(this.vm,key,newValue=>{
      node.textContent = newValue
    })
  }
  //v-model 
  modelUpdater(node,value,key){
    node.value = value 
    new Watcher(this.vm,key,newValue=>{
      node.value = newValue
    })
    //双向绑定
    node.addEventListener('input',()=>{
      this.vm[key] = node.value
    })
  }
  //编译文本节点，处理插值表达式
  compileText(node){
    // console.dir(node)
    //正则表达式匹配{{}}
    let reg = /\{\{(.+?)\}\}/  //?表示非贪婪模式
    let value = node.textContent //获取文本节点的内容
    if(reg.test(value)){
      let key = RegExp.$1.trim() //RegExp.$1表示第一个分组的内容，也就是(.+?)中的内容
      node.textContent = value.replace(reg,this.vm[key])//replace方法替换掉{{msg}}
      //创建watcher对象，当数据改变更新视图
      new Watcher(this.vm,key,(newValue)=>{
        node.textContent = newValue
      })

    }
  }
  //判断元素属性是否是指令
  isDirective(attrName){
    return attrName.startsWith('v-')//是否以v-开头
  }
  //判断节点是否是文本节点
  isTextNode(node){
    return node.nodeType === 3//3是文本节点
  }
  //判断节点是否是元素
  isElementNode(node){
    return node.nodeType === 1//1是元素节点
  }
}