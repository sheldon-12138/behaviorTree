import { EventEntity } from "../structure/entity.js";
import { g } from "../structure/gContext.js";
import Marquee from "../structure/marquee.js";
import dom from "./dom.js";
import Line from "../structure/line.js"
import Utils from "../utils/utils.js";
import gContextDao from "../dao/gContextDao.js";
import gContextController from "../controller/gContextController.js";
import viewOPController from "../controller/viewOPController.js";
import nodesOPController from "../controller/nodesOPController.js";


//鼠标控制的节点类型枚举
const DomType = {
    //实体
    ENTITY: 1,
    //线
    LINE: 2,
    //空白处
    CANVAS: 3,
    //框
    MARQUEE: 4,
    //模型
    MODEL: 5,
    //连接点
    CIRCLE: 6,
};
//当前鼠标控制的节点
const opContext = {
    //鼠标当前控制的节点类型
    controlType: null,
    //鼠标当前位置
    mouseCurrentLocation: null,
    //鼠标在节点上按下时记录所有选中节点的位置
    initialPosition: {},
    //鼠标按下时的位置
    mouseDownPosition: {},
    //鼠标当前选中创建节点的类型

    //settimeoutID
    timeOutId: null,
    //
    time: 0,
    //是否可以拖拽
    dragFlag: true,
};

let singleClickTimer;

//画布的鼠标按下操作
function mainMouseDown(e) {
    if (g.gContext.statusData.isShowProperty) return;
    Utils.stopDefault(e);
    Utils.stopBubble(e);
    // console.log('单击')
    gContextController.getFocus();
    g.gContext.statusData.canvasChanged = true;//标识画布有改动
    if (e.button === 2) { // 右键
        return;
    }

    let mainSVG = dom.query("#mainSVG");
    mainSVG.removeEventListener("mousemove", mainMove);
    nodesOPController.explantationNode();

    let downDom = e.target;
    let dom_key = downDom.getAttribute("data-key");
    let dom_class = downDom.getAttribute("data-class");
    // console.log('dom_class', dom_class)
    // console.log('downDom', downDom)

    if (dom_class === "canvas") {
        let zoom = viewOPController.getZoom();
        opContext.mouseDownPosition = { x: (e.offsetX) / zoom, y: e.offsetY / zoom };
        opContext.controlType = DomType.CANVAS;
        opContext.initialPosition = {};
        gContextController.clearActived();
        gContextController.cancelHeightLine();
        // gContextController.selectCanvas();
        gContextController.showMarquee(opContext.mouseDownPosition);//显示多选框

        // 单击空白处时关闭弹窗
        // let statusData = gContextDao.getGContextProp("statusData");
        // if (statusData.isShowProperty) {

        //     let attrData = gContextDao.getGContextProp("attrData");
        //     statusData.isShowProperty = false


        //     const oldDrawerID = g.gContext.chartData.drawerID
        //     const oldAnimateElement = document.getElementById(oldDrawerID);

        //     if (oldAnimateElement) {
        //         oldAnimateElement.parentNode.classList.remove('redSmallCircle');
        //         oldAnimateElement.setAttribute("values", "0");
        //         oldAnimateElement.setAttribute("repeatCount", "0");
        //         oldAnimateElement.endElement();
        //     }
        //     g.gContext.chartData.drawerID = null;
        //     // gContextDao.setGContextProp("attrData", attrData);
        //     gContextDao.setGContextProp("statusData", statusData);
        // }
        // closeAnimate()
    }
    else if (dom_class === "event") {
        gContextController.cancelHeightLine();


        if (gContextController.isActived(dom_key)) {
            opContext.initialPosition = {};
            gContextController.setActivedEntityPos(opContext.initialPosition);
        }
        else {
            opContext.initialPosition = {};
            gContextController.clearActived();//取消其他选中情况
            gContextController.setActivedEntityByID(downDom, dom_class, dom_key, opContext.initialPosition);
        }

        gContextController.selectEntity(dom_key);

        opContext.mouseDownPosition = { x: e.offsetX, y: e.offsetY };
        opContext.controlType = DomType.ENTITY;

    }

    else if (dom_class === "conn-up" || dom_class === "conn-down") {//连接点


        const acLine = gContextDao.getGContextProp("activedLine");
        // if (acLine && (acLine.begin.entityID == dom_key || acLine.end.entityID == dom_key)) {
        //     // 进入更改线条的情况
        //     const newLineBeginId = acLine.end.entityID == dom_key ? acLine.begin.entityID : acLine.end.entityID

        //     // 隐藏线
        //     gContextController.hideAcLine()
        //     gContextController.createNewLine(dom_class === "conn-up" ? "conn-down" : "conn-up", { id: newLineBeginId });

        //     opContext.mouseDownPosition = { x: e.offsetX, y: e.offsetY };
        //     opContext.controlType = DomType.CIRCLE;
        // } else {
        gContextController.cancelHeightLine();//取消高亮线
        gContextController.createNewLine(dom_class, { id: dom_key });
        opContext.mouseDownPosition = { x: e.offsetX, y: e.offsetY };
        opContext.controlType = DomType.CIRCLE;
        // }
    }
    else if (dom_class === "collapse") {//折叠
        gContextController.tagCollapse(dom_key);
        gContextController.addActivedChildEntityByID(dom_key, opContext.initialPosition);
        return;
    }
    else if (dom_class === "line") {
        gContextController.clearActived();
        gContextController.heightLine(dom_key);
        viewOPController.updateOperationStatus();

        return;
    }


    viewOPController.updateOperationStatus();

    dom.doc.onmousemove = Utils._throttle(mouseMove, 8);
    dom.doc.onmouseup = mouseUp;
};
// 关闭闪烁效果
function closeAnimate() {
    const animateElements = document.getElementsByTagName("animate")
    for (const oldAnimateElement of animateElements) {
        if (oldAnimateElement.getAttribute("values") === "1;0;1") {
            oldAnimateElement.parentNode.classList.remove('redSmallCircle');
            oldAnimateElement.setAttribute("values", "0");
            oldAnimateElement.setAttribute("repeatCount", "0");
            oldAnimateElement.endElement();
        }
    }
}

