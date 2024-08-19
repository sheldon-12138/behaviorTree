//模型结构
export default function Model(path, type, name, aliasName, sizeList, hasUpNodes, hasDownNodes, category, textColor) {
  this.id = ++Model.prototype.amount; //模型id
  this.path = path; //模型图片路径
  this.type = type; //模型类型
  this.name = name; //模型名称
  this.aliasName = aliasName; //模型中文别名
  this.sizeList = sizeList; //尺寸列表  {width:Number,height:Number}
  this.hasUpNodes = hasUpNodes;
  this.hasDownNodes = hasDownNodes;
  this.category = category;
  this.textColor = textColor
}
Model.prototype.amount = 0;

