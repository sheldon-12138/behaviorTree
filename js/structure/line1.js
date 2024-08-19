//线结构

// begin = {
//   entityID:EntityID,
//   posX:number,
//   posY:number,
//   type:up、down,
// }
export default function Line(id, begin, end, show, color, lineWidth, orginX) {
  this.id = id;
  this.begin = begin;
  this.end = end;
  this.lineWidth = lineWidth || 1;//默认
  this.color = color || "black";//默认
  this.show = show || true;
  this.size = {};
  this.pos = {};
  this.path = "";
  this.dom = null;
  this.orginX = orginX || 0
}


Line.prototype.update = function () {
  // console.log(this.end)
  this.pos = pos(this.begin, this.end);
  this.size = size(this.begin, this.end);
  this.computePath();
};
Line.prototype.computePath = function () {
  let points = linePoints(this.begin, this.end, this.lineWidth == 0.5)(this.size);// 根据连接方向和尺寸计算连接线的路径上的点
  if (!points) return "";
  this.path = "";
  let len = points.length;
  for (let i = 0; i < len; ++i) {
    this.path += points[i].x + "," + points[i].y + " ";
  }
};
function pos(begin, end) {
  return { x: Math.min(begin.posX, end.posX), y: Math.min(begin.posY, end.posY) };
};
function size(begin, end) {
  return { width: Math.abs(end.posX - begin.posX), height: Math.abs(end.posY - begin.posY) };
};

function linePoints(begin, end, userLineFlag) {
  let type = begin.type;
  // let endType = end.type;
  //如果是up连接点
  if (type === "up") {
    //如果在左上
    if (end.posX <= begin.posX && end.posY <= begin.posY) {
      return fromUpToTopLeft;
    }
    //如果是右上
    else if (end.posX > begin.posX && end.posY <= begin.posY) {
      return fromUpToTopRight;
    }
    //如果在左下
    else if (end.posX <= begin.posX && end.posY > begin.posY) {
      return fromUpToBottomLeft;
    }
    //如果在右下
    else if (end.posX > begin.posX && end.posY > begin.posY) {
      return fromUpToBottomRight;
    }
  }
  //如果是down连接点
  else {
    //如果在左上
    if (end.posX <= begin.posX && end.posY <= begin.posY) {
      if (userLineFlag) return fromUpToTopLeftUp
      else return fromDownToTopLeft;
    }
    //如果是右上
    else if (end.posX > begin.posX && end.posY <= begin.posY) {
      if (userLineFlag) return fromUpToTopRightUp
      else return fromDownToTopRight;
    }
    //如果在左下
    else if (end.posX <= begin.posX && end.posY > begin.posY) {
      return fromDownToBottomLeft;
    }
    //如果在右下
    else if (end.posX > begin.posX && end.posY > begin.posY) {
      return fromDownToBottomRight;
    }
  }
};
function fromUpToTopLeft(size) {
  let points = [];
  points.push({ x: 0, y: 0 });
  points.push({ x: 0, y: size.height / 2.0 });
  points.push({ x: size.width, y: size.height / 2.0 });
  points.push({ x: size.width, y: size.height });
  return points;
};
function fromUpToTopLeftUp(size) {
  let points = [];
  points.push({ x: size.width, y: size.height });
  points.push({ x: size.width, y: -20 });
  points.push({ x: 0, y: -20 });
  points.push({ x: 0, y: 0 });
  return points;
};
function fromUpToTopRight(size) {
  let points = [];
  points.push({ x: 0, y: size.height });
  points.push({ x: 0, y: size.height / 2.0 });
  points.push({ x: size.width, y: size.height / 2.0 });
  points.push({ x: size.width, y: 0 });
  return points;
};
function fromUpToTopRightUp(size) {
  let points = [];
  points.push({ x: 0, y: size.height });
  points.push({ x: 0, y: -20 });
  points.push({ x: size.width, y: -20 });
  points.push({ x: size.width, y: 0 });
  return points;
};

function fromUpToBottomLeft(size) {
  let points = [];
  points.push({ x: size.width, y: 0 });
  points.push({ x: size.width, y: -10 });
  points.push({ x: size.width / 2.0, y: -10 });
  points.push({ x: size.width / 2.0, y: size.height + 10 });
  points.push({ x: 0, y: size.height + 10 });
  points.push({ x: 0, y: size.height });
  return points;
};
function fromUpToBottomRight(size) {
  let points = [];
  points.push({ x: 0, y: 0 });
  points.push({ x: 0, y: -10 });
  points.push({ x: size.width / 2.0, y: -10 });
  points.push({ x: size.width / 2.0, y: size.height + 10 });
  points.push({ x: size.width, y: size.height + 10 });
  points.push({ x: size.width, y: size.height });
  return points;
};
function fromDownToTopLeft(size) {
  let points = [];
  points.push({ x: 0, y: 0 });
  points.push({ x: 0, y: -10 });
  points.push({ x: size.width / 2.0, y: -10 });
  points.push({ x: size.width / 2.0, y: size.height + 10 });
  points.push({ x: size.width, y: size.height + 10 });
  points.push({ x: size.width, y: size.height });
  return points;
};
function fromDownToTopRight(size) {
  let points = [];
  points.push({ x: 0, y: size.height });
  points.push({ x: 0, y: size.height + 10 });
  points.push({ x: size.width / 2.0, y: size.height + 10 });
  points.push({ x: size.width / 2.0, y: -10 });
  points.push({ x: size.width, y: -10 });
  points.push({ x: size.width, y: 0 });
  return points;
};
function fromDownToBottomLeft(size) {
  let points = [];
  points.push({ x: size.width, y: 0 });
  points.push({ x: size.width, y: size.height / 2.0 });
  points.push({ x: 0, y: size.height / 2.0 });
  points.push({ x: 0, y: size.height });
  return points;
};
function fromDownToBottomRight(size) {
  let points = [];
  points.push({ x: 0, y: 0 });
  points.push({ x: 0, y: size.height / 2.0 });
  points.push({ x: size.width, y: size.height / 2.0 });
  points.push({ x: size.width, y: size.height });
  return points;
};
