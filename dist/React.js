/**
 * by 司徒正美 Copyright 2018-02-08
 * IE9+
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.React = factory());
}(this, (function () {

  var hasSymbol = typeof Symbol === "function" && Symbol["for"];
  var innerHTML = "dangerouslySetInnerHTML";
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var REACT_ELEMENT_TYPE = hasSymbol ? Symbol["for"]("react.element") : 0xeac7;
  var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol["for"]("react.fragment") : 0xeacb;



  var emptyArray = [];
  var emptyObject = {};
  // 被警告
  //只会执行一次 执行过一次就不再执行
  function deprecatedWarn(methodName) {
    // 不存在就过时了
    if (!deprecatedWarn[methodName]) {
      //eslint-disable-next-line
      // 过时的
      console.warn(methodName + " is deprecated");
      deprecatedWarn[methodName] = 1;
    }
  }
  /**
   * 复制一个对象的属性到另一个对象
   *
   * @param {any} obj
   * @param {any} props
   * @returns
   */
  function extend(obj, props) {
    for (var i in props) {
      if (hasOwnProperty.call(props, i)) {
        obj[i] = props[i];
      }
    }
    return obj;
  }
  function returnFalse() {
    return false;
  }
  function returnTrue() {
    return true;
  }
  var __type = Object.prototype.toString;

  /**
   * 一个空函数
   *
   * @export
   */
  function noop() { }

  /**
   * 类继承
   * 将下一个类的
   * @export
   * @param {any} SubClass
   * @param {any} SupClass
   */

  function inherit(SubClass, SupClass) {
    function Bridge() { }
    var orig = SubClass.prototype;
    Bridge.prototype = SupClass.prototype;
    var fn = SubClass.prototype = new Bridge();

    // 避免原型链拉长导致方法查找的性能开销
    // 将orig SubClass.prototype; 上的方法放在原型上
    extend(fn, orig);
    fn.constructor = SubClass;
    return fn;
  }

  var lowerCache = {};
  function toLowerCase(s) {
    return lowerCache[s] || (lowerCache[s] = s.toLowerCase());
  }

  function clearArray(a) {
    return a.splice(0, a.length);
  }

  function isFn(obj) {
    return __type.call(obj) === "[object Function]";
  }

  var rword = /[^, ]+/g;

  function oneObject(array, val) {
    if (array + "" === array) {
      //利用字符串的特征进行优化，字符串加上一个空字符串等于自身
      array = array.match(rword) || [];
    }
    var result = {},

      //eslint-disable-next-line
      value = val !== void 666 ? val : 1;
    for (var i = 0, n = array.length; i < n; i++) {
      result[array[i]] = value;
    }
    return result;
  }

  var rcamelize = /[-_][^-_]/g;
  function camelize(target) {
    //提前判断，提高getStyle等的效率
    if (!target || target.indexOf("-") < 0 && target.indexOf("_") < 0) {
      return target;
    }
    //转换为驼峰风格
    var str = target.replace(rcamelize, function (match) {
      return match.charAt(1).toUpperCase();
    });
    return firstLetterLower(str);
  }

  function firstLetterLower(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  var options = oneObject(["beforeProps", "afterCreate", "beforeInsert", "beforeDelete", "beforeUpdate", "afterUpdate", "beforePatch", "afterPatch", "beforeUnmount", "afterMount"], noop);
  console.log('>>>>>options');
  console.dir(options.beforeProps);
  var numberMap = {
    //null undefined IE6-8这里会返回[object Object]
    "[object Boolean]": 2,
    "[object Number]": 3,
    "[object String]": 4,
    "[object Function]": 5,
    "[object Symbol]": 6,
    "[object Array]": 7
  };
  // undefined: 0, null: 1, boolean:2, number: 3, string: 4, function: 5, symbol:6, array: 7, object:8
  function typeNumber(data) {
    if (data === null) {
      return 1;
    }
    if (data === void 666) {
      return 0;
    }
    var a = numberMap[__type.call(data)];
    return a || 8;
  }
  // 类数组转数组；
  var toArray = Array.from || function (a) {
    var ret = [];
    for (var i = 0, n = a.length; i < n; i++) {
      ret[i] = a[i];
    }
    return ret;
  };

  //fix 0.14对此方法的改动，之前refs里面保存的是虚拟DOM
  function getDOMNode() {
    return this;
  }
  var pendingRefs = [];
  window.pendingRefs = pendingRefs;

  var Refs = {
    mountOrder: 1,
    currentOwner: null,
    controlledCbs: [],
    // errorHook: string,//发生错误的生命周期钩子
    // errorInfo: [],    //已经构建好的错误信息
    // doctors: null     //医生节点
    // error: null       //第一个捕捉到的错误
    fireRef: function fireRef(vnode, dom) {
      if (vnode._disposed || vnode.stateNode.__isStateless) {
        dom = null;
      }
      var ref = vnode.ref;
      if (typeof ref === "function") {
        return ref(dom);
      }
      var owner = vnode._owner;
      if (!ref) {
        return;
      }
      if (!owner) {
        throw "Element ref was specified as a string (" + ref + ") but no owner was set";
      }
      if (dom) {
        if (dom.nodeType) {
          dom.getDOMNode = getDOMNode;
        }
        owner.refs[ref] = dom;
      } else {
        delete owner.refs[ref];
      }
    }
  };
  // TODO:不知道做什么？
  var mapVtype = {
    0: 6,
    4: 1,
    2: 2,
    1: 5
  };
  function Vnode(type, vtype, props, key, ref) {
    // type 是 组件 vtype 有render 就是2
    // //debugger
    this.type = type;
    this.vtype = vtype;
    this.tag = mapVtype[vtype];
    if (vtype) {
      this.props = props;
      // Refs 是全局的类似于  vue中的
      this._owner = Refs.currentOwner;

      if (key) {
        this.key = key;
      }

      var refType = typeNumber(ref);
      if (refType === 3 || refType === 4 || refType === 5) {
        //number, string, function
        this._hasRef = true;
        this.ref = ref;
      }
    }
    /*
      this.stateNode = null
    */
    console.log('options.afterCreate???????????');
    console.dir(options.afterCreate);
    options.afterCreate(this);
    // //debugger
  }

  Vnode.prototype = {
    getDOMNode: function getDOMNode() {
      // this是每一个vnode实例的私有属性
      return this.stateNode || null;
    },


    $$typeof: REACT_ELEMENT_TYPE
  };
  // 片段
  function Fragment(props) {
    return props.children;
  }
  /**
   * 虚拟DOM工厂
   *
   * @param {string|function|Component} type
   * @param {object} props
   * @param {array} ...children
   * @returns
   */

  function createElement(type, config) {
    // debugger
    // 将多余两个的参数 放在children
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    var props = {},
      vtype = 1,
      key = null,
      ref = null,
      // 参数的长度
      argsLen = children.length;
    // * @param {string|function|Component} type
    if (type && type.call) {
      // string and  function 没有render
      // 如果有render方法  type就是我们的类 
      vtype = type.prototype && type.prototype.render ? 2 : 4;
      // 反应片段类型
    } else if (type === REACT_FRAGMENT_TYPE) {
      type = Fragment, vtype = 4;
    } else if (type + "" !== type) {
      throw "React.createElement第一个参数只能是函数或字符串";
    }
    if (config != null) {
      for (var i in config) {
        var val = config[i];
        // config 里面有key 如何操作
        // 单独拿出来
        if (i === "key") {
          if (val !== void 0) {
            key = val + "";
          }
          // 如果有ref如果处理
          // 单独ref 单独拿出来
        } else if (i === "ref") {
          if (val !== void 0) {
            ref = val;
          }
        } else {
          props[i] = val;
        }
      }
    }
    // 如果是1 如何处理
    if (argsLen === 1) {
      props.children = children[0];
    } else if (argsLen > 1) {
      props.children = children;
    }
    // type 怎么还有一个默认属性
    var defaultProps = type.defaultProps;
    if (defaultProps) {
      for (var propName in defaultProps) {
        // 因为undefined 有可能被赋值 所以使用 void 666 都可以
        // 如果没有传值 就使用默认值
        if (props[propName] === void 666) {
          props[propName] = defaultProps[propName];
        }
      }
    }
    // 以上是为了处理参数 扁平化
    // vtype存在的意义还不知道是什么
    //debugger
    return new Vnode(type, vtype, props, key, ref);
  }
  // 创建虚拟文本节点
  function createVText(type, text) {
    var vnode = new Vnode(type, 0);
    vnode.text = text;
    return vnode;
  }

  // 用于辅助XML元素的生成（svg, math),
  // 它们需要根据父节点的tagName与namespaceURI,知道自己是存在什么文档中
  function createVnode(node) {
    //debugger
    var type = node.nodeName,
      // 元素类型 div span等等
      vnode;
    // 如果是元素的话应该怎么弄
    if (node.nodeType === 1) {
      // 元素
      vnode = new Vnode(type, 1);
      // http://www.w3.org/1999/xhtml 命名空间

      var ns = node.namespaceURI;
      // 不存在的是 或者 存在，同时还有html 大于22
      if (!ns || ns.indexOf("html") >= 22) {
        vnode.type = type.toLowerCase(); //HTML的虚拟DOM的type需要小写化
      } else {
        //非HTML需要加上命名空间
        vnode.namespaceURI = ns;
      }
      //通过什么方式获取 class and id 
      vnode.props = getProps(node);
    } else {
      // 创建文本虚拟
      vnode = createVText(type, node.nodeValue);
    }
    // 挂在真实 元素节点
    vnode.stateNode = node;
    return vnode;
  }
  // 获取元素的属性class id
  function getProps(node) {
    var attrs = node.attributes,
      props = {};
    for (var i = 0, attr; attr = attrs[i++];) {
      if (attr.specified) {
        var name = attr.name;
        if (name === "class") {
          name = "className";
        }
        props[name] = attr.value;
      }
    }
    return props;
  }

  var lastText;
  // 扁平化指数
  var flattenIndex;
  var flattenObject;
  var flattenPrev;
  var flattenArray;
  function flattenCb(child, index, vnode) {
    // undefined: 0, null: 1, boolean:2, number: 3, string: 4, function: 5, symbol:6, array: 7, object:8
    var childType = typeNumber(child);
    if (childType < 3) {
      //在React16中undefined, null, boolean不会产生节点
      lastText = null;
      return;
    } else if (childType < 5) {
      // number: 3, string: 4, 
      if (lastText) {
        //合并相邻的文本节点
        lastText.text += child;
        return;
      }
      lastText = child = createVText("#text", child + "");
    } else {
      // symbol:6, array: 7, object:8
      lastText = null;
    }
    console.log('yangchongduo >>>>> flattenCb');
    var key = child.key;
    if (key && !flattenObject[".$" + key]) {
      flattenObject[".$" + key] = child;
    } else {
      if (index === ".") {
        index = "." + flattenIndex;
      }
      flattenObject[index] = child;
    }
    child.index = flattenIndex;
    console.log('----------------------------child');
    console.log(child);
    child.return = vnode;
    console.log('==========================');
    console.log(child);

    if (flattenPrev) {
      flattenPrev.sibling = child;
    }
    flattenPrev = child;
    flattenIndex++;
    flattenArray.push(child);
  }
  // 纤维化的孩子
  /**
   * 1、获取child的
   * 2、updater.children = flattenObject
   * 3、c.return = AnuWrapper(Vnode);
   * 4、vnode.child=
   */
  function fiberizeChildren(c, updater) {
    debugger
    flattenObject = {};
    flattenPrev = null;
    flattenArray = [];
    var vnode = updater._reactInternalFiber;
    if (c !== void 666) {
      lastText = null;
      flattenIndex = 0;
      debugger
      // C是子集 vnode 是父级的虚拟dom 放在
      operateChildren(c, "", flattenCb, vnode);
      // 偏平之后的
      var child = flattenArray[0];
      if (child) {
        // 父级的孩子
        vnode.child = child;
      }
      if (flattenPrev) {
        delete flattenPrev.sibling;
      }
    }
    return updater.children = flattenObject;
  }

  // 操作的孩子
  // children parent 都是 虚拟dom,react 本身就是大量的操作虚拟dom
  function operateChildren(children, prefix, callback, parent) {
    debugger
    var iteratorFn;
    if (children) {
      if (children.forEach) {
        children.forEach(function (el, i) {
          // 递归操作
          operateChildren(el, prefix ? prefix + ":" + i : "." + i, callback, parent);
        });
        return;
      } else if (iteratorFn = getIteractor(children)) {
        var iterator = iteratorFn.call(children),
          ii = 0,
          step;
        while (!(step = iterator.next()).done) {
          operateChildren(step.value, prefix ? prefix + ":" + ii : "." + ii, callback, parent);
          ii++;
        }
        return;
      }
    }
    if (Object(children) === children && !children.call && !children.type) {
      throw "children中存在非法的对象";
    }
    callback(children, prefix || ".", parent);
  }

  // 真正的象征
  var REAL_SYMBOL = hasSymbol && Symbol.iterator;
  // 假象征
  var FAKE_SYMBOL = "@@iterator";

  function getIteractor(a) {
    // undefined: 0, null: 1, boolean:2, number: 3, string: 4, function: 5, symbol:6, array: 7, object:8 
    if (typeNumber(a) > 7) {
      // Symbol(Symbol.iterator)  || "@@iterator"
      var iteratorFn = REAL_SYMBOL && a[REAL_SYMBOL] || a[FAKE_SYMBOL];
      if (iteratorFn && iteratorFn.call) {
        return iteratorFn;
      }
    }
  }

  function cloneElement(vnode, props) {
    //   var Refs = {
    //   mountOrder: 1,
    //   currentOwner: null,
    //   controlledCbs: [],
    //   // errorHook: string,//发生错误的生命周期钩子
    //   // errorInfo: [],    //已经构建好的错误信息
    //   // doctors: null     //医生节点
    //   // error: null       //第一个捕捉到的错误
    //   fireRef: function fireRef(vnode, dom) {
    //     if (vnode._disposed || vnode.stateNode.__isStateless) {
    //       dom = null;
    //     }
    //     var ref = vnode.ref;
    //     if (typeof ref === "function") {
    //       return ref(dom);
    //     }
    //     var owner = vnode._owner;
    //     if (!ref) {
    //       return;
    //     }
    //     if (!owner) {
    //       throw "Element ref was specified as a string (" + ref + ") but no owner was set";
    //     }
    //     if (dom) {
    //       if (dom.nodeType) {
    //         dom.getDOMNode = getDOMNode;
    //       }
    //       owner.refs[ref] = dom;
    //     } else {
    //       delete owner.refs[ref];
    //     }
    //   }
    // };
    //debugger
    if (!vnode.vtype) {
      var clone = extend({}, vnode);
      delete clone._disposed;
      return clone;
    }
    var owner = vnode._owner,
      lastOwn = Refs.currentOwner,
      old = vnode.props,
      configs = {};
    if (props) {
      extend(extend(configs, old), props);
      configs.key = props.key !== void 666 ? props.key : vnode.key;
      if (props.ref !== void 666) {
        configs.ref = props.ref;
        owner = lastOwn;
      } else if (vnode._hasRef) {
        configs.ref = vnode.ref;
      }
    } else {
      configs = old;
    }
    for (var i in configs) {
      if (i !== "children" && configs[i] && configs[i].$$typeof) {
        configs[i] = cloneElement(configs[i]);
      }
    }
    Refs.currentOwner = owner;

    var args = [].slice.call(arguments, 0),
      argsLength = args.length;
    args[0] = vnode.type;
    args[1] = configs;
    if (argsLength === 2 && configs.children) {
      delete configs.children._disposed;
      args.push(configs.children);
    }
    var ret = createElement.apply(null, args);
    Refs.currentOwner = lastOwn;
    return ret;
  }

  var mapStack = [];
  // 地图包后缀；
  function mapWrapperCb(old, prefix) {
    if (old === void 0 || old === false || old === true) {
      old = null;
    }
    var cur = mapStack[0];
    var el = cur.callback.call(cur.context, old, cur.index);
    var index = cur.index;
    cur.index++;
    if (cur.isEach || el == null) {
      return;
    }
    if (el.vtype) {
      //如果返回的el等于old,还需要使用原来的key, _prefix
      var key = computeKey(old, el, prefix, index);
      cur.arr.push(cloneElement(el, { key: key }));
    } else if (el.type) {
      cur.arr.push(extend({}, el));
    } else {
      cur.arr.push(el);
    }
  }
  function K(el) {
    return el;
  }
  // 给Children 增加方法
  var Children = {
    only: function only(children) {
      //only方法接受的参数只能是一个对象，不能是多个对象（数组）。
      if (children && children.vtype) {
        return children;
      }
      // 希望只有一个孩子节点
      throw new Error("expect only one child");
    },
    count: function count(children) {
      if (children == null) {
        return 0;
      }
      var index = 0;
      operateChildren(children, "", function () {
        index++;
      });
      return index;
    },
    map: function map(children, callback, context, isEach) {
      if (children == null) {
        return children;
      }
      // 地图叠加 从头部增加第一个
      mapStack.unshift({
        index: 0,
        callback: callback,
        context: context,
        isEach: isEach,
        arr: []
      });
      console.log('Children.map');
      operateChildren(children, "", mapWrapperCb);
      var top = mapStack.shift();
      return top.arr;
    },
    forEach: function forEach(children, callback, context) {
      Children.map(children, callback, context, true);
    },

    toArray: function toArray$$1(children) {
      if (children == null) {
        return [];
      }
      return Children.map(children, K);
    }
  };

  var rthimNumer = /\d+\$/;
  // 计算的 key
  function computeKey(old, el, prefix, index) {
    //  function escapeKey(key) {
    // return String(key).replace(/[=:]/g, escaperFn);
    // }
    // var escaperLookup = {
    //   "=": "=0",
    //   ":": "=2"
    // };

    // function escaperFn(match) {
    //   return escaperLookup[match];
    // }
    var curKey = el && el.key != null ? escapeKey(el.key) : null;
    var oldKey = old && old.key != null ? escapeKey(old.key) : null;
    var key = void 0;
    if (oldKey && curKey) {
      // 如果同时 设置key
      key = prefix + "$" + oldKey;
      // 如果不相等 再次设置key
      if (oldKey !== curKey) {
        key = curKey + "/" + key;
      }
    } else {
      // 如果只有一个话
      key = curKey || oldKey;
      if (key) {
        key = prefix + "$" + key;
      } else {
        key = prefix === "." ? prefix + index : prefix;
      }
    }
    console.log('key.replace(rthimNumer, "$")');
    return key.replace(rthimNumer, "$");
  }
  // 逃生的key
  function escapeKey(key) {
    return String(key).replace(/[=:]/g, escaperFn);
  }

  var escaperLookup = {
    "=": "=0",
    ":": "=2"
  };
  // 逃生的fn
  function escaperFn(match) {
    //   =0 =2
    return escaperLookup[match];
  }

  //用于后端的元素节点
  function DOMElement(type) {
    //debugger
    console.log('DOMElement', type);
    this.nodeName = type;
    this.style = {};
    this.children = [];
  }
  // 命名空间 也就是有不同的;

  var NAMESPACE = {
    svg: "http://www.w3.org/2000/svg",
    xmlns: "http://www.w3.org/2000/xmlns/",
    xlink: "http://www.w3.org/1999/xlink",
    math: "http://www.w3.org/1998/Math/MathML"
  };

  var fn = DOMElement.prototype = {
    contains: Boolean
  };
  // 将这些所有的方法增加在fn 同时也增加在DOMElement.prototype上 因为是引用地址
  String("replaceChild,appendChild,removeAttributeNS,setAttributeNS,removeAttribute,setAttribute" + ",getAttribute,insertBefore,removeChild,addEventListener,removeEventListener,attachEvent" + ",detachEvent").replace(/\w+/g, function (name) {
    fn[name] = function () {
      console.log("fire " + name); // eslint-disable-line
    };
  });

  //用于后端的document
  // 假的文档
  //debugger 
  var fakeDoc = new DOMElement();
  // 下面👇 三个方法是独自的 不是每个new DOMElement() 实例都有这三个方法
  fakeDoc.createElement = fakeDoc.createElementNS = fakeDoc.createDocumentFragment = function (type) {
    ////debugger
    return new DOMElement(type);
  };
  // 文本节点和 创建注释 是Boolean 再次增加一些属性和方法
  fakeDoc.createTextNode = fakeDoc.createComment = Boolean;
  fakeDoc.documentElement = new DOMElement("html");
  // 增加实例的
  // this.nodeName = type;
  // this.style = {};
  // this.children = [];
  fakeDoc.body = new DOMElement("body");
  // 单独赋值 nodeName
  fakeDoc.nodeName = "#document";
  fakeDoc.textContent = "";
  console.log('fakeDoc')
  console.log(fakeDoc)
  // 一个DOMElement 的实例 下面有 私有属性上有body
  try {
    var w = window;
    var b = !!w.alert;
  } catch (e) {
    b = false;
    w = {
      document: fakeDoc
    };
  }


  var win = w;

  var document = w.document || fakeDoc;
  // 双地图 的意义是什么
  var duplexMap = {
    color: 1,
    date: 1,
    datetime: 1,
    "datetime-local": 1,
    email: 1,
    month: 1,
    number: 1,
    password: 1,
    range: 1,
    search: 1,
    tel: 1,
    text: 1,
    time: 1,
    url: 1,
    week: 1,
    textarea: 1,
    checkbox: 2,
    radio: 2,
    "select-one": 3,
    "select-multiple": 3
  };
  // 判断是否是标准的浏览器
  var isStandard = "textContent" in document;
  // 创建文案碎片
  var fragment = document.createDocumentFragment();
  // 清空元素 不知道做什么用的
  function emptyElement(node) {
    var child;
    while (child = node.firstChild) {
      // 空元素 
      emptyElement(child);
      if (child === Refs.focusNode) {
        Refs.focusNode = false;
      }
      node.removeChild(child);
    }
  }
  // 可回收物
  var recyclables = {
    "#text": []
  };

  function removeElement(node) {
    //debugger
    if (!node) {
      return;
    }
    if (node.nodeType === 1) {
      if (isStandard) {
        // 获取元素内容
        node.textContent = "";
      } else {
        emptyElement(node);
      }
      node.__events = null;
    } else if (node.nodeType === 3) {
      //只回收文本节点
      if (recyclables["#text"].length < 100) {
        recyclables["#text"].push(node);
      }
    }
    if (node === Refs.focusNode) {
      Refs.focusNode = false;
    }
    fragment.appendChild(node);
    fragment.removeChild(node);
  }

  var versions = {
    88: 7, // IE7-8 objectobject
    80: 6, // IE6 objectundefined
    "00": NaN, // other modern browsers
    "08": NaN
  };
  /* istanbul ignore next  */
  // 判断是否是标准浏览器
  var msie = document.documentMode || versions[typeNumber(document.all) + "" + typeNumber(win.XMLHttpRequest)];
  // true
  var modern = /NaN|undefined/.test(msie) || msie > 8;

  // 真实的创建 dom元素
  //  p是parent 
  function createElement$1(vnode, p) {
    //debugger
    var type = vnode.type,
      ns;
    switch (type) {
      case "#text":
        //只重复利用文本节点 重复利用文本节点
        // 如果之前文本节点有使用的就直接拿出来使用。如果没有就创建
        var node = recyclables[type].pop();
        if (node) {
          node.nodeValue = vnode.text;
          return node;
        }
        return document.createTextNode(vnode.text);
      // 注释
      case "#comment":
        return document.createComment(vnode.text);
      // svg
      case "svg":
        // var NAMESPACE = {
        //   svg: "http://www.w3.org/2000/svg",
        //   xmlns: "http://www.w3.org/2000/xmlns/",
        //   xlink: "http://www.w3.org/1999/xlink",
        //   math: "http://www.w3.org/1998/Math/MathML"
        // };
        ns = NAMESPACE.svg;
        break;
      case "math":
        ns = NAMESPACE.math;
        break;
      case "div":
      case "span":
      case "p":
      case "tr":
      case "td":
      case "li":
        ns = "";
        break;
      default:
        // 命名空间
        ns = vnode.namespaceURI;
        // 如果不存在
        if (!ns) {
          do {
            if (p.vtype === 1) {
              ns = p.namespaceURI;
              if (p.type === "foreignObject") {
                ns = "";
              }
              break;
            }
          } while (p = p.return);
        }
        break;
    }
    try {
      if (ns) {
        vnode.namespaceURI = ns;
        return document.createElementNS(ns, type);
      }
      //eslint-disable-next-line
    } catch (e) { }
    //debugger
    var elem = document.createElement(type);
    // 获取元素的 
    var inputType = vnode.props && vnode.props.type; //IE6-8下立即设置type属性
    if (inputType) {
      elem.type = inputType;
    }
    return elem;
  }
  // b元素是否在a元素中
  function contains(a, b) {
    if (b) {
      // 把父亲节点给b
      while (b = b.parentNode) {
        if (b === a) {
          return true;
        }
      }
    }
    return false;
  }


  function insertElement(vnode, insertPoint) {
    //debugger
    if (vnode._disposed) {
      return;
    }
    //找到可用的父节点
    var p = vnode.return,
      parentNode;
    while (p) {
      if (p.vtype === 1) {
        parentNode = p.stateNode;
        break;
      }
      p = p.superReturn || p.return;
    }

    var dom = vnode.stateNode,
      after = insertPoint ? insertPoint.nextSibling : parentNode.firstChild;

    if (after === dom) {
      return;
    }
    if (after === null && dom === parentNode.lastChild) {
      return;
    }
    if (after && !contains(parentNode, after)) {
      return;
    }
    var isElement = vnode.vtype;
    var prevFocus = isElement && document.activeElement;
    parentNode.insertBefore(dom, after);
    if (isElement && prevFocus !== document.activeElement && contains(document.body, prevFocus)) {
      try {
        Refs.focusNode = prevFocus;
        prevFocus.__inner__ = true;
        prevFocus.focus();
      } catch (e) {
        prevFocus.__inner__ = false;
      }
    }
  }

  var topVnodes = [];
  var topNodes = [];
  // 处理Vnode
  // updateQueue跟新队列
  //debugger
  function disposeVnode(vnode, updateQueue, silent) {
    console.log('disposeVnode');
    //debugger
    if (vnode && !vnode._disposed) {
      options.beforeDelete(vnode);
      if (vnode.isTop) {
        var i = topVnodes.indexOf(vnode);
        if (i !== -1) {
          topVnodes.splice(i, 1);
          topNodes.splice(i, 1);
        }
      }

      if (vnode.superReturn) {
        var dom = vnode.superReturn.stateNode;
        delete dom.__events;
      }
      if (vnode.vtype > 1) {
        disposeComponent(vnode, updateQueue, silent);
      } else {
        if (vnode.vtype === 1) {
          disposeElement(vnode, updateQueue, silent);
        }
        updateQueue.push({
          node: vnode.stateNode,
          vnode: vnode,
          transition: remove
        });
      }
    }
  }

  function remove() {
    this.vnode._disposed = true;
    delete this.vnode.stateNode;
    removeElement(this.node);
  }
  // 处理元素
  function disposeElement(vnode, updateQueue, silent) {
    console.log('disposeElement');
    var updater = vnode.updater;

    if (!silent) {
      updater.addState("dispose");
      updateQueue.push(updater);
    } else {
      if (updater.isMounted()) {
        updater._states = ["dispose"];
        updateQueue.push(updater);
      }
    }
    // 处理孩子
    disposeChildren(updater.children, updateQueue, silent);
  }
  // 处理组件
  function disposeComponent(vnode, updateQueue, silent) {
    //debugger
    var instance = vnode.stateNode;
    if (!instance) {
      //没有实例化
      return;
    }
    var updater = instance.updater;
    if (instance.isPortal) {
      updater.updateQueue = updateQueue;
    }
    if (!silent) {
      updater.addState("dispose");
      updateQueue.push(updater);
    } else if (updater.isMounted()) {
      if (silent === 1) {
        updater._states.length = 0;
      }
      updater.addState("dispose");
      updateQueue.push(updater);
    }

    updater.insertQueue = updater.insertPoint = NaN; //用null/undefined会碰到 xxx[0]抛错的问题
    disposeChildren(updater.children, updateQueue, silent);
  }

  function disposeChildren(children, updateQueue, silent) {
    for (var i in children) {
      disposeVnode(children[i], updateQueue, silent);
    }
  }
  // 肮脏的组件
  var dirtyComponents = [];
  // 安装机
  function mountSorter(u1, u2) {
    //按文档顺序执行
    u1._dirty = false;
    return u1._mountOrder - u2._mountOrder;
  }
  // 冲洗器
  function flushUpdaters() {
    debugger
    if (dirtyComponents.length) {
      var currentQueue = clearArray(dirtyComponents).sort(mountSorter);
      currentQueue.forEach(function (el) {
        delete el._dirty;
      });
      debugger
      // 排排队
      drainQueue(currentQueue);
      debugger
    }
  }
  // 将更新
  function enqueueUpdater(updater) {
    debugger
    if (!updater._dirty) {
      updater.addState("hydrate");
      updater._dirty = true;
      dirtyComponents.push(updater);
    }
  }
  // noop是一个空格函数
  var placehoder = {
    transition: noop
  };
  //排排队
  function drainQueue(queue) {
    //debugger
    options.beforePatch();
    var updater = void 0;
    // 大量使用了while
    while (updater = queue.shift()) {
      // 水合物
      console.log(updater.name, "执行" + updater._states + " 状态");
      if (updater._disposed) {
        continue;
      }
      var hook = Refs.errorHook;
      if (hook) {
        //如果存在医生节点
        var doctors = Refs.doctors,
          doctor = doctors[0],
          gotoCreateRejectQueue,
          addDoctor,
          silent; //2时添加disposed，1直接变成disposed
        switch (hook) {
          case "componentDidMount":
          case "componentDidUpdate":
          case "componentWillUnmount":
            //render之后出错，拖动最后才构建错误列队
            gotoCreateRejectQueue = queue.length === 0;
            silent = 2;
            break;
          case "render": //render出错，说明还没有执行render
          case "constructor":
          case "componentWillMount":
          case "componentWillUpdate":
          case "componentWillReceiveProps":
            //render之前出错，会立即构建错误列队，然后加上医生节点之上的列队
            gotoCreateRejectQueue = true;
            ////debugger
            queue = queue.filter(function (el) {
              return el._mountOrder < doctor._mountOrder;
            });
            silent = 1;
            addDoctor = true;
            break;
        }
        if (gotoCreateRejectQueue) {
          delete Refs.error;
          delete Refs.doctors;
          delete Refs.errorHook;
          var rejectedQueue = [];
          //收集要销毁的组件（要求必须resolved）

          // 错误列队的钩子如果发生错误，如果还没有到达医生节点，它的出错会被忽略掉，
          // 详见CompositeUpdater#catch()与ErrorBoundary#captureError()中的Refs.ignoreError开关
          doctors.forEach(function (doctor, j) {
            for (var i in doctor.children) {
              var child = doctor.children[i];
              disposeVnode(child, rejectedQueue, silent);
            }
            doctor.children = {};
          });
          // rejectedQueue = Array.from(new Set(rejectedQueue));
          doctors.forEach(function (doctor) {
            if (addDoctor) {
              rejectedQueue.push(doctor);
              updater = placehoder;
            }
            doctor.addState("catch");
            rejectedQueue.push(doctor);
          });

          queue = rejectedQueue.concat(queue);
        }
      }
      debugger
      // 过渡
      updater.transition(queue);
    }

    options.afterPatch();
    var error = Refs.error;
    if (error) {
      delete Refs.error;
      throw error;
    }
  }

  var globalEvents = {};
  var eventPropHooks = {}; //用于在事件回调里对事件对象进行
  var eventHooks = {}; //用于在元素上绑定特定的事件
  //根据onXXX得到其全小写的事件名, onClick --> click, onClickCapture --> click,
  // onMouseMove --> mousemove

  var eventLowerCache = {
    onClick: "click",
    onChange: "change",
    onWheel: "wheel"
  };
  /**
   * 判定否为与事件相关
   *
   * @param {any} name
   * @returns
   */
  function isEventName(name) {
    return (/^on[A-Z]/.test(name));
  }

  var isTouch = "ontouchstart" in document;
  // 调度事件
  function dispatchEvent(e, type, end) {
    debugger
    //__type__ 在injectTapEventPlugin里用到
    // 综合事件
    e = new SyntheticEvent(e);
    if (type) {
      e.type = type;
    }
    var bubble = e.type;
    //var dom = e.target;
    // click wheel  事件属性
    var hook = eventPropHooks[bubble];
    debugger
    if (hook && false === hook(e)) {
      return;
    }
    var paths = collectPaths(e.target, end || document);
    var captured = bubble + "capture";
    document.__async = true;
    // 触发事件流
    triggerEventFlow(paths, captured, e);

    if (!e._stopPropagation) {
      debugger
      triggerEventFlow(paths.reverse(), bubble, e);
      // 触发事件流 事件的函数去执行， class Test 这个类的方法 this.setState 
      // this._pendingStates 
      // enqueueSetState 
      // dirtyComponents 有update
    }
    document.__async = false;
    debugger
    flushUpdaters();
    debugger
    Refs.controlledCbs.forEach(function (el) {
      if (el.stateNode) {
        el.controlledCb({
          target: el.stateNode
        });
      }
    });
    Refs.controlledCbs.length = 0;
  }

  function collectPaths(from, end) {
    debugger
    var paths = [];
    var node = from;
    while (node && !node.__events) {
      node = node.parentNode;
      if (end === from) {
        return paths;
      }
    }
    if (!node || node.nodeType > 1) {
      //如果跑到document上
      return paths;
    }
    var mid = node.__events;
    var vnode = mid.child || mid.vnode;
    do {
      if (vnode.vtype === 1) {
        var dom = vnode.stateNode;
        if (dom === end) {
          break;
        }
        if (!dom) {
          break;
        }
        if (dom.__events) {
          paths.push({ dom: dom, events: dom.__events });
        }
      }
    } while (vnode = vnode.return); // eslint-disable-line
    return paths;
  }

  function triggerEventFlow(paths, prop, e) {
    debugger
    for (var i = paths.length; i--;) {
      var path = paths[i];
      var fn = path.events[prop];
      if (isFn(fn)) {
        e.currentTarget = path.dom;
        fn.call(void 666, e);
        if (e._stopPropagation) {
          break;
        }
      }
    }
  }

  function addGlobalEvent(name, capture) {
    if (!globalEvents[name]) {
      globalEvents[name] = true;
      addEvent(document, name, dispatchEvent, capture);
    }
  }

  function addEvent(el, type, fn, bool) {
    if (el.addEventListener) {
      el.addEventListener(type, fn, bool || false);
    } else if (el.attachEvent) {
      el.attachEvent("on" + type, fn);
    }
  }

  var rcapture = /Capture$/;
  // 增加其他事件
  function getBrowserName(onStr) {
    var lower = eventLowerCache[onStr];
    if (lower) {
      return lower;
    }
    var camel = onStr.slice(2).replace(rcapture, "");
    lower = camel.toLowerCase();
    eventLowerCache[onStr] = lower;
    return lower;
  }

  /**
  DOM通过event对象的relatedTarget属性提供了相关元素的信息。这个属性只对于mouseover和mouseout事件才包含值；
  对于其他事件，这个属性的值是null。IE不支持realtedTarget属性，但提供了保存着同样信息的不同属性。
  在mouseover事件触发时，IE的fromElement属性中保存了相关元素；
  在mouseout事件出发时，IE的toElement属性中保存着相关元素。
  但fromElement与toElement可能同时都有值
   */
  function getRelatedTarget(e) {
    if (!e.timeStamp) {
      e.relatedTarget = e.type === "mouseover" ? e.fromElement : e.toElement;
    }
    return e.relatedTarget;
  }

  String("mouseenter,mouseleave").replace(/\w+/g, function (name) {
    console.log('1mouseenter,mouseleave');
    // console.log('name???????????????????????????');
    // console.log(name);
    // console.log(eventHooks);
    eventHooks[name] = function (dom, type) {
      debugger
      var mark = "__" + type;
      if (!dom[mark]) {
        dom[mark] = true;
        var mask = type === "mouseenter" ? "mouseover" : "mouseout";
        addEvent(dom, mask, function (e) {
          var t = getRelatedTarget(e);
          if (!t || t !== dom && !contains(dom, t)) {
            var common = getLowestCommonAncestor(dom, t);
            //由于不冒泡，因此paths长度为1
            dispatchEvent(e, type, common);
          }
        });
      }
    };
  });
  console.log('eventHooks');
  console.log(eventHooks);
  // 获得最低共同祖先
  function getLowestCommonAncestor(instA, instB) {
    // 找各自的路径
    var depthA = 0;
    for (var tempA = instA; tempA; tempA = tempA.parentNode) {
      depthA++;
    }
    var depthB = 0;
    for (var tempB = instB; tempB; tempB = tempB.parentNode) {
      depthB++;
    }

    // If A is deeper, crawl up.
    while (depthA - depthB > 0) {
      instA = instA.parentNode;
      depthA--;
    }

    // If B is deeper, crawl up.
    while (depthB - depthA > 0) {
      instB = instB.parentNode;
      depthB--;
    }

    // Walk in lockstep until we find a match.
    // 这个时候不管是 depthA or depathB 现在两者都一样
    // 通过while 不断查找parentnode 这样就可以
    var depth = depthA;
    while (depth--) {
      if (instA === instB) {
        return instA;
      }
      instA = instA.parentNode;
      instB = instB.parentNode;
    }
    return null;
  }
  // 特殊处理事件
  var specialHandles = {};
  function createHandle(name, fn) {
    return specialHandles[name] = function (e) {
      debugger
      if (fn && fn(e) === false) {
        return;
      }
      debugger
      // 派发这个事件
      dispatchEvent(e, name);
    };
  }
  // 串讲
  createHandle("change");
  createHandle("doubleclick");
  createHandle("scroll");
  createHandle("wheel");
  console.log('specialHandles');
  console.log(specialHandles);
  globalEvents.wheel = true;
  globalEvents.scroll = true;
  globalEvents.doubleclick = true;
  console.log('globalEvents');
  console.log(globalEvents);
  if (isTouch) {
    // 单击“捕获” 捕获过程 冒泡 捕获
    eventHooks.click = eventHooks.clickcapture = function (dom) {
      dom.onclick = dom.onclick || noop;
    };
  }

  // var globalEvents = {};
  // var eventPropHooks = {}; //用于在事件回调里对事件对象进行
  // var eventHooks = {}; //用于在元素上绑定特定的事件
  // //根据onXXX得到其全小写的事件名, onClick --> click, onClickCapture --> click,
  // onMouseMove --> mousemove
  eventPropHooks.click = function (e) {
    return !e.target.disabled;
  };
  // null
  var fixWheelType = document.onwheel !== void 666 ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
  eventHooks.wheel = function (dom) {
    addEvent(dom, fixWheelType, specialHandles.wheel);
  };

  eventPropHooks.wheel = function (event) {
    //debugger
    event.deltaX = "deltaX" in event ? event.deltaX : // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
      "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
    event.deltaY = "deltaY" in event ? event.deltaY : // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
      "wheelDeltaY" in event ? -event.wheelDeltaY : // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
        "wheelDelta" in event ? -event.wheelDelta : 0;
  };

  //react将text,textarea,password元素中的onChange事件当成onInput事件
  eventHooks.changecapture = eventHooks.change = function (dom) {
    if (/text|password|search/.test(dom.type)) {
      addEvent(document, "input", specialHandles.change);
    }
  };
  console.log('eventPropHooks');
  console.log(eventPropHooks)
  console.log('eventHooks');
  console.log(eventHooks);
  //debugger
  var focusMap = {
    "focus": "focus",
    "blur": "blur"
  };
  // 事件源 焦点消失 或者 聚集
  // 一律使用 dom2级事件 进行注册
  function blurFocus(e) {
    var dom = e.target || e.srcElement;
    var type = focusMap[e.type];
    var isFocus = type === "focus";
    // dom.__inner__ 标准下为false
    if (isFocus && dom.__inner__) {
      dom.__inner__ = false;
      return;
    }

    if (!isFocus && Refs.focusNode === dom) {
      Refs.focusNode = null;
    }
    do {
      if (dom.nodeType === 1) {
        // 标准下为 undefined
        if (dom.__events && dom.__events[type]) {
          dispatchEvent(e, type);
          break;
        }
      } else {
        break;
      }
    } while (dom = dom.parentNode);
  }

  "blur,focus".replace(/\w+/g, function (type) {
    // globalEvents.blur=true;
    // globalEvents.focus=true;
    console.log('--------------->');
    console.log(type);
    console.log(globalEvents);
    globalEvents[type] = true;
    if (modern) {
      var mark = "__" + type;
      // document.__blur
      if (!document[mark]) {
        // document.__blur = true
        document[mark] = true;
        // function addEvent(el, type, fn, bool) {
        //   if (el.addEventListener) {
        //     el.addEventListener(type, fn, bool || false);
        //   } else if (el.attachEvent) {
        //     el.attachEvent("on" + type, fn);
        //   }
        // }
        // 增加 在document上增加 事件这样就可以
        addEvent(document, type, blurFocus, true);
      }
    } else {
      // 事件钩子
      eventHooks[type] = function (dom, name) {
        addEvent(dom, focusMap[name], blurFocus);
      };
    }
  });

  eventHooks.scroll = function (dom, name) {
    addEvent(dom, name, specialHandles[name]);
  };

  eventHooks.doubleclick = function (dom, name) {
    addEvent(document, "dblclick", specialHandles[name]);
  };
  // eventHooks 各种事件钩子
  // 综合事件 event 也是dom2 事件源
  function SyntheticEvent(event) {
    debugger
    // 标准下是没有这个属性的
    if (event.nativeEvent) {
      return event;
    }
    //  eventProto 事件原型上如果没有，但是事件源上有，就作为这个总和事件的私有属性
    for (var i in event) {
      if (!eventProto[i]) {
        this[i] = event[i];
      }
    }
    // ie 下是没有this.target
    if (!this.target) {
      this.target = event.srcElement;
    }
    debugger
    console.log('this.fixEvent()');
    this.fixEvent();
    // 时间戳
    this.timeStamp = new Date() - 0;
    // 没有原生事件源 就
    this.nativeEvent = event;
  }
  // 总和事件原型
  var eventProto = SyntheticEvent.prototype = {
    fixEvent: noop, //留给以后扩展用
    fixHooks: noop,
    persist: noop,
    // 组织默认行为
    preventDefault: function preventDefault() {
      var e = this.nativeEvent || {};
      e.returnValue = this.returnValue = false;
      if (e.preventDefault) {
        e.preventDefault();
      }
    },
    // 组织 冒泡传播
    stopPropagation: function stopPropagation() {
      var e = this.nativeEvent || {};
      e.cancelBubble = this._stopPropagation = true;
      if (e.stopPropagation) {
        e.stopPropagation();
      }
    },
    stopImmediatePropagation: function stopImmediatePropagation() {
      this.stopPropagation();
      this.stopImmediate = true;
    },
    toString: function toString() {
      return "[object Event]";
    }
  };
  /* istanbul ignore next  */

  // function extend(obj, props) {
  //   for (var i in props) {
  //     if (hasOwnProperty.call(props, i)) {
  //       obj[i] = props[i];
  //     }
  //   }
  //   return obj;
  // }
  // eventSystem 事件系统
  var eventSystem = extend({
    eventPropHooks: eventPropHooks,
    eventHooks: eventHooks,
    eventLowerCache: eventLowerCache,
    isEventName: isEventName,
    // var isTouch = "ontouchstart" in document;
    isTouch: isTouch,
    dispatchEvent: dispatchEvent,
    addGlobalEvent: addGlobalEvent,
    // addEvent addEventListener attachEvent
    addEvent: addEvent,
    getBrowserName: getBrowserName,
    createHandle: createHandle,
    focusMap: focusMap,
    // 总和事件
    SyntheticEvent: SyntheticEvent
  });
  //debugger
  console.log('eventSystem');
  console.log(eventSystem);
  // 返回函数本身
  var check = function check() {
    return check;
  };
  check.isRequired = check;
  var PropTypes = {
    array: check,
    bool: check,
    func: check,
    number: check,
    object: check,
    string: check,
    any: check,
    arrayOf: check,
    element: check,
    instanceOf: check,
    node: check,
    objectOf: check,
    oneOf: check,
    oneOfType: check,
    shape: check
  };
  console.log('PropTypes')
  console.log(PropTypes);
  console.dir(check);
  //debugger
  /**
   *组件的基类
   *
   * React.component
   * @param {any} props
   * @param {any} context
   */
  // var Refs = {
  //    mountOrder: 1,
  //    currentOwner: null,
  //    controlledCbs: [],
  //    // errorHook: string,//发生错误的生命周期钩子
  //    // errorInfo: [],    //已经构建好的错误信息
  //    // doctors: null     //医生节点
  //    // error: null       //第一个捕捉到的错误
  //    fireRef: function fireRef(vnode, dom) {
  //      if (vnode._disposed || vnode.stateNode.__isStateless) {
  //        dom = null;
  //      }
  //      var ref = vnode.ref;
  //      if (typeof ref === "function") {
  //        return ref(dom);
  //      }
  //      var owner = vnode._owner;
  //      if (!ref) {
  //        return;
  //      }
  //      if (!owner) {
  //        throw "Element ref was specified as a string (" + ref + ") but no owner was set";
  //      }
  //      if (dom) {
  //        if (dom.nodeType) {
  //          dom.getDOMNode = getDOMNode;
  //        }
  //        owner.refs[ref] = dom;
  //      } else {
  //        delete owner.refs[ref];
  //      }
  //    }
  //  };
  function Component(props, context) {
    //debugger
    //防止用户在构造器生成JSX
    Refs.currentOwner = this;
    this.context = context;
    this.props = props;
    this.refs = {};
    this.state = null;
  }
  // function returnFalse() {
  //   return false;
  // }
  // 假对象
  var fakeObject = {
    enqueueSetState: returnFalse,
    isMounted: returnFalse
  };

  Component.prototype = {
    // 指向所属类本身
    constructor: Component, //必须重写constructor,防止别人在子类中使用Object.getPrototypeOf时找不到正确的基类
    replaceState: function replaceState() {
      deprecatedWarn("replaceState");
    },

    isReactComponent: returnTrue,
    isMounted: function isMounted() {
      deprecatedWarn("isMounted");
      return (this.updater || fakeObject).isMounted();
    },
    // setState 是 Component这个类的方法
    setState: function setState(state, cb) {
      debugger
      // 入队 
      (this.updater || fakeObject).enqueueSetState(state, cb);
    },
    forceUpdate: function forceUpdate(cb) {
      (this.updater || fakeObject).enqueueSetState(true, cb);
    },
    render: function render() {
      // Component 是我们自己写的
      //debugger
    }
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  /**
   * 为了兼容0.13之前的版本
   */
  var NOBIND = {
    render: 1,
    shouldComponentUpdate: 1,
    componentWillReceiveProps: 1,
    componentWillUpdate: 1,
    componentDidUpdate: 1,
    componentWillMount: 1,
    componentDidMount: 1,
    componentWillUnmount: 1,
    componentDidUnmount: 1
  };

  function collectMixins(mixins) {
    var keyed = {};

    for (var i = 0; i < mixins.length; i++) {
      var mixin = mixins[i];
      if (mixin.mixins) {
        applyMixins(mixin, collectMixins(mixin.mixins));
      }

      for (var key in mixin) {
        if (mixin.hasOwnProperty(key) && key !== "mixins") {
          (keyed[key] || (keyed[key] = [])).push(mixin[key]);
        }
      }
    }

    return keyed;
  }
  // 许多合并
  var MANY_MERGED = {
    getInitialState: 1,
    getDefaultProps: 1,
    getChildContext: 1
  };
  // 平钩 偏平钩子
  function flattenHooks(key, hooks) {
    var hookType = _typeof(hooks[0]);
    if (hookType === "object") {
      // Merge objects
      var ret = {};
      for (var i = 0; i < hooks.length; i++) {
        extend(ret, hooks[i]);
      }
      return ret;
    } else if (hookType === "function" && hooks.length > 1) {
      return function () {
        var ret = {},
          r = void 0,
          hasReturn = MANY_MERGED[key];
        for (var _i = 0; _i < hooks.length; _i++) {
          r = hooks[_i].apply(this, arguments);
          if (hasReturn && r) {
            extend(ret, r);
          }
        }
        if (hasReturn) {
          return ret;
        }
        return r;
      };
    } else {
      return hooks[0];
    }
  }

  function applyMixins(proto, mixins) {
    for (var key in mixins) {
      if (mixins.hasOwnProperty(key)) {
        proto[key] = flattenHooks(key, mixins[key].concat(proto[key] || []));
      }
    }
  }

  //Component
  // function name(props, context) {
  //   ReactComponent.call(this, props, context);
  //   for (var methodName in this) {
  //     var method = this[methodName];
  //     if (typeof method === "function" && !blacklist[methodName]) {
  //       this[methodName] = method.bind(this);
  //     }
  //     if (spec.getInitialState) {
  //       var test = this.state = spec.getInitialState.call(this);
  //       if (!(test === null || ({}).toString.call(test) == "[object Object]")) {
  //         throw ""
  //       }
  //     }
  //   };
  // }
  //创建一个构造器
  function newCtor(className, spec) {
    //debugger
    var curry = Function("ReactComponent", "blacklist", "spec", "return function " + className + "(props, context) {\n      ReactComponent.call(this, props, context);\n\n     for (var methodName in this) {\n        var method = this[methodName];\n        if (typeof method  === \"function\"&& !blacklist[methodName]) {\n          this[methodName] = method.bind(this);\n        }\n      }\n\n      if (spec.getInitialState) {\n        var test = this.state = spec.getInitialState.call(this);\n        if(!(test === null || ({}).toString.call(test) == \"[object Object]\")){\n          throw \"getInitialState\u53EA\u80FD\u8FD4\u56DE\u7EAFJS\u5BF9\u8C61\u6216\u8005null\"\n        }\n      }\n\n  };");
    // var NOBIND = {
    //   render: 1,
    //   shouldComponentUpdate: 1,
    //   componentWillReceiveProps: 1,
    //   componentWillUpdate: 1,
    //   componentDidUpdate: 1,
    //   componentWillMount: 1,
    //   componentDidMount: 1,
    //   componentWillUnmount: 1,
    //   componentDidUnmount: 1
    // };
    // 构造一各类
    return curry(Component, NOBIND, spec);
  }
  // 创建一个类 Component类 
  // spec就是 class A extends React.Component 
  function createClass(spec) {
    debugger
    deprecatedWarn("createClass");
    if (!isFn(spec.render)) {
      throw "请实现render方法";
    }
    // function Component(props, context) {
    //   //防止用户在构造器生成JSX
    //   Refs.currentOwner = this;
    //   this.context = context;
    //   this.props = props;
    //   this.refs = {};
    //   this.state = null;
    // }
    // Component.prototype = {
    //   // 指向所属类本身
    //   constructor: Component, //必须重写constructor,防止别人在子类中使用Object.getPrototypeOf时找不到正确的基类
    //   replaceState: function replaceState() {
    //     deprecatedWarn("replaceState");
    //   },

    //   isReactComponent: returnTrue,
    //   isMounted: function isMounted() {
    //     deprecatedWarn("isMounted");
    //     return (this.updater || fakeObject).isMounted();
    //   },
    //   // setState 是 Component这个类的方法
    //   setState: function setState(state, cb) {
    //     (this.updater || fakeObject).enqueueSetState(state, cb);
    //   },
    //   forceUpdate: function forceUpdate(cb) {
    //     (this.updater || fakeObject).enqueueSetState(true, cb);
    //   },
    //   render: function render() {
    //     // Component 是我们自己写的
    //     ////debugger
    //   }
    // };
    // 构造器这个构造器可以
    var Constructor = newCtor(spec.displayName || "Component", spec);
    //debugger
    //g:1562
    // function inherit(SubClass, SupClass) {
    //   function Bridge() { }
    //   var orig = SubClass.prototype;
    //   Bridge.prototype = SupClass.prototype;
    //   var fn = SubClass.prototype = new Bridge();
    //   避免原型链拉长导致方法查找的性能开销
    //   extend(fn, orig);
    //   fn.constructor = SubClass;
    //   return fn;
    // }
    var proto = inherit(Constructor, Component);
    //如果mixins里面非常复杂，可能mixin还包含其他mixin
    if (spec.mixins) {
      applyMixins(spec, collectMixins(spec.mixins));
    }

    extend(proto, spec);

    if (spec.statics) {
      extend(Constructor, spec.statics);
    }
    "propTypes,contextTypes,childContextTypes,displayName".replace(/\w+/g, function (name) {
      if (spec[name]) {
        var props = Constructor[name] = spec[name];
        if (name !== "displayName") {
          for (var i in props) {
            if (!isFn(props[i])) {
              console.error(i + " in " + name + " must be a function"); // eslint-disable-line
            }
          }
        }
      }
    });

    if (isFn(spec.getDefaultProps)) {
      Constructor.defaultProps = spec.getDefaultProps();
    }

    return Constructor;
  }
  //debugger
  // 浅等
  function shallowEqual(objA, objB) {
    // 如果两个对象地址相同，
    if (Object.is(objA, objB)) {
      return true;
    }
    //确保objA, objB都是对象
    // undefined: 0, null: 1, boolean:2, number: 3, string: 4, function: 5, symbol:6, array: 7, object:8
    // 其中一个不是也不行
    if (typeNumber(objA) < 7 || typeNumber(objB) < 7) {
      return false;
    }
    // 对象的长度必须一样
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
      return false;
    }

    // Test for A's keys different from B.
    for (var i = 0; i < keysA.length; i++) {
      // 是ObjB的私有属性 然后再比较 是否是相同的
      if (!hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) {
        return false;
      }
    }
    return true;
  }

  function PureComponent(props, context) {
    //debugger
    // 这里面的this好像是
    Component.call(this, props, context);
  }
  // 继承 
  var fn$1 = inherit(PureComponent, Component);
  // 纯组件做了是否更新的逻辑判断，不知道react做不做这个功能 是否需要自己做
  fn$1.shouldComponentUpdate = function shallowCompare(nextProps, nextState) {
    // 如果不想等
    var a = shallowEqual(this.props, nextProps);
    var b = shallowEqual(this.state, nextState);
    return !a || !b;
  };
  // 纯组件增加一个属性
  fn$1.isPureComponent = true;

  /**
  通过事件绑定实现受控组件 表单
   */
  var formElements = {
    select: 1,
    textarea: 1,
    input: 1,
    option: 1
  };
  // 双工数据
  var duplexData = {
    1: ["value", {
      onChange: 1,
      onInput: 1,
      readOnly: 1,
      disabled: 1
    }, function (a) {
      return a == null ? null : a + "";
    }, function (dom, value, vnode) {
      if (value == null) {
        return;
      }

      if (vnode.type === "input") {
        dom.__anuSetValue = true; //抑制onpropertychange
        dom.setAttribute("value", value);
        dom.__anuSetValue = false;
        if (dom.type === "number") {
          var valueAsNumber = parseFloat(dom.value) || 0;
          if (
            // eslint-disable-next-line
            value != valueAsNumber ||
            // eslint-disable-next-line
            value == valueAsNumber && dom.value != value) {
            // Cast `value` to a string to ensure the value is set correctly. While
            // browsers typically do this as necessary, jsdom doesn't.
            value += "";
          } else {
            return;
          }
        }
      }
      if (dom._persistValue !== value) {
        dom.__anuSetValue = true; //抑制onpropertychange
        dom._persistValue = dom.value = value;
        dom.__anuSetValue = false;
      }
    }, keepPersistValue, "change", "input"],

    2: ["checked", {
      onChange: 1,
      onClick: 1,
      readOnly: 1,
      disabled: 1
    }, function (a) {
      return !!a;
    }, function (dom, value, vnode) {
      if (vnode.props.value != null) {
        dom.value = vnode.props.value;
      }
      if (dom._persistValue !== value) {
        dom._persistValue = dom.checked = value;
      }
    }, keepPersistValue, "change", "click"],
    // select  option change
    3: ["value", {
      onChange: 1,
      disabled: 1
    }, function (a) {
      return a;
    }, function (dom, value, vnode, isUncontrolled) {
      //只有在单选的情况，用户会乱修改select.value
      if (isUncontrolled) {
        if (!dom.multiple && dom.value !== dom._persistValue) {
          dom._persistValue = dom.value;
          dom._setValue = false;
        }
      } else {
        //props中必须有value
        if ("value" in vnode.props) {
          dom._persistValue = value;
        }
      }

      syncOptions({
        target: dom
      });
    }, syncOptions, "change"]
  };
  // input的控制
  function inputControll(vnode, dom, props) {
    var domType = dom.type;
    // 123
    var duplexType = duplexMap[domType];
    var isUncontrolled = dom._uncontrolled;
    if (duplexType) {
      var data = duplexData[duplexType];
      var duplexProp = data[0];
      var keys = data[1];
      var converter = data[2];
      var sideEffect = data[3];

      var value = converter(isUncontrolled ? dom._persistValue : props[duplexProp]);
      sideEffect(dom, value, vnode, isUncontrolled);
      if (isUncontrolled) {
        return;
      }

      var handle = data[4];
      var event1 = data[5];
      var event2 = data[6];
      if (!hasOtherControllProperty(props, keys)) {
        // eslint-disable-next-line
        console.warn("\u4F60\u4E3A" + vnode.type + "[type=" + domType + "]\u5143\u7D20\u6307\u5B9A\u4E86**\u53D7\u63A7\u5C5E\u6027**" + duplexProp + "\uFF0C\n\u4F46\u662F\u6CA1\u6709\u63D0\u4F9B\u53E6\u5916\u7684" + Object.keys(keys) + "\n\u6765\u64CD\u4F5C" + duplexProp + "\u7684\u503C\uFF0C\b\u6846\u67B6\u5C06\u4E0D\u5141\u8BB8\u4F60\u901A\u8FC7\u8F93\u5165\u6539\u53D8\u8BE5\u503C");
        dom["on" + event1] = handle;
        dom["on" + event2] = handle;
      } else {
        vnode.controlledCb = handle;
        Refs.controlledCbs.push(vnode);
      }
    } else {
      //处理option标签
      var arr = dom.children || [];
      for (var i = 0, el; el = arr[i]; i++) {
        dom.removeChild(el);
        i--;
      }
      if ("value" in props) {
        dom.duplexValue = dom.value = props.value;
      } else {
        dom.duplexValue = dom.text;
      }
    }
  }

  function hasOtherControllProperty(props, keys) {
    for (var key in keys) {
      // if (props[key])  return true;
      if (props[key]) {
        return true;
      }
    }
  }
  // 一直坚持的价值
  function keepPersistValue(e) {
    var dom = e.target;
    var name = e.type === "textarea" ? "innerHTML" : /check|radio/.test(dom.type) ? "checked" : "value";
    // undefinded void 666;
    var v = dom._persistValue;
    var noNull = v != null;
    var noEqual = dom[name] !== v; //2.0 , 2

    if (noNull && noEqual) {

      dom[name] = v;
    }
  }
  //同步处理options
  function syncOptions(e) {
    var target = e.target,
      value = target._persistValue,
      options = target.options;
    if (target.multiple) {
      updateOptionsMore(options, options.length, value);
    } else {
      updateOptionsOne(options, options.length, value);
    }
    target._setSelected = true;
  }

  function updateOptionsOne(options, n, propValue) {
    var stringValues = {},
      noDisableds = [];
    for (var i = 0; i < n; i++) {
      var option = options[i];
      var value = option.duplexValue;
      if (!option.disabled) {
        noDisableds.push(option);
      }
      if (value === propValue) {
        //精确匹配
        return setOptionSelected(option, true);
      }
      stringValues[value] = option;
    }
    var match = stringValues[propValue];
    if (match) {
      //字符串模糊匹配
      return setOptionSelected(match, true);
    }
    if (n && noDisableds[0]) {
      //选中第一个没有变disable的元素
      setOptionSelected(noDisableds[0], true);
    }
  }

  function updateOptionsMore(options, n, propValue) {
    var selectedValue = {};
    try {
      for (var i = 0; i < propValue.length; i++) {
        selectedValue["&" + propValue[i]] = true;
      }
    } catch (e) {
      /* istanbul ignore next */
      console.warn('<select multiple="true"> 的value应该对应一个字符串数组'); // eslint-disable-line
    }
    for (var _i = 0; _i < n; _i++) {
      var option = options[_i];
      var value = option.duplexValue;
      var selected = selectedValue.hasOwnProperty("&" + value);
      setOptionSelected(option, selected);
    }
  }

  function setOptionSelected(dom, selected) {
    dom.selected = selected;
  }

  var rnumber = /^-?\d+(\.\d+)?$/;
  /**
   * 为元素样子设置样式
   * 
   * @export
   * @param {any} dom 
   * @param {any} lastStyle 
   * @param {any} nextStyle 
   */
  // 斑块样式
  function patchStyle(dom, lastStyle, nextStyle) {
    if (lastStyle === nextStyle) {
      return;
    }

    for (var name in nextStyle) {
      var val = nextStyle[name];
      // 如果不相等 style
      if (lastStyle[name] !== val) {
        // 获取兼容性的css 样式
        name = cssName(name, dom);
        if (val !== 0 && !val) {
          val = ""; //清除样式
        } else if (rnumber.test(val) && !cssNumber[name]) {
          val = val + "px"; //添加单位
        }
        try {
          //node.style.width = NaN;node.style.width = 'xxxxxxx';
          //node.style.width = undefine 在旧式IE下会抛异常
          dom.style[name] = val; //应用样式
        } catch (e) {
          console.log("dom.style[" + name + "] = " + val + "throw error"); // eslint-disable-line
        }
      }
    }
    // 如果旧样式存在，但新样式已经去掉
    for (var _name in lastStyle) {
      if (!(_name in nextStyle)) {
        _name = cssName(_name, dom);
        dom.style[_name] = ""; //清除样式
      }
    }
  }

  var cssNumber = oneObject("animationIterationCount,columnCount,order,flex,flexGrow,flexShrink,fillOpacity,fontWeight,lineHeight,opacity,orphans,widows,zIndex,zoom");

  //var testStyle = document.documentElement.style
  var prefixes = ["", "-webkit-", "-o-", "-moz-", "-ms-"];
  var cssMap = oneObject("float", "cssFloat");
  // function oneObject(array, val) {
  //   if (array + "" === array) {
  //     //利用字符串的特征进行优化，字符串加上一个空字符串等于自身
  //     array = array.match(rword) || [];
  //   }
  //   var result = {},

  //     //eslint-disable-next-line
  //     value = val !== void 666 ? val : 1;
  //   for (var i = 0, n = array.length; i < n; i++) {
  //     result[array[i]] = value;
  //   }
  //   return result;
  // }
  /**
   * 转换成当前浏览器可用的样式名
   * 
   * @param {any} name 
   * @returns 
   */
  function cssName(name, dom) {
    if (cssMap[name]) {
      return cssMap[name];
    }
    var host = dom && dom.style || {};
    // dom.style 具有所有的属性
    for (var i = 0, n = prefixes.length; i < n; i++) {
      var camelCase = camelize(prefixes[i] + name);
      if (camelCase in host) {
        return cssMap[name] = camelCase;
      }
    }
    return null;
  }

  /**
    通过对象监控实现非受控组件
   */
  var inputMonitor = {};
  var rcheck = /checked|radio/;
  var describe = {
    set: function set(value) {
      var controllProp = rcheck.test(this.type) ? "checked" : "value";
      if (this.type === "textarea") {
        this.innerHTML = value;
      }
      if (!this._observing) {
        if (!this._setValue) {
          //defaultXXX只会同步一次_persistValue
          var parsedValue = this[controllProp] = value;
          this._persistValue = Array.isArray(value) ? value : parsedValue;
          this._setValue = true;
        }
      } else {
        //如果用户私下改变defaultValue，那么_setValue会被抺掉
        this._setValue = value == null ? false : true;
      }
      this._defaultValue = value;
    },
    get: function get() {
      //debugger
      return this._defaultValue;
    },
    // configurabe是以后的属性可以修改
    configurable: true
  };

  inputMonitor.observe = function (dom, name) {
    try {
      if ("_persistValue" in dom) {
        dom._setValue = true;
      }
      // 对input 的监控；
      Object.defineProperty(dom, name, describe);
    } catch (e) { }
  };
  // function _toConsumableArray(arr) {
  //   if (Array.isArray(arr)) {
  //     for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
  //       arr2[i] = arr[i];
  //     }
  //     return arr2;
  //   } else {
  //     return Array.from(arr);
  //   }
  // }
  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  //布尔属性的值末必为true,false
  //https://github.com/facebook/react/issues/10589
  var controlled = {
    value: 1,
    checked: 1
  };
  function captureError(instance, hook, args) {
    try {
      var fn = instance[hook];
      if (fn) {
        return fn.apply(instance, args);
      }
      return true;
    } catch (error) {
      if (hook === "componentWillUnmount") {
        instance[hook] = noop;
      }

      pushError(instance, hook, error);
    }
  }
  var isSpecialAttr = {
    style: 1,
    autoFocus: 1,
    defaultValue: 1,
    defaultChecked: 1,
    children: 1,
    innerHTML: 1,
    dangerouslySetInnerHTML: 1
  };

  var svgCache = {};
  var strategyCache = {};
  /**
   * 仅匹配 svg 属性名中的第一个驼峰处，如 viewBox 中的 wB，
   * 数字表示该特征在属性列表中重复的次数
   * -1 表示用 ":" 隔开的属性 (xlink:href, xlink:title 等)
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
   */
  var svgCamelCase = {
    w: { r: 1, b: 1, t: 1 },
    e: { n: 1, t: 1, f: 1, p: 1, c: 1, m: 1, a: 2, u: 1, s: 1, v: 1 },
    o: { r: 1 },
    c: { m: 1 },
    p: { p: 1 },
    t: { s: 2, t: 1, u: 1, c: 1, d: 1, o: 1, x: 1, y: 1, l: 1 },
    l: { r: 1, m: 1, u: 1, b: -1, l: -1, s: -1 },
    r: { r: 1, u: 2, h: 1, w: 1, c: 1, e: 1 },
    h: { r: 1, a: 1, l: 1, t: 1 },
    y: { p: 1, s: 1, t: 1, c: 1 },
    g: { c: 1 },
    k: { a: -1, h: -1, r: -1, s: -1, t: -1, c: 1, u: 1 },
    m: { o: 1, l: 1, a: 1 },
    n: { c: 1, t: 1, u: 1 },
    s: { a: 3 },
    f: { x: 1, y: 1 },
    d: { e: 1, f: 1, m: 1, d: 1 },
    x: { c: 1 }
  };

  // SVG 属性列表中驼峰命名和短横线分隔命名特征值有重复
  // 列出了重复特征中的短横线命名的属性名
  var specialSVGPropertyName = {
    "overline-thickness": 2,
    "underline-thickness": 2,
    "overline-position": 2,
    "underline-position": 2,
    "stroke-miterlimit": 2,
    "baseline-shift": 2,
    "clip-path": 2,
    "font-size": 2,
    "font-size-adjust": 2,
    "font-stretch": 2,
    "font-style": 2,
    "text-decoration": 2,
    "vert-origin-x": 2,
    "vert-origin-y": 2,
    "paint-order": 2,
    "fill-rule": 2,
    "color-rendering": 2,
    "marker-end": 2,
    "pointer-events": 2,
    "units-per-em": 2,
    "strikethrough-thickness": 2,
    "lighting-color": 2
  };

  // 重复属性名的特征值列表
  var repeatedKey = ["et", "ep", "em", "es", "pp", "ts", "td", "to", "lr", "rr", "re", "ht", "gc"];

  function createRepaceFn(split) {
    return function (match) {
      return match.slice(0, 1) + split + match.slice(1).toLowerCase();
    };
  }

  var rhump = /[a-z][A-Z]/;
  var toHyphen = createRepaceFn("-");
  var toColon = createRepaceFn(":");
  console.log('---------->toHyphen , toColon');
  console.log(toHyphen);
  console.log(toColon);
  //debugger
  // var svgCache = {};
  // var strategyCache = {};

  function getSVGAttributeName(name) {
    //debugger
    if (svgCache[name]) {
      return svgCache[name];
    }
    var key = name.match(rhump);
    if (!key) {
      return svgCache[name] = name;
    }

    var _ref = [].concat(_toConsumableArray(key[0].toLowerCase())),
      prefix = _ref[0],
      postfix = _ref[1];

    var orig = name;
    if (svgCamelCase[prefix] && svgCamelCase[prefix][postfix]) {
      var count = svgCamelCase[prefix][postfix];

      if (count === -1) {
        return svgCache[orig] = {
          name: name.replace(rhump, toColon),
          ifSpecial: true
        };
      }

      if (~repeatedKey.indexOf(prefix + postfix)) {
        var dashName = name.replace(rhump, toHyphen);
        if (specialSVGPropertyName[dashName]) {
          name = dashName;
        }
      }
    } else {
      name = name.replace(rhump, toHyphen);
    }

    return svgCache[orig] = name;
  }
  // 不同的属性，props 之前是style
  function diffProps(dom, lastProps, nextProps, vnode) {
    //debugger
    options.beforeProps(vnode);
    // 命名空间
    var isSVG = vnode.namespaceURI === NAMESPACE.svg;
    var tag = vnode.type;
    //eslint-disable-next-line
    for (var name in nextProps) {
      var val = nextProps[name];
      if (val !== lastProps[name]) {
        var which = tag + isSVG + name;
        var action = strategyCache[which];
        if (!action) {
          action = strategyCache[which] = getPropAction(dom, name, isSVG);
        }
        actionStrategy[action](dom, name, val, lastProps, vnode);
      }
    }
    //如果旧属性在新属性对象不存在，那么移除DOM eslint-disable-next-line
    for (var _name in lastProps) {
      if (!nextProps.hasOwnProperty(_name)) {
        var _which = tag + isSVG + _name;
        var _action = strategyCache[_which];
        if (!_action) {
          continue;
        }
        actionStrategy[_action](dom, _name, false, lastProps, vnode);
      }
    }
  }

  function isBooleanAttr(dom, name) {
    var val = dom[name];
    return val === true || val === false;
  }

  /**
   * 根据一个属性所在的元素或元素的文档类型，就可以永久决定该使用什么策略操作它
   *
   * @param {any} dom 元素节点
   * @param {any} name 属性名
   * @param {any} isSVG
   * @returns
   */
  function getPropAction(dom, name, isSVG) {
    if (isSVG && name === "className") {
      return "svgClass";
    }
    if (isSpecialAttr[name]) {
      return name;
    }
    if (isEventName(name)) {
      return "event";
    }

    if (isSVG) {
      return "svgAttr";
    }
    //img.width = '100px'时,取img.width为0,必须用setAttribute
    if (name === "width" || name === "height") {
      return "attribute";
    }
    if (isBooleanAttr(dom, name)) {
      return "booleanAttr";
    }

    return name.indexOf("data-") === 0 || dom[name] === void 666 ? "attribute" : "property";
  }
  var builtinStringProps = {
    className: 1,
    title: 1,
    name: 1,
    type: 1,
    alt: 1,
    lang: 1
  };

  var rform = /textarea|input|select/i;
  // 为什么不写个对象写个对象还可以 通过Object.assign() 
  function uncontrolled(dom, name, val, lastProps, vnode) {
    if (rform.test(dom.nodeName)) {
      if (!dom._uncontrolled) {
        dom._uncontrolled = true;
        inputMonitor.observe(dom, name); //重写defaultXXX的setter/getter
      }
      dom._observing = false;
      if (vnode.type === "select" && dom._setValue && !lastProps.multiple !== !vnode.props.multiple) {
        //当select的multiple发生变化，需要重置selectedIndex，让底下的selected生效
        dom.selectedIndex = dom.selectedIndex;
        dom._setValue = false;
      }
      dom[name] = val;
      dom._observing = true;
    } else {
      dom.setAttribute(name, val);
    }
  }

  // 行动策略
  var actionStrategy = {
    innerHTML: noop,
    defaultValue: uncontrolled,
    defaultChecked: uncontrolled,
    children: noop,
    style: function style(dom, _, val, lastProps) {
      patchStyle(dom, lastProps.style || emptyObject, val || emptyObject);
    },
    autoFocus: function autoFocus(dom) {
      if (duplexMap[dom.type] < 3 || dom.contentEditable === "true") {
        dom.focus();
      }
    },
    svgClass: function svgClass(dom, name, val) {
      if (!val) {
        dom.removeAttribute("class");
      } else {
        dom.setAttribute("class", val);
      }
    },
    svgAttr: function svgAttr(dom, name, val) {
      // http://www.w3school.com.cn/xlink/xlink_reference.asp
      // https://facebook.github.io/react/blog/2015/10/07/react-v0.14.html#notable-enh
      // a ncements xlinkActuate, xlinkArcrole, xlinkHref, xlinkRole, xlinkShow,
      // xlinkTitle, xlinkType eslint-disable-next-line
      var method = typeNumber(val) < 3 && !val ? "removeAttribute" : "setAttribute";
      var nameRes = getSVGAttributeName(name);
      if (nameRes.ifSpecial) {
        var prefix = nameRes.name.split(":")[0];
        // 将xlinkHref 转换为 xlink:href
        dom[method + "NS"](NAMESPACE[prefix], nameRes.name, val || "");
      } else {
        dom[method](nameRes, val || "");
      }
    },
    booleanAttr: function booleanAttr(dom, name, val) {
      // 布尔属性必须使用el.xxx = true|false方式设值 如果为false, IE全系列下相当于setAttribute(xxx,""),
      // 会影响到样式,需要进一步处理 eslint-disable-next-line
      dom[name] = !!val;
      if (dom[name] === false) {
        dom.removeAttribute(name);
      } else if (dom[name] === "false") {
        //字符串属性会将它转换为false
        dom[name] = "";
      }
    },
    attribute: function attribute(dom, name, val) {
      if (val == null || val === false) {
        return dom.removeAttribute(name);
      }
      try {
        dom.setAttribute(name, val);
      } catch (e) {
        console.warn("setAttribute error", name, val); // eslint-disable-line
      }
    },
    property: function property(dom, name, val) {
      // if (dom[name] !== val) {
      // 尝试直接赋值，部分情况下会失败，如给 input 元素的 size 属性赋值 0 或字符串
      // 这时如果用 setAttribute 则会静默失败
      if (controlled[name]) {
        return;
      }
      try {
        if (!val && val !== 0) {
          //如果它是字符串属性，并且不等于""，清空
          if (builtinStringProps[name]) {
            dom[name] = "";
          }
          dom.removeAttribute(name);
        } else {
          dom[name] = val;
        }
      } catch (e) {
        try {
          //修改type会引发多次报错
          dom.setAttribute(name, val);
        } catch (e) {/*ignore*/ }
      }
    },
    event: function event(dom, name, val, lastProps, vnode) {
      var events = dom.__events || (dom.__events = {});
      events.vnode = vnode;
      var refName = toLowerCase(name.slice(2));
      if (val === false) {
        delete events[refName];
      } else {
        if (!lastProps[name]) {
          //添加全局监听事件
          var eventName = getBrowserName(name);
          var hook = eventHooks[eventName];
          addGlobalEvent(eventName);
          if (hook) {
            hook(dom, eventName);
          }
        }
        //onClick --> click, onClickCapture --> clickcapture
        events[refName] = val;
      }
    },
    dangerouslySetInnerHTML: function dangerouslySetInnerHTML(dom, name, val, lastProps) {
      var oldhtml = lastProps[name] && lastProps[name].__html;
      var html = val && val.__html;
      if (html !== oldhtml) {
        dom.innerHTML = html;
      }
    }
  };
  // vue 和react dom 更新  DOMUpdater 这个类
  function DOMUpdater(vnode) {
    //debugger
    this.name = vnode.type;
    this._states = ["resolve"];
    // 和vue 非常相似，watcher 中deps
    this._reactInternalFiber = vnode;
    vnode.updater = this;
    this._mountOrder = Refs.mountOrder++;
  }

  DOMUpdater.prototype = {
    addState: function addState(state) {
      debugger
      // this._states = ["resolve"];
      var states = this._states;
      // 如果最后一个状态队列里面的对象 状态是
      if (states[states.length - 1] !== state) {
        states.push(state);
      }
    },
    // 过渡将状态过度到  hydrate这个位置
    transition: function transition(updateQueue) {
      debugger
      console.log('updateQueue');
      var state = this._states.shift();
      if (state) {
        this[state](updateQueue);
      }
    },
    init: function init(updateQueue) {
      debugger
      updateQueue.push(this);
    },

    isMounted: returnFalse,
    props: function props() {
      var vnode = this._reactInternalFiber;
      var dom = vnode.stateNode;
      var type = vnode.type,
        props = vnode.props,
        lastProps = vnode.lastProps;

      diffProps(dom, lastProps || {}, props, vnode);
      if (formElements[type]) {
        inputControll(vnode, dom, props);
      }
    },
    resolve: function resolve() {
      var vnode = this._reactInternalFiber;
      var dom = vnode.stateNode;
      this.isMounted = returnTrue;
      Refs.fireRef(vnode, dom);
    },
    dispose: function dispose() {
      var vnode = this._reactInternalFiber;
      Refs.fireRef(vnode, null);
    }
  };

  function AnuPortal(props) {
    return props.children;
  }

  function createPortal(children, node) {
    //debugger
    console.log('createPortal');
    var vnode,
      events = node.__events;
    if (events) {
      vnode = node.__events.vnode;
    } else {
      events = node.__events = {};
      vnode = createVnode(node);
      events.vnode = vnode;
      new DOMUpdater(vnode);
    }

    var child = createElement(AnuPortal, { children: children });
    events.child = child;
    child.superReturn = vnode;
    return child;
  }

  function pushError(instance, hook, error) {
    var names = [];
    var catchUpdater = findCatchComponent(instance, names);
    instance.updater._hasError = true;
    var stack = describeError(names, hook);
    if (catchUpdater) {
      disableHook(instance.updater); //禁止患者节点执行钩子
      catchUpdater.errorInfo = catchUpdater.errorInfo || [error, { componentStack: stack }, instance];
      if (!Refs.errorHook) {
        Refs.errorHook = hook;
        Refs.doctors = [catchUpdater];
      } else {
        if (Refs.doctors.indexOf(catchUpdater) === -1) {
          Refs.doctors.push(catchUpdater);
        }
      }

      var vnode = catchUpdater._reactInternalFiber;
      delete vnode.child;
      delete catchUpdater.pendingVnode;
    } else {
      console.warn(stack); // eslint-disable-line
      //如果同时发生多个错误，那么只收集第一个错误，并延迟到afterPatch后执行
      if (!Refs.error) {
        Refs.error = error;
      }
    }
  }
  // 捕获错误
  function captureuError(instance, hook, args) {
    //debugger
    try {
      var fn = instance[hook];
      if (fn) {
        return fn.apply(instance, args);
      }
      return true;
    } catch (error) {
      if (hook === "componentWillUnmount") {
        instance[hook] = noop;
      }

      pushError(instance, hook, error);
    }
  }

  function describeError(names, hook) {
    var segments = ["**" + hook + "** method occur error "];
    names.forEach(function (name, i) {
      if (names[i + 1]) {
        segments.push("in " + name + " (created By " + names[i + 1] + ")");
      }
    });
    return segments.join("\n").trim();
  }

  //让该组件不要再触发钩子
  function disableHook(u) {
    u.hydrate = u.render = u.resolve = noop;
  }
  /**
   * 此方法遍历医生节点中所有updater，收集沿途的标签名与组件名
   */
  // 发现捕捉组件
  function findCatchComponent(target, names) {
    //debugger
    console.log('findCatchComponent');
    var vnode = target.updater._reactInternalFiber,
      instance,
      updater,
      type,
      name,
      catchIt;
    do {
      type = vnode.type;
      if (vnode.isTop) {
        if (catchIt) {
          return catchIt;
        }
        disposeVnode(vnode, [], true);
        break;
      } else if (vnode.vtype > 1) {
        name = type.displayName || type.name;
        names.push(name);
        instance = vnode.stateNode;
        if (instance.componentDidCatch) {
          updater = instance.updater;
          if (updater._isDoctor) {
            disableHook(updater);
          } else if (!catchIt && target !== instance) {
            catchIt = updater;
          }
        }
      } else if (vnode.vtype === 1) {
        names.push(type);
      }
    } while (vnode = vnode.return);
  }

  function alwaysNull() {
    return null;
  }
  var support16 = true;
  var errorType = {
    0: "undefined",
    2: "boolean",
    3: "number",
    4: "string",
    7: "array"
  };

  /**
   * 为了防止污染用户的实例，需要将操作组件虚拟DOM与生命周期钩子的逻辑全部抽象到这个类中
   *
   * @export
   * @param {any} instance
   * @param {any} vnode
   */
  // 复合更新
  function CompositeUpdater(vnode, parentContext) {
    //debugger  {child :} 
    var type = vnode.type,
      props = vnode.props;

    if (!type) {
      throw vnode;
    }
    this.name = type.displayName || type.name;
    this.props = props;
    this._reactInternalFiber = vnode;
    this.context = getContextByTypes(parentContext, type.contextTypes);
    this.parentContext = parentContext;
    this._pendingCallbacks = [];
    this._pendingStates = [];
    this._states = ["resolve"];
    this._mountOrder = Refs.mountOrder++;
    if (vnode.superReturn) {
      this.isPortal = true;
    }
    // update总是保存最新的数据，如state, props, context, parentContext, parentVnode
    //  this._hydrating = true 表示组件会调用render方法及componentDidMount/Update钩子
    //  this._nextCallbacks = [] 表示组件需要在下一周期重新渲染
    //  this._forceUpdate = true 表示会无视shouldComponentUpdate的结果
  }

  CompositeUpdater.prototype = {
    addState: function addState(state) {
      debugger
      var states = this._states;
      if (states[states.length - 1] !== state) {
        states.push(state);
      }
    },
    // 过度到
    transition: function transition(updateQueue) {
      var state = this._states.shift();
      if (state) {
        this[state](updateQueue);
      }
    },
    // 将设置状态
    enqueueSetState: function enqueueSetState(state, cb) {
      if (state === true) {
        //forceUpdate
        this._forceUpdate = true;
      } else {
        // 
        //setState
        this._pendingStates.push(state);
      }
      if (this._hydrating) {
        //组件在更新过程（_hydrating = true），其setState/forceUpdate被调用
        //那么会延期到下一个渲染过程调用
        if (!this._nextCallbacks) {
          this._nextCallbacks = [cb];
        } else {
          this._nextCallbacks.push(cb);
        }
        return;
      } else {
        if (isFn(cb)) {
          this._pendingCallbacks.push(cb);
        }
      }
      if (document.__async) {
        //在事件句柄中执行setState会进行合并
        // this._pendingStates已经有最新的状态了
        enqueueUpdater(this);
        return;
      }
      if (this.isMounted === returnTrue) {
        if (this._receiving) {
          //componentWillReceiveProps中的setState/forceUpdate应该被忽略
          return;
        }
        this.addState("hydrate");
        drainQueue([this]);
      }
    },
    mergeStates: function mergeStates() {
      var instance = this.instance,
        // this._pendingStates 里面存放着 已经延迟更新的状态
        pendings = this._pendingStates,
        n = pendings.length,
        state = instance.state;
      if (n === 0) {
        return state;
      }
      var nextState = extend({}, state); //每次都返回新的state
      for (var i = 0; i < n; i++) {
        var pending = pendings[i];
        if (pending && pending.call) {
          pending = pending.call(instance, nextState, this.props);
        }
        extend(nextState, pending);
      }
      pendings.length = 0;
      return nextState;
    },


    isMounted: returnFalse,
    init: function init(updateQueue, insertCarrier) {
      // 这个时候已经有updateQueue方法了 
      debugger
      // var type = vnode.type,
      //   props = vnode.props;

      // if (!type) {
      //   throw vnode;
      // }
      // this.name = type.displayName || type.name;
      // this.props = props;
      // this._reactInternalFiber = vnode;
      // this.context = getContextByTypes(parentContext, type.contextTypes);
      // this.parentContext = parentContext;
      // this._pendingCallbacks = [];
      // this._pendingStates = [];
      // this._states = ["resolve"];
      // this._mountOrder = Refs.mountOrder++;
      // if (vnode.superReturn) {
      //   this.isPortal = true;
      // }
      debugger
      var props = this.props,
        context = this.context,
        vnode = this._reactInternalFiber;

      var type = vnode.type,
        isStateless = vnode.vtype === 4,
        instance = void 0,
        mixin = void 0;
      //实例化组件
      try {
        var lastOwn = Refs.currentOwner;
        if (isStateless) {
          instance = {
            refs: {},
            __proto__: type.prototype,
            render: function render() {
              debugger
              return type(this.props, this.context);
            }
          };
          Refs.currentOwner = instance;
          mixin = type(props, context);
        } else {
          // 创建 组件实例 私有属性 ，共有方法放在原型上
          debugger
          instance = new type(props, context);
          Refs.currentOwner = instance;
        }
      } catch (e) {
        //失败时，则创建一个假的instance
        instance = {
          updater: this
        };
        vnode.stateNode = instance;
        this.instance = instance;
        return pushError(instance, "constructor", e);
      } finally {
        // 上面赋值 组件实例，现在又 赋值最后一个 ，上面有毛用
        Refs.currentOwner = lastOwn;
      }
      //如果是无状态组件需要再加工
      if (isStateless) {
        if (mixin && mixin.render) {
          //带生命周期的
          extend(instance, mixin);
        } else {
          //不带生命周期的
          vnode.child = mixin;
          instance.__isStateless = true;
          this.mergeStates = alwaysNull;
          this.willReceive = false;
        }
      }
      debugger
      vnode.stateNode = this.instance = instance;
      debugger
      // 实例永远是真实的
      getDerivedStateFromProps(this, type, props, instance.state);
      //如果没有调用constructor super，需要加上这三行
      instance.props = props;
      instance.context = context;
      // 这个实例上的updater，最大的 总和update实例
      instance.updater = this;
      var queue = this.insertCarrier = this.isPortal ? {} : insertCarrier;

      this.insertPoint = queue.dom;
      this.updateQueue = updateQueue;
      if (instance.componentWillMount) {
        captureError(instance, "componentWillMount", []);
      }
      instance.state = this.mergeStates();
      //让顶层的元素updater进行收集
      debugger
      this.render(updateQueue);
      updateQueue.push(this);
    },
    // 前面增加 hydrate 只是为了调用这个方法
    hydrate: function hydrate(updateQueue, inner) {
      debugger
      // this.instance是真正的类
      var instance = this.instance,
        context = this.context,
        props = this.props,
        vnode = this._reactInternalFiber,
        pendingVnode = this.pendingVnode;

      if (this._states[0] === "hydrate") {
        this._states.shift(); // ReactCompositeComponentNestedState-state
      }
      // 获取最新的数据
      var state = this.mergeStates();
      var shouldUpdate = true;
      if (!this._forceUpdate && !captureError(instance, "shouldComponentUpdate", [props, state, context])) {
        shouldUpdate = false;
        if (pendingVnode) {
          var child = this._reactInternalFiber.child;
          this._reactInternalFiber = pendingVnode;
          pendingVnode.child = child;
          delete this.pendingVnode;
        }
        var nodes = collectComponentNodes(this.children);
        var queue = this.insertCarrier;
        nodes.forEach(function (el) {
          insertElement(el, queue.dom);
          queue.dom = el.stateNode;
          // queue.unshift(el.stateNode);
        });
      } else {
        captureError(instance, "componentWillUpdate", [props, state, context]);
        var lastProps = instance.props,
          lastState = instance.state;

        this._hookArgs = [lastProps, lastState];
      }
      if (this._hasError) {
        return;
      }
      vnode.stateNode = instance;
      delete this._forceUpdate;
      //既然setState了，无论shouldComponentUpdate结果如何，用户传给的state对象都会作用到组件上
      // 获取最新的状态
      instance.props = props;
      instance.state = state;
      instance.context = context;
      if (!inner) {
        this.insertCarrier.dom = this.insertPoint;
      }
      if (shouldUpdate) {
        // 停止 暂停
        debugger
        // 一旦调用update的方法 
        this.render(updateQueue);
      }
      this.addState("resolve");
      updateQueue.push(this);
    },
    render: function render(updateQueue) {
      debugger
      console.log('yangchongduo---->>>>>>>>//debugger');
      // 内部
      var vnode = this._reactInternalFiber,
        pendingVnode = this.pendingVnode,
        instance = this.instance,
        parentContext = this.parentContext,
        nextChildren = emptyObject,
        lastChildren = emptyObject,
        childContext = parentContext,
        rendered = void 0,
        number = void 0;


      if (pendingVnode) {
        vnode = this._reactInternalFiber = pendingVnode;
        delete this.pendingVnode;
      }
      this._hydrating = true;

      if (this.willReceive === false) {
        rendered = vnode.child;
        delete this.willReceive;
      } else {
        var lastOwn = Refs.currentOwner;
        Refs.currentOwner = instance;
        debugger
        // 这个位置是至关重要的 原生class 类的render 方法的实现
        // AnuWrapper render 方法执行 就是返回 child this.props.child
        rendered = captureError(instance, "render", []);
        if (this._hasError) {
          rendered = true;
        }
        Refs.currentOwner = lastOwn;
      }
      number = typeNumber(rendered);
      var hasMounted = this.isMounted();
      if (hasMounted) {
        lastChildren = this.children;
      }
      if (number > 2) {
        if (number > 5) {
          //array, object
          childContext = getChildContext(instance, parentContext);
        }
        // 纤维化  rendered 会指引到 子组件
        debugger
        nextChildren = fiberizeChildren(rendered, this);
      } else {
        //undefinded, null, boolean
        this.children = nextChildren; //emptyObject
        delete this.child;
      }
      var noSupport = !support16 && errorType[number];
      if (noSupport) {
        pushError(instance, "render", new Error("React15 fail to render " + noSupport));
      }
      debugger
      // 这个函数的意义是什么意思？
      Refs.diffChildren(lastChildren, nextChildren, vnode, childContext, updateQueue, this.insertCarrier);
    },

    // ComponentDidMount/update钩子，React Chrome DevTools的钩子， 组件ref, 及错误边界
    resolve: function resolve(updateQueue) {
      // stop
      debugger
      console.log('ComponentDidMount/update钩子，React Chrome DevTools的钩子， 组件ref, 及错误边界');
      var instance = this.instance,
        vnode = this._reactInternalFiber;

      var hasMounted = this.isMounted();
      if (!hasMounted) {
        this.isMounted = returnTrue;
      }
      if (this._hydrating) {
        var hookName = hasMounted ? "componentDidUpdate" : "componentDidMount";
        captureError(instance, hookName, this._hookArgs || []);
        //执行React Chrome DevTools的钩子
        if (hasMounted) {
          options.afterUpdate(instance);
        } else {
          options.afterMount(instance);
        }
        delete this._hookArgs;
        delete this._hydrating;
      }

      if (this._hasError) {
        return;
      } else {
        //执行组件ref（发生错误时不执行）
        if (vnode._hasRef) {
          Refs.fireRef(vnode, instance);
          vnode._hasRef = false;
        }
        clearArray(this._pendingCallbacks).forEach(function (fn) {
          fn.call(instance);
        });
      }
      transfer.call(this, updateQueue);
    },
    catch: function _catch(queue) {
      var instance = this.instance;
      // delete Refs.ignoreError; 

      this._states.length = 0;
      this.children = {};
      this._isDoctor = this._hydrating = true;
      instance.componentDidCatch.apply(instance, this.errorInfo);
      delete this.errorInfo;
      this._hydrating = false;
      transfer.call(this, queue);
    },
    dispose: function dispose() {
      var vnode = this._reactInternalFiber,
        instance = this.instance;

      options.beforeUnmount(instance);
      instance.setState = instance.forceUpdate = returnFalse;

      Refs.fireRef(vnode, null);
      captureError(instance, "componentWillUnmount", []);
      //在执行componentWillUnmount后才将关联的元素节点解绑，防止用户在钩子里调用 findDOMNode方法
      this.isMounted = returnFalse;
      vnode._disposed = this._disposed = true;
    }
  };
  function transfer(queue) {
    var cbs = this._nextCallbacks,
      cb;
    if (cbs && cbs.length) {
      //如果在componentDidMount/Update钩子里执行了setState，那么再次渲染此组件
      do {
        cb = cbs.shift();
        if (isFn(cb)) {
          this._pendingCallbacks.push(cb);
        }
      } while (cbs.length);
      delete this._nextCallbacks;
      this.addState("hydrate");
      queue.push(this);
    }
  }
  function getDerivedStateFromProps(updater, type, props, state) {
    if (isFn(type.getDerivedStateFromProps)) {
      var state = type.getDerivedStateFromProps.call(null, props, state);
      if (state != null) {
        updater._pendingStates.push(state);
      }
    }
  }

  function getChildContext(instance, parentContext) {
    if (instance.getChildContext) {
      var context = instance.getChildContext();
      if (context) {
        parentContext = extend(extend({}, parentContext), context);
      }
    }
    return parentContext;
  }

  function getContextByTypes(curContext, contextTypes) {
    var context = {};
    if (!contextTypes || !curContext) {
      return context;
    }
    for (var key in contextTypes) {
      if (contextTypes.hasOwnProperty(key)) {
        context[key] = curContext[key];
      }
    }
    return context;
  }

  function collectComponentNodes(children) {
    var ret = [];
    for (var i in children) {
      var child = children[i];
      var inner = child.stateNode;
      if (child._disposed) {
        continue;
      }
      if (child.vtype < 2) {
        ret.push(child);
      } else {
        var updater = inner.updater;
        if (child.child) {
          var args = collectComponentNodes(updater.children);
          ret.push.apply(ret, args);
        }
      }
    }
    return ret;
  }

  //[Top API] React.isValidElement
  function isValidElement(vnode) {
    return vnode && vnode.vtype;
  }

  //[Top API] ReactDOM.render
  // 这个时候已经创建完虚拟dom了
  function render(vnode, container, callback) {
    debugger
    console.log('ReactDOM---->render');
    return renderByAnu(vnode, container, callback);
  }
  //[Top API] ReactDOM.unstable_renderSubtreeIntoContainer
  function unstable_renderSubtreeIntoContainer(lastVnode, nextVnode, container, callback) {
    deprecatedWarn("unstable_renderSubtreeIntoContainer");
    var updater = lastVnode && lastVnode.updater;
    var parentContext = updater ? updater.parentContext : {};
    return renderByAnu(nextVnode, container, callback, parentContext);
  }
  //[Top API] ReactDOM.unmountComponentAtNode
  function unmountComponentAtNode(container) {
    //debugger
    var nodeIndex = topNodes.indexOf(container);
    if (nodeIndex > -1) {
      var lastVnode = topVnodes[nodeIndex];
      var queue = [];
      disposeVnode(lastVnode, queue);
      drainQueue(queue);
      emptyElement(container);
      container.__component = null;
      return true;
    }
    return false;
  }
  //[Top API] ReactDOM.findDOMNode
  function findDOMNode(componentOrElement) {
    //debugger
    if (componentOrElement == null) {
      //如果是null
      return null;
    }
    if (componentOrElement.nodeType) {
      //如果本身是元素节点
      return componentOrElement;
    }
    //实例必然拥有updater与render
    if (componentOrElement.render) {
      var vnode = componentOrElement.updater._reactInternalFiber;
      var c = vnode.child;
      if (c) {
        return findDOMNode(c.stateNode);
      } else {
        return null;
      }
    }
  }
  // Anu人的包装
  var AnuWrapper = function AnuWrapper() {
    // 又是Component
    // 这样写只继承Component 
    Component.call(this);
  };
  var fn$2 = inherit(AnuWrapper, Component);
  // 这个是原型上的方法
  fn$2.render = function () {
    debugger
    return this.props.child;
  };
  //debugger
  // ReactDOM.render的内部实现 Host
  function renderByAnu(vnode, container, callback) {
    console.log('renderByAnu');
    var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (!(container && container.appendChild)) {
      throw "ReactDOM.render\u7684\u7B2C\u4E8C\u4E2A\u53C2\u6570\u9519\u8BEF"; // eslint-disable-line
    }
    //__component用来标识这个真实DOM是ReactDOM.render的容器，通过它可以取得上一次的虚拟DOM
    // 但是在IE6－8中，文本/注释节点不能通过添加自定义属性来引用虚拟DOM，这时我们额外引进topVnode,
    //topNode来寻找它们。

    var nodeIndex = topNodes.indexOf(container),
      lastWrapper = void 0,
      top = void 0,
      wrapper = void 0,
      updateQueue = [],
      insertCarrier = {};
    // 插入载体
    //updaterQueue是用来装载updater， insertCarrier是用来装载插入DOM树的真实DOM
    if (nodeIndex !== -1) {
      lastWrapper = topVnodes[nodeIndex];
      wrapper = lastWrapper.stateNode.updater;
      if (wrapper._hydrating) {
        //如果是在componentDidMount/Update中使用了ReactDOM.render，那么将延迟到此组件的resolve阶段执行
        wrapper._pendingCallbacks.push(renderByAnu.bind(null, vnode, container, callback, context));
        return lastWrapper.child.stateNode;
      }
    } else {
      topNodes.push(container);
      nodeIndex = topNodes.length - 1;
    }
    Refs.currentOwner = null; //防止干扰
    debugger
    // createElement 是  vnode 工厂
    var nextWrapper = createElement(AnuWrapper, { child: vnode });
    debugger
    // 这里已经写好了
    // top(contaner) > nextWrapper > vnode
    nextWrapper.isTop = true;
    topVnodes[nodeIndex] = nextWrapper;
    // 包装之后的 next
    if (lastWrapper) {
      top = nextWrapper.return = lastWrapper.return;
      top.child = nextWrapper;
      receiveVnode(lastWrapper, nextWrapper, context, updateQueue, insertCarrier);
    } else {
      // 最顶层 虚拟dom
      // container 根据容器 创建vnode
      // top是最顶层的vnode nextWrapper 是第二层的虚拟dom
      top = nextWrapper.return = createVnode(container);
      // 创建一个 top的更新实例 根据vnode创建DOMUpdater
      // 这个位置已经将
      var topUpdater = new DOMUpdater(top);
      top.child = nextWrapper;
      topUpdater.children = {
        ".0": nextWrapper
      };
      nextWrapper.child = vnode;
      // 以上将组件的
      genVnodes(nextWrapper, context, updateQueue, insertCarrier); // 这里会从下到上添加updater
    }
    // 此处是 最后
    debugger
    top.updater.init(updateQueue); // 添加最顶层的updater
    container.__component = nextWrapper; //兼容旧的
    wrapper = nextWrapper.stateNode.updater;

    if (callback) {
      wrapper._pendingCallbacks.push(callback.bind(vnode.stateNode));
    }
    drainQueue(updateQueue);
    //组件返回组件实例，而普通虚拟DOM 返回元素节点
    return vnode.stateNode;
  }

  // genVnodes 通过 vnode.return.stateNode.childNodes
  function genVnodes(vnode, context, updateQueue, insertCarrier) {
    console.log('genVnodes');
    var parentNode = vnode.return.stateNode;
    debugger
    // 不断的去创建 childNodes lastVnode = createVnode(dom);
    // childNodes 这是一种原生的；
    var nodes = toArray(parentNode.childNodes || emptyArray);
    var lastVnode = null;
    for (var i = 0, dom; dom = nodes[i++];) {
      if (toLowerCase(dom.nodeName) === vnode.type) {
        debugger
        lastVnode = createVnode(dom);
      } else {
        debugger
        parentNode.removeChild(dom);
      }
    }
    if (lastVnode) {
      receiveVnode(lastVnode, vnode, context, updateQueue, insertCarrier);
    } else {
      debugger
      // 挂在真实dom
      mountVnode(vnode, context, updateQueue, insertCarrier);
    }
  }

  //mountVnode只是转换虚拟DOM为真实DOM，不做插入DOM树操作
  // insertCarrier 就是那个 插入载体
  function mountVnode(vnode, context, updateQueue, insertCarrier) {
    console.log('mountVnode');
    options.beforeInsert(vnode);
    if (vnode.vtype === 0 || vnode.vtype === 1) {
      // 每一个vnode 上stateNode都是原生的属性
      vnode.stateNode = createElement$1(vnode, vnode.return);
      var beforeDOM = insertCarrier.dom;
      // 将产生的dom放在insertCarrier
      insertCarrier.dom = vnode.stateNode;
      if (vnode.vtype === 1) {
        debugger
        var _updater = new DOMUpdater(vnode);
        // 孩子节点还是要打开
        var children = fiberizeChildren(vnode.props.children, _updater);
        mountChildren(vnode, children, context, updateQueue, {});
        _updater.init(updateQueue);
      }
      insertElement(vnode, beforeDOM);
      if (vnode.updater) {
        vnode.updater.props();
      }
    } else {
      // 创建一个 CompositeUpdater实例
      // 1：AnuWrapper vnode  因为不是真实的dom 所以就 创建一个复合型 Updater
      //debugger  {child :} 
      // CompositeUpdater
      // var type = vnode.type,
      //   props = vnode.props;

      // if (!type) {
      //   throw vnode;
      // }
      // this.name = type.displayName || type.name;
      // this.props = props;
      // this._reactInternalFiber = vnode;
      // this.context = getContextByTypes(parentContext, type.contextTypes);
      // this.parentContext = parentContext;
      // this._pendingCallbacks = [];
      // this._pendingStates = [];
      // this._states = ["resolve"];
      // this._mountOrder = Refs.mountOrder++;
      // if (vnode.superReturn) {
      //   this.isPortal = true;
      // }
      debugger
      // 停止 
      var updater = new CompositeUpdater(vnode, context);
      debugger
      updater.init(updateQueue, insertCarrier);
    }
  }

  function mountChildren(vnode, children, context, updateQueue, insertCarrier) {
    console.log('mountChildren');
    for (var i in children) {
      var child = children[i];
      mountVnode(child, context, updateQueue, insertCarrier);
      if (Refs.errorHook) {
        break;
      }
    }
  }

  function updateVnode(lastVnode, nextVnode, context, updateQueue, insertCarrier) {
    debugger
    console.log('updateVnode');
    var dom = nextVnode.stateNode = lastVnode.stateNode;
    options.beforeUpdate(nextVnode);
    if (lastVnode.vtype < 2) {
      insertElement(nextVnode, insertCarrier.dom);
      insertCarrier.dom = dom;
      if (lastVnode.vtype === 0) {
        if (nextVnode.text !== lastVnode.text) {
          dom.nodeValue = nextVnode.text;
        }
      } else {
        if (lastVnode.namespaceURI) {
          nextVnode.namespaceURI = lastVnode.namespaceURI;
        }
        var updater = nextVnode.updater = lastVnode.updater;
        updater._reactInternalFiber = nextVnode;
        nextVnode.lastProps = lastVnode.props;
        var lastChildren = updater.children;
        var props = nextVnode.props;

        if (props[innerHTML]) {
          disposeChildren(lastChildren, updateQueue);
        } else {
          var nextChildren = fiberizeChildren(props.children, updater);
          debugger
          diffChildren(lastChildren, nextChildren, nextVnode, context, updateQueue, {});
        }
        updater.props();
        updater.addState("resolve");
        updateQueue.push(updater);
      }
    } else {
      receiveComponent(lastVnode, nextVnode, context, updateQueue, insertCarrier);
    }
  }

  function receiveComponent(lastVnode, nextVnode, parentContext, updateQueue, insertCarrier) {
    console.log('receiveComponent');
    // todo:减少数据的接收次数
    var type = lastVnode.type,
      stateNode = lastVnode.stateNode,
      updater = stateNode.updater,
      nextProps = nextVnode.props,
      willReceive = lastVnode !== nextVnode,
      nextContext = void 0;

    if (!type.contextTypes) {
      nextContext = stateNode.context;
    } else {
      nextContext = getContextByTypes(parentContext, type.contextTypes);
      willReceive = true;
    }

    updater.props = nextProps;
    if (updater.isPortal) {
      updater.insertCarrier = {};
    } else {
      updater.insertCarrier = insertCarrier;
    }
    updater.parentContext = parentContext;
    updater.pendingVnode = nextVnode;
    updater.context = nextContext;
    updater.willReceive = willReceive;
    nextVnode.stateNode = stateNode;
    if (!updater._dirty) {
      updater._receiving = true;
      updater.updateQueue = updateQueue;
      if (willReceive) {
        captureError(stateNode, "componentWillReceiveProps", [nextProps, nextContext]);
      }
      if (lastVnode.props !== nextProps) {
        getDerivedStateFromProps(updater, type, nextProps, stateNode.state);
      }
      if (updater._hasError) {
        return;
      }
      delete updater._receiving;
      if (lastVnode.ref !== nextVnode.ref) {
        Refs.fireRef(lastVnode, null);
      }
      updater.hydrate(updateQueue, true);
    }
  }

  function isSameNode(a, b) {
    if (a.type === b.type && a.key === b.key) {
      return true;
    }
  }

  function receiveVnode(lastVnode, nextVnode, context, updateQueue, insertCarrier) {
    if (isSameNode(lastVnode, nextVnode)) {
      //组件虚拟DOM已经在diffChildren生成并插入DOM树
      updateVnode(lastVnode, nextVnode, context, updateQueue, insertCarrier);
    } else {
      disposeVnode(lastVnode, updateQueue);
      mountVnode(nextVnode, context, updateQueue, insertCarrier);
    }
  }
  // https://github.com/onmyway133/DeepDiff
  function diffChildren(lastChildren, nextChildren, parentVnode, parentContext, updateQueue, insertCarrier) {
    debugger
    console.log('diffChildren');
    //这里都是走新的任务列队
    var lastChild = void 0,
      nextChild = void 0,
      isEmpty = true,
      child = void 0,
      firstChild = void 0;
    if (parentVnode.vtype === 1) {
      firstChild = parentVnode.stateNode.firstChild;
    }
    // lastChildren 如果有值就走新的队列
    for (var i in lastChildren) {
      isEmpty = false;
      child = lastChildren[i];
      //向下找到其第一个元素节点子孙
      if (firstChild) {
        do {
          if (child.superReturn) {
            break;
          }
          if (child.vtype < 2) {
            child.stateNode = firstChild;
            break;
          }
        } while (child = child.child);
      }
      break;
    }
    debugger
    //优化： 只添加
    if (isEmpty) {
      mountChildren(parentVnode, nextChildren, parentContext, updateQueue, insertCarrier);
    } else {
      var matchNodes = {},
        matchRefs = [];
      for (var _i in lastChildren) {
        nextChild = nextChildren[_i];
        lastChild = lastChildren[_i];
        if (nextChild && nextChild.type === lastChild.type) {
          matchNodes[_i] = lastChild;
          if (lastChild.vtype < 2 && lastChild.ref !== nextChild.ref) {
            lastChild.order = nextChild.index;
            matchRefs.push(lastChild);
          }
          continue;
        }
        disposeVnode(lastChild, updateQueue);
      }
      //step2: 更新或新增节点
      matchRefs.sort(function (a, b) {
        return a.order - b.order;
      }).forEach(function (el) {
        updateQueue.push({
          transition: Refs.fireRef.bind(null, el, null),
          isMounted: noop
        });
      });
      for (var _i2 in nextChildren) {
        nextChild = nextChildren[_i2];
        lastChild = matchNodes[_i2];
        if (lastChild) {
          // 之前都有 lastChild nextChild 进行对比更新
          receiveVnode(lastChild, nextChild, parentContext, updateQueue, insertCarrier);
        } else {
          mountVnode(nextChild, parentContext, updateQueue, insertCarrier);
        }

        if (Refs.errorHook) {
          return;
        }
      }
    }
  }

  Refs.diffChildren = diffChildren;

  var React;
  if (win.React && win.React.options) {
    React = win.React; //解决引入多个
  } else {
    React = win.React = win.ReactDOM = {
      version: "1.2.9",
      render: render,
      hydrate: render,
      options: options,
      Fragment: REACT_FRAGMENT_TYPE,
      PropTypes: PropTypes,
      Children: Children,
      createPortal: createPortal,
      Component: Component,
      eventSystem: eventSystem,
      findDOMNode: findDOMNode,
      createClass: createClass,
      createElement: createElement,
      cloneElement: cloneElement,
      PureComponent: PureComponent,
      isValidElement: isValidElement,
      unmountComponentAtNode: unmountComponentAtNode,
      unstable_renderSubtreeIntoContainer: unstable_renderSubtreeIntoContainer,
      createFactory: function createFactory(type) {
        console.warn("createFactory is deprecated"); // eslint-disable-line
        var factory = createElement.bind(null, type);
        factory.type = type;
        return factory;
      }
    };
  }
  var React$1 = React;

  return React$1;

})));
