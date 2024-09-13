import gContextDao from "../dao/gContextDao.js";
import dom from "../viewModel/dom.js";
import { EventEntity } from "../structure/entity.js";
import { g } from "../structure/gContext.js";
import Model from "../structure/model.js"
import Marquee from "../structure/marquee.js";
// import "../ext/d3.v6.min.js";
import Line from "../structure/line.js"
import Utils from "../utils/utils.js";
import nodesOPController from "./nodesOPController.js";
import viewOPController from "./viewOPController.js";


function updateTest() {
    // 
    let criterionPopList = gContextDao.getGContextProp("criterionPopList");
    let userLineMap = gContextDao.getGContextProp("userLineMap");
    let statusData = gContextDao.getGContextProp("statusData");
    let zoom = viewOPController.getZoom();

    const length = criterionPopList.filter(obj => obj.show === true).length
    const left = 936 - Math.min(length * 517, 1845) / 2
    let content = dom.query("#content");

    let index = 0
    criterionPopList.forEach((item) => {
        if (!item.show) return
        let line = userLineMap[item.drawerID]
        line.orginX = left + index * 517 + 248
        // line.end.posX = content.scrollLeft + (line.orginX-) / zoom

        line.end.posY = g.gContext.svgCanvas.size.height - (statusData.isShowBottomMsg ? 380 : 400)
        line.end.posY = 682 / zoom + content.scrollTop

        line.update()
        dom.setAttributeByDom(line.dom, { "x": line.pos.x, "y": line.pos.y });
        dom.setAttributeByDom(line.dom.querySelector(".polyline"), { "d": line.path });
        index++
    });
}

// 放大缩小更新判据线
function updateUserLine() {
    let criterionPopList = gContextDao.getGContextProp("criterionPopList");
    let userLineMap = gContextDao.getGContextProp("userLineMap");
    // let statusData = gContextDao.getGContextProp("statusData");
    let zoom = viewOPController.getZoom();
    const viewPort = g.gContext.viewPort


    const length = criterionPopList.filter(obj => obj.show === true).length
    const left = viewPort.width / 2 - Math.min(length * 517, viewPort.width - 30) / 2
    // console.log(g.gContext.svgCanvas.size.height)
    let content = dom.query("#content");
    const cardList = dom.query('#criterionPopList')

    let index = 0
    criterionPopList.forEach((item) => {
        if (!item.show) return
        let line = userLineMap[item.drawerID]

        line.orginX = (left + index * 517 + 248)
        line.end.posX = content.scrollLeft + (line.orginX - cardList.scrollLeft) / zoom
        // line.end.posY = g.gContext.svgCanvas.size.height - (statusData.isShowBottomMsg ? 380 : 400)
        line.end.posY = (viewPort.height - 200) / zoom + content.scrollTop //682

        // line.end.posY = g.gContext.svgCanvas.size.height / zoom
        // console.log(g.gContext.svgCanvas.size.height, line.end.posY, zoom)
        // console.log('放大缩小')
        line.update()
        dom.setAttributeByDom(line.dom, { "x": line.pos.x, "y": line.pos.y });
        dom.setAttributeByDom(line.dom.querySelector(".polyline"), { "d": line.path });
        index++
    });
}

function test() {

    let fragment = document.createDocumentFragment();

    for (let i = 0; i < 10000; ++i) {
        // g.gContext.doorEntityMap[i] = new DoorEntity(i, "ftID", "and_door", 0, i, i,
        //     {width:64, height:64}, {x:i/100, y:i/50},
        //     true, true, true,
        //     null, null);
        //g.gContext.doorEntityMap[i].dom = dom.createNode(g.gContext.doorEntityMap[i]);
        let entity = gContextDao.addEntity({
            ftID: "ftID",
            type: "and_door0",
            layer: 0,
            size: { width: 64, height: 64 },
            pos: { x: Math.round(Math.random() * 2000), y: Math.round(Math.random() * 2000) },
            // pos: {x: i/5, y: i/5},
            hasUpNodes: true,
            hasDownNodes: false,
            collapse: true,
            category: "door",
        });
        if (entity) {
            let eDom = dom.createNode(entity);
            entity.dom = eDom;
            fragment.appendChild(eDom);
        }
    }

    let mainSVG = document.querySelector("#mainSVG");

    mainSVG.appendChild(fragment);

};

// 模型栏创建新节点
function createNewNode(type, pos, name) {
    let model = gContextDao.getModelByType(type);
    // console.log('model', model)
    if (model) {
        let temp = null;
        temp = new EventEntity("newSVGNode", "btID", model.type, name, name,
            model.sizeList[0], pos, false, false, false, "#fff");
        gContextDao.setGContextProp("newSVGNode", temp);
    }

    let newSVGNode = gContextDao.getGContextProp("newSVGNode");
    newSVGNode.pos = pos;
    newSVGNode.name = name;
    newSVGNode.aliasName = name;

    dom.query("#hide-field").appendChild(dom.createNewSVGNode(newSVGNode));
    dom.query("#hide-field").classList.remove("hide");
};


function deleteNewNode() {
    let newSVGNode = gContextDao.getGContextProp("newSVGNode");
    if (newSVGNode) {
        gContextDao.getGContextProp("newSVGNode", null);
    }
    let domNewSVGNode = dom.query("#newSVGNode");
    if (domNewSVGNode) {
        dom.query("#hide-field").removeChild(domNewSVGNode);
    }
    dom.query("#hide-field").classList.add("hide");
}

//在模型栏拖拽新节点时调用
function newNodeUpdate(pos) {
    // console.log(pos)
    let newSVGNode = gContextDao.getGContextProp("newSVGNode");
    if (newSVGNode) {
        newSVGNode.pos = pos;
    }
    dom.setAttributeById("#newSVGNode", {
        "transform": "translate(" + (pos.x - 110) + "," + pos.y + ")",
    });
    // dom.setAttributeById("#newSVGNode", {
    //     "style":"left:"+pos.x+"px;top:"+pos.y+"px;",
    // });
};

