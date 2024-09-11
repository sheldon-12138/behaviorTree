import gContextDao from "../dao/gContextDao.js";
import dom from "../viewModel/dom.js";
import { EventEntity, getBtID } from "../structure/entity.js";
import Model from "../structure/model.js";
import Line from "../structure/line.js";
import Utils from "../utils/utils.js";
import viewOPController from "./viewOPController.js";
import Layout from "../algorithm/layout.js"
import TreeNode from "../structure/treeNode.js";
import gContextController from "./gContextController.js";
import renderFTree from "../render/renderFTree.js";
import { g } from "../structure/gContext.js";
import fileParser from "../parser/fileParser.js";

function selectedTree(treeId, name) {
    let statusData = gContextDao.getGContextProp("statusData");
    if (treeId === statusData.currentTreeID) return

    //清空画布树
    clearTreeDom()
    // 根据数据渲染dom
    renderFTree.renderByContext(treeId);

    // 添加tab页
    if (name) {
        let tabsArr = gContextDao.getGContextProp("tabsArr");
        const exists = tabsArr.some(element => element.id === treeId);
        if (exists) {
        } else {
            tabsArr.push({ id: treeId, name });
            // 自动布局(新开tab页时才自动布局)
            _nodeLayout(treeId);
        }
    }
    statusData.currentTreeID = treeId;
    // 调整画布大小
    gContextController.updateMainSVGSizeUp();
}

// 清空画布树
function clearTreeDom() {
    let nodes = dom.queryAll(".node");
    let lines = dom.queryAll(".line");
    // let len = nodes.length;
    let mainSVG = dom.query("#mainSVG");
    for (let i = nodes.length - 1; i >= 0; --i) {
        mainSVG.removeChild(nodes[i]);
    }
    for (let i = lines.length - 1; i >= 0; --i) {
        mainSVG.removeChild(lines[i]);
    }
}
// 节点别名改动后的处理
function handleNodeSurface(entity, aliasFlag, orgFlag, orgDesIsNull) {
    // console.log('aliasFlag', aliasFlag, 'orgFlag', orgFlag, 'orgDesIsNull', orgDesIsNull)
    if (!aliasFlag && !orgFlag && orgDesIsNull && (!entity._description)) return

    // 更新实体尺寸
    dom.updateEntitySize(entity, aliasFlag);
    // 更新连接点位置
    dom.updateConnectionPoints(entity);
    // 更新节点元素
    dom.updateNodeElements(entity, aliasFlag, orgFlag, orgDesIsNull);
    // 更新连线
    gContextController.updateLine({ [`${entity.id}`]: entity })
    // 
    // if (aliasFlag) {
    //     if (orgFlag) {//修改别名
    //         // console.log('修改别名')
    //         // dom.updateAliasName(entity)

    //         // 更新实体尺寸
    //         dom.updateEntitySize(entity, true);
    //         // 更新连接点位置
    //         dom.updateConnectionPoints(entity);
    //         // 更新节点元素
    //         dom.updateNodeElements(entity, true, handleDes, true);
    //         // 更新连线
    //         gContextController.updateLine({ [`${entity.id}`]: entity })
    //     } else {//加别名
    //         // console.log('加别名')
    //         // dom.addAliasName(entity)
    //         dom.updateEntitySize(entity, true);
    //         // 更新连接点位置
    //         dom.updateConnectionPoints(entity);
    //         // 更新节点元素
    //         dom.updateNodeElements(entity, true, handleDes);
    //         // 更新连线
    //         gContextController.updateLine({ [`${entity.id}`]: entity })
    //     }
    // } else {
    //     if (orgFlag) { //删除别名
    //         // console.log('删除别名')
    //         // dom.removeAliasName(entity)

    //         dom.updateEntitySize(entity, false);
    //         // 更新连接点位置
    //         dom.updateConnectionPoints(entity);
    //         // 更新节点元素
    //         dom.updateNodeElements(entity, false, handleDes);
    //         // 更新连线
    //         gContextController.updateLine({ [`${entity.id}`]: entity })
    //     }
    // }
}

function _copy() {


    let copyList = {};
    let copyLineList = {};
    let activedMap = gContextDao.getGContextProp("activedEntityMap");
    for (let key in activedMap) {
        let entity = Utils.jsonClone(activedMap[key]);
        if (entity.modelType === "top_event") continue;//顶事件不可复制
        copyList[key] = entity;
        let len = entity.upEntity.length;
        for (let upIndex = 0; upIndex < len; ++upIndex) {
            if (activedMap[entity.upEntity[upIndex]]) {
                let endEntity = activedMap[entity.upEntity[upIndex]];

                if (entity.modelType === "top_event" || endEntity.modelType === "top_event") {
                    continue;
                }

                let id = entity.id + "-" + entity.upEntity[upIndex];
                copyLineList[id] = new Line(id,
                    {
                        entityID: entity.id,
                        posX: entity.pos.x + entity.upNodeOffset.x,
                        posY: entity.pos.y + entity.upNodeOffset.y,
                        type: "up"
                    },
                    {
                        entityID: entity.upEntity[upIndex],
                        posX: endEntity.pos.x + endEntity.downNodeOffset.x,
                        posY: endEntity.pos.y + endEntity.downNodeOffset.y,
                        type: "down"
                    });
            }
        }
    }
    gContextDao.setGContextProp("copyList", copyList);
    gContextDao.setGContextProp("copyLineList", copyLineList);
    let clipBoard = gContextDao.getGContextProp("clipBoard");
    clipBoard.pasteOffset.x = 10;
    clipBoard.pasteOffset.y = 10;
    // console.log(copyList);
};

function copy() {

    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.isCompute) return;
    _copy();
    viewOPController.updateOperationStatus();

}

// 粘贴
function paste(pasteOffset) {
    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.isCompute) return;
    _paste();
    // if (statusData.autoLayoutMode) {
    //     nodeLayout();
    //     gContextController.updateMainSVGSizeUp();
    // }
    viewOPController.updateOperationStatus();
}

