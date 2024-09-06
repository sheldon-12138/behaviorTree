import gContextDao from "../dao/gContextDao.js";
import { g } from "../structure/gContext.js";
import Criterion from "../structure/criterion.js";
import codec from "../codec/codec.js"
import color from "../utils/color.js";
import computeController from "../controller/computeController.js";
import gContextController from "../controller/gContextController.js"
import dom from "../viewModel/dom.js";

//将解析节点函数注册到解析器中
// const parseNode = {
//     "FT_NODE": ftNode,
//     "LINE": ftLine,
//     "INFO": infoNodes,
//     "INFO_PREVIEW": infoNodes2,
//     "INFO_HOVER_PREVIEW": infoNodes3,
//     // "DAMAGE_ASSOCIATION": daNode,
//     "PI": piNode,
//     "VERSION": infoNodes.bind(null, "VERSION"),
//     "NAME": infoNodes.bind(null, "NAME"),
//     "LEVEL": infoNodes.bind(null, "LEVEL"),
//     "CREATETIME": infoNodes.bind(null, "CREATETIME"),
//     "UPDATETIME": infoNodes.bind(null, "UPDATETIME"),
//     "UNIT": infoNodes.bind(null, "UNIT"),
//     "CONFIDENCE": infoNodes.bind(null, "CONFIDENCE"),
//     "DESCRIBE": infoNodes.bind(null, "DESCRIBE"),
//     "VERIFICATION": infoNodes.bind(null, "VERIFICATION"),
//     "STANDARD": standardNode,

// };


function func(x) {
    return 1 - Math.pow(Math.E, 2.0 * (x - 2.6));
}



function getSumY(data1, t, o) {
    let sum = 0
    sum += data1[t][o] ? data1[t][o][1] : 0
    // console.log(t, sum)
    return Math.min(parseInt3(sum), 1)
}

function getIntersection(point1, point2, axis) {
    const k = (point2[1] - point1[1]) / (point2[0] - point1[0])
    if (axis == 'x') {
        const x = point2[0] - point2[1] / k
        // console.log(point1, point2, x)
        return parseInt3(x)
    } else if (axis == 'y') {
        const b = point2[1] - k * point2[0]
        // console.log(point1, point2, b)
        return parseInt3(b)
    }
}

function totalize(data, k) {
    let sum = 0;
    for (let r in data) {
        if (r == 0) continue;
        sum += data[r][k][1]
    }
    sum = Math.min(sum, 1)
    let num = parseInt3(1 - sum)
    // console.log(num)
    return num
}

function getY(fun, xValue) {
    let modifiedExpression = fun.replace(/x/gi, xValue);//取代x
    modifiedExpression = modifiedExpression.replace(/e\^/gi, "Math.exp");

    const result = eval(modifiedExpression); // 使用 eval() 计算表达式结果
    return parseIntNum(result, 4);
}

// 保留3位小数
function parseInt3(x) {
    return parseFloat(x.toFixed(3));
}

// 保留5位小数
function parseIntNum(x, n) {
    return parseFloat(x.toFixed(n));
}



// fileInfoPreview  INFO_PREVIEW
function infoParser2(content) {
    if (content === "") {
        return;
    }
    let fileInfo = gContextDao.getGContextProp("fileInfoPreview");
    fileInfo = Object.assign(fileInfo, initInfo());

    content = content.replace(/\r\n/g, "\n");
    let nodeStr = content.split("*");
    //删除第0个元素，是空元素
    nodeStr.splice(0, 1);

    let len = nodeStr.length;
    //加载所有节点
    for (let i = 0; i < len; ++i) {
        let lines = nodeStr[i].split("\n");
        let type = lines[0];
        let parseFun = parseNode["INFO_PREVIEW"];
        if (parseFun) {
            lines.splice(0, 1);
            let data = lines.join("\n");
            let res = parseFun(type, data);
        }
    }
}

// fileInfoHoverPreview INFO_HOVER_PREVIEW
function infoParser3(content) {
    if (content === "") {
        return;
    }
    let fileInfo = gContextDao.getGContextProp("fileInfoHoverPreview");
    fileInfo = Object.assign(fileInfo, initInfo());

    content = content.replace(/\r\n/g, "\n");
    let nodeStr = content.split("*");
    //删除第0个元素，是空元素
    nodeStr.splice(0, 1);

    let len = nodeStr.length;
    //加载所有节点
    for (let i = 0; i < len; ++i) {
        let lines = nodeStr[i].split("\n");
        let type = lines[0];
        let parseFun = parseNode["INFO_HOVER_PREVIEW"];
        if (parseFun) {
            lines.splice(0, 1);
            let data = lines.join("\n");
            let res = parseFun(type, data);
        }
    }
}