function getNodeSize(id) {
    // if()
}

//创建画布
function createCanvas() {
    let svgCanvas = gContextDao.getGContextProp("svgCanvas");

    if (!svgCanvas) {
        console.log(svgCanvas)
        gContextDao.setGContextProp("svgCanvas", { _size: { width: 200, height: 200 }, _zoom: 1 });
        svgCanvas = gContextDao.getGContextProp("svgCanvas");
    }
    // console.log(svgCanvas, window.innerWidth)
    Object.defineProperties(svgCanvas, {
        "size": {
            set: function (val) {
                dom.setAttributeById("#mainSVG", {
                    width: val.width,
                    height: val.height,
                });
                dom.setAttributeById("#RectGrid", {
                    width: val.width,
                    height: val.height,
                });
                let axis = gContextDao.getGContextProp("axis");
                axis.axis_x.width = val.width;
                axis.axis_y.height = val.height;
                this._size = val;

                let publish = gContextDao.getGContextProp("publish");
                publish.emit("canvas_size");
            },
            get: function () {
                return this._size;
            }
        },
        "zoom": {
            set: function (val) {

                dom.doc.documentElement.style.setProperty("--zoom", val + "");
                // if(document.getElementById("timeline")){
                //     document.getElementById("timeline").style.zoom = 1.000/val;
                // }

                this._zoom = val;
                let publish = gContextDao.getGContextProp("publish");
                publish.emit("canvas_size");

            },
            get: function () {
                return this._zoom;
            }
        },
    });

    let canvas = dom.createCanvas(svgCanvas.size);
    // let mf = dom.query("#marquee-field");
    // dom.addElement(canvas, dom.query("#content"));

    //网格
    let grid = dom.createGrid({ size: svgCanvas.size });
    canvas.appendChild(grid);

    // let filter = dom.createHeightLightFilter();
    // canvas.appendChild(filter);

    dom.query("#content").insertBefore(canvas, dom.query("#marquee"));



    return canvas;
};
//创建模型栏的model
function createModel(model) {
    let new_model = new Model(model.path,
        model.type,
        model.name, model.aliasName, model.sizeList, model.hasUpNodes, model.hasDownNodes, model.category, model.textColor);
    let list = null;
    if (model.category === "door") {
        list = gContextDao.getGContextProp("doorModelList");
    } else if (model.category === "event") {
        list = gContextDao.getGContextProp("eventModelList");
    }
    list ? list.push(new_model) : null;


    // let dom_model = dom.createModel(new_model);
    // dom.addElement(dom_model, dom.query("."+model.category+"-items"));


};
//判断鼠标是否在content中
function inContent(mousePos) {
    let zoom = gContextDao.getGContextProp("svgCanvas").zoom;
    let left = dom.query("#drawingBoard").offsetLeft * zoom;
    //let top = dom.query("#content").offsetTop;
    let top = dom.query("#header").offsetTop + dom.query("#header").offsetHeight;
    let width = dom.query("#drawingBoard").offsetWidth * zoom;
    let height = dom.query("#drawingBoard").offsetHeight * zoom;
    if (mousePos.x <= left + width && mousePos.x >= left && mousePos.y <= top + height && mousePos.y >= top)
        return true;
    return false;
};
//获取键盘操作焦点
function getFocus() {
    let content = dom.query("#content");
    content.tabIndex = -1;
    content.focus();
}

//生成节点
function createNode(type, pos, name) {
    let model = gContextDao.getModelByType(type);
    // console.log('model', model)
    if (type.includes("top")) {
        let root = gContextDao.findRoot();
        if (root) {
            console.warn("顶事件已存在");
            return;
        }
    }

    let len = name ? name.length : 4
    const iconName = dom.imgName({ type, name })
    const width = 20 + (iconName ? 30 : 0) + len * 11;

    let entityProp = {
        type: model.type,
        size: {
            width: width || model.sizeList[1].width,
            height: model.sizeList[1].height
        },
        pos: { x: pos.x, y: pos.y },
        hasUpNodes: model.hasUpNodes,
        hasDownNodes: model.hasDownNodes,
        collapse: null,
        category: model.category,
        modelType: model.type,
        aliasName: name || model.name,

        name: name || model.name,
        textColor: model.textColor,
    };
    let entity = gContextDao.addEntity(entityProp);
    // console.log('新建的entity', entity)

    if (entity) {
        let eDom = dom.createNode(entity);
        entity.dom = eDom;
        dom.query("#mainSVG").appendChild(eDom);
        return entity;
    }
};
//生成多选框
function createMarquee(marquee) {
    let temp = new Marquee(marquee.pos, marquee.size, false, marquee.stroke, marquee.strokeWidth, marquee.fill, marquee.opacity);
    let mDom = dom.createMarquee(temp);
    temp.dom = mDom;
    //dom.query("#marquee-field").appendChild(mDom);
    dom.query("#content").appendChild(mDom);
    gContextDao.setGContextProp("marquee", temp);

};
//显示多选框
function showMarquee(pos) {
    let marquee = gContextDao.getGContextProp("marquee");
    if (marquee) {
        marquee.pos = pos;
        marquee.size.width = 0;
        marquee.size.height = 0;
        dom.setAttributeByDom(marquee.dom, {
            "style": "left:" + marquee.pos.x + "px;top:" + marquee.pos.y + "px;height:" + marquee.size.height + "px;width:" + marquee.size.width + "px;",
        });
        dom.removeClassByDOM(marquee.dom, "hide");
    }
}
//更新多选框
function updateMarquee(pos, size) {
    let marquee = gContextDao.getGContextProp("marquee");
    if (marquee) {
        marquee.pos = pos;
        marquee.size = size;
        dom.setAttributeByDom(marquee.dom, {
            "style": "left:" + marquee.pos.x + "px;top:" + marquee.pos.y + "px;height:" + marquee.size.height + "px;width:" + marquee.size.width + "px;",
        });
    }
};
//隐藏多选框
function hideMarquee() {
    let marquee = gContextDao.getGContextProp("marquee");
    if (marquee) {
        dom.addClassByDOM(marquee.dom, "hide");
    }
};
//
function getNewSVGNode() {
    return gContextDao.getGContextProp("newSVGNode");
};