function _paste(pasteOffset) {

    let clipBoard = gContextDao.getGContextProp("clipBoard");
    pasteOffset = clipBoard.pasteOffset;
    let copyList = gContextDao.getGContextProp("copyList");
    let copyLineList = gContextDao.getGContextProp("copyLineList");
    let eventEntityMap = gContextDao.getGContextProp("eventEntityMap");
    let doorEntityMap = gContextDao.getGContextProp("doorEntityMap");
    let lineMap = gContextDao.getGContextProp("lineMap");
    let newIdMap = {};
    for (let key in copyList) {
        let entity = copyList[key];
        let id = Utils.GenNonDuplicateID();
        while (eventEntityMap[id] || doorEntityMap[id]) {
            id = Utils.GenNonDuplicateID();
        }
        newIdMap[key] = id;
        let newEntity;
        if (entity.category === "door") {
            // newEntity = doorEntityMap[id] = new DoorEntity(id, null, entity.type, entity.layer, entity.name, entity.aliasName,
            //     {width:entity.size.width, height:entity.size.height},
            //     {x:entity.pos.x + pasteOffset.x, y:entity.pos.y + pasteOffset.y},
            //     entity.hasUpNodes, entity.hasDownNodes, entity.collapse, entity.code, entity.desc);
            // newEntity.modelType = entity.modelType;

            newEntity = doorEntityMap[id] = Utils.jsonClone(entity);
            newEntity.id = id;
            newEntity.pos.x = newEntity.pos.x + pasteOffset.x;
            newEntity.pos.y = newEntity.pos.y + pasteOffset.x;
            newEntity.upEntity = [];
            newEntity.downEntity = [];
            newEntity.ftID = getBtID() + "";

        } else if (entity.category === "event") {

            newEntity = eventEntityMap[id] = Utils.jsonClone(entity);
            newEntity.id = id;
            newEntity.pos.x = newEntity.pos.x + pasteOffset.x;
            newEntity.pos.y = newEntity.pos.y + pasteOffset.x;
            newEntity.upEntity = [];
            newEntity.downEntity = [];
            newEntity.btID = getBtID() + "";


            // newEntity = eventEntityMap[id] = new EventEntity(id, null, entity.type, entity.layer, entity.name, entity.aliasName,
            //     {width:entity.size.width, height:entity.size.height},
            //     {x:entity.pos.x + pasteOffset.x, y:entity.pos.y + pasteOffset.y},
            //     entity.hasUpNodes, entity.hasDownNodes, entity.collapse, entity.level, entity.componentID);
            // newEntity.criterionDoor = Utils.jsonClone(entity.criterionDoor);
            // newEntity.criterions = Utils.jsonClone(entity.criterions);
            // newEntity.modelType = entity.modelType;

        }
        if (newEntity) {
            let eDom = dom.createNode(newEntity);
            eDom = dom.createNode(newEntity)
            newEntity.dom = eDom;
            // dom.addNodeImg(newEntity);//图片也复制
            dom.query("#mainSVG").appendChild(eDom);
        }
    }

    // console.log(copyLineList);
    for (let key in copyLineList) {
        let line = copyLineList[key];
        let ids = key.split("-");
        ids[0] = newIdMap[ids[0]];
        ids[1] = newIdMap[ids[1]];
        let bEntity = gContextDao.findEntity(ids[0]);
        bEntity.upEntity.push(ids[1]);
        let eEntity = gContextDao.findEntity(ids[1]);
        eEntity.downEntity.push(ids[0]);
        let newId = ids.join("-");
        // let newLine = lineMap[newId] = Utils.jsonClone(line);
        let newLine = lineMap[newId] = new Line(newId, { entityID: ids[0], posX: bEntity.pos.x + bEntity.upNodeOffset.x, posY: bEntity.pos.y + bEntity.upNodeOffset.y + bEntity.lineOffset[line.begin.type], type: line.begin.type },
            { entityID: ids[1], posX: eEntity.pos.x + eEntity.downNodeOffset.x, posY: eEntity.pos.y + eEntity.downNodeOffset.y + eEntity.lineOffset[line.end.type], type: line.end.type });
        if (newLine) {
            newLine.update();
            let lDom = dom.createLine(newLine);
            newLine.dom = lDom;
            dom.query("#mainSVG").appendChild(lDom);
        }
    }
    clipBoard.pasteOffset.x += 10;
    clipBoard.pasteOffset.y += 10;

    // 展开折叠的节点
    // for (let key in newIdMap) {
    //     updateCollapseByChild(newIdMap[key]);
    // }

    updateLayer();
    viewOPController.updateAmount(["nodeNum", "maxLayer", "topNodeNum", "midNodeNum",
        "bottomNodeNum", "doorType", "doorNum", "maxDamageLevel", "criterionNum", "criterionTypeNum",
        "criterionRelevanceNum"]);
};
function updateCollapseByChild(id) {
    let entity = gContextDao.findEntity(id);
    if (entity.downEntity.length > 0) {
        gContextController.unfoldNode(entity);
    }
    else if (entity.downEntity.length <= 0) {
        gContextController.noFoldNode(entity);
    }
}

//删除节点及子节点
function deleteTreeByFtID(ftID) {
    let activedEntityMap = gContextDao.getGContextProp("activedEntityMap");
    let acLine = gContextDao.getGContextProp("activedLine");
    activedEntityMap = {};
    acLine = null;

    let entity = gContextDao.findEntityByFtID(ftID);

    if (!!entity) {
        let queue = [];
        queue.push(entity.id);
        while (queue.length > 0) {
            let node_id = queue.shift();
            let node = gContextDao.findEntity(node_id);
            if (!!node) {
                activedEntityMap[node_id] = node;
                for (let i = 0, len = node.downEntity.length; i < len; ++i) {
                    queue.push(node.downEntity[i]);
                }
            }
        }
        gContextDao.setGContextProp("activedEntityMap", activedEntityMap);
        gContextDao.setGContextProp("activedLine", acLine);
        _delete();

    }
}

function _delete() {
    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.isCompute) return;
    __delete();
    // if (statusData.autoLayoutMode) {
    //     nodeLayout();
    //     gContextController.updateMainSVGSizeUp();
    // }
    viewOPController.updateOperationStatus();
    let hsStand = gContextDao.getGContextProp("hsStandard");
    for (let key in hsStand.standardList) {
        let entity = gContextDao.findEntityByFtID(key);
        if (!entity) {
            hsStandard.removeHSStandard(key);
        }
    }
}

function __delete() {

    removeActivedLine();

    let activedEntityMap = gContextDao.getGContextProp("activedEntityMap");
    let eventEntityMap = gContextDao.getGContextProp("eventEntityMap");
    let doorEntityMap = gContextDao.getGContextProp("doorEntityMap");
    let lineMap = gContextDao.getGContextProp("lineMap");

    let userLineMap = gContextDao.getGContextProp("userLineMap");
    let criterionPopList = gContextDao.getGContextProp("criterionPopList");

    let deleteIdMap = {};
    //删除节点
    for (let key in activedEntityMap) {
        let entity = activedEntityMap[key];
        if (entity.modelType === "top_event") continue;//顶事件不可删
        if (entity.modelType === "bottom_event") {//删除底事件的判据
            for (let i = 0; i < 17; i++) {
                const drawerID = `${entity.id}${i.toString().padStart(2, '0')}`
                if (userLineMap[drawerID]) {
                    dom.query("#mainSVG").removeChild(userLineMap[drawerID].dom);
                    delete (userLineMap[drawerID]);

                    let indexToDelete = criterionPopList.findIndex(item => {
                        return item.drawerID == drawerID;
                    });
                    if (indexToDelete != -1) {// 如已存在则删除
                        criterionPopList.splice(indexToDelete, 1);
                    }
                }
            }
        };

        let len = entity.upEntity.length;
        for (let upIndex = 0; upIndex < len; ++upIndex) {
            let upEntity = gContextDao.findEntity(entity.upEntity[upIndex]);
            upEntity.downEntity = Utils.removeElement(upEntity.downEntity, entity.id);
            //删除父节点的收缩按钮
            // if (!activedEntityMap[upEntity.id] && upEntity.downEntity.length <= 0) {
            //     gContextController.noFoldNode(upEntity);
            // }
        }
        len = entity.downEntity.length;
        for (let downIndex = 0; downIndex < len; ++downIndex) {
            let downEntity = gContextDao.findEntity(entity.downEntity[downIndex]);
            downEntity.upEntity = Utils.removeElement(downEntity.upEntity, entity.id);
        }
        if (entity) {
            dom.query("#mainSVG").removeChild(entity.dom);
        }
        (entity.category === "door") ? delete (doorEntityMap[key]) : delete (eventEntityMap[key]);
        // console.log(isRemove);
        deleteIdMap[key] = key;

    }
    //删除相关线
    let deleteLineIdMap = {};
    for (let key in deleteIdMap) {
        delete (activedEntityMap[key]);
        for (let lineKey in lineMap) {
            if (lineKey.indexOf(key) >= 0) {
                deleteLineIdMap[lineKey] = lineKey;
            }
        }
    }

    for (let key in deleteLineIdMap) {
        if (lineMap[key]) {
            dom.query("#mainSVG").removeChild(lineMap[key].dom);
        }
        delete (lineMap[key]);
    }

    gContextDao.setGContextProp("activedEntityMap", {});
    updateLayer();
    viewOPController.updateAmount(["nodeNum", "maxLayer", "topNodeNum", "midNodeNum",
        "bottomNodeNum", "doorType", "doorNum", "maxDamageLevel", "criterionNum", "criterionTypeNum",
        "criterionRelevanceNum"]);
}

