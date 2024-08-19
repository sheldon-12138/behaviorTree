<template>
  <svg v-show="marquee.show" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" :width="marquee.size.width"
       :height="marquee.size.height" :x="marquee.pos.x" :y="marquee.pos.y" class="marquee">
<!--    <g :width="marquee.size.width" :height="marquee.size.height" v-show="marquee.show" :transform="'translate('+marquee.pos.x +','+marquee.pos.y+')'">-->

    <rect x="0" y="0"  :width="marquee.size.width" :height="marquee.size.height"/>
  </svg>
<!--&lt;!&ndash;  </g>&ndash;&gt;-->
<!--  <div v-show="marquee.show" class="marquee" :style="{width:marquee.size.width+'px', height:marquee.size.height+'px',transform:'translate('+marquee.pos.x +','+marquee.pos.y+')'}">-->

<!--  </div>-->

</template>

<script>
import { mapState } from "vuex";
export default {
  data(){
    return {

    }
  },
  computed:{
    ...mapState(['gContext']),
    marquee(){
      return this.gContext.marquee;
    }
  },
  methods:{

  }
}
</script>

<style scoped>
.marquee{
  pointer-events: none;
  fill:deepskyblue;
  stroke:midnightblue;
  stroke-width:2;
  fill-opacity: 0.3;
  stroke-opacity: 0.6;
  /*background-color: #00bfff;*/
  /*opacity: 0.3;*/
  /*position:relative;*/

}
</style>
