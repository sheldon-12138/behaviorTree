import {g} from "../../../js/structure/gContext.js"
import gContextController from "../../../js/controller/gContextController.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";
import viewOPController from "../../../js/controller/viewOPController.js";

export function hierarchyBarVm() {
    new Vue({
        el: '#hierarchyBar',
        data: {
            openID2: true,
            currentID: 1,
            visible: false,
            statusData: g.gContext.statusData,
            // treeData: g.gContext.entityTree,
            attrData: g.gContext.attrData,
            svgData: g.gContext.svgCanvas,
            left: '8px',
            bottomAmount:g.gContext.bottomAmount,//全局信息
            scroll:0,
            isShow:false,
        },
        mounted(){
            // setTimeout(() => {
            //     console.log(document.getElementById("content").offsetHeight,document.getElementById("content").scrollHeight);
            //     this.left = document.getElementById("content").offsetWidth + document.getElementById("content").scrollLeft - 15 - 8 + 'px';
                document.getElementById("content").addEventListener("scroll",this.offsetLeft);
            // },500)
        },
        watch: {
            svgSize() {

                setTimeout(() => {
                    if (document.getElementById("content").scrollHeight > document.getElementById("content").clientHeight) {
                        this.left = document.getElementById("content").offsetWidth + document.getElementById("content").scrollLeft - 15 - 8 + 'px';
                    } else {
                        this.left = document.getElementById("content").offsetWidth + document.getElementById("content").scrollLeft - 15 + 'px';
                    }
                    // this.isShow = true;
                },100);

            },
            treeData() {
                //console.log('1');
            },


        },
        computed: {
            svgSize() {
                console.log(document.getElementById("content").offsetHeight,document.getElementById("content").scrollHeight);
                return g.gContext.svgCanvas._size;
            },
            treeData(){
                //return g.gContext.entityTree.treeData;
            },
            amountLayerNum(){
                return this.bottomAmount.amountLayerNum;
            },
            // offsetLeft(){
            //     console.log(document.getElementById("content").scrollLeft);
            //     return document.getElementById("content").scrollLeft;
            // },
        },
        methods: {
            offsetLeft(){
                console.log(document.getElementById("content").scrollLeft);

                this.left = document.getElementById("content").offsetWidth + document.getElementById("content").scrollLeft - 15 - 8 + 'px';
                // return document.getElementById("content").offsetLeft;
            },
            // kk(){
            //     for (let key in g.gContext.doorEntityMap){
            //         gContextController.foldNode(g.gContext.doorEntityMap[key]);
            //         break;
            //     }
            // },
            // kkl(){
            //     for (let key in g.gContext.doorEntityMap){
            //         gContextController.unfoldNode(g.gContext.doorEntityMap[key]);
            //         break;
            //     }
            // }
            foldEntity(item){
                console.log(item);

                if(!item.fold){
                    for (let key in item.data){
                        gContextController.foldNodeById(item.data[key]);
                    }
                }
                else{
                    for (let key in item.data){
                        gContextController.unfoldNodeById(item.data[key]);
                    }
                }
                item.fold = !item.fold;
            }
        }
    });
}
