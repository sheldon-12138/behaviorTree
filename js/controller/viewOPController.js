import gContextDao from "../dao/gContextDao.js";
import dom from "../viewModel/dom.js";
import { EventEntity } from "../structure/entity.js";
import Model from "../structure/model.js";
import Line from "../structure/line.js";
import Utils from "../utils/utils.js";
import { g } from "../structure/gContext.js";
import nodesOPController from "./nodesOPController.js";


function hideMainSVG() {
    dom.query("#content").classList.add("hide");
    dom.query("#axis_x").classList.add("hide");
    dom.query("#axis_y").classList.add("hide");
    // dom.query("#marquee").classList.add("hide");
};

function showMainSVG() {
    dom.query("#content").classList.remove("hide");
    dom.query("#axis_x").classList.remove("hide");
    dom.query("#axis_y").classList.remove("hide");
    // dom.query("#marquee").classList.remove("hide");
};

function zoom(val) {
    let svgCanvas = gContextDao.getGContextProp("svgCanvas");
    svgCanvas.zoom = val;
};

function updateAmount(props) {
    let amount = gContextDao.getGContextProp("bottomAmount");
    let temp = {};
    for (let i = 0; i < props.length; ++i) {
        temp[props[i]] = 0;
    }
    let doorType = {};
    let criterionType = {};
    let traver = gContextDao.traverseNode();
    let node = traver.next();
    while (!node.done) {

        let value = node.value;
        // console.log(value)
        if (temp.hasOwnProperty("nodeNum")) {
            ++temp["nodeNum"];
        }
        if (temp.hasOwnProperty("maxLayer")) {
            temp["maxLayer"] = Math.max(temp["maxLayer"], value.layer);
            let num = [];
            temp["amountLayer"] = gContextDao.amountLayer(num);
            temp["amountLayerNum"] = num;
            //console.log(temp["amountLayerNum"]);
        }
        if (temp.hasOwnProperty("topNodeNum")) {
            if (value.modelType === "top_event")
                ++temp["topNodeNum"];
        }
        if (temp.hasOwnProperty("midNodeNum")) {
            if (value.modelType === "mediate_event")
                ++temp["midNodeNum"];
        }
        if (temp.hasOwnProperty("bottomNodeNum")) {
            if (value.modelType === "bottom_event")
                ++temp["bottomNodeNum"];
        }
        if (temp.hasOwnProperty("doorType")) {
            if (value.category === "door" && !doorType[value.modelType]) {
                ++temp["doorType"];
                doorType[value.modelType] = value.modelType;
            }
        }
        if (temp.hasOwnProperty("doorNum")) {
            if (value.category === "door")
                ++temp["doorNum"];
        }
        if (temp.hasOwnProperty("maxDamageLevel")) {
            if (value.category === "event")
                temp["maxDamageLevel"] = Math.max(temp["maxDamageLevel"], value.level);
        }
        if (temp.hasOwnProperty("criterionNum")) {
            if (value.modelType === "bottom_event" && value["criterions"]) {
                for (let key in value["criterions"]) {
                    if (value["criterions"][key].actived) ++temp["criterionNum"];
                    if (value["criterions"][key].actived && !criterionType[key]) {
                        ++temp["criterionTypeNum"];
                        criterionType[key] = key;
                    }
                }


            }
        }
        // if (temp.hasOwnProperty("criterionTypeNum")) {
        //     if (value.modelType === "bottom_event" && value["criterions"]) {
        //         for (let key in value["criterions"]) {
        //             if (value["criterions"][key].actived && !criterionType[key]) {
        //                 ++temp["criterionTypeNum"];
        //                 criterionType[key] = key;
        //             }
        //         }
        //     }
        // }
        if (props.indexOf("criterionRelevanceNum") !== -1) {

        }
        // console.log(node);

        node = traver.next();
    }
    amount = Object.assign(amount, temp);
    // console.log(amount);
};

function getZoom() {
    let canvas = gContextDao.getGContextProp("svgCanvas");
    return canvas.zoom;
}

//切换ftId的显隐
function toggleFtIdShow(show) {
    if (show) {
        dom.removeDomsClass("ft-id-text", "hide");
    } else {
        dom.addDomsClass("ft-id-text", "hide");
    }
}