function initInfo() {
    return {
        version: "",
        name: "",
        level: "",
        createTime: "",
        updateTime: "",
        createUnit: "",
        confidence: "",
        founder: "",
        contactInformation: "",
        describe: "",
        verification: "",

    }
}


function infoNodes(type, data) {
    let info = gContextDao.getGContextProp("fileInfo");
    // let info = g.gContext.fileInfo;
    let reg = /(.*)\n/ms;
    reg.test(data);
    if (type === "VERSION") {
        info.version = RegExp.$1;
    } else if (type === "NAME") {
        info.name = RegExp.$1;
    } else if (type === "LEVEL") {
        info.level = parseInt(RegExp.$1);
    } else if (type === "CREATETIME") {
        info.createTime = RegExp.$1;
    } else if (type === "UPDATETIME") {
        info.updateTime = RegExp.$1;
    } else if (type === "UNIT") {
        info.createUnit = RegExp.$1;
    } else if (type === "CONFIDENCE") {
        info.confidence = RegExp.$1;
    } else if (type === "FOUNDER") {
        info.founder = RegExp.$1;
    } else if (type === "CONTACT") {
        info.contactInformation = RegExp.$1;
    } else if (type === "DESCRIBE") {
        info.describe = RegExp.$1;
    } else if (type === "VERIFICATION") {
        info.verification = RegExp.$1;
    }

    return null;
}

function infoNodes2(type, data) {
    let info = gContextDao.getGContextProp("fileInfoPreview");
    // let info = g.gContext.fileInfo;
    let reg = /(.*)\n/ms;
    reg.test(data);
    if (type === "VERSION") {
        info.version = RegExp.$1;
    } else if (type === "NAME") {
        info.name = RegExp.$1;
    } else if (type === "LEVEL") {
        info.level = parseInt(RegExp.$1);
    } else if (type === "CREATETIME") {
        info.createTime = RegExp.$1;
    } else if (type === "UPDATETIME") {
        info.updateTime = RegExp.$1;
    } else if (type === "UNIT") {
        info.createUnit = RegExp.$1;
    } else if (type === "CONFIDENCE") {
        info.confidence = RegExp.$1;
    } else if (type === "FOUNDER") {
        info.founder = RegExp.$1;
    } else if (type === "CONTACT") {
        info.contactInformation = RegExp.$1;
    } else if (type === "DESCRIBE") {
        info.describe = RegExp.$1;
    } else if (type === "VERIFICATION") {
        info.verification = RegExp.$1;
    }

    return null;
}

function infoNodes3(type, data) {
    let info = gContextDao.getGContextProp("fileInfoHoverPreview");
    // let info = g.gContext.fileInfo;
    let reg = /(.*)\n/ms;
    reg.test(data);
    if (type === "VERSION") {
        info.version = RegExp.$1;
    } else if (type === "NAME") {
        info.name = RegExp.$1;
    } else if (type === "LEVEL") {
        info.level = parseInt(RegExp.$1);
    } else if (type === "CREATETIME") {
        info.createTime = RegExp.$1;
    } else if (type === "UPDATETIME") {
        info.updateTime = RegExp.$1;
    } else if (type === "UNIT") {
        info.createUnit = RegExp.$1;
    } else if (type === "CONFIDENCE") {
        info.confidence = RegExp.$1;
    } else if (type === "FOUNDER") {
        info.founder = RegExp.$1;
    } else if (type === "CONTACT") {
        info.contactInformation = RegExp.$1;
    } else if (type === "DESCRIBE") {
        info.describe = RegExp.$1;
    } else if (type === "VERIFICATION") {
        info.verification = RegExp.$1;
    }

    return null;
}


function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

