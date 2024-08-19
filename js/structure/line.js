export default function Line(id, begin, end, show, color, lineWidth, orginX) {
  this.id = id;
  this.begin = begin;
  this.end = end;
  this.lineWidth = lineWidth || 3; //默认
  this.color = color || "#008b8b"; //默认
  this.show = show || true;
  this.size = {};
  this.pos = {};
  this.path = "";
  this.dom = null;
  this.orginX = orginX || 0;
}

Line.prototype.update = function () {
  this.pos = pos(this.begin, this.end);
  this.size = size(this.begin, this.end);
  this.computePath();
};

Line.prototype.computePath = function () {
  let points = linePoints(this.begin, this.end)(this.size); // 根据连接方向和尺寸计算连接线的路径上的点
  if (!points) return "";
  // 使用贝塞尔曲线控制点生成路径数据
  this.path = `M ${points[0].x},${points[0].y} C ${points[1].x},${points[1].y} ${points[2].x},${points[2].y} ${points[3].x},${points[3].y}`;

};

function pos(begin, end) {
  return { x: Math.min(begin.posX, end.posX), y: Math.min(begin.posY, end.posY) };
}

function size(begin, end) {
  return { width: Math.abs(end.posX - begin.posX), height: Math.abs(end.posY - begin.posY) };
}

function linePoints(begin, end) {
  let type = begin.type;
  // 定义不同方向的贝塞尔曲线控制点
  if (type === "up") {
    if (end.posX <= begin.posX && end.posY <= begin.posY) {
      return fromUpToTopLeft;
    } else if (end.posX > begin.posX && end.posY <= begin.posY) {
      return fromUpToTopRight;
    } else if (end.posX <= begin.posX && end.posY > begin.posY) {
      return fromUpToBottomLeft;
    } else if (end.posX > begin.posX && end.posY > begin.posY) {
      return fromUpToBottomRight;
    }
  } else {
    if (end.posX <= begin.posX && end.posY <= begin.posY) {
      return fromDownToTopLeft;
    } else if (end.posX > begin.posX && end.posY <= begin.posY) {
      return fromDownToTopRight;
    } else if (end.posX <= begin.posX && end.posY > begin.posY) {
      return fromDownToBottomLeft;
    } else if (end.posX > begin.posX && end.posY > begin.posY) {
      return fromDownToBottomRight;
    }
  }
}

// 定义贝塞尔曲线的控制点
function fromUpToTopLeft(size) {
  return [
    { x: 0, y: 0 },
    { x: 0, y: size.height / 2 },
    { x: size.width, y: size.height / 2 },
    { x: size.width, y: size.height }
  ];
}


function fromUpToTopRight(size) {
  return [
    { x: 0, y: size.height },
    { x: 0, y: size.height / 2 },
    { x: size.width, y: size.height / 2 },
    { x: size.width, y: 0 }
  ];
}

function fromUpToBottomLeft(size) {
  return [
    { x: size.width, y: 0 },
    { x: size.width / 2, y: 0 },
    { x: size.width / 2, y: size.height },
    { x: 0, y: size.height }
  ];
}

function fromUpToBottomRight(size) {
  return [
    { x: 0, y: 0 },
    { x: size.width / 2, y: 0 },
    { x: size.width / 2, y: size.height },
    { x: size.width, y: size.height }
  ];
}

function fromDownToTopLeft(size) {
  const yOffset = Math.min(100, size.height);
  const xOffset = Math.min(300, size.width / 2);
  return [
    { x: 0, y: 0 },
    { x: size.width / 2 - xOffset, y: 0 - yOffset },
    { x: size.width / 2 + xOffset, y: size.height + yOffset },
    { x: size.width, y: size.height }
  ];
}

function fromDownToTopRight(size) {
  const yOffset = Math.min(100, size.height);
  const xOffset = Math.min(300, size.width / 2);
  return [
    { x: 0, y: size.height },
    { x: size.width / 2 - xOffset, y: size.height + yOffset },
    { x: size.width / 2 + xOffset, y: 0 - yOffset },
    { x: size.width, y: 0 }
  ];
}

function fromDownToBottomLeft(size) {
  return [
    { x: size.width, y: 0 },
    { x: size.width, y: size.height / 2 },
    { x: 0, y: size.height / 2 },
    { x: 0, y: size.height }
  ];
}

function fromDownToBottomRight(size) {
  return [
    { x: 0, y: 0 },
    { x: 0, y: size.height / 2 },
    { x: size.width, y: size.height / 2 },
    { x: size.width, y: size.height }
  ];
}