function getMainSVGOffset() {
    let zoom = gContextDao.getGContextProp("svgCanvas").zoom;
    let mainSVG = dom.query("#mainSVG");
    let left = dom.query("#drawingBoard").offsetLeft;
    //let left = dom.query("#content").offsetLeft;
    //let top = dom.query("#content").offsetTop;
    let top = parseInt(dom.query("#header").offsetTop) + parseInt(dom.query("#header").offsetHeight);
    // let width = dom.query("#content").offsetWidth;
    // let height = dom.query("#content").offsetHeight;
    return { x: parseInt(left) * zoom, y: parseInt(top) };
};

function getScrollOffset() {
    let mainSVG = dom.query("#content");
    return { x: parseInt(mainSVG.scrollLeft), y: parseInt(mainSVG.scrollTop) }
};
//设置选中状态（多选）
function setActivedEntity(initialPosition) {
    const marquee = gContextDao.getGContextProp("marquee");//拖拽框
    let doors = gContextDao.getGContextProp("doorEntityMap");
    let events = gContextDao.getGContextProp("eventEntityMap");
    let activedMap = {};
    for (let key in doors) {
        let entity = doors[key];
        if (dom.hasClassByDom(entity.dom, "hide")) {
            continue;
        }
        if (entity.pos.x >= marquee.pos.x &&
            entity.pos.y >= marquee.pos.y &&
            entity.pos.x + entity.size.width <= marquee.pos.x + marquee.size.width &&
            entity.pos.y + entity.size.height <= marquee.pos.y + marquee.size.height
        ) {

            activedMap[key] = entity;

            // entity.dom.querySelector(".border").classList.remove("hide");
            initialPosition ? initialPosition[key] = { x: entity.pos.x, y: entity.pos.y } : null;
            if (entity.collapse) {
                let queue = [];
                for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
                    queue.push(entity.downEntity[i]);
                }
                while (queue.length > 0) {
                    let e = gContextDao.findEntity(queue.shift());
                    activedMap[e.id] = e;
                    e.dom.querySelector(".border").classList.remove("hide");
                    initialPosition ? initialPosition[e.id] = { x: e.pos.x, y: e.pos.y } : null;
                    for (let i = 0, len = e.downEntity.length; i < len; ++i) {
                        queue.push(e.downEntity[i]);
                    }
                }
            }
        }
    }
    for (let key in events) {
        let entity = events[key];
        if (dom.hasClassByDom(entity.dom, "hide")) {
            continue;
        }
        if (entity.pos.x >= marquee.pos.x &&
            entity.pos.y >= marquee.pos.y &&
            entity.pos.x + entity.size.width <= marquee.pos.x + marquee.size.width &&
            entity.pos.y + entity.size.height <= marquee.pos.y + marquee.size.height
        ) {
            activedMap[key] = entity;
            entity.dom.querySelector(".border").classList.remove("hide");
            initialPosition ? initialPosition[key] = { x: entity.pos.x, y: entity.pos.y } : null;
            if (entity.collapse) {
                let queue = [];
                for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
                    queue.push(entity.downEntity[i]);
                }
                while (queue.length > 0) {
                    let e = gContextDao.findEntity(queue.shift());
                    activedMap[e.id] = e;
                    e.dom.querySelector(".border").classList.remove("hide");
                    initialPosition ? initialPosition[e.id] = { x: e.pos.x, y: e.pos.y } : null;
                    for (let i = 0, len = e.downEntity.length; i < len; ++i) {
                        queue.push(e.downEntity[i]);
                    }
                }
            }
        }
    }

    gContextDao.setGContextProp("activedEntityMap", activedMap);
};
//设置选中
function setActivedEntityPos(initialPosition) {
    let activedMap = gContextDao.getGContextProp("activedEntityMap");
    for (let key in activedMap) {
        let entity = activedMap[key];
        initialPosition ? initialPosition[key] = { x: entity.pos.x, y: entity.pos.y } : null;
    }
};
//清除选中状态
function clearActived() {
    let activedMap = gContextDao.getGContextProp("activedEntityMap");
    for (let key in activedMap) {
        let entity = activedMap[key];
        entity.dom.querySelector("rect").setAttribute("stroke", "#fff");
    }
    gContextDao.setGContextProp("activedEntityMap", {});
};
//是否选中
function isActived(key) {
    let activedMap = gContextDao.getGContextProp("activedEntityMap");
    return activedMap[key] ? true : false;
};

//单个事件是否已经是选中状态
function isAttrData(key) {
    let attrData = gContextDao.getGContextProp("attrData");
    const flag = attrData.entity && attrData.entity.id == key
    // if (!flag && attrData.entity) {//点新节点的情况  ==>把原来的节点清除选中效果
    //     console.log(!flag, attrData.entity,!flag && attrData.entity)
    //     dom.setAttributeById(attrData.entity.id, { "stroke": "#fff" })
    // }
    return flag;
};