//解析ft文件
function ftParser(content) {
    // console.log(content);
    if (content === "") {
        return;
    }
    content = content.replace(/\r\n/g, "\n");
    let nodeStr = content.split("\n*");
    // console.log('nodeStr', nodeStr)
    //删除第0个元素，是空元素[修改切割规则后无需删除]
    // nodeStr.splice(0, 1);

    nodeStr[0] = nodeStr[0][0] == '*' ? nodeStr[0].substring(1) : nodeStr[0]//去掉*FT_DESC的*


    let tempNodes = {};
    let tempNodesBtID = [];

    let len = nodeStr.length;
    //加载所有节点
    for (let i = 0; i < len; ++i) {
        let lines = nodeStr[i].split("\n");
        if (i < len - 1) lines.push('')
        // console.log('lines', lines)
        let type = lines[0];
        if (infoKeyword.hasOwnProperty(type)) {
            lines.splice(0, 1);
            let data = lines.join("\n");
            infoNodes(type, data);
            continue;
        }
        if (type === "STANDARD") {
            lines.splice(0, 1);
            let data = lines.join("\n");
            standardNode(data);
            continue;
        }
        if (type === "EFFECT") {
            lines.splice(0, 1);
            let data = lines.join("\n");
            effectNode(data);
            continue;
        }
        let parseFun = parseNode[type];
        // console.log(type);
        if (parseFun) {
            lines.splice(0, 1);
            let data = lines.join("\n");
            let res = parseFun(data);
            if (res && res.entity) {
                tempNodes[res.ftID] = res.entity;
                tempNodesBtID.push(res.ftID);
            }
        }
    }

    //加载所有节点之间的连线
    let tLen = tempNodesBtID.length;
    for (let i = 0, k = 0; i < len && k < tLen; ++i) {

        let lines = nodeStr[i].split("\n");
        // console.log('lines', lines)
        let type = lines[0];//节点类型（ftNode、stand、effect等）
        if (infoKeyword.hasOwnProperty(type)) {
            continue;
        }
        const arr = lines[1].split(",")
        let hasChild = (lines.length >= 3 && arr[1] !== "EVENT_BOTTOM");
        if (hasChild) {
            parseNode["LINE"](tempNodesBtID[k], lines[2], tempNodes);
        }
        ++k;
    }
    //console.log(gContextDao.getGContextProp("eventEntityMap"));
};

// 解析xml文件
function xmlParser(content, xmlName) {
    if (content === "") { return; }
    let { BehaviorTree, TreeNodesModel } = content.root
    let projectObj = gContextDao.getGContextProp("projectObj");

    // 调整结构


    if (xmlName) {//通过项目遍历读文件
        let projStruct = []

        let modelList = gContextDao.getGContextProp("modelList");
        if (modelList.length == 4) {
            modelList.push({
                ID: '子树',
                type: 'SubTree',
                children: []
            })
        }
        BehaviorTree.forEach(item => {
            // console.log(item.$.ID)
            projectObj[xmlName] = {
                [`${item.$.ID}`]: item
            }
            projStruct.push({ label: item.$.ID })
            // console.log(index, parseEntityArr(item))
            modelList[4].children.push({ ID: item.$.ID, isUser: true })
            // haidesgudaxyued
        })
        return projStruct
    } else {//读单个xml文件
        handeTreeNodesModel(TreeNodesModel[0])
        loadXml(BehaviorTree[1])
        // BehaviorTree.forEach(item => {

        // })


    }
}

function loadXml(BehaviorTree) {
    let tempNodes = {};
    let tempNodesBtID = [];

    let entityArr = parseEntityArr(BehaviorTree)

    // 添加子树节点
    let modelList = gContextDao.getGContextProp("modelList");
    if (modelList.length == 4) {
        modelList.push({ ID: '子树', type: 'SubTree', children: [] })
    }
    modelList[4].children.push({ ID: BehaviorTree.$.ID, isUser: true, })

    // console.log(entityArr)
    for (let i = 0; i < entityArr.length; i++) {
        // console.log(entityArr[i])
        let { ID, modelName, btID, name, _description,
            _skipif, _successif, _failureif, _while,
            _onSuccess, _onFailure, _onHalted, _post } = entityArr[i]


        // 添加自定义节点的端口信息
        const port = findNodePort(modelName)
        let portLength = 0
        if (port) {
            Object.keys(port).forEach(key => {
                if (entityArr[i][key]) {
                    port[key].value = entityArr[i][key];
                }
            });
            portLength = Object.keys(port).length
        }

        let type = findParentTypeById(modelName)
        if (modelName == 'SubTree') modelName = ID

        let model = gContextDao.getModelByType(type || 'Top');
        // console.log('modelName', modelName, 'type', type, 'model', model)
        // console.log(entityArr[i])

        let len = modelName ? modelName.length : 4
        let nameLength = 0
        let haveAlias = name && name !== modelName
        if (haveAlias) nameLength = name.length

        const iconName = dom.imgName({ type: type || 'Top', name: modelName })
        const width = Math.max(20 + (iconName ? 30 : 0) + len * 11 + (_description ? 30 : 0), nameLength * 11 + 20);
        const height = 60 + (haveAlias ? 30 : 0) + portLength * 53 + (type == 'SubTree' ? 15 : 0)

        let entityProp = {
            btID,
            type: model.type,
            // size: model.sizeList[1],
            size: {
                width: width || model.sizeList[1].width,
                height: height || model.sizeList[1].height
            },
            pos: { x: 100 * (i + 1), y: 100 * (i + 1) },
            hasUpNodes: model.hasUpNodes,
            hasDownNodes: model.hasDownNodes,
            collapse: null,
            category: model.category,
            modelType: model.type,
            aliasName: name || modelName || model.name,
            name: modelName || model.name,
            textColor: model.textColor,

            _description: _description || '',

            _skipif: _skipif || '',
            _successif: _successif || '',
            _failureif: _failureif || '',
            _while: _while || '',

            _onSuccess: _onSuccess || '',
            _onFailure: _onFailure || '',
            _onHalted: _onHalted || '',
            _post: _post || '',

            port: port || null,

        }
        const entity = gContextDao.addEntity(entityProp);
        // console.log('entity', entity)

        tempNodes[btID] = entity;
        tempNodesBtID.push(btID);
    }

    // 加载实体的父节点子节点ID
    for (let k = 0; k < tempNodesBtID.length; k++) {
        if (entityArr[k].downEntity.length > 0) {
            btLine(tempNodesBtID[k], entityArr[k].downEntity, tempNodes);
        }
    }
}


