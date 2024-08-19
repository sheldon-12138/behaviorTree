import {g} from "../../../js/structure/gContext.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";

export function chartVm() {
    new Vue({
        el: '#chart',
        data: {
            chartShow:true,
            myChart: null,
            chartData: g.gContext.chartData,
            chartOption: {
                legend: {
                    data: ['曲线1', '曲线2'],
                    top:'10%'
                },
                tooltip: {
                    trigger: 'axis',
                },
                toolbox: {
                    show: false,
                },

                grid: {
                    top: 70,
                    bottom: 50
                },
                dataZoom: {
                    // start: 80,
                    type: "inside"
                },
                xAxis: {
                    type: 'value',
                    // name: '冲量',
                    boundaryGap: ['0', '5%'],
                    // axisLine:{
                    //     symbol:['none', 'arrow'],
                    //     symbolSize:[6, 8],
                    //     symbolOffset:[0,7]
                    // },
                    axisTick:{
                        inside:true
                    },
                    axisLabel:{
                        overflow:'breakAll',
                        fontSize:8,
                    },
                    minorTick:{
                        show:true,
                        length:2,
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisPointer: {
                        show:true,
                        snap:false
                    },
                    scale: true
                },
                yAxis: {
                    // name: '压力',
                    type: 'value',
                    boundaryGap: ['0', '5%'],
                    // axisLine:{
                    //     symbol:['none', 'arrow'],
                    //     symbolSize:[5, 8],
                    //     symbolOffset:[0,6]
                    // },
                    axisTick:{
                        inside:true
                    },
                    axisLabel:{
                        overflow:'breakAll',
                        fontSize:8,
                    },
                    minorTick:{
                        show:true,
                        length:3,
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisPointer: {
                        show:true,
                        snap:false
                    },
                    scale: true
                },
                series: [{
                    name: '曲线1',
                    data: [
                        [0.99, 4],
                        [1.11, 9],
                        [1.21, 18],
                        [1.32, 40],
                        [1.53, 71],
                        [1.74, 88],
                        [1.85, 55],
                        [1.96, 32],
                        [2.07, 9],
                        [2.38, 0.2]
                    ],
                    type: 'line',
                    smooth: true,
                    symbol:'emptyCircle',
                    symbolSize: 4,
                    lineStyle: {
                        width: 2,
                    },
                    itemStyle: {
                        color: "#5470c6",

                    },
                    // selectedMode: true
                    // showSymbol: false,
                    // barGap: 0
                },
                {
                    name: '曲线2',
                    data: [
                        [0.98, 1],
                        [1.3, 6],
                        [1.41, 27],
                        [1.62, 45],
                        [1.73, 52],
                        [1.84, 85],
                        [2.05, 47],
                        [2.16, 18],
                        [2.37, 6],
                        [2.38, 2]
                    ],
                    type: 'line',
                    smooth: true,
                    symbol:'emptyCircle',
                    symbolSize: 4,
                    lineStyle: {
                        width: 2,
                    },
                    itemStyle: {
                        color: "#91CC75",
                    },
                    // showSymbol:false,
                    // barGap: 0
                }
                ]
            },
            predefineColors: [
                '#ff4500',
                '#ff8c00',
                '#ffd700',
                '#90ee90',
                '#00ced1',
                '#1e90ff',
                '#c71585',
                'rgba(255, 69, 0, 0.68)',
                'rgb(255, 120, 0)',
                'hsv(51, 100, 98)',
                'hsva(120, 40, 94, 0.5)',
                'hsl(181, 100%, 37%)',
                'hsla(209, 100%, 56%, 0.73)',
                '#c7158577'
            ],
            shapeOption: ['emptyCircle','circle', 'rect', 'triangle', 'diamond', 'none'],
            DCDTypeList:[],    //当前判据线类型
            DCDType:null,   //判据线类型
            axisTypeList:[{value:'value',label:'均匀'},{value:'log',label:'对数'}],   //坐标轴类型
            XAxisType:'value',  //X轴类型
            YAxisType:'value',  //Y轴类型
            tableData:[],   //表格数据
            tableDataEdit:[],   //编辑模式表格数据
            activeTitle:[], //控制样式面板展开
            chartEditID:false,  //chart是否处于编辑模式
        },
        watch: {
            drawerID(newVal) {
                //打开图表弹窗
                if (newVal) {
                    setTimeout(() => {
                        this.initialization(true);
                        this.myChart = echarts.init(document.getElementById('chartContent'));
                        this.myChart.setOption(this.chartOption,true);
                    }, 100);
                }
            },
            XAxisType(newVal){
                this.chartOption.xAxis.type = newVal;
                this.myChart.setOption(this.chartOption,true);
            },
            YAxisType(newVal){
                this.chartOption.yAxis.type = newVal;
                this.myChart.setOption(this.chartOption,true);
            }
        },
        computed: {
            drawerID() {
                return g.gContext.chartData.drawerID;
            },
            DCDTypeName(){
                for (let i = 0;i < this.DCDTypeList.length;i++){
                    if(this.DCDTypeList[i].value == this.DCDType){
                        return this.DCDTypeList[i].label;
                    }
                }
            }
        },
        methods: {
            drawer() {
                this.chartOption.series[0].data = [
                    [0.99, 4],
                    [1.11, 9],
                    [1.21, 18],
                    [1.32, 40],
                ];
                this.myChart.setOption(this.chartOption,true);
            },
            formatTooltip(val) {
                return val / 10;
            },
            //初始化数据
            initialization(first) {
                // console.log(g.gContext.chartData);
                // console.log(g.gContext.criterionList);
                this.flag = null;
                this.DCDTypeList = [];
                this.chartOption.legend.data = [];
                this.chartOption.series = [];
                for(let i = 0;i < g.gContext.criterionList.length;i++){
                    if(g.gContext.criterionList[i].type == g.gContext.chartData.DC_type){
                        this.flag = i;
                        for (let key in g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type]){
                            this.DCDTypeList.push({
                                value:key,
                                label:g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type][key].name
                            });
                            // console.log(g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type]);
                        }
                        if(first){
                            this.DCDType = this.DCDTypeList[0].value;
                        }
                        this.tableData = g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type][this.DCDType].data;
                        // console.log(this.tableData);
                        for(let key2 in g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type][this.DCDType].data){
                            this.chartOption.legend.data.push('等级' + key2);
                            this.chartOption.series.push({
                                name: '等级' + key2,
                                data: g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type][this.DCDType].data[key2],
                                type: 'line',
                                smooth: true,
                                symbol:g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type][this.DCDType].style[key2].symbol,
                                symbolSize: g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type][this.DCDType].style[key2].symbolSize,
                                lineStyle: g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type][this.DCDType].style[key2].lineStyle,
                                itemStyle: g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type][this.DCDType].style[key2].itemStyle,
                                areaStyle: g.gContext.criterionList[i].chartList[g.gContext.chartData.DC_goods_type][this.DCDType].style[key2].areaStyle,
                                // showSymbol:false,
                                // barGap: 0
                            })
                            // this.tableData.push({
                            //
                            // })
                        }
                        if(this.DCDType == 'DCD_01'){
                            this.chartOption.yAxis.scale = false;
                        }
                    }
                }
                // console.log(this.chartOption);
                // console.log(this.DCDTypeList);
            },
            openEdit(){
                this.tableDataEdit = JSON.parse(JSON.stringify(this.tableData));
                setTimeout(()=> {
                    this.chartEditID = true;
                },50);
            },
            saveEdit(){
                this.tableData = JSON.parse(JSON.stringify(this.tableDataEdit));
                setTimeout(()=> {
                    this.chartEditID = false;
                },50);
            },
            //改变DCD类型
            changeDCDType(){
                this.initialization();
                console.log(this.chartOption);
                this.chartShow = false;
                this.myChart = null;
                this.chartShow = true;
                setTimeout(() => {
                    this.myChart = echarts.init(document.getElementById('chartContent'));
                    this.myChart.setOption(this.chartOption,true);
                },500)

                // for()
            },
            //关闭chart栏
            closeDrawer(){
                g.gContext.chartData.drawerID = false;
                g.gContext.chartData.DC_type = null;
            },
            //更新chart图
            setChart(type,index){
                console.log("kk")
                if (type){
                    if(type == 'lineSize'){
                        this.chartOption.series[index].symbolSize = this.chartOption.series[index].lineStyle.width * 2;
                        this.myChart.setOption(this.chartOption,true);
                    } else {
                        console.log(type);
                        this.myChart.setOption(this.chartOption,true);
                    }
                } else {
                    this.myChart.setOption(this.chartOption,true);
                }
            }
        }
    })
}