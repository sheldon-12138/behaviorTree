import { g } from "../structure/gContext.js";
import Utils from "../utils/utils.js";
import { EventEntity } from "../structure/entity.js";
import Model from "../structure/model.js";
import Line from "../structure/line.js";
import TreeNode from "../structure/newTreeNode.js";

var gContext = g.gContext;


// 检查dc数据是否有效
function checkCriterion(userCode, dcType) {
    // userCode = userCode.replace(/\s/g, '')
    let flag = false //显示红框
    if (userCode) {
        switch (dcType) {
            case 'DT_01': {
                let pattern = /^\d+(\.\d+)?(,\d+(\.\d+)?){0,3}$/  // 正则匹配 /^\d+(,\d+){0,3}$/
                flag = pattern.test(userCode)
                if (flag) {
                    const arr = userCode.split(",").map(Number);
                    const sortFlag = arr.every((val, i, array) => i === 0 || val > array[i - 1]);
                    flag = sortFlag
                }
                break;
            }
            case 'DT_LINEAR': {
                let pattern = /^\d+(\.\d+)?(,\d+(\.\d+)?){0,3}$/; // 正则匹配
                flag = pattern.test(userCode)
                if (flag) {
                    const arr = userCode.split(",").map(Number);
                    const sortFlag = arr.every((val, i, array) => i === 0 || val > array[i - 1]);
                    flag = sortFlag
                }
                break;
            }
            case 'DT_EXP': {
                // let pattern =/^\d+(\.\d+)?,\d+(\.\d+)?$/
                // let pattern = /^\d+(\.\d+)?(,\d+(\.\d+)?){0,1}$/
                // flag = pattern.test(userCode)
                let arr = userCode.split(',')
                if (arr.length == 2 && Number(arr[0]) >= 0 && Number(arr[1]) > 0) {
                    flag = true
                }
                break;
            }
            case 'DT_CURVE': {
                const lines = userCode.split("\n");
                if (lines.length % 2 == 0 && lines.length >= 2 && lines.length <= 10) {
                    let pattern = /^\d+(\.\d+)?(,\d+(\.\d+)?){0,9}$/
                    flag = lines.every((item, index) => {
                        if (pattern.test(item)) {
                            const arr = item.split(",").map(Number);
                            if (index % 2 == 0) return arr.every((val, i, array) => i === 0 || val >= array[i - 1]);
                            else return arr.every((val, i, array) => i === 0 || val <= array[i - 1]);
                        } else return false
                    })
                }
                break;
            }
            case 'DT_UD': {
                flag = true
                break;
            }
            default: {
                console.log('未知操作')
                break;
            }
        }
    }
    return flag
}

function addEntity(entity) {

    if (!entity.category) {
        return "请输入类型参数如entity.category='door'";
    }
    if (entity.category === "event") {
        return addEventEntity(entity);
    }


    return null;
};
function generateID() {
    let id = Utils.GenNonDuplicateID();
    while (gContext.eventEntityMap[id]) {
        id = Utils.GenNonDuplicateID();
    }
    return id;
};
function addEventEntity(entity) {
    let id = generateID();
    let event = new EventEntity(id, entity.btID || "", entity.type,
        entity.name || "", entity.aliasName || "", entity.size || {}, entity.pos || {},
        entity.hasUpNodes, entity.hasDownNodes, entity.collapse,
        entity.textColor || '#fff',
        entity._description, entity._skipif, entity._successif, entity._failureif, entity._while,
        entity._onSuccess, entity._onFailure, entity._onHalted, entity._post, entity.treeId || 'newTree',);

    event.dom = entity.dom || null;

    event.modelType = entity.modelType;
    event.textColor = entity.textColor;

    event.port = entity.port;

    // event.desc = entity.desc || "";
    // console.log('event',event)
    return gContext.eventEntityMap[id] = event;
};

function findEntity(key) {
    return gContext.doorEntityMap[key] ? gContext.doorEntityMap[key] : gContext.eventEntityMap[key] ? gContext.eventEntityMap[key] : null;
};
function findEntityByFtID(id) {
    let events = gContext.eventEntityMap;
    for (let key in events) {
        let event = events[key];
        if (event.ftID === id)
            return event;
    }
    let doors = gContext.doorEntityMap;
    for (let key in doors) {
        let door = doors[key];
        if (door.ftID === id)
            return door;
    }
    return null;
}