// 双击模型树叶子结点 弹出属性信息框
function doubleClick(e) {
    let downDom = e.target;
    let dom_key = downDom.getAttribute("data-key");
    if (gContextDao.findEntity(dom_key).modelType !== "Top") {
        let statusData = gContextDao.getGContextProp("statusData");
        statusData.isShowProperty = true//打开弹窗  
    }
}


// 模型树按下
function modelTreeMouseDown(e) {
    if (g.gContext.statusData.isShowProperty) return;
    Utils.stopDefault(e);
    Utils.stopBubble(e);
    const downDom = e.target;
    const dom_type = downDom.getAttribute("data-type");
    const isLeaf = downDom.getAttribute("data-isLeaf");

    const name = downDom.textContent.trim();//去除两端空格
    if (!isLeaf) return

    if (dom_type) {

        gContextController.selectModel(dom_type, name)

        if (singleClickTimer) {
            clearTimeout(singleClickTimer);
            singleClickTimer = null;
        } else {
            singleClickTimer = setTimeout(function () {
                singleClickTimer = null;
                // 启动延时来执行单击事件的逻辑
                gContextController.createNewNode(dom_type, { x: e.clientX, y: e.clientY }, name);
                opContext.controlType = DomType.MODEL;//表示是模型 

                dom.doc.onmousemove = Utils._throttle(mouseMove, 20); //节流 20秒内触发一次
                dom.doc.onmouseup = mouseUp;
            }, 300)
        }
    }
}

let mainMove = Utils._throttle(mainMouseMove, 8);


function nodeMouseMoveout(e) {
    Utils.stopDefault(e);
    let moveDom = e.target;
    let dom_key = moveDom.getAttribute("data-key");
    let dom_class = moveDom.getAttribute("data-class");

    if (opContext.controlType === DomType.ENTITY) return;

    if (dom_class === "door" || dom_class === "event") {
        nodesOPController.explantationNode();
        let mainSVG = dom.query("#mainSVG");
        mainSVG.addEventListener("mousemove", mainMove);
    }
}

function mainMouseMove(e) {
    Utils.stopDefault(e);
    let moveDom = e.target;
    let dom_key = moveDom.getAttribute("data-key");
    let dom_class = moveDom.getAttribute("data-class");
    if (dom_class === "door" || dom_class === "event") {
        // nodesOPController.hoverNode(dom_key);  鼠标经过悬浮
        let mainSVG = dom.query("#mainSVG");
        mainSVG.removeEventListener("mousemove", mainMove);
        moveDom.addEventListener("mouseout", nodeMouseMoveout);
    }
    if (dom_class === "tip") {
        moveDom.parentNode.querySelector(".msg").classList.remove("hide")
        moveDom.parentNode.querySelector(".msg").classList.add("show")
    } else {
        if (moveDom.parentNode.querySelector(".msg")) {
            moveDom.parentNode.querySelector(".msg").classList.remove("show")
            moveDom.parentNode.querySelector(".msg").classList.add("hide")
        }
    }
}