function findNodePort(modelName) {
    let modelList = gContextDao.getGContextProp("modelList");
    // console.log('modelList', modelList)
    let result = null
    for (let i = 0; i < 4; i++) {
        modelList[i].children.forEach(item => {
            if (item.port && Object.keys(item.port).length > 0 && item.ID == modelName) {
                result = item.port
            }
        })
    }
    return result
}

// 解析proj文件
function projParser(content) {
    if (content === "") { return; }

    let { include, TreeNodesModel } = content.root
    let btFormat = content.root.$.BTCPP_format
    let projectName = content.root.$.project_name

    handeTreeNodesModel(TreeNodesModel[0])
    let pathArr = handeInclude(include)
    let obj = {
        btFormat,
        projectName,
        pathArr
    }
    return obj
    // console.log(content, pathArr);
}

// 处理项目文件中的 include 标签
function handeInclude(include) {
    let pathArr = []
    include.forEach(item => {
        pathArr.push(item.$.path)
    });
    return pathArr;
}

// 解析树结构，返回实体数组
function parseEntityArr(node) {
    let entityArr = [];
    let btIDCounter = 1;
    function traverse(node, parentKey = null, parentId = null) {
        if (typeof node === 'object' && !Array.isArray(node)) {
            let entity = {};
            let currentId = btIDCounter++;
            entity.btID = currentId;
            entity.upEntity = parentId !== null ? [parentId] : [];
            entity.downEntity = [];

            for (let key in node) {
                if (parentKey) entity.modelName = parentKey;
                if (key === '$') {
                    Object.assign(entity, node[key]);
                } else if (Array.isArray(node[key])) {
                    let childIds = node[key].map(child => traverse(child, key, currentId));
                    entity.downEntity.push(...childIds.filter(id => id !== null));
                    if (node[key].length === 1 && node[key][0] === '') {//叶子结点
                        let leafId = btIDCounter++;
                        entity.downEntity.push(leafId);
                        entityArr.push({ modelName: key, btID: leafId, upEntity: [currentId], downEntity: [] });
                    }
                } else {
                    let childId = traverse(node[key], key, currentId);
                    if (childId !== null) {
                        entity.downEntity.push(childId);
                    }
                }
            }

            if (Object.keys(entity).length > 0) {
                entityArr.push(entity);
            }
            return currentId;
        } else if (Array.isArray(node)) {
            if (node.length === 1 && node[0] === '') {
                let leafId = btIDCounter++;
                entityArr.push({ modelName: parentKey, btID: leafId, upEntity: parentId !== null ? [parentId] : [], downEntity: [] });
                return leafId;
            } else {
                return node.map(child => traverse(child, parentKey, parentId)).filter(id => id !== null);
            }
        }
        return null;
    }

    traverse(node);
    return entityArr;
}

//检查数组对象中是否有$属性
function check$(array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].hasOwnProperty('$')) {
            return true;
        }
    }
    return false;
}