//更新节点判据图标
function updateNodeCriterionImgList(nodeId) {
    let entity = gContextDao.findEntity(nodeId);
    if (entity)
        dom.updateCriterionImgList(entity);
}
function roundFun(value, n) {
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
}
function ceilFun(value, n) {
    return Math.ceil(value * Math.pow(10, n)) / Math.pow(10, n);
}

// 启动判据
function startCriterion(nodeId, type, dcId) {
    const dcObj = gContextDao.getGContextProp("dcObj");
    const dcItem = dcObj[dcId]
    const length = +dcItem[5] + 1

    let entity = gContextDao.findEntity(nodeId);
    // console.log('entity', entity)
    if (entity && !entity.criterions[type].actived) {
        entity.criterions[type].actived = true

        entity.criterions[type].p = Array(length).fill(0)
        entity.criterions[type].p[0] = 1

        const smallCircleList = entity.dom.querySelectorAll(".smallCircle");
        const index = g.gContext.List.indexOf(type)
        const smallCircle = smallCircleList[index]  //smallCircleList[Math.abs(19 - index)]
        dom.setAttributeByDom(smallCircle, {
            "fill": `url(#attr${index})`
        });

        viewOPController.updateAmount(["criterionNum", "criterionTypeNum"]);
    }
}

function closeCriterion(nodeId, type) {
    // 
    let entity = gContextDao.findEntity(nodeId);
    if (entity && entity.criterions[type].actived) {
        entity.criterions[type].actived = false

        // entity.criterions[type].p = Array(length).fill(0)
        // entity.criterions[type].p[0] = 1

        const smallCircleList = entity.dom.querySelectorAll(".smallCircle");
        const index = g.gContext.List.indexOf(type)
        const smallCircle = smallCircleList[index]  //smallCircleList[Math.abs(19 - index)]
        dom.setAttributeByDom(smallCircle, {
            "fill": "white"
        });

        viewOPController.updateAmount(["criterionNum", "criterionTypeNum"]);
    }
}


function updateDi(nodeId, type, value) {
    let entity = gContextDao.findEntity(nodeId);
    if (entity && entity.di[type]) {
        entity.di[type] = value;
    }
}

// 输入改变判据概率改变
function changeDi(nodeId, dcId, diNum1, diNum2, criterionMsg) {
    // console.log(dcId,diNum1, diNum2)
    let entity = gContextDao.findEntity(nodeId);
    if (entity.modelType === 'bottom_event') {
        const dcObj = gContextDao.getGContextProp("dcObj");
        const dcItem = dcObj[dcId]

        if (dcItem[4] == 'DT_EXP') dcItem[5] = 1
        // console.log(dcItem)
        let pArr = criterionP(dcItem, diNum1, diNum2)
        // console.log('pArr', ...pArr)
        const s = Array(+dcItem[5] + 1).fill(0)
        s[0] = 1
        // console.log('等级', dcItem[5], s)
        if (criterionMsg) {//排列式的判据
            criterionMsg.entityDcObj.p = pArr.length > 0 ? pArr : s
        } else {
            let attrData = gContextDao.getGContextProp("attrData");
            attrData.entity.criterions[attrData.criterionItem.type].p = pArr.length > 0 ? pArr : s
        }

        // console.log('pArr', ...pArr)
    }
}

function criterionP(dcItem, diNum1, diNum2) {
    let pArr = []
    if (dcItem && (diNum1 || diNum1 == 0)) {
        // console.log('diNum1', diNum1)
        let dataArr = []
        if (dcItem[4] !== 'DT_UD') {
            for (let i = 6; i < dcItem.length; ++i) {//-1是因为dcList添加了一项全部的数据
                dataArr.push(dcItem[i].split(","))
            }
        }
        if (dcItem[4] == 'DT_01') {//01型
            if (parseFloat(diNum1) < (parseFloat(dataArr[0][0]))) pArr.push(1);
            else pArr.push(0);
            for (let kk = 0; kk < dataArr[0].length; ++kk) {
                if ((parseFloat(dataArr[0][kk])) <= parseFloat(diNum1)
                    && (kk + 1 < dataArr[0].length ? parseFloat(diNum1) < parseFloat(dataArr[0][kk + 1]) : true)) {
                    pArr.push(1);
                } else pArr.push(0);
            }
        }
        else if (dcItem[4] == 'DT_EXP') {//指数型
            // console.log(dataArr[0][0])
            if (diNum1 <= dataArr[0][0]) { pArr.push(1, 0); }
            else {
                let x = 1 - Math.exp(dataArr[0][1] * (dataArr[0][0] - diNum1))
                const p = parseInt(x * 100000) / 100000
                pArr.push(parseInt((1 - p) * 100000) / 100000, p);
            }
        }
        else if (dcItem[4] == 'DT_LINEAR') {//线性型
            let resultArr = []
            let k = 0;
            while (k < dataArr[0].length) {
                let arr = [];
                arr.push(
                    [0, 0],
                    k == 0 ? [0, 0] : [parseFloat(dataArr[0][k - 1]), 0],
                    [parseFloat(dataArr[0][k]), 1],
                    k + 1 >= dataArr[0].length ? [parseFloat(dataArr[0][k]), 1] : [parseFloat(dataArr[0][k + 1]), 0],
                    [100000000, k + 1 >= dataArr[0].length ? 1 : 0]
                );
                ++k;

                // 将当前迭代生成的数组推入 resultArr
                resultArr.push(arr);
            }
            if (diNum1 < dataArr[0][0]) {
                pArr.push(parseInt((1 - interpolateY(diNum1, resultArr[0])) * 10000) / 10000)
            } else pArr.push(0)
            for (const segment of resultArr) {
                const yCoordinate = interpolateY(diNum1, segment);
                pArr.push(yCoordinate)
                // console.log(`For segment ${JSON.stringify(segment)}, y=${yCoordinate}`);
            }
        }
        else if (diNum2 && dcItem[4] == 'DT_CURVE') {//曲线型
            const result = Array((dataArr.length / 2)).fill(null);//记录点在每条线上的情况 0在下方，1在上方
            const inputPoint = [diNum1, diNum2]

            let op = 0
            for (let i = 0; i < dataArr.length; i += 2) {
                const f1 = [parseFloat(dataArr[i][0]), parseFloat(dataArr[i + 1][0])],//第一个点
                    f2 = [parseFloat(dataArr[i][1]), parseFloat(dataArr[i + 1][1])],//第二个点
                    // 倒数1、2个点
                    l1 = [parseFloat(dataArr[i][dataArr[i].length - 2]), parseFloat(dataArr[i][dataArr[i + 1].length - 2])],
                    l2 = [parseFloat(dataArr[i][dataArr[i].length - 1]), parseFloat(dataArr[i][dataArr[i + 1].length - 1])]
                // console.log(f1, f2, l1, l2)
                for (let p = 0; p < dataArr[i].length - 1; ++p) {
                    const point1 = [parseFloat(dataArr[i][p]), parseFloat(dataArr[i + 1][p])]
                    const point2 = [parseFloat(dataArr[i][p + 1]), parseFloat(dataArr[i + 1][p + 1])]
                    // console.log(point1[0], diNum1, point2[0])
                    if (point1[0] <= diNum1 && diNum1 <= point2[0]) {
                        result[op] = pointPosition(point1, point2, inputPoint)
                        // console.log(point1, point2, pointPosition(point1, point2, inputPoint))
                    } else if (diNum1 < f1[0]) {
                        result[op] = pointPosition(f1, f2, inputPoint)
                        // console.log(f1, f2, pointPosition(f1, f2, inputPoint))
                    } else if (l2[0] < diNum1) {
                        result[op] = pointPosition(l1, l2, inputPoint)
                        // console.log(l1, l2, pointPosition(l1, l2, inputPoint))
                    }

                    // console.log(point1, point2, pointPosition(point1, point2, inputPoint))
                }
                op++
            }
            // console.log('result', result)
            const index = result.lastIndexOf(1)
            if (index == -1) { //不在任何线上方
                pArr.push(1, ...result)
            } else {//在某一条线上方  保留最后一个1
                result.fill(0)
                result[index] = 1
                pArr.push(0, ...result)
            }
        }
        else if (dcItem[4] == 'DT_UD') {//自定义型
            let sum = 0
            for (let i = 10; i < dcItem.length; i++) {
                let y = fileParser.getY(dcItem[i], diNum1)
                sum += y
                // console.log(dcItem[i], y)
                pArr.push(y)
            }
            // pArr.unshift(parseInt((1 - sum) * 1000) / 1000)
            pArr.unshift(Math.max(parseIntNum(1 - sum, 4), 0))
        }
    }
    return pArr
}