//全局鼠标移动操作
function mouseMove(e) {
    Utils.stopDefault(e);

    // let moveDom = e.target;
    // let dom_key = moveDom.getAttribute("data-key");
    // let dom_class = moveDom.getAttribute("data-class");

    // console.log(moveDom);

    //如果事先没有按下，则调用hover
    if (!opContext.controlType) {
        return;
    }


    // let inMainSVG = e.path.some((value, index)=>{
    //         return value.id === dom.query("#mainSVG").id;
    //     });

    //如果在mainSVG中
    if (true) {
        if (opContext.controlType === DomType.MODEL) {
            let clientPosition = { x: e.clientX, y: e.clientY };
            gContextController.newNodeUpdate(clientPosition);
        }
        else if (opContext.controlType === DomType.ENTITY) {
            // console.log(dom_key, dom_class)
            if (opContext.dragFlag) {
                let zoom = viewOPController.getZoom();
                let offsetPosition = { x: Math.floor(e.offsetX), y: Math.max(Math.floor(e.offsetY), 10) };
                let offset = {
                    x: (offsetPosition.x - opContext.mouseDownPosition.x) / zoom,
                    y: (offsetPosition.y - opContext.mouseDownPosition.y) / zoom
                };

                // const { initialPosition } = opContext
                // let maxYKey = Object.keys(initialPosition).reduce((a, b) =>
                //     initialPosition[a].y > initialPosition[b].y ? a : b);

                // console.log('maxYKey', maxYKey)
                // const newY = Math.floor(initialPosition[maxYKey].y + offset.y)
                // console.log('newY', newY)
                // if (newY < 60) offset.y = 60 - initialPosition.y
                // console.log('offset.y', offset.y)
                // newY

                gContextController.updateEntityPos(opContext.initialPosition, offset);
                gContextController.updateMainSVGSize();
            }
        }
        else if (opContext.controlType === DomType.CANVAS) {
            if (opContext.dragFlag) {
                let zoom = viewOPController.getZoom();
                let offsetPosition = { x: e.offsetX / zoom + e.target.scrollLeft, y: e.offsetY / zoom + e.target.scrollTop };
                let offset = {
                    x: (e.offsetX / zoom + e.target.scrollLeft - opContext.mouseDownPosition.x),
                    y: (e.offsetY / zoom + e.target.scrollTop - opContext.mouseDownPosition.y)
                };
                let pos = {
                    x: offset.x < 0 ? offsetPosition.x : opContext.mouseDownPosition.x,
                    y: offset.y < 0 ? offsetPosition.y : opContext.mouseDownPosition.y,
                };
                let size = {
                    width: Math.abs(offset.x),
                    height: Math.abs(offset.y),
                }
                gContextController.updateMarquee(pos, size);//更新多选框
            }
        }
        else if (opContext.controlType === DomType.LINE) {

        }
        else if (opContext.controlType === DomType.MARQUEE) {

        }
        else if (opContext.controlType === DomType.CIRCLE) {//连接点
            if (opContext.dragFlag) {
                let zoom = viewOPController.getZoom();
                let offsetPosition = { x: e.offsetX / zoom, y: e.offsetY / zoom };
                //let offset = {x:e.offsetX - opContext.mouseDownPosition.x, y:e.offsetY - opContext.mouseDownPosition.y};
                gContextController.updateNewLine(offsetPosition);
            }
        }
    }
    else {
        if (opContext.controlType === DomType.MODEL) {
            let clientPosition = { x: e.clientX, y: e.clientY };
            gContextController.newNodeUpdate(clientPosition);
        }
    }

    // document.onmousemove = null;
    // opContext.timeOutId = setTimeout(function () {
    //     document.onmousemove = mouseMove;
    // }, 20);
};