// 加载实体的父节点子节点ID【downEntity，upEntity】
function btLine(parentBtID, children, tempData) {
    let parent = tempData[parentBtID];
    // console.log(parentBtID, 'children', children)
    if (children.length > 0) {
        for (let i = 0; i < children.length; ++i) {
            let child = tempData[children[i]];
            if (child) {
                parent.downEntity.push(child.id);
                child.upEntity.push(parent.id);
            }
        }
    }
};

// 处理自定义节点
function handeTreeNodesModel(TreeNodesModel) {
    let modelList = gContextDao.getGContextProp("modelList");
    for (let key in TreeNodesModel) {
        for (let item of modelList) {
            if (key == item.type) {
                // console.log('TreeNodesModel[key]', TreeNodesModel[key])
                //{$: {"ID": "ApproachObject","editable": "true"}, input_port: [{$: {name: 'key_name3'}}]"
                const children = TreeNodesModel[key].map(item2 => {
                    const result = { ...item2.$, isUser: true, port: {} };

                    // 处理 input_port
                    if (item2.input_port) {
                        item2.input_port.forEach(port => {
                            result.port[port.$.name] = { direction: 'input_port', defaultValue: port.$.default || '', description: port._ || '' }
                        });
                    }

                    // 处理 output_port
                    if (item2.output_port) {
                        item2.output_port.forEach(port => {
                            result.port[port.$.name] = { direction: 'output_port', defaultValue: port.$.default || '', description: port._ || '' }
                        });
                    }

                    // 处理 inout_port
                    if (item2.inout_port) {
                        item2.inout_port.forEach(port => {
                            result.port[port.$.name] = { direction: 'inout_port', defaultValue: port.$.default || '', description: port._ || '' };
                        });
                    }

                    return result;
                });

                item.children.push(...children);
                break; // 提前退出循环，因为找到了匹配的类型
            }
        }
    }
    // console.log('modelList', modelList)
}

function findParentTypeById(targetId) {
    if (targetId == 'SubTree') return 'SubTree'
    let modelList = gContextDao.getGContextProp("modelList");
    for (const node of modelList) {
        if (node.children) {
            for (const child of node.children) {
                if (child.ID == targetId) {
                    return node.type; // 返回当前节点的 type
                }
            }
        }
    }
    return null; // 如果未找到目标 ID
}