//聚焦节点
function focusEntityByID(id) {
    clearActived();
    let entity = gContextDao.findEntity(id);
    setActivedEntityByID(entity.category, id);
    selectEntity(id);
    let pos = entity.pos;
    let size = entity.size;
    // dom.query("#content").scrollTop = pos.y-size.height/2;
    // dom.query("#content").scrollLeft = pos.x-size.width/2;
    // scrollTop: pos.y-size.height/2 - document.getElementById('content').clientHeight/2,
    // scrollLeft: pos.x-size.width/2 - document.getElementById('content').clientWidth/2
    let container = $('#content');
    container.animate({
        scrollTop: pos.y - size.height / 2 - document.getElementById('content').clientHeight / 2,

        scrollLeft: pos.x - size.width / 2 - document.getElementById('content').clientWidth / 2
    });
}
//根据entity的id设置选中（单选）
function setActivedEntityByID(downDom, type, id, initialPosition) {
    let map = type === "door" ? gContextDao.getGContextProp("doorEntityMap") : gContextDao.getGContextProp("eventEntityMap");
    let entity = map[id];
    if (entity) {
        let activedMap = {};
        activedMap[id] = entity;

        downDom.setAttribute("stroke", "#00ffff");
        // entity.dom.querySelector(".border").classList.remove("hide");

        initialPosition ? initialPosition[id] = { x: entity.pos.x, y: entity.pos.y } : null;
        if (entity.collapse) {
            let queue = [];
            for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
                queue.push(entity.downEntity[i]);
            }
            while (queue.length > 0) {
                let e = gContextDao.findEntity(queue.shift());
                activedMap[e.id] = e;
                e.dom.querySelector(".border").classList.remove("hide");
                initialPosition ? initialPosition[e.id] = { x: e.pos.x, y: e.pos.y } : null;
                for (let i = 0, len = e.downEntity.length; i < len; ++i) {
                    queue.push(e.downEntity[i]);
                }
            }
        }
        gContextDao.setGContextProp("activedEntityMap", activedMap);
    }
};
//增添选中节点
function addActivedChildEntityByID(id, initialPosition) {
    let activedMap = gContextDao.getGContextProp("activedEntityMap");
    let entity = activedMap[id];
    if (entity) {
        if (entity.collapse) {
            let queue = [];
            for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
                queue.push(entity.downEntity[i]);
            }
            while (queue.length > 0) {
                let e = gContextDao.findEntity(queue.shift());
                activedMap[e.id] = e;
                e.dom.querySelector(".border").classList.remove("hide");
                initialPosition ? initialPosition[e.id] = { x: e.pos.x, y: e.pos.y } : null;
                for (let i = 0, len = e.downEntity.length; i < len; ++i) {
                    queue.push(e.downEntity[i]);
                }
            }
        }
    }

}
//连接线拖拽创建时的增删改操作
function createNewLine(type, beginPoint) {
    console.log("createNewLine", type, beginPoint)
    //let lines = gContextDao.getGContextProp("lineMap");
    let newLine = gContextDao.getGContextProp("newLine");
    let entity = gContextDao.findEntity(beginPoint.id);
    let point = type === "conn-up" ? "upNodeOffset" : "downNodeOffset";//选择起始节点的上圆圈或下圆圈
    let t = type === "conn-up" ? "up" : "down";//设置当前方向
    let et = type === "conn-up" ? "down" : "up";//设置目标方向
    let pos = {
        x: entity.pos.x + entity[point].x,
        y: entity.pos.y + entity[point].y + entity.lineOffset[t]
    };
    if (!newLine) {
        newLine = new Line("newTreeLine", "newLine",
            { entityID: beginPoint.id, posX: pos.x, posY: pos.y, type: t },
            { posX: pos.x, posY: pos.y, type: et }, true);
        console.log("newLine", newLine)
        newLine.update();// 更新连接线的属性
        gContextDao.setGContextProp("newLine", newLine);// 将新连接线对象存储到gContext中
        let line = dom.createLine(newLine);
        newLine.dom = line;
        dom.query("#mainSVG").appendChild(line);//添加进画布中
    }

};

// 移动时更新连接线
function updateNewLine(endPosition) {

    const acLine = gContextDao.getGContextProp("activedLine");
    let newLine = gContextDao.getGContextProp("newLine");

    let beginE = gContextDao.findEntity(newLine.begin.entityID);
    let map = gContextDao.getGContextProp("eventEntityMap")
    let point = (newLine.begin.type === "up") ? "downNodeOffset" : "upNodeOffset";
    let t = (newLine.begin.type === "up") ? "down" : "up";

    if (newLine) {
        // console.log('newLine', newLine)
        newLine.end.entityID = null;

        for (let key in map) {
            if (key === newLine.begin.entityID) continue;

            let entity = map[key];
            if (t === "up") { // 上向下连
                if (entity.upEntity.length >= 1 || (beginE.type == "Control" ? false : beginE.downEntity.length >= 1) || !entity.hasUpNodes) continue;
            } else if (t === "down") { // 下往上连
                if ((entity.type == "Control" ? false : entity.downEntity.length >= 1) || beginE.upEntity.length >= 1 || !entity.hasDownNodes) continue;
            }


            let pos = { x: entity.pos.x + entity[point].x, y: entity.pos.y + entity[point].y + entity.lineOffset[t] };
            if (Math.abs(endPosition.x - pos.x) <= 10 && Math.abs(endPosition.y - pos.y) <= 10) {
                newLine.end.entityID = key;
                endPosition.x = pos.x;
                endPosition.y = pos.y;
                break;
            }
        }
    }
    newLine.end.posX = endPosition.x;
    newLine.end.posY = endPosition.y;
    newLine.update();
    dom.setAttributeByDom(newLine.dom, {
        "x": newLine.pos.x,
        "y": newLine.pos.y,
    });
    dom.setAttributeByDom(newLine.dom.querySelector(".polyline"), {
        "d": newLine.path,
    });
};


// let ff = (t === "down" && (entity.downEntity.length >= 1 || beginE.upEntity.length >= 1 || !entity.hasDownNodes))
//     || (t === "up" && (entity.upEntity.length >= 1 || beginE.downEntity.length >= 1 || !entity.hasUpNodes))

// if (ff) {
//     continue;
// }
function deleteNewLine() {
    let newLine = gContextDao.getGContextProp("newLine");
    if (newLine) {
        dom.query("#mainSVG").removeChild(newLine.dom);
        gContextDao.setGContextProp("newLine", null);
    }
};