//全局鼠标松开操作
function mouseUp(e) {
    g.gContext.statusData.canvasChanged = true;//标识画布有改动
    Utils.stopDefault(e);
    // clearTimeout(opContext.timeOutId);

    // let inMainSVG = e.path.some((value, index)=>{
    //     return value.id === dom.query("#mainSVG").id;
    // });
    //console.log(e.target);
    let mainSVG = dom.query("#mainSVG");
    mainSVG.addEventListener("mousemove", mainMove);

    let dom_class = e.target.getAttribute("data-class");
    let dom_key = e.target.getAttribute("data-key");


    if (opContext.controlType === DomType.MODEL) {//模型
        let zoom = viewOPController.getZoom();
        let clientPosition = { x: e.clientX, y: e.clientY };
        // console.log(clientPosition);
        let mainSVGOffset = gContextController.getMainSVGOffset();
        let scrollOffset = gContextController.getScrollOffset();
        let newSVGNode = gContextController.getNewSVGNode();
        let newNodeNum = gContextDao.getGContextProp("newNodeNum");//新增节点的数
        // console.log(newSVGNode)

        // console.log(gContextController.inContent(clientPosition), newSVGNode)
        if (gContextController.inContent(clientPosition) && newSVGNode) {
            //console.log(111);
            gContextController.createNode(newSVGNode.type,
                {
                    x: (clientPosition.x - mainSVGOffset.x) / zoom + scrollOffset.x,
                    y: (clientPosition.y - mainSVGOffset.y) / zoom + scrollOffset.y
                },
                newSVGNode.name);
            nodesOPController.updateLayer();
            nodesOPController.updateTreeData();


            let attrData = gContextDao.getGContextProp("attrData");
            attrData.model = null

            console.log('daol ', g.gContext.attrData)
        }
        // else {
        //     gContextController.createNode(newSVGNode.type, { x: 20 + newNodeNum * 10, y: 20 + newNodeNum * 10 }, newSVGNode.name);
        //     g.gContext.newNodeNum++;
        // }
        gContextController.deleteNewNode();

        gContextController.updateMainSVGSizeUp();

        viewOPController.updateAmount(["nodeNum", "maxLayer", "topNodeNum", "midNodeNum",
            "bottomNodeNum", "doorType", "doorNum", "maxDamageLevel", "criterionNum", "criterionTypeNum",
            "criterionRelevanceNum"]);
    }
    else if (opContext.controlType === DomType.ENTITY) {//实体
        nodesOPController.updateTreeData();
        gContextController.updateMainSVGSizeUp();

        const flag = e.offsetX == opContext.mouseDownPosition.x && e.offsetY == opContext.mouseDownPosition.y


        if (dom_class === "door" && flag) {
            //切换门类型
            // console.log('门')

            if (singleClickTimer) {
                clearTimeout(singleClickTimer);
                singleClickTimer = null;
            } else {
                singleClickTimer = setTimeout(function () {
                    singleClickTimer = null;
                    // 启动延时来执行单击事件的逻辑
                    let arr = ["and_door", "or_door", "user_door"]
                    let entity = gContextDao.findEntity(dom_key);
                    // console.log('entity', entity)
                    const index = arr.indexOf(entity.modelType)


                    entity.modelType = arr[(index + 1) % 3] //门类型轮流切换
                    // dom.updateDoorMark(entity, (index + 1) % 3);
                }, 300)
            }


        }
    }
    else if (opContext.controlType === DomType.CANVAS) {//空白处

        //拖拽框
        gContextController.setActivedEntity(opContext.initialPosition);
        gContextController.hideMarquee();
    }
    else if (opContext.controlType === DomType.LINE) {
        nodesOPController.updateTreeData();
    }
    else if (opContext.controlType === DomType.MARQUEE) {//框(无内容)

    }
    else if (opContext.controlType === DomType.CIRCLE) {//连接点
        const acLine = gContextDao.getGContextProp("activedLine");
        let res = gContextController.createLine(gContextController.getNewLine());
        gContextController.deleteNewLine();
        // console.log('res', res)
        if (res) {
            //     if (acLine) {//修改线并生成了新的线——>原有选中的线删除
            nodesOPController.removeActivedLine();
            gContextController.cancelHeightLine();
        }

        //     nodesOPController.updateTreeData();
        //     nodesOPController.updateLayer();
        //     viewOPController.updateAmount(["nodeNum", "maxLayer", "topNodeNum", "midNodeNum",
        //         "bottomNodeNum", "doorType", "doorNum", "maxDamageLevel", "criterionNum", "criterionTypeNum",
        //         "criterionRelevanceNum"]);
        // } else {
        //     if (acLine) { //新生的线没实现，选中的线隐藏了——>原有选中的线恢复
        //         gContextController.showAcLine()
        //     }
        // }
    }
    // }
    // else{
    //创建新节点

    // }


    opContext.controlType = null;

    dom.doc.onmousemove = null;
    dom.doc.onmouseup = null;
    viewOPController.updateOperationStatus();

};


