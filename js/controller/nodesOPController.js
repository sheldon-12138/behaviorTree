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

// 删除树
function deleteTree(treeId) {
    let treeMap = gContextDao.getGContextProp("treeMap");
    // 删除eventEntityMap及dom元素
    __delete(treeMap[treeId].entityMap);
    // 删除treeMap
    delete this.treeMap[treeId];
}

// 删除tabs中的树
function deleteTabTree(treeId) {
    let statusData = gContextDao.getGContextProp("statusData");
    // statusData.currentTreeID = null
    if (statusData.currentTreeID === treeId) {
        closeTab()
    }
    let tabsArr = gContextDao.getGContextProp("tabsArr");
    let index = tabsArr.findIndex(element => element.id === treeId);
    tabsArr.splice(index, 1);
}

// 关闭tab页
function closeTab(index) {
    let statusData = gContextDao.getGContextProp("statusData");
    let tabsArr = gContextDao.getGContextProp("tabsArr");

    const currentTreeID = tabsArr[index].id
    tabsArr.splice(index, 1)
    if ((currentTreeID == statusData.currentTreeID)) {
        if (tabsArr.length > 0) {
            const item = tabsArr[tabsArr.length - 1]
            selectedTree(item.id)
        } else {//关闭最后一个tab
            closeLastTab();
        }
    }
}

// 清空
function closeLastTab() {
    //清空画布树 + 删除复制的子树
    clearTreeDom();
    deleteSubTree();

    let statusData = gContextDao.getGContextProp("statusData");
    statusData.currentTreeID = null;
}

// 选中打开树
function selectedTree(treeId, name) {
    let statusData = gContextDao.getGContextProp("statusData");
    if (treeId === statusData.currentTreeID) return;

    // 清空画布树 + 删除复制的子树
    closeLastTab();

    // 根据数据渲染dom
    let subArr = renderFTree.renderByContext(treeId);
    // console.log(subArr)

    // 添加tab页
    let nodeLayoutFlag = false
    if (name) {
        let tabsArr = gContextDao.getGContextProp("tabsArr");
        const exists = tabsArr.some(element => element.id === treeId);
        if (exists) {
        } else {
            tabsArr.push({ id: treeId, name });
            // 自动布局(新开tab页时才自动布局)
            // _nodeLayout(treeId);
            nodeLayoutFlag = true
        }
    }
    statusData.currentTreeID = treeId;

    //加载子树
    if (subArr.length > 0) {
        subArr.forEach(obj => {
            loadSubTree(treeId, obj.subNodeId, obj.subtreeEvents)
        })
    }
    // if (obj.subTreeId) { loadSubTree(treeId, obj.subNodeId); }

    // 分屏状态下，自动布局
    // if (statusData.isSplitScreen) nodeLayoutFlag = true;
    // if (nodeLayoutFlag) 
    _nodeLayout(treeId);

    viewOPController.updateAmount(["nodeNum"]);
    // 调整画布大小
    gContextController.updateMainSVGSizeUp();
}

// 在副屏打开树（无子树版）
function selectedAssTree(treeId) {
    let statusData = gContextDao.getGContextProp("statusData");
    if (treeId === statusData.currentTreeID2) return;

    if (statusData.currentTreeID2) clearTreeDom(true);
    statusData.currentTreeID2 = treeId;
    renderFTree.renderByContext(treeId, false);
}

// 关闭副屏的tab
function closeAssTab(index) {
    let statusData = gContextDao.getGContextProp("statusData");
    let tabsArr = gContextDao.getGContextProp("tabsArr2");

    const currentTreeID = tabsArr[index].id
    tabsArr.splice(index, 1)
    if ((currentTreeID == statusData.currentTreeID2)) {
        if (tabsArr.length > 0) {
            const item = tabsArr[tabsArr.length - 1]
            selectedAssTree(item.id)
        } else {//关闭最后一个tab 直接合屏
            mergeScreen();
        }
    }
}