//创建子节点
function createChildNode(ftId, child_type) {

    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.isCompute) {
        console.warn("计算中无法添加节点");
        return;
    }
    //通过模型名查找模型
    let model = gContextDao.getModelByType(child_type);

    let sizeIndex = model.category === "door" ? 0 : 1;

    let parent = gContextDao.findEntityByFtID(ftId);

    let child_node = createNode(model.type, { x: parent.pos.x + (parent.size.width - model.sizeList[sizeIndex].width) / 2, y: parent.pos.y + parent.size.height + 50 });


    let parent_pos = { x: parent.pos.x + parent["downNodeOffset"].x, y: parent.pos.y + parent["downNodeOffset"].y + parent.lineOffset["down"] };
    let child_pos = { x: child_node.pos.x + child_node["upNodeOffset"].x, y: child_node.pos.y + child_node["upNodeOffset"].y + child_node.lineOffset["up"] };
    let line = new Line(null, { entityID: parent.id, posX: parent_pos.x, posY: parent_pos.y, type: "down" },
        { entityID: child_node.id, posX: child_pos.x, posY: child_pos.y, type: "up" });
    createLine(line);

    // if (statusData.autoLayoutMode) {
    //     nodesOPController.nodeLayout();
    //     updateMainSVGSizeUp();
    // }

}

function moveCondition() {
    return true;
}
function deleteLine(node1, node2) {

    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.isCompute) {
        console.warn("计算中无法删除线");
        return;
    }

    let lineMap = gContextDao.getGContextProp("lineMap");
    let id = node1.id + "-" + node2.id;
    let id2 = node2.id + "-" + node1.id;
    let line = lineMap[id] ? lineMap[id] : lineMap[id2];
    if (line) {
        delete (lineMap[line.id]);
        let mainSVG = dom.query("#mainSVG");
        mainSVG.removeChild(line.dom);
        console.log("remove line that id is " + line.id);
    }

}

//将节点移动到另一节点下
function changeNodeParent(childID, parentID) {

    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.isCompute) {
        console.warn("计算中无法修改树");
        return;
    }

    let child = gContextDao.findEntity(childID);
    let parent = gContextDao.findEntity(parentID);

    if (child && parent) {
        let condition = moveCondition(child, parent);
        if (!!condition) {
            let old_parent_id = child.upEntity.length > 0 ? child.upEntity[0] : null;
            if (old_parent_id) {
                let old_parent = gContextDao.findEntity(old_parent_id);
                if (old_parent) {
                    old_parent.downEntity = Utils.removeElement(old_parent.downEntity, childID);
                    child.upEntity = Utils.removeElement(child.upEntity, old_parent_id);
                    deleteLine(child, old_parent);
                    if (old_parent.downEntity.length <= 0) {
                        noFoldNode(old_parent);
                    }
                }
            }
        }
        let parent_pos = { x: parent.pos.x + parent["downNodeOffset"].x, y: parent.pos.y + parent["downNodeOffset"].y + parent.lineOffset["down"] };
        let child_pos = { x: child.pos.x + child["upNodeOffset"].x, y: child.pos.y + child["upNodeOffset"].y + child.lineOffset["up"] };
        let line = new Line(null, { entityID: parent.id, posX: parent_pos.x, posY: parent_pos.y, type: "down" },
            { entityID: child.id, posX: child_pos.x, posY: child_pos.y, type: "up" });
        createLine(line);

        // let statusData = gContextDao.getGContextProp("statusData");
        // if (statusData.autoLayoutMode) {
        //     nodesOPController.nodeLayout();
        //     updateMainSVGSizeUp();
        // }
    }
}


//连接线拖拽创建结束，生成连接线
function createLine(line) {

    // let statusData = gContextDao.getGContextProp("statusData");
    // if (statusData.isCompute) {
    //     console.warn("计算中无法添加线");
    //     return;
    // }
    // console.log('line', line); console.log('line.end.entityID', line.end.entityID);
    // if (!line || !line.end.entityID) { console.log('line', line); console.log('line.end.entityID', line.end.entityID); return };
    if (!line || !line.end.entityID) return //若无则结束
    let lineMap = gContextDao.getGContextProp("lineMap");
    let id = line.begin.entityID + "-" + line.end.entityID;
    let id2 = line.end.entityID + "-" + line.begin.entityID;


    if (!lineMap[id] && !lineMap[id2]) {//检查没有重复的线
        let newLine = new Line('newTreeLine', id, line.begin, line.end, true);
        let begin = gContextDao.findEntity(line.begin.entityID);
        let end = gContextDao.findEntity(line.end.entityID);
        if (newLine) {
            lineMap[id] = newLine;
            (line.begin.type === "up") ? begin.upEntity.push(line.end.entityID) : begin.downEntity.push(line.end.entityID);
            (line.begin.type === "up") ? end.downEntity.push(line.begin.entityID) : end.upEntity.push(line.begin.entityID);
            newLine.update();
            let lDom = dom.createLine(newLine);
            newLine.dom = lDom;
            dom.query("#mainSVG").appendChild(lDom);

            // let upNode = (line.begin.type === "up") ? end : begin;
            // unfoldNode(upNode);

            return true;
        }
    }
    return false;
};
//获取线dom节点
function getNewLine() {
    return gContextDao.getGContextProp("newLine");
}
//选中节点
function selectEntity(key) {
    let statusData = gContextDao.getGContextProp("statusData");
    let attrData = gContextDao.getGContextProp("attrData");
    let entity = gContextDao.findEntity(key);

    console.log('选中的entity', entity)
    statusData.attrID = 1;
    attrData.entity = entity;
};

// 选中节点模型
function selectModel(type, name) {
    let modelList = gContextDao.getGContextProp("modelList");
    let statusData = gContextDao.getGContextProp("statusData");
    let attrData = gContextDao.getGContextProp("attrData");

    const arr = ['Action', 'Condition', 'Control', 'Decorator', 'SubTree']
    let index = arr.indexOf(type)

    const model = modelList[index].children.find(item => item.ID === name);
    model.type = type;
    // console.log('model', model)
    attrData.model = model;

    statusData.attrID = model.isUser ? 3 : 4;
}
// //设置节点
// function setCurrentEntity(id) {
//     let entity = gContextDao.findEntity(id);
//     let statusData = gContextDao.getGContextProp("statusData");
//     let attrData = gContextDao.getGContextProp("attrData");
//     // //
//     if (attrData.entity && statusData.attrID === 2) {
//         clearObserver(attrData.entity);
//     }
//     statusData.attrID = 1;