//渲染失效计算结果
function calculationResultsRender() {
    g.gContext.failureComputedData.computedRenderID = true;
    let flash = [
        ['notFlash', 'greyFlash'],
        ['notFlash', 'orangeFlash', 'greyFlash'],
        ['notFlash', 'yellowFlash', 'redFlash', 'greyFlash'],
        ['notFlash', 'yellowFlash', 'orangeFlash', 'redFlash', 'greyFlash'],
    ];
    for (let key in g.gContext.failureComputedData.result) {
        g.gContext.failureComputedData.result[key].flash = null;
        let id = gContextDao.findEntityByFtID(g.gContext.failureComputedData.result[key].ftID).id;
        for (let item in flash[3]) {
            //document.getElementById(id).getElementsByTagName("use")[0].classList.remove(flash[3][item]);
            document.getElementById(id).getElementsByClassName("pic")[0].classList.remove(flash[3][item]);
        }
        let max_flag = 0;
        for (let i = 1; i < g.gContext.failureComputedData.result[key].probability.length; i++) {
            // console.log(typeof (g.gContext.failureComputedData.result[key].probability[i]));
            if (g.gContext.failureComputedData.result[key].probability[max_flag] - g.gContext.failureComputedData.result[key].probability[i] < 0) {
                max_flag = i;
            }
        }
        //document.getElementById(id).getElementsByTagName("use")[0].classList.add(flash[g.gContext.failureComputedData.result[key].level-1][max_flag]);
        document.getElementById(id).getElementsByClassName("pic")[0].classList.add(flash[g.gContext.failureComputedData.result[key].level - 1][max_flag]);
        g.gContext.failureComputedData.result[key].flash = flash[g.gContext.failureComputedData.result[key].level - 1][max_flag];
    }
    console.log('yes')
}
function calculationResultsRenderWave() {
    g.gContext.failureComputedData.computedRenderID = true;
    let flash = [
        ['notWave', 'crimsonWave'],
        ['notWave', 'orangeWave', 'crimsonWave'],
        ['notWave', 'yellowWave', 'orangeWave', 'crimsonWave'],
        ['notWave', 'yellowWave', 'orangeWave', 'redWave', 'crimsonWave'],
    ];
    for (let key in g.gContext.failureComputedData.result) {
        g.gContext.failureComputedData.result[key].flash = null;
        // let id = gContextDao.findEntityByFtID(g.gContext.failureComputedData.result[key].ftID).id;
        let e = gContextDao.findEntityByFtID(g.gContext.failureComputedData.result[key].ftID);
        if (e.modelType === "standard_event" || e.modelType === "effect_event") continue;
        let id = e.id;
        for (let item in flash[3]) {
            //document.getElementById(id).getElementsByTagName("use")[0].classList.remove(flash[3][item]);
            document.getElementById(id).getElementsByClassName("filter-dom")[0].classList.remove(flash[3][item]);
        }
        let max_flag = 0;
        for (let i = 1; i < g.gContext.failureComputedData.result[key].probability.length; i++) {
            // console.log(typeof (g.gContext.failureComputedData.result[key].probability[i]));
            if (g.gContext.failureComputedData.result[key].probability[max_flag] - g.gContext.failureComputedData.result[key].probability[i] < 0) {
                max_flag = i;
            }
        }
        //document.getElementById(id).getElementsByTagName("use")[0].classList.add(flash[g.gContext.failureComputedData.result[key].level-1][max_flag]);
        document.getElementById(id).getElementsByClassName("filter-dom")[0].classList.add(flash[g.gContext.failureComputedData.result[key].level - 1][max_flag]);
        g.gContext.failureComputedData.result[key].flash = flash[g.gContext.failureComputedData.result[key].level - 1][max_flag];
    }
}
// function calculationResultsRender2(data) {
//     g.gContext.failureComputedData.computedRenderID = true;
//     let flash = [
//         ['notFlash','greyFlash'],
//         ['notFlash','orangeFlash','greyFlash'],
//         ['notFlash','yellowFlash','redFlash','greyFlash'],
//         ['notFlash','yellowFlash','orangeFlash','redFlash','greyFlash'],
//     ];
//     for (let key in g.gContext.failureComputedData.result){
//         g.gContext.failureComputedData.result[key].flash = null;
//         let id = gContextDao.findEntityByFtID(g.gContext.failureComputedData.result[key].ftID).id;
//         for (let item in flash[3]){
//             //document.getElementById(id).getElementsByTagName("use")[0].classList.remove(flash[3][item]);
//             document.getElementById(id).getElementsByClassName("pic")[0].classList.remove(flash[3][item]);
//         }
//     }
//     for (let i in data){
//         let id = gContextDao.findEntityByFtID(data[i].ftID).id;
//         //document.getElementById(id).getElementsByTagName("use")[0].classList.add(data[i].flash);
//         document.getElementById(id).getElementsByClassName("pic")[0].classList.add(data[i].flash);
//     }
//
//     // console.log('yes')
// }
//移除计算渲染效果
//移除计算结果的渲染效果
function calculationResultsRenderRemove() {
    g.gContext.failureComputedData.computedRenderID = false;
    let flash = [
        ['notFlash', 'greyFlash'],
        ['notFlash', 'orangeFlash', 'greyFlash'],
        ['notFlash', 'yellowFlash', 'redFlash', 'greyFlash'],
        ['notFlash', 'yellowFlash', 'orangeFlash', 'redFlash', 'greyFlash'],
    ];
    for (let key in g.gContext.failureComputedData.result) {
        g.gContext.failureComputedData.result[key].flash = null;
        let id = gContextDao.findEntityByFtID(g.gContext.failureComputedData.result[key].ftID).id;
        for (let item in flash[3]) {
            //document.getElementById(id).getElementsByTagName("use")[0].classList.remove(flash[3][item]);
            document.getElementById(id).getElementsByClassName("pic")[0].classList.remove(flash[3][item]);
        }
    }
}
function calculationResultsRenderRemoveWave() {
    g.gContext.failureComputedData.computedRenderID = false;
    console.log('remove')
    let flash = [
        ['notWave', 'crimsonWave'],
        ['notWave', 'orangeWave', 'crimsonWave'],
        ['notWave', 'yellowWave', 'orangeWave', 'crimsonWave'],
        ['notWave', 'yellowWave', 'orangeWave', 'redWave', 'crimsonWave'],
    ];
    for (let key in g.gContext.failureComputedData.result) {
        g.gContext.failureComputedData.result[key].flash = null;
        let id = gContextDao.findEntityByFtID(g.gContext.failureComputedData.result[key].ftID).id;
        for (let item in flash[3]) {
            //document.getElementById(id).getElementsByTagName("use")[0].classList.remove(flash[3][item]);
            // document.getElementById(id).getElementsByClassName("pic")[0].classList.remove(flash[3][item]);
            document.getElementById(id).getElementsByClassName("filter-dom")[0].classList.remove(flash[3][item]);

        }
    }
}
//筛选渲染结果
function filterResultsRender() {
    let failureComputedData = gContextDao.getGContextProp("failureComputedData");
    let computeList = failureComputedData.computedRenderList;
    //let filterList = ['notFlash', 'yellowFlash', 'orangeFlash', 'redFlash', 'greyFlash'];
    let filterList = ['notWave', 'yellowWave', 'orangeWave', 'redWave', 'crimsonWave'];
    for (let i = 0, len = filterList.length; i < len; ++i) {
        let filter_name = filterList[i];
        let doms = dom.queryAll("." + filter_name);
        if (doms) {
            for (let j = 0; j < doms.length; ++j) {
                let entity = gContextDao.findEntity(doms[j].getAttribute("data-key"));
                if (entity && entity.downEntity.length <= 0 && entity.modelType === "bottom_event") {
                    if (computeList.includes(filter_name)) {
                        if (entity.dom.classList.contains("node-render")) {
                            entity.dom.classList.remove("node-render");
                            for (let k = 0, lenD = entity.upEntity.length; k < lenD; ++k) {
                                let id1 = entity.id + "-" + entity.upEntity[k];
                                let id2 = entity.upEntity[k] + "-" + entity.id;
                                let lineDom = dom.doc.getElementById(id1) || dom.doc.getElementById(id2);
                                dom.removeClassByDOM(lineDom, "node-render");
                            }
                        }
                    } else if (!entity.dom.classList.contains("node-fold")) {
                        entity.dom.classList.add("node-render");
                        for (let k = 0, lenD = entity.upEntity.length; k < lenD; ++k) {
                            let id1 = entity.id + "-" + entity.upEntity[k];
                            let id2 = entity.upEntity[k] + "-" + entity.id;
                            let lineDom = dom.doc.getElementById(id1) || dom.doc.getElementById(id2);
                            dom.addClassByDOM(lineDom, "node-render");
                        }
                    }
                }
            }
        }
    }
    // nodesOPController.nodeLayout();
}