// function findEntityByImgName(imgName) {
//     let events = gContext.eventEntityMap;
//     let filteredEvents = {};
//     for (let key in events) {
//         let event = events[key];
//         if (event.imgName === imgName)
//             filteredEvents.push(event);
//     }
//     return null;
// }

function filterEventsByImgName(imgName) {
    let events = gContext.eventEntityMap;
    let filteredEvents = {};

    for (let key in events) {
        if (events.hasOwnProperty(key)) { // 确保属性是对象自身的属性，而不是从原型链继承的属性
            let event = events[key];
            if (event.imgName === imgName) {
                filteredEvents[key] = event;
            }
        }
    }

    return filteredEvents;
}
function setEntity(key, entity) {
    return gContext.doorEntityMap[key] ? gContext.doorEntityMap[key] = entity : gContext.eventEntityMap[key] ? gContext.eventEntityMap[key] = entity : null;
}
function getEntityProp(id, key) {
    let entity = findEntity(id);
    if (entity)
        return entity[key];
    return null;
};
function alterEntity(id, key, value) {
    let entity = findEntity(id);
    entity[key] = value;

};
function removeEntity(key) {
    if (gContext.doorEntityMap[key]) {
        return delete (gContext.doorEntityMap[key]);
    }
    else if (gContext.eventEntityMap[key]) {
        return delete (gContext.eventEntityMap[key]);
    }
    return false;
};

function addLine(begin, end, treeId) {
    let lineId = begin.entityID + "-" + end.entityID;
    let newLine = new Line(treeId, lineId, begin, end, true);
    newLine.update();
    return gContext.lineMap[lineId] = newLine;
};
function findLine(id) {
    return gContext.lineMap[id];
}
function addDoorModel(model) {
    let door = new Model(model.path,
        model.type,
        model.name, model.aliasName, model.sizeList, model.hasUpNodes, model.hasDownNodes);
    gContext.doorModelList.push(door);
    return door;
};
function addEventModel(model) {
    let event = new Model(model.path,
        model.type,
        model.name, model.aliasName, model.sizeList, model.hasUpNodes, model.hasDownNodes);
    gContext.doorModelList.push(event);
    return event;
};
function findActiveEntity(id) {
    return gContext.activedEntityMap[id];
};
function getGContextProp(key) {
    return gContext[key];
};
function setGContextProp(key, value) {

    return gContext[key] = value;

};
function _updateMaxPosition(entity, maxPosition) {
    if (entity.pos.x > maxPosition.x) {
        maxPosition.x = entity.pos.x;
    }
    if (entity.pos.y > maxPosition.y) {
        maxPosition.y = entity.pos.y;
    }
};
function getMaxPosition() {
    let events = gContext.eventEntityMap;
    let doors = gContext.doorEntityMap;
    let maxPosition = { x: 0, y: 0 };
    for (let key in doors) {
        _updateMaxPosition(doors[key], maxPosition);
    }
    for (let key in events) {
        _updateMaxPosition(events[key], maxPosition);
    }
    return maxPosition;
};

function recordInitialPosition() {
    let acMap = getGContextProp("activedEntityMap");
    let position = {};
    for (let key in acMap) {
        position[key] = acMap[key].pos;
    }
    setGContextProp("initialPosition", position);
};

