import {g} from "../../../js/structure/gContext.js"
// import gContextController from "../../../js/controller/gContextController.js"
// import nodesOPController from "../../../js/controller/nodesOPController.js";
// import viewOPController from "../../../js/controller/viewOPController.js";

export function hiddenPopoverVm() {
    new Vue({
        el: '#hiddenPopover',
        data: {
            hiddenPopoverData: g.gContext.hiddenPopoverData,
            svgCanvas:g.gContext.svgCanvas,
            isCompute:true
        },
        created(){
            console.log(this.svgCanvas._zoom);
        },
        computed:{
            contentName(){
                if(this.hiddenPopoverData.data){
                    if (this.hiddenPopoverData.data.name){
                        return this.hiddenPopoverData.data.name;
                    } else {
                        return '暂无';
                    }

                } else {
                    return '暂无';
                }
            },
            // zoom(){
            //     return this.svgCanvas._zoom;
            // }
        },
    });
}