function parseIntNum(x, n) {
    return parseFloat(x.toFixed(n));
}

function CriterionP1() {
    const dcObj = gContextDao.getGContextProp("dcObj");
    const dcItem = dcObj[dcId]
    let pArr = []
    if (dcItem && diNum1) {
        let dataArr = []
        if (dcItem[4] !== 'DT_UD') {
            for (let i = 6; i < dcItem.length; ++i) {//-1是因为dcList添加了一项全部的数据
                dataArr.push(dcItem[i].split(","))
            }
        }

        // console.log('dataArr', dataArr)
        if (dcItem[4] == 'DT_01') {//01型
            // dataArr[0].unshift(0)
            if (parseFloat(diNum1) < (parseFloat(dataArr[0][0]))) pArr.push(1);
            else pArr.push(0);
            for (let kk = 0; kk < dataArr[0].length; ++kk) {
                if ((parseFloat(dataArr[0][kk])) <= parseFloat(diNum1)
                    && (kk + 1 < dataArr[0].length ? parseFloat(diNum1) < parseFloat(dataArr[0][kk + 1]) : true)) {
                    pArr.push(1);
                } else pArr.push(0);
            }
            // for (const value of dataArr[0]) {
            //     
            // }
        }
        else if (dcItem[4] == 'DT_EXP') {//指数型
            // console.log(dataArr[0][0])
            if (diNum1 <= dataArr[0][0]) { pArr.push(1, 0); }
            else {
                let x = 1 - Math.exp(dataArr[0][1] * (dataArr[0][0] - diNum1))
                const p = parseInt(x * 100000) / 100000
                pArr.push(parseInt((1 - p) * 100000) / 100000, p);
            }
        }
        else if (dcItem[4] == 'DT_LINEAR') {//线性型

            //[4500,53000]
            let resultArr = []
            let k = 0;
            while (k < dataArr[0].length) {
                let arr = [];
                arr.push(
                    [0, 0],
                    k == 0 ? [0, 0] : [parseInt(dataArr[0][k - 1]), 0],
                    [parseInt(dataArr[0][k]), 1],
                    k + 1 >= dataArr[0].length ? [parseInt(dataArr[0][k]), 1] : [parseInt(dataArr[0][k + 1]), 0],
                    [100000000, k + 1 >= dataArr[0].length ? 1 : 0]
                );
                ++k;
                // console.log('arr', arr);

                // 将当前迭代生成的数组推入 resultArr
                resultArr.push(arr);
            }
            if (diNum1 < dataArr[0][0]) pArr.push(parseInt((1 - interpolateY(diNum1, resultArr[0])) * 10000) / 10000)
            else pArr.push(0)
            for (const segment of resultArr) {
                const yCoordinate = interpolateY(diNum1, segment);
                pArr.push(yCoordinate)
                // console.log(`For segment ${JSON.stringify(segment)}, y=${yCoordinate}`);
            }
        }
        // else if (diNum2 && dcItem[4] == 'DT_AND') {//与型
        //     //[5,100000.0]
        //     //[9,130000]
        //     // 初始化结果数组
        //     const result = Array(dataArr.length + 1).fill(0);
        //     // 遍历阶段规则
        //     for (let i = 0; i < dataArr.length; i++) {
        //         // 检查点是否在当前阶段
        //         if (parseInt(diNum1) < parseInt(dataArr[i][0]) && parseInt(diNum2) < parseInt(dataArr[i][1])) {
        //             result[i] = 1; // 在当前阶段
        //             // console.log(result)
        //             break; // 已确定阶段，结束循环
        //         }
        //     }
        //     // 如果点在最后一个阶段之外，标记在最后一个位置
        //     if (result.every(val => val === 0)) {
        //         result[result.length - 1] = 1;
        //     }
        //     pArr.push(...result);
        // }
        // else if (diNum2 && dcItem[4] == 'DT_OR') {//或型
        //     const result = Array(dataArr.length + 1).fill(0);
        //     // 遍历阶段规则
        //     for (let i = 0; i < dataArr.length; i++) {
        //         // 检查点是否在当前阶段
        //         if (parseInt(diNum1) < parseInt(dataArr[i][0]) || parseInt(diNum2) < parseInt(dataArr[i][1])) {
        //             result[i] = 1; // 在当前阶段
        //             // console.log(result)
        //             break; // 已确定阶段，结束循环
        //         }
        //     }
        //     // 如果点在最后一个阶段之外，标记在最后一个位置
        //     if (result.every(val => val === 0)) {
        //         result[result.length - 1] = 1;
        //     }
        //     pArr.push(...result);
        // }
        else if (diNum2 && dcItem[4] == 'DT_CURVE') {//曲线型
            const result = Array((dataArr.length / 2)).fill(null);//记录点在每条线上的情况 0在下方，1在上方
            const inputPoint = [diNum1, diNum2]

            // console.log('dataArr', dataArr)
            // [[7000.0,150000.0,210000.0,220000.0]
            // [8000.0,2000.0,600.0,500.0]
            // [10000.0,210000.0,250000.0]
            // [10000.0,2000.0,1500.0]]
            let op = 0
            for (let i = 0; i < dataArr.length; i += 2) {
                const f1 = [parseInt(dataArr[i][0]), parseInt(dataArr[i + 1][0])],//第一个点
                    f2 = [parseInt(dataArr[i][1]), parseInt(dataArr[i + 1][1])],//第一个点
                    // 倒数1、2个点
                    l1 = [parseInt(dataArr[i][dataArr[i].length - 2]), parseInt(dataArr[i][dataArr[i + 1].length - 2])],
                    l2 = [parseInt(dataArr[i][dataArr[i].length - 1]), parseInt(dataArr[i][dataArr[i + 1].length - 1])]
                // console.log(f1, f2, l1, l2)
                for (let p = 0; p < dataArr[i].length - 1; ++p) {
                    const point1 = [parseInt(dataArr[i][p]), parseInt(dataArr[i + 1][p])]
                    const point2 = [parseInt(dataArr[i][p + 1]), parseInt(dataArr[i + 1][p + 1])]
                    // console.log(point1[0], diNum1, point2[0])
                    if (point1[0] <= diNum1 && diNum1 <= point2[0]) {
                        result[op] = pointPosition(point1, point2, inputPoint)
                        // console.log(point1, point2, pointPosition(point1, point2, inputPoint))
                    } else if (diNum1 < f1[0]) {
                        result[op] = pointPosition(f1, f2, inputPoint)
                        // console.log(f1, f2, pointPosition(f1, f2, inputPoint))
                    } else if (l2[0] < diNum1) {
                        result[op] = pointPosition(l1, l2, inputPoint)
                        // console.log(l1, l2, pointPosition(l1, l2, inputPoint))
                    }

                    // console.log(point1, point2, pointPosition(point1, point2, inputPoint))
                }
                op++
            }
            // console.log('result', result)
            const index = result.lastIndexOf(1)
            if (index == -1) { //不在任何线上方
                pArr.push(1, ...result)
            } else {//在某一条线上方  保留最后一个1
                result.fill(0)
                result[index] = 1
                pArr.push(0, ...result)
            }
        }
        else if (dcItem[4] == 'DT_UD') {//自定义型
            let sum = 0
            for (let i = 10; i < dcItem.length; i++) {
                let y = parseInt(fileParser.getY(dcItem[i], diNum1) * 1000) / 1000
                sum += y
                // console.log(dcItem[i], y)
                pArr.push(y)
            }
            pArr.unshift(parseInt((1 - sum) * 1000) / 1000)
        }
    }
}