function mainSVGMouseLeave() {
    opContext.dragFlag = false;
};
function mainSVGMouseEnter() {
    opContext.dragFlag = true;
}

function focusDivKeyUp(e) {
    let evt = e || window.event;
    let keyCode = evt.keyCode || evt.which || evt.charCode;
    //ctrl + c
    if (evt.ctrlKey && keyCode === 67) {
        nodesOPController.copy();
    }
    //ctrl + v
    else if (evt.ctrlKey && keyCode === 86) {
        nodesOPController.paste();
    }
    //绑定backspace或delete
    else if (keyCode === 8 || keyCode === 46) {
        nodesOPController._delete();
    }
    nodesOPController.updateTreeData();
}


function isPageFullscreen() {
    return !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function updateUserLineMap(userLineMap) {
    // console.log('是否进入')
    const cardList = dom.query('#criterionPopList')
    let zoom = viewOPController.getZoom();
    const viewPortHeight = g.gContext.viewPort.height

    for (let key in userLineMap) {//滚动改变判据连线的终点
        let line = userLineMap[key];

        const cardDom = dom.query(`#card-${key}`)
        line.end.posX = (line.orginX - cardList.scrollLeft) / zoom + content.scrollLeft
        line.end.posY = (viewPortHeight - cardDom.offsetHeight) / zoom + content.scrollTop
        line.update()
        dom.setAttributeByDom(line.dom, {
            "x": line.pos.x,
            "y": line.pos.y,
        });
        dom.setAttributeByDom(line.dom.querySelector(".polyline"), {
            "points": line.path,
        });
    }

}
function checkFullScreen() {
    setTimeout(() => {
        g.gContext.viewPort.height = window.innerHeight - 74
        let userLineMap = gContextDao.getGContextProp("userLineMap");
        if (Object.keys(userLineMap).length !== 0) updateUserLineMap(userLineMap)
    }, 300)
}
//给对应元素绑定操作
export function loadOperation() {

    // 切换全屏时操作
    window.addEventListener('resize', checkFullScreen)
    // 禁止浏览器Ctrl+滚轮放大缩小
    window.addEventListener('mousewheel', function (event) {
        if (event.ctrlKey === true || event.metaKey) {
            event.preventDefault();
        }
    }, { passive: false });

    document.addEventListener("fullscreenchange", function () {
        console.log(isPageFullscreen())
        if (isPageFullscreen()) {
            console.log("进入全屏模式");
        } else {
            console.log("退出全屏模式");
        }
    });

    gContextController.createCanvas();

    // gContextController.test();

    let mainSVG = dom.query("#mainSVG");
    // let listSVG = dom.query("#list");
    let content = dom.query("#content");

    let modelTree = dom.query("#modelTree");

    // let main = dom.query("#main")
    //
    // main.addEventListener("mouseup",)

    mainSVG.addEventListener("mousedown", mainMouseDown);

    mainSVG.addEventListener("dblclick", (e) => {
        // 清除单击事件的延时
        clearTimeout(singleClickTimer);
        singleClickTimer = null;

        // 双击节点的逻辑
        doubleClick(e);
    });


    content.addEventListener("mouseleave", mainSVGMouseLeave);
    content.addEventListener("mouseenter", mainSVGMouseEnter);

    // listSVG.addEventListener("mousedown", listMouseDown);
    // content.addEventListener("scroll", contentScroll);

    content.addEventListener("keyup", focusDivKeyUp);


    mainSVG.addEventListener("mousemove", mainMove);

    modelTree.addEventListener("mousedown", modelTreeMouseDown);
    modelTree.addEventListener("dblclick", (e) => {
        // 清除单击事件的延时
        clearTimeout(singleClickTimer);
        singleClickTimer = null;

        // 双击模型树的逻辑
        // doubleClick(e);
        let statusData = gContextDao.getGContextProp("statusData");
        statusData.isShowProperty = true//打开弹窗 
    });
};