// function ActivedisEmpty(){
//     let activedMap = gContextDao.getGContextProp("activedEntityMap");
//     return Object.keys(activedMap).length <= 0;
// }
//更新操作状态
function updateOperationStatus() {
    let activedMap = gContextDao.getGContextProp("activedEntityMap");
    let copyList = gContextDao.getGContextProp("copyList");
    let activedLine = gContextDao.getGContextProp("activedLine");
    let statusData = gContextDao.getGContextProp("statusData");
    statusData.operation_copy_delete = (!statusData.isCompute) && ((Object.keys(activedMap).length > 0) || !!(activedLine));
    statusData.operation_paste = (!statusData.isCompute) && (Object.keys(copyList).length > 0);
    statusData.autoLayoutMode = false;
}

function updateResult() {
}

function updateCanvasAxis(val) {
    let axis = gContextDao.getGContextProp("axis");
    axis.axis_x.canvas_x = val.x;
    axis.axis_y.canvas_y = val.y;
}

function updateCanvasHeight(h) {
    let publish = gContextDao.getGContextProp("publish");
    publish.emit("canvas_size", h);
}



export default {
    hideMainSVG,
    showMainSVG,
    zoom,
    updateAmount,
    getZoom,
    calculationResultsRender,
    calculationResultsRenderRemove,
    toggleFtIdShow,
    // calculationResultsRender2,
    filterResultsRender,
    // ActivedisEmpty,
    updateOperationStatus,
    calculationResultsRenderWave,
    updateCanvasAxis,
    calculationResultsRenderRemoveWave,
    updateCanvasHeight,
}