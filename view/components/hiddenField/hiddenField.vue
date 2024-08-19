<template>
  <!--    隐藏域    -->
  <div v-if="gContext.newSVGNode && gContext.mouseCurrentLocation !== gContext.MouseLocation.CANVAS"
       :style="{'left':gContext.newSVGNode.pos.x+'px','top':gContext.newSVGNode.pos.y+'px'}"
        class="new-svg-node">
    <svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" :width="gContext.newSVGNode.size.width"
          :height="gContext.newSVGNode.size.height" :opacity="0.3">
      <use :xlink:href="'#'+gContext.newSVGNode.type"></use>
    </svg>
  </div>
</template>

<script>
import {g} from "@/structure/gContext";
export default {
  data(){
    return {
      gContext: g.gContext,
    }
  },

}
</script>

<style scoped>
  .new-svg-node{
    position:absolute;
    z-index: 99;
    pointer-events:none;
  }
</style>