function getModel(key, value) {
    for (let i = 0; i < gContext.doorModelList.length; ++i) {
        if (gContext.doorModelList[i][key] === value)
            return gContext.doorModelList[i];
    }
    for (let i = 0; i < gContext.eventModelList.length; ++i) {
        if (gContext.eventModelList[i][key] === value)
            return gContext.eventModelList[i];
    }
};
function getModelByType(type) {
    return getModel("type", type);
};
function getModelByName(name) {
    return getModel("name", name);
};
// 清空context
function clearContext() {
    gContext.doorEntityMap = {};
    gContext.eventEntityMap = {};
    gContext.entityTree = [];
    gContext.lineMap = {};
    // gContext.userLineMap = {};
    //gContext.attrData.entity = {criterions:null};
    // gContext.attrData.entity = Object.assign(gContext.attrData.entity, {});
    gContext.statusData.attrID = -1;

    // 新增的
    gContext.statusData.isShowProperty = false;//是否显示属性框弹窗
    gContext.statusData.isShowCriterionPop = false;//是否显示判据排列列表
    gContext.statusData.isShowBottomMsg = false;    //是否显示底部分析计算信息
    gContext.statusData.canvasChanged = false;    //标识项目是否有改动


    gContext.failureComputedData.computedRenderID = false;
    gContext.failureComputedData.computedRenderList = ['notWave', 'yellowWave', 'orangeWave', 'redWave', 'crimsonWave'];
    gContext.failureComputedData.result = null;

    //当前选中的实体
    gContext.activedLine = null;  //选中的连线数据
    gContext.activedEntityMap = {}; //所有选中的节点数据
    gContext.activedEntityNode = null; //选中的节点，用于属性栏
    gContext.activedLineMap = {};//选中的节点相关的线
    gContext.hsStandard.standardList = [];
    gContext.hsStandard.currentIndex = -1;
};
//遍历节点列表迭代器
function* traverseNode(treeId) {
    for (let key in g.gContext.eventEntityMap) {
        if (treeId == g.gContext.eventEntityMap[key].treeId)
            yield g.gContext.eventEntityMap[key];
    }
    for (let key in g.gContext.doorEntityMap) {
        yield g.gContext.doorEntityMap[key];
    }
};
function findCriterion(type) {
    for (let i = 0, len = g.gContext.criterionList.length; i < len; ++i) {
        if (g.gContext.criterionList[i].type === type) {
            return g.gContext.criterionList[i];
        }
    }
    return null;
};
function traverseCriterion(callback) {
    if (typeof callback === "function") {
        for (let i = 0, len = g.gContext.criterionList.length; i < len; ++i) {
            callback(g.gContext.criterionList[i]);
        }
    }
    else {
        console.log("The type of the parameter error");
        return;
    }
};
//节点初始化判据
function initNodeCriterion(entity) {
    if (!entity.criterions) {// 检查实体对象是否具有 "criterions" 属性
        console.log("criterions undefind");
        return;
    }
    let cris = {};
    traverseCriterion((criterion) => {
        let type = criterion.type;
        // console.log('type', type)
        // console.log('entity.criterions', entity.criterions)
        if (!entity.criterions[type]) {
            // console.log('criterion', criterion)
            cris[type] = {
                "actived": false,
                "value": "",
                "dcId": '',
                'p': []
            }
        }
    });
    entity.criterions = Object.assign(entity.criterions, cris);

};
//修改节点毁伤等级和毁伤概率根据ID
function setLevelAndProByFtID(ftID, level, probability) {
    let entity = findEntityByFtID(ftID);
    setLevelAndProByEntity(entity, level, probability);
};
//修改节点毁伤等级和毁伤概率根据entity
function setLevelAndProByEntity(entity, level, probability) {
    if (entity.level) {
        entity.level = level;
        entity.probability.splice(0, entity.probability.length);
        if (!probability) {
            for (let i = 0; i < level + 1; ++i) {
                entity.probability.push((1.0 / (level + 1)).toFixed(3));
            }
        }
        for (let i = 0; i < level + 1; ++i) {
            entity.probability.push(probability[i]);
        }
    }
}

let imgManager = (function () {

    let images = {};

    return {
        getNodeImg: function (imgName) {
            return images[imgName];
        },
        setNodeImg: function (imgName, file) {
            images[imgName] = file;
        },
    }
})();

//查找根节点
function findRoot() {
    for (let key in g.gContext.eventEntityMap) {
        if (g.gContext.eventEntityMap[key].modelType.includes("top")) {
            return g.gContext.eventEntityMap[key];
        }
    }
    return null;
}
// 查找根节点id
function findTopNodeId() {
    for (const [id, entity] of Object.entries(g.gContext.eventEntityMap)) {
        if (entity.modelType === 'Top') {
            return id;
        }
    }
    return null;
}

// 返回树结构
function returnTree() {
    const { eventEntityMap } = g.gContext;
    let tree = buildTree(findTopNodeId(), eventEntityMap)
    // console.log('tree', tree)
    return tree;
}

