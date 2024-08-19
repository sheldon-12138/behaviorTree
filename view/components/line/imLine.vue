<template>
  <svg xmlns="http://www.w3.org/2000/svg" :x="pos.x" :y="pos.y" :width="size.width" :height="size.height" class="line">
<!--    <polyLine></polyLine>-->
    <polyline data-class="line" :points="points" :stroke="line.color" :stroke-width="line.lineWidth" fill="none" :data-key="dataKey"></polyline>
  </svg>
</template>

<script>
export default {

  data(){
    return {

    }
  },

  computed:{
    pos(){
      //线svg当前位置
      //let bPos = this.line.begin.pos;
      //let ePos = this.line.end.pos;
      return {x:Math.min(this.line.begin.posX, this.line.end.posX), y:Math.min(this.line.begin.posY, this.line.end.posY)};
    },
    size(){
      //线svg当前大小
      // let bPos = this.line.begin.pos;
      // let ePos = this.line.end.pos;
      return {width:Math.abs(this.line.end.posX-this.line.begin.posX), height:Math.abs(this.line.end.posY-this.line.begin.posY)};
    },
    points(){
      let type = this.line.type;
      let bPos = this.line.begin.pos;
      let ePos = this.line.end.pos;
      let path = "";
      let points = this.linePoints();
      //console.log(points);
      if(!points) return "";
      for(let i = 0; i < points.length; ++i){
        path += points[i].x + "," +points[i].y + " ";
      }
      //console.log(path);
      return path;

    },
    fromUpToTopLeft(){
      let points = [];
      points.push({x:0, y:0});
      points.push({x:0, y:this.size.height/2.0});
      points.push({x:this.size.width, y:this.size.height/2.0});
      points.push({x:this.size.width, y:this.size.height});
      return points;
    },
    fromUpToTopRight(){
      let points = [];
      points.push({x:0, y:this.size.height});
      points.push({x:0, y:this.size.height/2.0});
      points.push({x:this.size.width, y:this.size.height/2.0});
      points.push({x:this.size.width, y:0});
      return points;
    },
    fromUpToBottomLeft(){
      let points = [];
      points.push({x:this.size.width, y:0});
      points.push({x:this.size.width, y:-10});
      points.push({x:this.size.width/2.0, y:-10});
      points.push({x:this.size.width/2.0, y:this.size.height+10});
      points.push({x:0, y:this.size.height+10});
      points.push({x:0, y:this.size.height});
      return points;
    },
    fromUpToBottomRight(){
      let points = [];
      points.push({x:0, y:0});
      points.push({x:0, y:-10});
      points.push({x:this.size.width/2.0, y:-10});
      points.push({x:this.size.width/2.0, y:this.size.height+10});
      points.push({x:this.size.width, y:this.size.height+10});
      points.push({x:this.size.width, y:this.size.height});
      return points;
    },
    fromDownToTopLeft(){
      let points = [];
      points.push({x:0, y:0});
      points.push({x:0, y:-10});
      points.push({x:this.size.width/2.0, y:-10});
      points.push({x:this.size.width/2.0, y:this.size.height+10});
      points.push({x:this.size.width, y:this.size.height+10});
      points.push({x:this.size.width, y:this.size.height});
      return points;
    },
    fromDownToTopRight(){
      let points = [];
      points.push({x:0, y:this.size.height});
      points.push({x:0, y:this.size.height+10});
      points.push({x:this.size.width/2.0, y:this.size.height+10});
      points.push({x:this.size.width/2.0, y:-10});
      points.push({x:this.size.width, y:-10});
      points.push({x:this.size.width, y:0});
      return points;
    },
    fromDownToBottomLeft(){
      let points = [];
      points.push({x:this.size.width, y:0});
      points.push({x:this.size.width, y:this.size.height/2.0});
      points.push({x:0, y:this.size.height/2.0});
      points.push({x:0, y:this.size.height});
      return points;
    },
    fromDownToBottomRight(){
      let points = [];
      points.push({x:0, y:0});
      points.push({x:0, y:this.size.height/2.0});
      points.push({x:this.size.width, y:this.size.height/2.0});
      points.push({x:this.size.width, y:this.size.height});
      return points;
    },

  },
  props:{
    line:Object,
    dataKey:String,
  },
  methods:{

    linePoints(){
      let type = this.line.begin.type;
      let begin = this.line.begin;
      let end = this.line.end;
      //如果是up连接点
      if(type === "up"){
        //如果在左上
        if(end.posX <= begin.posX && end.posY <= begin.posY){
          return this.fromUpToTopLeft;
        }
        //如果是右上
        else if(end.posX > begin.posX && end.posY <= begin.posY){
          return this.fromUpToTopRight;
        }
        //如果在左下
        else if(end.posX <= begin.posX && end.posY > begin.posY){
          return this.fromUpToBottomLeft;
        }
        //如果在右下
        else if(end.posX > begin.posX && end.posY > begin.posY){
          return this.fromUpToBottomRight;
        }
      }
      //如果是down连接点
      else{
        //如果在左上
        if(end.posX <= begin.posX && end.posY <= begin.posY){
          return this.fromDownToTopLeft;
        }
        //如果是右上
        else if(end.posX > begin.posX && end.posY <= begin.posY){
          return this.fromDownToTopRight;
        }
        //如果在左下
        else if(end.posX <= begin.posX && end.posY > begin.posY){
          return this.fromDownToBottomLeft;
        }
        //如果在右下
        else if(end.posX > begin.posX && end.posY > begin.posY){
          return this.fromDownToBottomRight;
        }
      }

    },


  },
}
</script>

<style scoped>
.line{
  overflow:visible;
  pointer-events: none;
}
</style>
