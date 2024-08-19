import {g} from "../../../js/structure/gContext.js"
import viewOPController from "../../../js/controller/viewOPController.js";

export function renderModeVm() {
    new Vue({
        el: '#renderMode',
        data: {
            // gContext: gContext,
            // doorModelList: g.gContext.doorModelList,
            // eventModelList: g.gContext.eventModelList,
            // criterionImgList:g.gContext.criterionImgList,
            openID: true,
            openID2: true,
            statusData:g.gContext.statusData,
            failureComputedData: g.gContext.failureComputedData, //失效计算相关数据
        },
        components: {},
        computed: {},
        methods: {
            //渲染模式切换
            changeComputedRenderID(newVal) {
                console.log(newVal);
                if (newVal) {
                    viewOPController.calculationResultsRenderWave();
                    console.log('1');
                } else {
                    viewOPController.calculationResultsRenderRemoveWave();
                    console.log('2');
                }
            },
            //渲染结果筛选
            screenRenderChange(val) {
                let flag = this.failureComputedData.computedRenderList.indexOf(val);
                // let filterList = ['notFlash','yellowFlash','orangeFlash','redFlash','greyFlash'];
                if(flag != -1){
                    this.failureComputedData.computedRenderList.splice(flag,1);
                } else {
                    this.failureComputedData.computedRenderList.push(val);
                }
                //此处调函数
                viewOPController.filterResultsRender();
            },
            open(){
                this.openID = true;
                setTimeout(() => {
                    this.openID2 = true
                },400);
            },
            //切换视图模式
            modeSwitching(id) {
                g.gContext.statusData.modeID = id;
                if (id == 2) {
                    g.gContext.rootPosition.show = false;
                    viewOPController.hideMainSVG();
                } else {
                    g.gContext.rootPosition.show = true;
                    viewOPController.showMainSVG();
                }
            },
        }
    })
}