// 树切屏
function changeScreen(treeId, index, mainScreenFlag) {
    // console.log('changeScreen', treeId, index, mainScreenFlag);
    // mainScreenFlag表是否从主屏切换到副屏
    let tabsArr = gContextDao.getGContextProp("tabsArr");
    let tabsArr2 = gContextDao.getGContextProp("tabsArr2");
    let statusData = gContextDao.getGContextProp("statusData");


    if (mainScreenFlag) { // 主切副 true
        tabsArr2.push(tabsArr[index]);
        tabsArr.splice(index, 1);

        // 主屏的操作：保持/打开最后一个tabs的树
        if (treeId == statusData.currentTreeID) {//正打开的树切过去
            const item = tabsArr[tabsArr.length - 1]
            selectedTree(item.id)
        }

        selectedAssTree(treeId)
        // 副屏的操作
        // if (statusData.currentTreeID2) {
        //     // 清空副屏画布树 + 删除复制的子树
        //     clearTreeDom(true);
        // }
        // statusData.currentTreeID2 = treeId;
        // renderFTree.renderByContext(treeId, false);//在副屏打开
    } else {//副切主
        tabsArr.push(tabsArr2[index]);
        tabsArr2.splice(index, 1);

        // 副屏的操作：保持/打开最后一个tabs的树
        if (treeId == statusData.currentTreeID2) {//正打开的树切过去
            const item = tabsArr2[tabsArr2.length - 1]
            selectedAssTree(item.id)
        }
        // 主屏
        selectedTree(treeId);
    }

    // 主切副
    // 打开状态
    // tabs减 、tabs2加、currentTreeID2改、
    // selectedTree(treeId, null, false)
}

// 合屏
function mergeScreen() {
    // tabs的操作
    let tabsArr = gContextDao.getGContextProp("tabsArr");
    let tabsArr2 = gContextDao.getGContextProp("tabsArr2");
    tabsArr.push(...tabsArr2);
    tabsArr2.length = 0;

    // 清空副屏画布树 + 删除复制的子树
    clearTreeDom(true);
    // deleteSubTree();

    let statusData = gContextDao.getGContextProp("statusData");
    statusData.currentTreeID2 = null;

    viewOPController.updateAmount(["nodeNum"]);
}

// 加载子树
function loadSubTree(treeId, subNodeId, subtreeEvents, isAssScreen) {
    // console.log('loadSubTree', treeId, subNodeId, subtreeEvents)
    gContextDao.setGContextProp("activedEntityMap", subtreeEvents);
    // 复制子树
    copy();
    paste(true, isAssScreen);

    // 跟主树连接
    let subNode = gContextDao.findEntity(subNodeId);
    // console.log('subNode', subNode)

    let subTreeRoot = findSubTreeRoot(treeId)
    // console.log('subTreeRoot', subTreeRoot)
    if (subTreeRoot) {
        subNode.downEntity.push(subTreeRoot.id);
        subTreeRoot.upEntity.push(subNode.id);


        let newLine = gContextDao.addLine({ entityID: subNode.id, posX: subNode.pos.x + subNode.downNodeOffset.x, posY: subNode.pos.y + subNode.downNodeOffset.y + subNode.lineOffset["down"], type: "down" },
            { entityID: subTreeRoot.id, posX: subTreeRoot.pos.x + subTreeRoot.upNodeOffset.x, posY: subTreeRoot.pos.y + subTreeRoot.upNodeOffset.y + subNode.lineOffset["up"], type: "up" },
            treeId);
        let line = dom.createLine(newLine);
        newLine.dom = line;
        dom.query(isAssScreen ? "#mainSVG2" : "#mainSVG").appendChild(line);
    }

    // 折叠子树节点
    gContextController.foldNodeById(subNode.id)

    gContextDao.setGContextProp("activedEntityMap", {});
}


function findSubTreeRoot(treeId) {
    const eventEntityMap = gContextDao.getGContextProp("eventEntityMap");
    for (let key in eventEntityMap) {
        const entity = eventEntityMap[key];
        if (entity.treeId === treeId && entity.upEntity.length === 0 && entity.type !== 'Top') {
            // console.log('entity', entity);
            return entity;
        }
    }
    return null; // 明确返回null
}

// 清空画布树
function clearTreeDom(isAssScreen) {
    let nodes = dom.queryAll(".node");
    let lines = dom.queryAll(".line");
    // let len = nodes.length;
    let mainSVG = dom.query(isAssScreen ? "#mainSVG2" : "#mainSVG");

    // console.log('清空副画布', isAssScreen);
    for (let i = nodes.length - 1; i >= 0; --i) {
        if (mainSVG.contains(nodes[i])) {
            mainSVG.removeChild(nodes[i]);
        }
    }
    for (let i = lines.length - 1; i >= 0; --i) {
        if (mainSVG.contains(lines[i])) {
            mainSVG.removeChild(lines[i]);
        }
    }

    // 节点数清零
    let amount = gContextDao.getGContextProp("bottomAmount");
    amount.nodeNum = 0;
}