//     setTimeout(() => {
//         statusData.attrID = 2;
//         attrData.entity = entity;
//     }, 500);
// }
// //点击画布，切换属性栏
// function selectCanvas() {
//     let statusData = gContextDao.getGContextProp("statusData");
//     let attrData = gContextDao.getGContextProp("attrData");
//     if (attrData.entity && statusData.attrID === 2) {
//         clearObserver(attrData.entity);
//     }
//     statusData.attrID = 1;
// };

function clearObserver(entity) {
    let newE = Utils.jsonClone(entity);
    newE.dom = entity.dom;
    gContextDao.setEntity(entity.id, newE);
    let activedMap = gContextDao.getGContextProp("activedEntityMap");
    if (activedMap[entity.id]) {
        activedMap[entity.id] = newE;
    }
    return newE;
};
//拖拽更新节点视图
function updateEntityPos(initialPosition, offset) {
    let activedMap = gContextDao.getGContextProp("activedEntityMap");

    // let userLineMap = gContextDao.getGContextProp("userLineMap");
    let mainSVG = dom.query("#mainSVG");
    // let content = dom.query("#content");
    // let rect = dom.createRect();
    // mainSVG.appendChild(rect);
    // let entityFragment = dom.doc.createDocumentFragment();
    // entityFragment.append(mainSVG.childNodes);
    // mainSVG.classList.add("hide");
    for (let key in activedMap) {
        let entity = activedMap[key];
        // let publish = gContextDao.getGContextProp("publish");
        if (entity) {
            entity.pos.x = Math.floor((initialPosition[key].x + offset.x));
            entity.pos.y = Math.floor((initialPosition[key].y + offset.y));
            // entity.pos.y = Math.max(Math.floor((initialPosition[key].y + offset.y)), 60);
            // dom.addClassByDOM(entity.dom, "hide");
            //let temp = entity.dom.cloneNode(true);

            dom.setAttributeByDom(entity.dom, {
                // "transform":"translate("+entity.pos.x+","+entity.pos.y+")",
                "x": entity.pos.x,
                "y": entity.pos.y
            });
            // d3.select(entity.dom).attr("x", entity.pos.x).attr("y", entity.pos.y);

            // mainSVG.replaceChild(temp, entity.dom);
            //entity.dom = temp;
            // dom.removeClassByDOM(entity.dom, "hide");
        }
    }

    updateLine(activedMap)
    // for (let key in userLineMap) {//拖拽改变判据连线的起点
    //     let line = userLineMap[key];

    //     // lineizs5btaicg12f894800
    //     const dom_index = line.id.slice(-2); // 取最后两位即index 00
    //     const entityId = line.id.slice(4, -2); // 取ID
    //     // console.log(line.id, entityId, dom_index)
    //     const entity = activedMap[entityId]


    //     if (entity) {
    //         const angle = ((15 - dom_index) / 16) * 1.05 * Math.PI + 0.02;
    //         const upFlag = (entity.pos.y + 48 + 54 * Math.sin(angle)) > line.end.posY

    //         line.begin.posX = entity.pos.x + 48 + 54 * Math.cos(angle); // 计算小圆的 x 坐标
    //         line.begin.posY = entity.pos.y + (upFlag ? 43 : 53) + 54 * Math.sin(angle);

    //         line.update();
    //         dom.setAttributeByDom(line.dom, {
    //             "x": line.pos.x,
    //             "y": line.pos.y,
    //         });
    //         dom.setAttributeByDom(line.dom.querySelector(".polyline"), {
    //             "d": line.path,
    //         });
    //     }

    // }


    // mainSVG.removeChild(rect);
    // mainSVG.appendChild(entityFragment);
    // mainSVG.classList.remove("hide");
    // mainSVG.scrollLeft;
};