function pointPosition(linePoint1, linePoint2, testPoint) {
    // 计算直线斜率
    let m = (linePoint2[1] - linePoint1[1]) / (linePoint2[0] - linePoint1[0]);

    // 计算直线上对应测试点的y值
    let yOnLine = m * (testPoint[0] - linePoint1[0]) + linePoint1[1];

    // 判断测试点在直线的上方还是下方
    // console.log('testPoint[1]', testPoint[1])
    // console.log('yOnLine', yOnLine)
    // if (testPoint[1] >= yOnLine) {
    //     return "上方";
    // } else if (testPoint[1] < yOnLine) {
    //     return "下方";
    // }
    return (testPoint[1] < yOnLine) ? 0 : 1
}


// 线性计算函数
function interpolateY(x, segment) {
    for (let i = 0; i < segment.length - 1; i++) {
        const x1 = segment[i][0];
        const y1 = segment[i][1];
        const x2 = segment[i + 1][0];
        const y2 = segment[i + 1][1];
        if (x1 === x2) continue;
        if (x >= x1 && x <= x2) {
            const ccc = y1 + ((x - x1) * (y2 - y1)) / (x2 - x1)
            return parseInt(ccc * 100000) / 100000
        }
    }
    // Return undefined if x is outside the range of the segments
    return undefined;
}


// 更新事件类型
function updateEventType(nodeId, val) {
    let entity = gContextDao.findEntity(nodeId);
    if (entity && gContextDao.getModelByType(val)) {
        dom.updateEventType(entity, val);
        viewOPController.updateAmount(["nodeNum", "topNodeNum", "midNodeNum",
            "bottomNodeNum",]);
    }
};

//更新节点等级
function updateNodeLevel(nodeId, level) {
    let entity = gContextDao.findEntity(nodeId);
    const downEntity = gContextDao.findEntity(entity.downEntity[0])
    if (entity) {
        entity.level = level;
        entity.probability.splice(0, entity.probability.length);

        //切换等级后清空计算规则
        if (downEntity) {
            downEntity.upLevel = level//把底下门的等级也跟着改了
            // downEntity.rules = ['', '', '', '']
        }
        // else entity.rules = ['', '', '', '']
        if (entity.rules.length > level) {
            entity.rules = entity.rules.slice(0, level + 1)//只截取当前等级的前几项规则
        }


        for (let i = 0; i < level + 1; ++i) {
            entity.probability.push(roundFun(1.0 / (level + 1), 6));
        }
        if (entity.level === 2) {
            entity.probability[0] = 0.333333;
            entity.probability[1] = 0.333333;
            entity.probability[2] = 0.333334;
        }

        dom.updateCriterionColorNode(entity);
    }
    viewOPController.updateAmount(["maxDamageLevel"]);
};
//更新节点概率
function updateNodeProbability(nodeId) {
    let entity = gContextDao.findEntity(nodeId);
    if (entity) {
        dom.updateCriterionColorNode(entity);
    }
};

//修改名称
function updateNodeName(nodeId) {
    let entity = gContextDao.findEntity(nodeId);
    if (entity) {
        let strList = Utils.splitByLine(entity.name, (entity.size.width * 2 / 3.0), 10);
        dom.updateNameNode(entity, strList, 10);
    }
}

function nodeLayer(node, layer) {
    node.layer = layer;
    for (let i = 0; i < node.downEntity.length; ++i) {
        let entity = gContextDao.findEntity(node.downEntity[i]);
        if (entity.category !== "event")
            nodeLayer(entity, layer);
        else
            nodeLayer(entity, layer + 1);
    }
}

function updateLayer() {
    let traver = gContextDao.traverseNode();
    let node = traver.next();
    while (!node.done) {
        if (node.value.upEntity.length <= 0) {
            nodeLayer(node.value, 1);
        }
        node = traver.next();
    }
}

function createLayout(startPosX, startPosY, spacingX, spacingY) {
    let layout = new Layout(startPosX, startPosY, spacingX, spacingY);
    gContextDao.setGContextProp("layout", layout);
};

function eSort(id1, id2) {
    let e1 = gContextDao.findEntity(id1);
    let e2 = gContextDao.findEntity(id2);
    if (e1 && e2) {
        return e1.pos.x - e2.pos.x;
    }
    return true;
}

function addTreeNode(entity, treeNode) {
    if (!entity.collapse) {
        let cpyList = entity.downEntity.slice();
        cpyList.sort(eSort);
        for (let i = 0, len = cpyList.length; i < len; ++i) {
            let child = gContextDao.findEntity(cpyList[i]);
            if (child.dom.classList.contains("node-render")) continue;
            let cTreeNode = new TreeNode(child.id, child.size);
            treeNode.children.push(cTreeNode);
            addTreeNode(child, cTreeNode);
        }
        return treeNode;
    }
};