// 移除主树的子树
function deleteSubTree() {
    let eventEntityMap = gContextDao.getGContextProp("eventEntityMap");
    let lineMap = gContextDao.getGContextProp("lineMap");
    let subMap = {}
    for (let key in eventEntityMap) {
        if (eventEntityMap[key].isCopySubTree) {
            subMap[key] = eventEntityMap[key]
        }
    }

    let deleteIdMap = {};
    //删除节点
    for (let key in subMap) {
        let entity = subMap[key];
        if (entity.type === "Top") continue;//顶事件不可删

        let len = entity.upEntity.length;
        for (let upIndex = 0; upIndex < len; ++upIndex) {
            let upEntity = gContextDao.findEntity(entity.upEntity[upIndex]);
            upEntity.downEntity = Utils.removeElement(upEntity.downEntity, entity.id);
        }
        len = entity.downEntity.length;
        for (let downIndex = 0; downIndex < len; ++downIndex) {
            let downEntity = gContextDao.findEntity(entity.downEntity[downIndex]);
            downEntity.upEntity = Utils.removeElement(downEntity.upEntity, entity.id);
        }

        delete (eventEntityMap[key]);
        deleteIdMap[key] = key;

    }
    //删除相关线
    let deleteLineIdMap = {};
    for (let key in deleteIdMap) {
        delete (subMap[key]);
        for (let lineKey in lineMap) {
            if (lineKey.indexOf(key) >= 0) {
                deleteLineIdMap[lineKey] = lineKey;
            }
        }
    }

    for (let key in deleteLineIdMap) {
        delete (lineMap[key]);
    }
}