// 更新连线
function updateLine(activedMap) {
    let lineMap = gContextDao.getGContextProp("lineMap");
    for (let key in lineMap) {
        let line = lineMap[key];
        let ids = key.split("-");
        let begin = ids[0], end = ids[1];
        let beginE = activedMap[begin];
        let endE = activedMap[end];
        if (beginE || endE) {
            let bt = (line.begin.type === "up") ? "upNodeOffset" : "downNodeOffset";
            let et = (line.end.type === "up") ? "upNodeOffset" : "downNodeOffset";
            let tl = (line.begin.type === "up") ? "up" : "down";
            let etl = (line.begin.type === "up") ? "down" : "up";
            if (beginE) {
                line.begin.posX = beginE.pos.x + beginE[bt].x;
                line.begin.posY = beginE.pos.y + beginE[bt].y + beginE.lineOffset[tl];
            }
            if (endE) {
                line.end.posX = endE.pos.x + endE[et].x;
                line.end.posY = endE.pos.y + endE[et].y + endE.lineOffset[etl];
            }
            line.update();
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
}
//实时更新画布大小
function updateMainSVGSize() {
    // console.log('根据用户操作更新大小（不包括放大缩小）')
    let maxPosition = gContextDao.getMaxPosition();
    let svgCanvas = gContextDao.getGContextProp("svgCanvas");
    let newSize = { width: svgCanvas.size.width, height: svgCanvas.size.height };
    let flag = false;

    if (svgCanvas.size.width < maxPosition.x + 100) {
        newSize.width = maxPosition.x + 300;
        flag = true;
    }
    if (svgCanvas.size.height < maxPosition.y + 100) {
        newSize.height = maxPosition.y + 500;
        flag = true;
    }
    if (flag) {
        svgCanvas.size = newSize;
        //svgCanvas.zoom = svgCanvas.zoom;
    }
};

// 根据底部判据弹窗显示画布尺寸再扩大或减小指定大小
function IncreaseMainSVGSize(width, height) {
    let svgCanvas = gContextDao.getGContextProp("svgCanvas");
    let newSize = {
        width: svgCanvas.size.width + (width ? width : 0),
        height: svgCanvas.size.height + (height ? height : 0)
    };
    svgCanvas.size = newSize;
}

// 滚动到底部
function scrollToBottom() {
    const container = document.getElementById('mainSVG');
    // 使用 scrollIntoView() 方法滚动到底部
    container.scrollIntoView(false, { behavior: 'smooth', block: 'end', inline: 'nearest' });
    // container.scrollTop = container.scrollHeight;
}

// 隐藏选中的线
function hideAcLine() {
    let acLine = gContextDao.getGContextProp("activedLine");
    if (acLine) {
        // console.log('acLine', acLine)
        acLine.dom.classList.add("hide");
    }
}

// 重新展示隐藏的选中线
function showAcLine() {
    let acLine = gContextDao.getGContextProp("activedLine");
    if (acLine && acLine.dom.classList.contains("hide")) {
        acLine.dom.classList.remove("hide");
    }
}



//线高亮
function heightLine(id) {
    let acLine = gContextDao.getGContextProp("activedLine");
    if (acLine) {
        cancelHeightLine();
    }
    let line = gContextDao.findLine(id);
    gContextDao.setGContextProp("activedLine", line);
    dom.setAttributeByDom(line.dom.querySelector(".polyline"), {
        "stroke": "#00ffff",
    });
}
//线取消高亮
function cancelHeightLine() {
    let acLine = gContextDao.getGContextProp("activedLine");
    if (acLine) {
        dom.setAttributeByDom(acLine.dom.querySelector(".polyline"), {
            "stroke": "#008b8b",
        });
        gContextDao.setGContextProp("activedLine", null);
    }
}
//随时更新画布大小（以包含当前的最大位置坐标和额外空间）包括放大缩小
function updateMainSVGSizeUp() {
    // console.log('更新画布大小')
    let maxPosition = gContextDao.getMaxPosition(); // 获取当前最大位置坐标
    let svgCanvas = gContextDao.getGContextProp("svgCanvas");// 获取 SVG 画布对象
    let statusData = gContextDao.getGContextProp("statusData");
    // let newSize = {
    //     width: svgCanvas.size.width / (svgCanvas.zoom < 1 ? svgCanvas.zoom : 1),
    //     height: svgCanvas.size.height / (svgCanvas.zoom < 1 ? svgCanvas.zoom : 1)
    // };

    let newSize = {// 基于最大位置坐标调整新尺寸
        // * (svgCanvas.zoom > 1 ? svgCanvas.zoom : 1)
        width: (maxPosition.x + 200),
        height: (maxPosition.y + 200)
    };
    // (statusData.isShowCriterionPop ? 300 : 200)
    // console.log(newSize.height)

    //  newSize.width = Math.max(1872 /
    // newSize.height = Math.max(892 /

    newSize.width = Math.max(1632 / (svgCanvas.zoom < 1 ? svgCanvas.zoom : 1), newSize.width)// 基于最大位置坐标调整新尺寸
    newSize.height = Math.max(860 / (svgCanvas.zoom < 1 ? svgCanvas.zoom : 1), newSize.height) + (statusData.isShowCriterionPop ? 100 : 0)// 当尺寸大于原来尺寸时再扩大
    // newSize.height = newSize.height 
    // console.log(newSize.height)
    // console.log('maxX', maxPosition.x, '画布宽', newSize.width)

    // 更新 SVG 画布的尺寸
    svgCanvas.size = newSize;
    svgCanvas.zoom = svgCanvas.zoom;  // 保持当前缩放比例不变
};
//切换折叠by FTid
function tagCollapseByFtID(ftID) {
    let entity = gContextDao.findEntityByFtID(ftID);
    if (!!entity)
        tagCollapse(entity.id);
}
//切换折叠
function tagCollapse(id) {
    let entity = gContextDao.findEntity(id);
    if (entity.collapse === true) {
        unfoldNode(entity);
    }
    else if (entity.collapse === false) {
        foldNode(entity);
    }
}
//折叠节点
function foldNodeById(id) {
    let entity = gContextDao.findEntity(id);
    if (entity.downEntity.length <= 0) return;
    entity.collapse = true;

    updateFoldNode(entity);
};
//展开一个节点
function unfoldNodeById(id) {
    let entity = gContextDao.findEntity(id);
    if (entity.downEntity.length <= 0) return;

    entity.collapse = false;

    updateFoldNode(entity);

    // // 自动布局 【展开后不要自动布局】
    // nodesOPController.nodeLayout();
    // updateMainSVGSizeUp();
    // nodesOPController.openAutoLayoutMode();
};
//折叠一个节点
function foldNode(entity) {
    entity.collapse = true;
    updateFoldNode(entity);
};
//展开一个节点
function unfoldNode(entity) {
    entity.collapse = false;
    updateFoldNode(entity);

    // 自动布局 【展开后不要自动布局】
    // nodesOPController.nodeLayout();
    // updateMainSVGSizeUp();
    // nodesOPController.openAutoLayoutMode();
};
//没有子节点
function noFoldNode(entity) {
    entity.collapse = null;
    // updateFoldNode(entity);
}
//根据节点的coll更新开折叠与展节点
function updateFoldNode(entity) {
    dom.updateCollapse(entity);
    // let lineMap = gContextDao.getGContextProp("lineMap");
    let userLineMap = gContextDao.getGContextProp("userLineMap");
    let criterionPopList = gContextDao.getGContextProp("criterionPopList");
    const viewPortWidth = g.gContext.viewPort.width
    const viewPortHeight = g.gContext.viewPort.height

    if (entity.collapse === null) {

    }
    else if (entity.collapse === false) {//展开
        let queue = [];
        for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
            let id1 = entity.id + "-" + entity.downEntity[i];
            let id2 = entity.downEntity[i] + "-" + entity.id;
            let lineDom = dom.doc.getElementById(id1) || dom.doc.getElementById(id2);
            dom.removeClassByDOM(lineDom, "node-fold");
            queue.push(entity.downEntity[i]);
        }
        while (queue.length > 0) {
            let currentE = gContextDao.findEntity(queue.shift());
            dom.removeClassByDOM(currentE.dom, "node-fold");

            if (currentE.modelType == "bottom_event") {
                for (let i = 0; i < 17; i++) {
                    const lineId = `${currentE.id}${i.toString().padStart(2, '0')}`
                    if (userLineMap[lineId]) {
                        dom.removeClassByDOM(userLineMap[lineId].dom, "node-fold");
                        criterionPopList.forEach((item, index) => {
                            if (item.drawerID == lineId) criterionPopList[index].show = true
                        });
                    }
                }
            }
            if (currentE.collapse !== true) {
                for (let i = 0, len = currentE.downEntity.length; i < len; ++i) {
                    let id1 = currentE.id + "-" + currentE.downEntity[i];
                    let id2 = currentE.downEntity[i] + "-" + currentE.id;
                    let lineDom = dom.doc.getElementById(id1) || dom.doc.getElementById(id2);
                    dom.removeClassByDOM(lineDom, "node-fold");
                    queue.push(currentE.downEntity[i]);
                }
            }
        }
    }
    else if (entity.collapse) {//折叠
        let queue = [];
        for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
            let id1 = entity.id + "-" + entity.downEntity[i];
            let id2 = entity.downEntity[i] + "-" + entity.id;
            let lineDom = dom.doc.getElementById(id1) || dom.doc.getElementById(id2);
            dom.addClassByDOM(lineDom, "node-fold");
            queue.push(entity.downEntity[i]);
        }
        while (queue.length > 0) {
            let currentE = gContextDao.findEntity(queue.shift());
            dom.addClassByDOM(currentE.dom, "node-fold");

            if (currentE.modelType == "bottom_event") {
                for (let i = 0; i < 17; i++) {
                    const lineId = `${currentE.id}${i.toString().padStart(2, '0')}`
                    if (userLineMap[lineId]) {
                        dom.addClassByDOM(userLineMap[lineId].dom, "node-fold");
                    }
                    criterionPopList.forEach((item, index) => {
                        if (item.drawerID == lineId) criterionPopList[index].show = false
                    });
                    // if(criterionPopList.findIndex(item => {
                    //     return item.drawerID == drawerID;
                    // });)
                }

            }
            if (currentE.collapse !== true) {
                for (let i = 0, len = currentE.downEntity.length; i < len; ++i) {
                    let id1 = currentE.id + "-" + currentE.downEntity[i];
                    let id2 = currentE.downEntity[i] + "-" + currentE.id;
                    let lineDom = dom.doc.getElementById(id1) || dom.doc.getElementById(id2);
                    dom.addClassByDOM(lineDom, "node-fold");
                    queue.push(currentE.downEntity[i]);
                }
            }
        }
    }

    // 折叠展开判据连线更新
    let zoom = viewOPController.getZoom();
    const length = criterionPopList.filter(obj => obj.show === true).length
    const left = viewPortWidth / 2 - Math.min(length * 517, viewPortWidth - 30) / 2
    let content = dom.query("#content");
    const cardList = dom.query('#criterionPopList')
    let t = 0

    setTimeout(() => {//等200ms拿到新展开的排列卡片的高度
        criterionPopList.forEach((item) => {
            // console.log(item)
            if (!item.show) return
            const cardDom = dom.query(`#card-${item.drawerID}`)
            let line = userLineMap[item.drawerID]
            line.orginX = left + t * 517 + 248
            line.end.posX = content.scrollLeft + (line.orginX - cardList.scrollLeft) / zoom
            line.end.posY = (viewPortHeight - cardDom.offsetHeight) / zoom + content.scrollTop
            // console.log(viewPortHeight, cardDom.offsetHeight, content.scrollTop)

            line.update()
            dom.setAttributeByDom(line.dom, {
                "x": line.pos.x,
                "y": line.pos.y,
            });
            dom.setAttributeByDom(line.dom.querySelector(".polyline"), {
                "d": line.path,
            });
            t++
            // dom.setAttributeByDom(line.dom.querySelector(".pitch"), {
            //     "d": line.path,
            // })
        })
    }, 200);
};
//初始化节点的判据
function initNodeCriterion(id) {
    let entity = gContextDao.findEntity(id);
    let attrData = gContextDao.getGContextProp("attrData");
    //选中节点添加判据
    // if (entity.category === "event" && Utils.isEmpty(entity.criterions)) {
    //     gContextDao.initNodeCriterion(entity);
    // }
    attrData.entity = clearObserver(entity);
}

