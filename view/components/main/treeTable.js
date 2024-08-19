import {g} from "../../../js/structure/gContext.js";
import gContextController from "../../../js/controller/gContextController.js";
export function treeTableVm() {
    new Vue({
        el: '#treeTable',
        data: {
            statusData: g.gContext.statusData,
            treeTableData: g.gContext.entityTree,
            tableHeight: 1000,  //表的总高度
            propColor:{
                1: [
                    "#3CFF00", "#890101"
                ],
                2: [
                    "#3CFF00", "#FFC080", "#890101"
                ],
                3: [
                    "#3CFF00", "#FFFF00", "#FFC080", "#890101"
                ],
                4: [
                    "#3CFF00","#FFFF00", "#FFC080", "#FF0000", "#890101"
                ],
            }
        },
        computed: {
            modeID() {
                return g.gContext.statusData.modeID
            }
        },
        created() {
            this.tableHeight = document.body.clientHeight - 100;
            window.addEventListener('resize', this.setTableHeight);
            console.log(this.treeTableData);
        },
        methods: {
            //根据窗口大小设置表的高度
            setTableHeight() {
                this.tableHeight = document.body.clientHeight - 100;
            },
            //计算表每一列的总数
            getSummaries(param) {
                let criterionData = {
                    overpressure: 0, //超压
                    impulse: 0,  //冲量
                    quasiStaticCompression: 0, //准静压
                    DC_FragmentNumberAndKineticEnergy: 0, //破片数量
                    fragmentKineticEnergy: 0,  //破片动能
                    fragmentMomentum: 0, //破片动量
                    penetrationRange: 0, //侵彻距离
                    penetrationDepth: 0, //侵彻法向深度
                    penetrationVolume: 0,  //侵彻开坑体积
                    displacement: 0, //位移
                    velocity: 0, //速度
                    acceleration: 0, //加速度
                    deflectionSpanRatio: 0,  //挠跨比
                    damagedArea: 0,  //破口面积
                    overallLongitudinalStrength: 0,  //总纵强度
                    heatFlux: 0, //热通量
                    shockFactor: 0,  //冲击因子
                    inlet: 0,  //进水
                    DC_PI: 0, //PI
                };
                for (let key in g.gContext.eventEntityMap) {
                    if (g.gContext.eventEntityMap[key].category == 'event') {
                        for (let key2 in g.gContext.eventEntityMap[key].criterions){
                            if (g.gContext.eventEntityMap[key].criterions[key2]){
                                if (g.gContext.eventEntityMap[key].criterions[key2].actived){
                                    // console.log(key2);
                                    criterionData[key2]++;
                                }
                            }
                        }
                    }
                }
                // console.log(criterionData);
                let totalList = ['总计'];
                for(let k in criterionData){
                    totalList.push(criterionData[k]);
                }
                let totalNum = 0;
                for (let i = 1;i < totalList.length;i++){
                    totalNum +=totalList[i];
                }
                totalList.push(totalNum);
                return totalList;
                // return ['总计', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            },
            //点击单元格选中对应节点
            rowClick(row) {
                gContextController.focusEntityByID(row.id);
            },
            rowTotal(data) {
                let total = 0;
                for (let key in data) {
                    if (data[key].actived) {
                        total++;
                    }
                }
                return total;
            },
            //点击单元格
            cellClick(row, column, cell, event){
                if(row.data.category=='event'){
                    if(column.columnKey){
                        let title = column.columnKey;
                        if(title == g.gContext.chartData.DC_type){
                            if(g.gContext.chartData.DC_goods_type == row.data.criterions[title].value){
                                g.gContext.chartData.drawerID = false;
                                g.gContext.chartData.DC_type = null;
                            } else {
                                g.gContext.chartData.drawerID = false;
                                setTimeout(()=>{
                                    g.gContext.chartData.DC_type = title;
                                    g.gContext.chartData.DC_goods_type = row.data.criterions[title].value;
                                    g.gContext.chartData.drawerID = true;
                                },10);
                            }
                        } else {
                            if(g.gContext.chartData.DC_type == null){
                                g.gContext.chartData.DC_type = title;
                                g.gContext.chartData.DC_goods_type = row.data.criterions[title].value;
                                g.gContext.chartData.drawerID = true;
                            } else {
                                g.gContext.chartData.drawerID = false;
                                setTimeout(()=>{
                                    g.gContext.chartData.DC_type = title;
                                    g.gContext.chartData.DC_goods_type = row.data.criterions[title].value;
                                    g.gContext.chartData.drawerID = true;
                                },10);
                            }
                        }
                    }
                }

                console.log(column.columnKey);
                // console.log(row, column, cell);
            }
        }
    })
}