// 节点别名改动后的处理
function handleNodeSurface(entity, aliasFlag, orgFlag, orgDesIsNull) {
    // console.log('aliasFlag', aliasFlag, 'orgFlag', orgFlag, 'orgDesIsNull', orgDesIsNull)
    // if (!aliasFlag && !orgFlag && orgDesIsNull && (!entity._description)) return

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

// 模型改变后
function handleModelChange(ID, port, type) {
    let eventEntityMap = gContextDao.getGContextProp("eventEntityMap");
    let statusData = gContextDao.getGContextProp("statusData");

    for (let key in eventEntityMap) {
        let entity = eventEntityMap[key];

        if (entity.name === ID && entity.treeId === statusData.currentTreeID) {
            // console.log('jin', entity)
            if (type) {
                entity.type = type;
                // 改type后，更新节点元素
                dom.updateIcon(entity);
            }
            entity.port = port;
            handleNodeSurface(entity,
                entity.aliasName !== entity.name, entity.aliasName !== entity.name, !entity._description)
            // console.log(entity)
        }
    }
}

function _copy() {

    let copyList = {};
    let copyLineList = {};
    let activedMap = gContextDao.getGContextProp("activedEntityMap");
    let statusData = gContextDao.getGContextProp("statusData");
    const treeId = statusData.currentTreeID;

    for (let key in activedMap) {
        let entity = Utils.jsonClone(activedMap[key]);
        entity.treeId = treeId
        if (entity.type === "Top") continue;//顶事件不可复制

        copyList[key] = entity

        let len = entity.upEntity.length;
        for (let upIndex = 0; upIndex < len; ++upIndex) {
            if (activedMap[entity.upEntity[upIndex]]) {
                let endEntity = activedMap[entity.upEntity[upIndex]];

                if (entity.type === "Top" || endEntity.type === "Top") {
                    continue;
                }

                let id = entity.id + "-" + entity.upEntity[upIndex];
                copyLineList[id] = new Line(treeId, id,
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
    // console.log(copyLineList);
};

function copy() {

    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.isCompute) return;
    _copy();
    viewOPController.updateOperationStatus();

}

// 粘贴
function paste(flag, isAssScreen) {
    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.isCompute) return;
    _paste(null, flag, isAssScreen);
    // if (statusData.autoLayoutMode) {
    //     nodeLayout();
    //     gContextController.updateMainSVGSizeUp();
    // }
    viewOPController.updateOperationStatus();
}

function _paste(pasteOffset, flag, isAssScreen) {
    let statusData = gContextDao.getGContextProp("statusData");

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
            newEntity.isCopySubTree = flag
            // console.log(Object.keys(copyList))
            // newEntity.isCopySubTree = Object.keys(copyList).length > 1 ? true : false;

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
            dom.query(isAssScreen ? "#mainSVG2" : "#mainSVG").appendChild(eDom);
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
        let newLine = lineMap[newId] = new Line(statusData.currentTreeID, newId, { entityID: ids[0], posX: bEntity.pos.x + bEntity.upNodeOffset.x, posY: bEntity.pos.y + bEntity.upNodeOffset.y + bEntity.lineOffset[line.begin.type], type: line.begin.type },
            { entityID: ids[1], posX: eEntity.pos.x + eEntity.downNodeOffset.x, posY: eEntity.pos.y + eEntity.downNodeOffset.y + eEntity.lineOffset[line.end.type], type: line.end.type });
        if (newLine) {
            newLine.update();
            let lDom = dom.createLine(newLine);
            newLine.dom = lDom;
            dom.query(isAssScreen ? "#mainSVG2" : "#mainSVG").appendChild(lDom);
        }
    }

    // console.log(copyLineList);
    clipBoard.pasteOffset.x += 10;
    clipBoard.pasteOffset.y += 10;

    // 展开折叠的节点
    // for (let key in newIdMap) {
    //     updateCollapseByChild(newIdMap[key]);
    // }

    // updateLayer();
    viewOPController.updateAmount(["nodeNum", "maxLayer", "topNodeNum", "midNodeNum",
        "bottomNodeNum", "doorType", "doorNum", "maxDamageLevel", "criterionNum", "criterionTypeNum",
        "criterionRelevanceNum"]);
};

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

function __delete(deleteMap) {
    // console.log('delete', deleteMap)
    removeActivedLine();

    let activedEntityMap = deleteMap || gContextDao.getGContextProp("activedEntityMap");
    let eventEntityMap = gContextDao.getGContextProp("eventEntityMap");
    let lineMap = gContextDao.getGContextProp("lineMap");

    let deleteIdMap = {};
    //删除节点
    for (let key in activedEntityMap) {
        let entity = activedEntityMap[key];
        if (entity.type === "Top" && !deleteMap) continue;//顶事件不可删(当删除整个树时，顶事件会被删掉)

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
        delete (eventEntityMap[key]);
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

    if (!deleteMap) gContextDao.setGContextProp("activedEntityMap", {});
    // updateLayer();
    viewOPController.updateAmount(["nodeNum", "maxLayer", "topNodeNum", "midNodeNum",
        "bottomNodeNum", "doorType", "doorNum", "maxDamageLevel", "criterionNum", "criterionTypeNum",
        "criterionRelevanceNum"]);
}

//修改名称
function updateNodeName(nodeId) {
    let entity = gContextDao.findEntity(nodeId);
    if (entity) {
        let strList = Utils.splitByLine(entity.name, (entity.size.width * 2 / 3.0), 10);
        dom.updateNameNode(entity, strList, 10);
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
            if (child && child.dom.classList.contains("node-render")) continue;
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
    const statusData = gContextDao.getGContextProp("statusData");
    _nodeLayout(currentTreeID ? currentTreeID : statusData.currentTreeID);
    // console.log(g.gContext.eventEntityMap)
    // updateEffectPos();
    // updateHSStandardPos();
}
//自动布局
function _nodeLayout(treeId) {
    // console.log('自动布局了', treeId)
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
    // console.log('tree', roots);
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

// 修改树名——实则修改树根节点的modelType属性
function editTreeName(nodeId, label) {
    let entity = gContextDao.findEntity(nodeId);
    if (entity && entity.type == 'Top') {
        entity.modelType = label
    }
}

export default {
    selectedAssTree,
    closeAssTab,

    changeScreen,
    mergeScreen,
    explantationNode,
    deleteTree,
    deleteTabTree,
    editTreeName,
    closeTab,
    loadSubTree,
    handleModelChange,
    clearTreeDom,
    selectedTree,
    handleNodeSurface,
    eSort,
    returnTree,
    removeActivedLine,
    copy,
    paste,
    _delete,
    createLayout,
    nodeLayout,
    updateNodeName,
    updateTreeData,
    deleteTreeByFtID,
    hoverNode,

    openAutoLayoutMode,

};