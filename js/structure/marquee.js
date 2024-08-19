//框选结构
//大小、位置、显隐
export default function Marquee(size, pos, show, stroke, strokeWidth, fill, opacity){
  this.show = show;
  this.pos = pos;
  this.size = size;
  this.stroke = stroke||"blue";
  this.strokeWidth = strokeWidth||1;
  this.fill = fill||"skyblue";
  this.opacity = opacity||0.2;
  this.dom = null;
}