function openAutoLayoutMode() {
    let statusData = gContextDao.getGContextProp("statusData");
    // statusData.autoLayoutMode = true;
    gContextDao.setGContextProp("statusData", statusData);
}
function nodeLayout(currentTreeID) {
    _nodeLayout(currentTreeID);
    // console.log(g.gContext.eventEntityMap)
    // updateEffectPos();
    // updateHSStandardPos();
}
//自动布局
function _nodeLayout(treeId) {
    // console.log('自动布局了')
    let roots = new TreeNode(null);
    let traver = gContextDao.traverseNode(treeId);

    let node = traver.next();
    while (!node.done) {

        if (node.value.upEntity.length <= 0) {//判断是否是根节点
            roots.children.push(new TreeNode(node.value.id, node.value.size));
        }
        node = traver.next();
    }

    for (let i = 0, len = roots.children.length; i < len; ++i) {//构建树模型
        let entity = gContextDao.findEntity(roots.children[i].id);
        if (entity.treeId == treeId)
            roots.children[i] = addTreeNode(entity, roots.children[i]);
        else console.log('不是同一棵树')
    }

    let layout = gContextDao.getGContextProp("layout");
    layout.init();
    layout.autoSequence(roots, layout.currentPosY);

    let queue = [roots];
    let fragment = dom.doc.createDocumentFragment();
    while (queue.length > 0) {
        let treeNode = queue.shift();
        if (treeNode.id !== null) {
            let entity = gContextDao.findEntity(treeNode.id);
            if (entity && entity.treeId == treeId) {
                entity.pos.x = Math.floor(treeNode.pos.x);
                entity.pos.y = Math.floor(treeNode.pos.y);
                fragment.appendChild(entity.dom);
                dom.setAttributeByDom(entity.dom, {
                    "x": entity.pos.x,
                    "y": entity.pos.y,
                });
            }
        }
        for (let i = 0, len = treeNode.children.length; i < len; ++i) {
            //  if (!treeNode.children[i].collapse)
            queue.push(treeNode.children[i]);
        }
        // console.log(treeNode.id);
    }
    let lineMap = gContextDao.getGContextProp("lineMap");
    for (let key in lineMap) {
        let line = lineMap[key];
        if (line.treeId !== treeId) continue;
        let ids = key.split("-");
        let begin = ids[0], end = ids[1];
        let beginE = gContextDao.findEntity(begin);
        let endE = gContextDao.findEntity(end);
        if (beginE || endE) {
            let bt = (line.begin.type === "up") ? "upNodeOffset" : "downNodeOffset";
            let et = (line.end.type === "up") ? "upNodeOffset" : "downNodeOffset";
            let btl = (line.begin.type === "up") ? "up" : "down";
            let etl = (line.begin.type === "up") ? "down" : "up";
            if (beginE) {
                line.begin.posX = beginE.pos.x + beginE[bt].x;
                line.begin.posY = beginE.pos.y + beginE[bt].y + beginE.lineOffset[btl];
            }
            if (endE) {
                line.end.posX = endE.pos.x + endE[et].x;
                line.end.posY = endE.pos.y + endE[et].y + endE.lineOffset[etl];
            }
            line.update();
            fragment.appendChild(line.dom);
            dom.setAttributeByDom(line.dom, {
                // "transform": "translate(" + line.pos.x + "," + line.pos.y + ")",
                "x": line.pos.x,
                "y": line.pos.y,
            });
            dom.setAttributeByDom(line.dom.querySelector(".polyline"), {
                "d": line.path,
            });
            dom.setAttributeByDom(line.dom.querySelector(".pitch"), {
                "d": line.path,
            });
        }
    }

    let mainSVG = dom.query("#mainSVG");
    mainSVG.appendChild(fragment);
};

function returnTree() {
    let roots = new TreeNode(null);
    let traver = gContextDao.traverseNode();
    let node = traver.next();
    while (!node.done) {

        if (node.value.upEntity.length <= 0) {//判断是否是根节点
            roots.children.push(new TreeNode(node.value.id, node.value.size));
        }
        node = traver.next();
    }

    for (let i = 0, len = roots.children.length; i < len; ++i) {//构建树模型
        let entity = gContextDao.findEntity(roots.children[i].id);
        roots.children[i] = addTreeNode(entity, roots.children[i]);
    }
    console.log('tree', roots);
    return roots
}

//删除线
function removeActivedLine() {
    let lineMap = gContextDao.getGContextProp("lineMap");
    let acLine = gContextDao.getGContextProp("activedLine");
    if (acLine) {
        let beginE = gContextDao.findEntity(acLine.begin.entityID);
        let endE = gContextDao.findEntity(acLine.end.entityID);
        if (acLine.begin.type === "up") {
            beginE.upEntity = Utils.removeElement(beginE.upEntity, endE.id);
            endE.downEntity = Utils.removeElement(endE.downEntity, beginE.id);
            // if (endE.downEntity.length <= 0) {
            //     gContextController.noFoldNode(endE);
            // }
        }
        else {
            beginE.downEntity = Utils.removeElement(beginE.downEntity, endE.id);
            endE.upEntity = Utils.removeElement(endE.upEntity, beginE.id);
            // if (beginE.downEntity.length <= 0) {
            //     gContextController.noFoldNode(beginE);
            // }
        }
        delete (lineMap[acLine.id]);
        let mainSVG = dom.query("#mainSVG");
        mainSVG.removeChild(acLine.dom);
        gContextDao.setGContextProp("activedLine", null);
    }

}

//更新模型实体树数据
function updateTreeData() {
    g.gContext.entityTree.isShow = false;
    let treeData = [];
    for (let key in g.gContext.eventEntityMap) {
        if (g.gContext.eventEntityMap[key].modelType == 'effect_event' || g.gContext.eventEntityMap[key].modelType == 'standard_event') continue;
        if (g.gContext.eventEntityMap[key].upEntity.length === 0) {
            treeData.push({
                id: key,
                data: g.gContext.eventEntityMap[key],
                children: []
            })
        }
    }
    for (let key in g.gContext.doorEntityMap) {
        if (g.gContext.doorEntityMap[key].upEntity.length === 0) {
            // console.log(key);
            treeData.push({
                id: key,
                data: g.gContext.doorEntityMap[key],
                children: []
            })
        }
    }
    for (let i = 0; i < treeData.length; i++) {
        childData(treeData[i]);
    }
    // let hierarchyData = [[]];
    // for (let i = 0;i < treeData.length;i++){
    //     hierarchyData[0].push(treeData[i].id);
    //     ergodicHierarchyData(treeData[i],hierarchyData[0]);
    // }
    g.gContext.entityTree.treeData = Utils.jsonClone(treeData);
    g.gContext.entityTree.isShow = true;
}
//遍历树的子节点
function childData(data) {
    if (data.data.downEntity.length !== 0) {
        for (let j = 0; j < data.data.downEntity.length; j++) {
            data.children.push({
                id: g.gContext.eventEntityMap[data.data.downEntity[j]].id,
                data: g.gContext.eventEntityMap[data.data.downEntity[j]],
                children: []
            })
        }
        for (let k = 0; k < data.children.length; k++) {
            childData(data.children[k]);
        }
    } else {
        return;
    }
}
//遍历树的层级结构
function ergodicHierarchyData(data, hierarchyData) {
    for (let k = 0; k < data.children.length; k++) {
        childData(data.children[k]);
    }
    // hierarchyData
}