//解析ft节点函数
function ftNode(data) {

    // console.log(data);
    // let reg = /([0-9a-zA-Z]+),(.*),(\d+),"(.*)","(.*)",(.*),(.*),(\d+),"(.*)"/ms;
    // reg.test(data);
    // let ftID = RegExp.$1;
    // let type = RegExp.$2;
    // let depth = parseInt(RegExp.$3);
    // let name = codec.encoder(RegExp.$4);
    // let description = codec.encoder(RegExp.$5);
    // let x = parseInt(RegExp.$6);
    // let y = parseInt(RegExp.$7);
    // let level = parseInt(RegExp.$8);
    // let code = codec.encoder(RegExp.$9);
    const line = data.split('\n')
    const matches = line[0].split(','); //第一行 nodeId,nodeType,depth,name,描述,x,y,N_state,GateType(门类型),代码

    let ftID = matches && matches[0] ? matches[0] : '';
    let type = matches && matches[1] ? matches[1] : '';
    let depth = matches && matches[2] ? parseInt(matches[2]) : '';
    let name = matches && matches[3] ? codec.encoder(matches[3].replace(/^"|"$/g, '')) : '';
    let description = matches && matches[4] ? codec.encoder(matches[4].replace(/^"|"$/g, '')) : '';
    let x = matches && matches[5] ? parseInt(matches[5]) : '';
    let y = matches && matches[6] ? parseInt(matches[6]) : '';
    let level = matches && matches[7] ? parseInt(matches[7]) : '';
    let rulesStr = matches && matches[8] ? codec.encoder(matches[8].replace(/^"|"$/g, '')) : '';
    let imgName = matches && matches[9] && codec.encoder(matches[9].replace(/^"|"$/g, '')) !== '' ? codec.encoder(matches[9].replace(/^"|"$/g, '')) : name;
    // let doorType = matches && matches[9] ? matches[9] : '';
    // let code = matches && matches[9] ? codec.encoder(matches[9].replace(/^"|"$/g, '')) : '';

    // console.log('matches', matches)
    // console.log(doorType, code)
    // console.log('ftID', ftID)
    // console.log('type', type)
    // console.log('depth', depth)
    // console.log('name', name)
    // console.log('description', description)
    // console.log('x', x)
    // console.log('y', y)
    // console.log('level', level)
    // console.log('rulesStr', rulesStr)
    // console.log('doorType', doorType)
    // console.log('code', code)

    let model = gContextDao.getModelByName(type);
    let sizeIndex = model.category === "door" ? 0 : 1;

    const Ids = line[1].split(',');//第二行数据：
    // partId(空),DCId1,DCId2....[仅底事件]
    // Child_ID1, Child_ID2, Child_ID3, …[底事件不可有]


    let entity = {
        ftID: ftID,
        type: model.type + sizeIndex,
        name: name,
        layer: depth,
        desc: description,
        size: model.sizeList[sizeIndex],
        pos: { x, y },
        level: level,
        // code: code,
        category: model.category,
        hasUpNodes: model.hasUpNodes,
        hasDownNodes: model.hasDownNodes,
        collapse: false,
        modelType: model.type,
        aliasName: model.aliasName,
        imgName
        // componentID: partID,
        //     criterions: Object.assign(entity.criterions, criterions),
    }


    if (type === 'EVENT_BOTTOM') {
        const partID = Ids[0];
        let criterions = {};
        const dcObj = gContextDao.getGContextProp("dcObj");

        // console.log('tiArr', tiArr)
        if (dcObj) {
            let pp = []
            for (let i = 1; i < Ids.length; ++i) {
                if (Ids[i] - 1 > -1) {//没有dc判据时[dcList索引号需正确]不执行以下操作
                    // let dc = dcList[Ids[i] - 1] //举例： ['1', 'Runway', '跑道', 'DC_PI', 'DT_CURVE', '2',数据]
                    let dc = dcObj[Ids[i]]
                    // console.log(Ids[i],dcObj,dc)
                    if (tiArr.length > 0) {
                        tiArr.forEach((item) => {
                            if (item[0] == ftID && item[1] == dc[3]) {
                                pp = item.slice(2)
                            }
                        })
                    }
                    criterions[dc[3]] = { value: dc[1], actived: true, dcId: Ids[i], p: pp.length > 0 ? pp : [] };
                }
            }
        }
        const di = (diObj && diObj[partID]) ? { ...deepClone(oriDiObj), ...deepClone(diObj[partID]) } : deepClone(oriDiObj)
        // console.log('di', di)
        entity = Object.assign(entity, {
            componentID: partID ? partID : '',
            // di: partID ? diObj[partID] : {},
            di,
            criterions,
            // criterionDoor: {//底事件关乎判据的门
            //     type: doorType ? doorType : '',
            //     code: doorType ? code : '',
            // },
            // rules: ['', '', '', '', '']
            rules: rulesStr.split(';')
        });
    }
    // if (model.category === "door") {
    //     entity = Object.assign(entity, {
    //         doorType: doorType ? doorType : 1,
    //     });
    // }
    entity = Object.assign(entity, {
        rules: rulesStr.split(';')
    });

    // console.log('entity', entity)
    let e = gContextDao.addEntity(entity);
    // console.log('e', e)
    return { ftID: ftID, entity: e };
};



export default {
    getSumY,
    getIntersection,
    totalize,
    parseInt3,
    getY,
    xmlParser,
    projParser,
    // ftParser,
    // infoParser,
    infoParser2,
    infoParser3,
}


// const sr = [
//     {
//         "$": {
//             "ID": "IfDoorClosed"
//         },
//         "Fallback": [
//             {
//                 "OpenDoor": [
//                     ""
//                 ],
//                 "RetryUntilSuccessful": [
//                     {
//                         "$": {
//                             "num_attempts": "5"
//                         },
//                         "PickLock": [
//                             ""
//                         ]
//                     }
//                 ],
//                 "SmashDoor": [
//                     ""
//                 ]
//             }
//         ]
//     },
//     {
//         "$": {
//             "ID": "MoveWithSubtree"
//         },
//         "Sequence": [
//             {
//                 "Fallback": [
//                     {
//                         "Inverter": [
//                             {
//                                 "IsDoorClosed": [
//                                     ""
//                                 ]
//                             }
//                         ],
// "SubTree": [
//     {
//         "$": {
//             "ID": "IfDoorClosed",
//             "_description": "CTRL + Left Click to Jump to the corresponding subtree.\r\nOr Click \"Expand\" to visualize in place."
//         }
//     }
// ]
//                     }
//                 ],
//                 "PassThroughDoor": [
//                     ""
//                 ]
//             }
//         ]
//     }
// ]