function buildTree(nodeId, eventEntityMap) {
    const nodeData = eventEntityMap[nodeId];
    if (!nodeData) { return null }
    const children = nodeData.downEntity ? nodeData.downEntity.map(childId => buildTree(childId, eventEntityMap)) : [];
    let attrObj = {}
    // console.log('nodeData', nodeData)
    if (nodeData.aliasName != nodeData.name) { attrObj.name = nodeData.aliasName }

    const attrKeys = ['_description', '_skipif', '_successif', '_failureif', '_while', '_onSuccess', '_onFailure', '_onHalted', '_post'];
    attrKeys.forEach(key => {
        if (nodeData[key]) {
            attrObj[key] = nodeData[key];
        }
    });

    return new TreeNode(nodeData.id, nodeData.name, attrObj, children);
}

//计算总层数包括门
function amountLayer(num) {
    let maxLayer = 0;
    let root = findRoot();
    let queue = [];

    if (root) {
        queue.push(root.id);
        while (queue.length > 0) {
            ++maxLayer;
            let len = queue.length;
            let layerInfo = {
                fold: false,
                data: queue.slice()
            }
            num.push(layerInfo);
            while (len > 0) {
                let id = queue.shift();
                let node = findEntity(id);
                if (node) {
                    for (let i = 0; i < node.downEntity.length; ++i) {
                        queue.push(node.downEntity[i]);
                    }
                }
                --len;
            }
        }
    }
    return maxLayer;
}

let hsStandard = (function () {
    return {
        //修改hs标准等级
        updateHsStandardLevel(target) {

        },
        //添加标准
        addHSStandard(id, target) {
            let hsStandard = getGContextProp("hsStandard");
            let standardList = hsStandard.standardList;
            if (target) {
                standardList[id] = target;
            }
            else {
                let standard = {
                    code: "",
                    levelCatch: {},
                };
                for (let i = 1; i < 5; ++i) {
                    standard.levelCatch[i] = [];
                    for (let j = 0; j < i + 1; ++j) {
                        let levelDescribe = {
                            levelName: `level${j + 1}`,
                            aliasLevelName: `等级${j + 1}`,
                            describe: "",
                            understandDescribe: "",
                        };
                        standard.levelCatch[i].push(levelDescribe);
                    }
                }

                standardList[id] = (standard);
            }
        },

        removeHSStandard(id) {
            let hsStandard = getGContextProp("hsStandard");
            let standardList = hsStandard.standardList;
            delete standardList[id];

        },
    }
})();

let effectProxy = (function () {
    return {
        addEffectEvent(ftID, target) {
            let effectEvent = getGContextProp("effectEvent");
            if (target) {
                effectEvent.effectEventList[ftID] = target;
            }
            else {
                let effect = {
                    code: "",
                    stats: [],
                };
                effectEvent.effectEventList[ftID] = effect;
            }
        },
        removeEffectEvent(ftID) {
            let effectEvent = getGContextProp("effectEvent");

            if (effectEvent.effectEventList.hasOwnProperty(ftID)) {
                delete effectEvent.effectEventList[ftID];
            }
        },
        setEffectStats(ftID, stats) {
            let effectEvent = getGContextProp("effectEvent");
            if (effectEvent.effectEventList.hasOwnProperty(ftID)) {
                effectEvent.effectEventList[ftID].stats = stats;
            }
        },

    }
})();

export default {
    generateID,
    returnTree,
    findTopNodeId,
    checkCriterion,
    filterEventsByImgName,
    addEventEntity,
    // addDoorEntity,
    removeEntity,
    getGContextProp,
    findActiveEntity,
    addDoorModel,
    addEventModel,
    setGContextProp,
    addEntity,
    recordInitialPosition,
    getModelByType,
    findEntity,
    getModelByName,
    clearContext,
    addLine,
    getMaxPosition,
    setEntity,
    traverseNode,
    findEntityByFtID,
    findLine,
    findCriterion,
    traverseCriterion,
    initNodeCriterion,
    setLevelAndProByFtID,
    setLevelAndProByEntity,
    // imgManager,
    findRoot,
    // hsStEventEntityctProxy,
    amountLayer,
}