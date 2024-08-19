import {g} from "../../../js/structure/gContext.js"
import viewOPController from "../../../js/controller/viewOPController.js";

export function timelineVm() {
    new Vue({
        el: '#timeline',
        data: {
            width: 0,
            statusData: g.gContext.statusData,
            resultList: g.gContext.computeResult,
            failureComputedData: g.gContext.failureComputedData,
            timeIndex: 2,
            startTime: 0,
            nowTime: 505,
            interval: 10,    //时间轴单位时间间隔
            timeData: null,
            item_width: 150
        },
        components: {},
        watch: {
            isShowTimeline(newVal) {
                if (newVal) {
                    document.getElementById("drawingBoard").style.paddingBottom = "58px";
                    console.log('des');
                    this.width = 0;
                    this.statusData = g.gContext.statusData;
                    this.resultList = g.gContext.computeResult;
                    this.failureComputedData = g.gContext.failureComputedData;
                    this.timeIndex = 2;
                    this.startTime = 0;
                    this.nowTime = 505;
                    this.interval = 10;    //时间轴单位时间间隔
                    this.timeData = null;
                    this.item_width = 150;
                } else {
                    document.getElementById("drawingBoard").style.paddingBottom = "0px";
                }
            },
            isShowModel() {
                setTimeout(() => {
                    this.width = document.getElementById("content").clientWidth;
                }, 550);
            },
            // isShowProperty() {
            //     setTimeout(() => {
            //         this.width = document.getElementById("content").clientWidth;
            //     }, 550);
            // },
            resultList(newVal) {
                this.timeIndex = g.gContext.computeResult[g.gContext.computeResult.length - 1].time;
                // let intervalTotal = Math.ceil( this.timelineInterval / this.interval);
                let timeData = {};
                // console.log(intervalTotal);
                for (let i = 0; i < this.intervalTotal; i++) {
                    timeData[i * this.interval] = [];
                }
                // console.log(timeData);
                for (let i = 0; i < g.gContext.computeResult.length; i++) {
                    let time = Math.ceil((g.gContext.computeResult[i].timeStamp - this.failureComputedData.startTimeStamp) / 1000.0);
                    let key = 0;
                    for (let j = 0; j < this.intervalTotal; j++) {
                        if ((time >= (j * this.interval)) && (time < ((j + 1) * this.interval))) {
                            key = j * this.interval;
                        }
                    }
                    // let key = Math.ceil((g.gContext.computeResult[i].timeStamp - this.failureComputedData.startTimeStamp) / 1000.0);
                    let position = Math.ceil((g.gContext.computeResult[i].timeStamp - this.failureComputedData.startTimeStamp) / 1000.0) % this.interval / this.interval * 100 + '%';
                    g.gContext.computeResult[i].position = position;
                    g.gContext.computeResult[i].times = Math.ceil((g.gContext.computeResult[i].timeStamp - this.failureComputedData.startTimeStamp) / 1000.0);
                    timeData[key].push(g.gContext.computeResult[i]);
                }
                this.timeData = timeData;
            }
        },
        computed: {
            isShowTimeline() {
                return this.statusData.isShowTimeline;
            },
            isShowModel() {
                return this.statusData.isShowModel;
            },
            isShowProperty() {
                return this.statusData.isShowProperty;
            },
            timelineWidth() {
                // let width = 500 * (this.resultList.length + 1);
                // if (this.width < width){
                //     return width;
                // } else {
                //     return this.width;
                // }
                let width = this.item_width * this.intervalTotal;
                if (this.width < width) {
                    return width;
                } else {
                    return this.width;
                }
            },
            itemWidth() {
                return this.item_width + 'px';

                // let width = (this.width * 1.0) / this.intervalTotal;
                // if (width < this.item_width){
                //     return this.item_width + 'px';
                // } else {
                //     return 1.0 / (this.intervalTotal) * 100 + '%';
                // }
                // return this.item_width + 'px';
            },
            //时间轴总单位个数
            intervalTotal() {
                if (this.resultList.length > 0) {
                    if (Math.ceil((this.resultList[this.resultList.length - 1].timeStamp - this.failureComputedData.startTimeStamp) / 1000 / this.interval) > 10) {
                        return Math.ceil((this.resultList[this.resultList.length - 1].timeStamp - this.failureComputedData.startTimeStamp) / 1000 / this.interval);
                    } else {
                        return 10;
                    }
                } else {
                    return 10;
                }
            },
        },
        updated() {
            let container = $('#timeline');
            let scrollTo = $('.timeline-content-item-model-active');
            if (scrollTo.offset()) {
                container.animate({
                    scrollLeft: scrollTo.offset().left - container.offset().left + container.scrollLeft()
                });
            }
        },
        mounted() {
            // this.kk();
            if (this.isShowTimeline) {
                document.getElementById("drawingBoard").style.paddingBottom = "58px";
            } else {
                document.getElementById("drawingBoard").style.paddingBottom = "0px";
            }
            this.width = document.getElementById("drawingBoard").clientWidth;
            window.onresize = () => {
                this.width = document.getElementById("drawingBoard").clientWidth;

            };
        },
        beforeDestroy() {
            console.log('des');
            this.width = 0;
            this.statusData = g.gContext.statusData;
            this.resultList = g.gContext.computeResult;
            this.failureComputedData = g.gContext.failureComputedData;
            this.timeIndex = 2;
            this.startTime = 0;
            this.nowTime = 505;
            this.interval = 10;    //时间轴单位时间间隔
            this.timeData = null;
            this.item_width = 150;
        },
        methods: {
            changeActive(index, result) {
                g.gContext.failureComputedData.timeStamp = index;
                g.gContext.failureComputedData.result = result;
                // viewOPController.calculationResultsRenderRemove();
                viewOPController.calculationResultsRenderWave();
            },
            kk() {
                let intervalTotal = Math.ceil((this.nowTime - this.startTime) / this.interval);
                let timeData = {};
                // console.log(intervalTotal);
                for (let i = 0; i < intervalTotal; i++) {
                    timeData[(i + 1) * this.interval] = [];
                }
                this.timeData = timeData;
                // console.log(timeData);
            }
        }
    });
}
