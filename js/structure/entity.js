//实体基类
//id、ftID、节点类型如("and_door")、层数、节点名称、节点别名、节点大小、节点位置
var maxID = 1;

function Entity(id, btID, type, name, aliasName, size, pos, hasUpNodes, hasDownNodes, collapse, textColor, _description,
  _skipif, _successif, _failureif, _while,
  _onSuccess, _onFailure, _onHalted, _post) {
  //内部id
  this.id = id;
  //btID
  this.btID = (btID && btID !== "") ? (btID) : (maxID++) + "";
  this.type = type;
  //父节点
  this.upEntity = [];
  //子节点
  this.downEntity = [];
  this.name = name;
  this.aliasName = aliasName;
  this.size = size;
  this.pos = pos;

  this.hasUpNodes = hasUpNodes;
  this.hasDownNodes = hasDownNodes;

  this.collapse = collapse;
  // this.show = true;
  // this.isRender = true;
  this.textColor = textColor;
  this._description = _description;

  this._skipif = _skipif;
  this._successif = _successif;
  this._failureif = _failureif;
  this._while = _while;

  this._onSuccess = _onSuccess;
  this._onFailure = _onFailure;
  this._onHalted = _onHalted;
  this._post = _post

  this.dom = null;

  this.modelType = "";
  this.lineOffset = { "up": -4, "down": 4 };

  //border.type边框关联类型 : 1-关联自身,2-关联子节点
  // this.border = { color: "#000000", type: 1 };
  // maxID = Math.max(maxID, parseInt(this.ftID)+1);
  // setBtID(this.btID);
}
export function getBtID() {
  return maxID++;
};
export function setBtID(btID) {
  if (parseInt(btID) >= maxID) {
    maxID = parseInt(btID) + 1;
  }
}

export function EventEntity(id, btID, type, name, aliasName, size, pos, hasUpNodes, hasDownNodes, collapse, textColor, _description,
  _skipif, _successif, _failureif, _while,
  _onSuccess, _onFailure, _onHalted, _post) {
  Entity.call(this, id, btID, type, name, aliasName, size, pos, hasUpNodes, hasDownNodes, collapse, textColor, _description,
    _skipif, _successif, _failureif, _while,
    _onSuccess, _onFailure, _onHalted, _post);
  // console.log(this)
  //等级
  // this.size = { width: size.width, height: size.height }
  // console.log(this)
  this.upNodeOffset = { x: size.width / 2, y: +2 };
  //this.downNodeOffset = {x:size.width/2, y:size.height+8};
  this.downNodeOffset = { x: size.width / 2, y: size.height - 2 };
  this.category = "event";
  this.textColor = textColor
  // this._description = ''

  // this._skipif = ''
  // this._successif = ''
  // this._failureif = ''
  // this._while = ''

  // this._onSuccess = ''
  // this._onFailure = ''
  // this._onHalted = ''
  // this._post = ''
}

// (function(){
//   //创建临时类
//   let Temp = function(){};
//   Temp.prototype = Entity.prototype;
//   //子类原型指向父类实例
//   EventEntity.prototype = new Temp();
// })();
// //修复构造函数指向
// EventEntity.prototype.constructor = EventEntity;