//鼠标浮动在节点上有突出效果
function hoverNode(key) {
    let entity = gContextDao.findEntity(key);
    if (entity) {
        let publish = gContextDao.getGContextProp("publish");
        publish.emit("hover-node", entity);
    }
}

function explantationNode() {
    let publish = gContextDao.getGContextProp("publish");
    publish.emit("explantation-node");

}

//给节点添加图片
function addNodeImg(id, file) {

    let entity = gContextDao.findEntity(id);
    entity.imgName = file.name.slice(0, file.name.lastIndexOf("."))

    if (!entity) return;
    let reader = new FileReader();
    reader.onloadend = (e) => {
        if (reader.result) {
            let newFile = Utils.dataConversion.base64ToFile(file.name, reader.result);
            gContextDao.imgManager.setNodeImg(entity.imgName, newFile);
            Utils.dataConversion.getSizeByBase64(reader.result, (size) => {
                entity.img = size;
                entity.imgSrc = reader.result;
                dom.addNodeImg(entity);
            });
        }

    }
    reader.readAsDataURL(file);

}

function deleteNodeImg(id) {
    let entity = gContextDao.findEntity(id);
    if (!entity) return;
    entity.imgName = ""
    dom.deleteNodeImg(entity);

    let entityMap = gContextDao.filterEventsByImgName(entity.imgName);
    if (Object.keys(entityMap).length < 2) {
        gContextDao.imgManager.setNodeImg(entity.imgName, null);
    }

}

function getNodeImg(imgName, callback) {
    let file = gContextDao.imgManager.getNodeImg(imgName);
    if (!file) {
        callback("");
    } else {
        let reader = new FileReader();
        reader.onloadend = (e) => {
            if (reader.result) {
                callback(reader.result)
            }
        }
        reader.readAsDataURL(file);
    }
}

function setNodeBorderColor(id) {
    let entity = gContextDao.findEntity(id);
    if (!entity) return;
    getAssociationNode(id, entity.border.type, (node) => {
        node.border.type = entity.border.type;
        node.border.color = entity.border.color;
        let pic = node.dom.querySelector(".pic-img");
        if (pic) {
            dom.setAttributeByDom(pic, {
                "stroke": node.border.color,
            });
        }
    });

}

function getAssociationNode(id, type, callback) {
    //self
    if (type === 1) {
        let entity = gContextDao.findEntity(id);
        if (!entity.modelType.includes("door")) {
            callback(entity);
        }
    }
    //self and child
    else if (type === 2) {
        let queue = [];
        queue.push(id);
        while (queue.length > 0) {
            let entity = gContextDao.findEntity(queue.shift());
            if (!entity.modelType.includes("door")) {
                callback(entity);
            }
            for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
                queue.push(entity.downEntity[i]);
            }
        }
    }
}



let hsStandard = {
    //选择某个hs标准
    updateHSStandardIndex(id) {
        let hsStandard = gContextDao.getGContextProp("hsStandard");
        hsStandard.currentIndex = id;
    },
    //添加hs标准
    addHSStandard(target) {
        gContextDao.hsStandard.addHSStandard(target);
    },
    //更新hs标准等级
    updateHsStandardLevel(target) {
        gContextDao.hsStandard.updateHsStandardLevel(target);
        let hsStandard = gContextDao.getGContextProp("hsStandard");
        let standardList = hsStandard.standardList;
        let root = gContextDao.findRoot();

        updateNodeProbability(root.id);

    },
    //删除hs标准
    removeHSStandard(target) {
        gContextDao.hsStandard.removeHSStandard(target);
        let root = gContextDao.findRoot();
        if (root) {

        }
    }
};

function allOffset(offset) {
    let root = gContextDao.findRoot();
    let queue = [];
    queue.push(root.id);
    let fragment = dom.doc.createDocumentFragment();
    while (queue.length > 0) {
        let id = queue.shift();
        let entity = gContextDao.findEntity(id);
        if (entity) {
            entity.pos.x = entity.pos.x + offset.x;
            entity.pos.y = entity.pos.y + offset.y;
            fragment.appendChild(entity.dom);
            dom.setAttributeByDom(entity.dom, {
                "x": entity.pos.x,
                "y": entity.pos.y,
            });
            for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
                queue.push(entity.downEntity[i]);
            }
        }

    }
    let lineMap = gContextDao.getGContextProp("lineMap");
    for (let key in lineMap) {
        let line = lineMap[key];
        let ids = key.split("-");
        let begin = ids[0], end = ids[1];
        let beginE = gContextDao.findEntity(begin);
        let endE = gContextDao.findEntity(end);
        if (beginE || endE) {
            let bt = (line.begin.type === "up") ? "upNodeOffset" : "downNodeOffset";
            let et = (line.end.type === "up") ? "upNodeOffset" : "downNodeOffset";
            let btl = (line.begin.type === "up") ? "up" : "down";
            let etl = (line.begin.type === "up") ? "down" : "up";
            if (beginE) {
                line.begin.posX = beginE.pos.x + beginE[bt].x;
                line.begin.posY = beginE.pos.y + beginE[bt].y + beginE.lineOffset[btl];
            }
            if (endE) {
                line.end.posX = endE.pos.x + endE[et].x;
                line.end.posY = endE.pos.y + endE[et].y + endE.lineOffset[etl];
            }
            line.update();
            fragment.appendChild(line.dom);
            dom.setAttributeByDom(line.dom, {
                // "transform": "translate(" + line.pos.x + "," + line.pos.y + ")",
                "x": line.pos.x,
                "y": line.pos.y,
            });
            dom.setAttributeByDom(line.dom.querySelector(".polyline"), {
                "d": line.path,
            });
            dom.setAttributeByDom(line.dom.querySelector(".pitch"), {
                "d": line.path,
            });
        }
    }
    let mainSVG = dom.query("#mainSVG");
    mainSVG.appendChild(fragment);
}

function updateEffectPos() {
    let root = gContextDao.findRoot();
    let effectEvent = gContextDao.getGContextProp("effectEvent");
    let list = Object.keys(effectEvent.effectEventList);
    let len = list.length;
    let needWidth = len * 125 + 100;
    if (root) {
        if (root.pos.x < needWidth) {
            allOffset({ x: needWidth - root.pos.x, y: 0 });
        }
    }
    let current_x = root.pos.x - 125;
    for (let i = 0; i < len; ++i) {
        let entity = gContextDao.findEntityByFtID(list[i]);
        if (entity) {
            entity.pos.x = current_x;
            entity.pos.y = root.pos.y;
            dom.setAttributeByDom(entity.dom, {
                "x": entity.pos.x,
                "y": entity.pos.y,
            });
            current_x -= 125;
        }
    }


}

