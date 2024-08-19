<template>
  <svg xmlns="http://www.w3.org/2000/svg" :x="item.pos.x" :y="item.pos.y" class="node" :data-key="dataKey" :class="{'hide':!item.show}" >
    <rect v-show="nodeActived" x="0" y="0" :width="item.size.width" :height="item.size.height" class="nodeActived"></rect>
<!--  <g  :transform="'translate('+item.pos.x +','+item.pos.y+')'" :height="item.size.height" :width="item.size.width" class="node" :data-key="dataKey" :class="{'hide':!item.show}">-->
    <circle v-show="item.hasUpNodes" r="4" :cx="item.size.width/2.0" :cy="item.level ? -8 : -4" class="connection" data-class="conn-up" :data-key="dataKey"></circle>
    <g v-show="item.level"  y="-4" x="0" :width="item.size.width" height="4" :data-key="dataKey">
      <template v-for="(prob, index) in probList">
        <rect :x="prob.posX" y="0" :width="prob.width" height="4" fill="blue" :key="index"/>
      </template>
    </g>
    <slot name="pic"></slot>
    <circle v-show="item.hasDownNodes" r="4" :cx="item.size.width/2.0" :cy="item.size.height+4" class="connection" data-class="conn-down" :data-key="dataKey"></circle>
  </svg>
<!--  </g>-->
</template>

<script>

export default {

  data(){
    return {

    }
  },
  computed:{
    probList(){
      if(!this.item.level) return [];
      let list = [];
      let currentPos = 0;
      for(let i = 0; i < this.item.probability.length; ++i){
        list.push({posX:currentPos, width:this.item.probability[i] * this.item.size.width});
        currentPos += this.item.probability[i] * this.item.size.width;
      }
      return list;
    },

  },
  props:{
    item: Object,
    dataKey:String,
    dataType:String,
    nodeActived:Boolean,
  },
  watch:{

  },
}
</script>

<style scoped>
.node{
  overflow:visible;
  pointer-events: none;
  width: 64px;
  height: 64px;
}
.connection{
  fill:white;
  opacity: 0.3;
  stroke-width:1;
  stroke:deepskyblue;
  pointer-events: auto;

}
.hide{
  display: none;
  fill:red;
}
.pic{
  pointer-events: auto;
}
.nodeActived{
  fill:none;
  stroke-width:1;
  stroke:red;
}

</style>
<style lang="less">

</style>