//配置判据图标
function configureCriterion(imgList) {
    let criterionImgList = gContextDao.getGContextProp("criterionImgList");
    criterionImgList = Object.assign(criterionImgList, imgList);
    createCriterionDefs(criterionImgList);
}

//创建判据图标的defs
function createCriterionDefs(criterionImgList) {
    // dom.createCriterionDefs(criterionImgList);
}

export default {
    updateLine,
    isAttrData,
    updateUserLine,
    test,
    scrollToBottom,
    IncreaseMainSVGSize,
    hideAcLine,
    showAcLine,
    createNewNode,
    newNodeUpdate,
    createCanvas,
    createModel,
    deleteNewNode,
    inContent,
    createNode,
    getNewSVGNode,
    getMainSVGOffset,
    getScrollOffset,
    createMarquee,
    showMarquee,
    updateMarquee,
    hideMarquee,
    setActivedEntity,
    clearActived,
    isActived,
    setActivedEntityByID,
    updateEntityPos,
    setActivedEntityPos,
    createNewLine,
    updateNewLine,
    deleteNewLine,
    createLine,
    getNewLine,
    selectEntity,
    selectModel,
    // selectCanvas,
    getFocus,
    updateMainSVGSize,
    updateMainSVGSizeUp,
    tagCollapse,
    foldNode,
    unfoldNode,
    noFoldNode,
    heightLine,
    cancelHeightLine,
    addActivedChildEntityByID,
    initNodeCriterion,
    // setCurrentEntity,
    configureCriterion,
    tagCollapseByFtID,
    createChildNode,
    focusEntityByID,
    changeNodeParent,
    foldNodeById,
    unfoldNodeById,
    clearObserver,
}