function updateHSStandardPos() {
    let root = gContextDao.findRoot();
    let hsStandard = gContextDao.getGContextProp("hsStandard");
    let list = Object.keys(hsStandard.standardList);
    let len = list.length;

    let current_x = root.pos.x + 125;
    for (let i = 0; i < len; ++i) {
        let entity = gContextDao.findEntityByFtID(list[i]);
        if (entity) {
            entity.pos.x = current_x;
            entity.pos.y = root.pos.y;
            dom.setAttributeByDom(entity.dom, {
                "x": entity.pos.x,
                "y": entity.pos.y,
            });
            current_x += 125;
        }
    }
}

function hideHSStandardPos() {

}

function selectFirstHSStandard() {
    let hsStandardG = gContextDao.getGContextProp("hsStandard");
    let standardList = hsStandardG.standardList;
    hsStandard.updateHSStandardIndex(standardList[0].id);
}
function updateUDoorMark(id) {
    let entity = gContextDao.findEntity(id);
    dom.updateDoorMark(entity, "user_door");

}
//生成与门代码
function genAndCode(id) {
    let entity = gContextDao.findEntity(id);

    if (entity) {
        let code = "";
        let child = "";
        // if (entity.downEntity.length > 0) {
        for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
            let c = gContextDao.findEntity(entity.downEntity[i]);
            if (i === 0) {
                child += "c[" + c.ftID + "]"
            }
            else {
                child += "&&c[" + c.ftID + "]"
            }
        }
        code =
            'if(' + child + ')\r\n' +
            '    return 1;\r\n' +
            'else\r\n' +
            '    return 0;'
        // }
        // console.log('code', code)
        entity.modelType = 'and_door'
        entity.code = code;
        dom.updateDoorMark(entity, "and_door");
    }
}
// 生成【底事件】与门代码
function bottomAndCode(id) {
    const List = g.gContext.List
    let entity = gContextDao.findEntity(id);
    // console.log('entity', entity)
    const { criterions } = entity
    // if (entity) {
    //     let code = "";
    //     // let child = "";
    //     // if (entity.downEntity.length > 0) {
    //     for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
    //         let c = gContextDao.findEntity(entity.downEntity[i]);
    //         if (i === 0) {
    //             child += "c[" + c.ftID + "]"
    //         }
    //         else {
    //             child += "&&c[" + c.ftID + "]"
    //         }
    //     }
    //     code =
    //         'if(' + child + ')\r\n' +
    //         '    return 1;\r\n' +
    //         'else\r\n' +
    //         '    return 0;'
    //     // }
    //     // console.log('code', code)
    //     entity.code = code;
    //     if (entityId) {//出处：从事件改变门逻辑，此Id为事件Id
    //         let attrData = gContextDao.getGContextProp("attrData");
    //         entity.modelType = 'and_door'
    //         attrData.entity.criterionDoor.type = 'and_door'
    //         attrData.entity.criterionDoor.code = code
    //     }
    //     dom.updateDoorMark(entity, "and_door");
    // }
    let child = "";
    let code = "";
    for (let key in criterions) {
        if (criterions[key] && criterions[key].actived) {
            const index = List.indexOf(key)
            if (index != -1) { child += `c[${Math.abs(22 - index)}]>0&&` }
        }

    }
    child = child.slice(0, -2);//裁剪掉最后两个&&
    // console.log('child', child)
    code =
        'if(' + child + ')\r\n' +
        '    return 1;\r\n' +
        'else\r\n' +
        '    return 0;'
    // console.log(code)
    let attrData = gContextDao.getGContextProp("attrData");
    const criterionDoor = {
        type: 'and_door',
        code
    }
    entity.criterionDoor = criterionDoor

    attrData.entity.criterionDoor.type = 'and_door'
    attrData.entity.criterionDoor.code = code
    // console.log('attrData', attrData.entity.criterionDoor)

    // console.log('entity', gContextDao.getGContextProp("eventEntityMap"))
}
//生成或门代码
function genOrCode(id) {
    let entity = gContextDao.findEntity(id);

    if (entity) {
        let code = "";
        let child = "";
        // if (entity.downEntity.length > 0) {
        for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
            let c = gContextDao.findEntity(entity.downEntity[i]);
            if (i === 0) {
                child += "c[" + c.ftID + "]"
            }
            else {
                child += "||c[" + c.ftID + "]"
            }
        }
        code =
            'if(' + child + ')\r\n' +
            '    return 1;\r\n' +
            'else\r\n' +
            '    return 0;'
        // }
        // console.log('code', code)
        entity.code = code;
        entity.modelType = 'or_door'

        dom.updateDoorMark(entity, "or_door");
    }
    // console.log('entity', gContextDao.getGContextProp("eventEntityMap"))

}
// 生成【底事件】或门代码
function bottomOrCode(id) {
    const List = g.gContext.List
    let entity = gContextDao.findEntity(id);
    // console.log('entity', entity)
    const { criterions } = entity
    let child = "";
    let code = "";
    for (let key in criterions) {
        if (criterions[key] && criterions[key].actived) {
            const index = List.indexOf(key)
            if (index != -1) { child += `c[${Math.abs(22 - index)}]>0||` }
        }

    }
    child = child.slice(0, -2);//裁剪掉最后两个||
    // console.log('child', child)
    code =
        'if(' + child + ')\r\n' +
        '    return 1;\r\n' +
        'else\r\n' +
        '    return 0;'
    // console.log(code)
    let attrData = gContextDao.getGContextProp("attrData");
    // entity.criterionDoor.type = 'or_door'
    // entity.criterionDoor.code = code
    const criterionDoor = {
        type: 'or_door',
        code
    }
    entity.criterionDoor = criterionDoor

    attrData.entity.criterionDoor.type = 'or_door'
    attrData.entity.criterionDoor.code = code
    // console.log('attrData', attrData.entity.criterionDoor)

    console.log('entity', gContextDao.getGContextProp("eventEntityMap"))
}

function genUserCode(id) {
    let entity = gContextDao.findEntity(id);
    if (entity) {
        entity.code = '';
        entity.modelType = 'user_door'
        dom.updateDoorMark(entity, "user_door");
    }
}
// 生成【底事件】自定义门代码
function bottomUserCode(id) {
    let entity = gContextDao.findEntity(id);
    if (entity) {
        let attrData = gContextDao.getGContextProp("attrData");
        entity.criterionDoor.code = '';
        entity.criterionDoor.type = 'user_door'
        attrData.entity.criterionDoor.type = 'user_door'
        attrData.entity.criterionDoor.code = ''
    }
}


export default {
    clearTreeDom,
    selectedTree,
    handleNodeSurface,
    eSort,
    returnTree,
    criterionP,
    updateDi,
    changeDi,
    startCriterion,
    closeCriterion,
    removeActivedLine,
    copy,
    paste,
    _delete,
    updateNodeLevel,
    updateEventType,
    updateNodeProbability,
    createLayout,
    nodeLayout,
    updateNodeName,
    updateLayer,
    updateNodeCriterionImgList,
    updateTreeData,
    deleteTreeByFtID,
    hoverNode,
    explantationNode,
    addNodeImg,
    deleteNodeImg,
    openAutoLayoutMode,
    getNodeImg,
    setNodeBorderColor,
    hsStandard,
    updateHSStandardPos,
    hideHSStandardPos,
    selectFirstHSStandard,
    genAndCode,
    genOrCode,
    genUserCode,
    bottomAndCode,
    bottomOrCode,
    bottomUserCode,
    updateUDoorMark,
};