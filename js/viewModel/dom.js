import { g } from "../structure/gContext.js"
import gContextDao from "../dao/gContextDao.js";
import gContextController from "../controller/gContextController.js";

var doc = document;

var doms = {
    element: {},
    elements: {},
};

//hs等级颜色表，颜色越深hs程度越高
const statusColor = {
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
        "#3CFF00", "#FFFF00", "#FFC080", "#FF0000", "#890101"
    ],
};

let statusData = gContextDao.getGContextProp("statusData")

function updateStandButton(id, hsStandard) {
    // let entity = gContextDao.findEntity(id);
    // if(entity){
    //     let standardButton = entity.dom.querySelector(".standard");
    //     if(!standardButton){
    //         standardButton = createSVGElement("g", {
    //
    //         }, ["standard"]);
    //     }else{
    //         entity.dom.removeChild(standardButton);
    //     }
    //     let size = {width:entity.size.width/2, height:10};
    //     let len = hsStandard.standardList.length;
    //     let current_x = (entity.size.width-size.width*len)/2;
    //     let current_y = -1*(size.height+2);
    //     for(let i = 0; i < len; ++i){
    //         let button = createSVGElement("rect", {
    //             x:current_x,
    //             y:current_y,
    //             width:size.width,
    //             height:size.height,
    //             fill:(hsStandard.currentIndex === hsStandard.standardList[i].id)?"blue":"white",
    //             "stroke":"black",
    //         }, ["standard-button"]);
    //         standardButton.appendChild(button);
    //         current_x += size.width;
    //     }
    //     entity.dom.appendChild(standardButton);
    // }
}

//将文本按照指定长度进行分行
function splitByLine(str, max, fontsize) {
    let curLen = 0;
    let result = [];
    let start = 0, end = 0;
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        let pixelLen = code > 255 ? fontsize : fontsize / 2;
        curLen += pixelLen;
        if (curLen > max) {
            end = i;
            result.push(str.substring(start, end));
            start = i;
            curLen = pixelLen;
        }
        if (i === str.length - 1) {
            end = i;
            result.push(str.substring(start, end + 1));
        }
    }
    return result;
};

// 在 SVG 中创建多行文本元素
function appendMultiText(strList, posX, posY, fontsize, entity, fontFamily) {
    // console.log(entity, statusData.isShowImg, entity.imgSrc, (statusData.isShowImg && entity.imgSrc))

    if (!fontsize) {
        fontsize = 14;
    }
    if (!fontFamily) {
        // fontFamily = "simsun";
        fontFamily = "Microsoft YaHei";
    }
    let mulText = createSVGElement(
        "text",
        {
            x: posX,
            y: posY - 6,//提高一点，不和红三角提示图标重叠
            "font-size": fontsize,
            "font-family": fontFamily,
            // "stroke": "black",
            // "stroke-width": "0.5px",
            // "font-weight": "bold",
            // "fill": "white",
            "fill": (statusData.isShowImg && entity.imgSrc) ? 'white' : 'black',
            "font-weight": (statusData.isShowImg && entity.imgSrc) ? 'bold' : 'null',
            "stroke": (statusData.isShowImg && entity.imgSrc) ? 'black' : 'null',
            "stroke-width": (statusData.isShowImg && entity.imgSrc) ? '0.5px' : 'null',
        },
        ["entity-name", "none-pointer"]
    );

    let len = strList.length;
    for (let i = 0; i < len; ++i) {

        let span = createSVGElement(
            "tspan",
            {
                x: posX,
                dy: "1em",
                "text-anchor": "middle",
            },
            []
        );
        span.innerHTML = strList[i];
        mulText.appendChild(span);
    }
    return mulText;
}

//更新coll
function updateCollapse(entity) {
    if (entity.category !== "event") return;//门没有折叠图标了
    let coll = entity.dom.querySelector(".collapse");
    if (entity.collapse === null) {
        coll.classList.add("hide");
    } else if (entity.collapse === false) {
        setAttributeByDom(coll, { "href": "#fold" });
        coll.classList.remove("hide");
    } else if (entity.collapse) {
        setAttributeByDom(coll, { "href": "#unfold" });
        coll.classList.remove("hide");
    }
}

//更新名称
function updateNameNode(entity, strList, fontSize) {

    let nameBar = entity.dom.querySelector(".entity-name");
    // let nameBack = entity.dom.querySelector(".node-name-back");
    if (nameBar) {
        entity.dom.removeChild(nameBar);
    }
    // if (nameBack) {
    //     entity.dom.removeChild(nameBack);
    // }
    let posY = entity.size.height / 2.0 - (strList.length * fontSize / 2.0) < entity.size.height / 3 ? entity.size.height / 3 : entity.size.height / 2.0 - (strList.length * fontSize / 2.0);
    if (strList.length > 2) {
        strList = strList.splice(0, 2);
        strList.push("...");
    }
    // if (strList.length > 0) {
    //     let textBorder = createSVGElement("rect", {
    //         "fill": "white",
    //         "x": 16,
    //         "y": posY,
    //         "height": 8 * (strList.length + 1),
    //         "width": 64,
    //     }, ["none-select", "none-pointer", "node-name-back"]);
    //     entity.dom.appendChild(textBorder);
    // }

    nameBar = appendMultiText(strList, entity.size.width / 2.0, posY, fontSize, entity);
    // console.log(entity)
    entity.dom.appendChild(nameBar);

}

// 返回节点图标名
function imgName(entity) {
    if (entity.type == 'Action') {
        return 'Action'
    } else if (entity.type == 'Condition') {
        return 'Condition'
    } else if (entity.type == 'Control') {
        if (entity.name == 'Fallback') return 'Fallback'
        else if (entity.name == 'Parallel') return 'Parallel'
        else if (entity.name == 'Sequence') return 'Sequence'
        else return false
    } else if (entity.type == 'Decorator') {
        if (entity.name == 'Repeat') return 'Repeat'
        else if (entity.name == 'Timeout') return 'Timeout'
        else if (entity.name == 'RetryUntilSuccessful') return 'RetryUntilSuccessful'
        else if (entity.name == 'ForceSuccess') return 'ForceSuccess'
        else if (entity.name == 'ForceFailure') return 'ForceFailure'
        else if (entity.name == 'Inverter') return 'Inverter'
        else return false
    } else if (entity.type == 'Top') return 'Top'
    else return false
}

// 创建节点rect
function createRect(entity) {
    let rect = createSVGElement(
        "rect",
        {
            "width": entity.size.width,
            "height": entity.size.height,
            "fill": "url(#grad1)",
            "stroke": "#fff",
            "stroke-width": 2,
            "rx": 5,
            "ry": 5,
            // entity.modelType == 'Top' ? 'Top' :
            "data-class": 'event',
            "data-key": entity.id,
        },
        ["clickable", "rect"]
    );
    return rect
}

//创建节点
function createNode(entity) {
    // console.log(entity)
    let entityNode = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    let entityFragment = doc.createDocumentFragment();

    const iconName = imgName(entity)

    //节点渐变底色框
    entityFragment.appendChild(createRect(entity));


    //添加名称 
    if (entity.name !== "") {
        let eName = createSVGElement(
            "text",
            {
                "x": entity.size.width / 2 + (iconName ? 15 : 0) - (entity._description ? 15 : 0),
                "y": "30",
                "text-anchor": "middle", //根据文字中心点定位
                "dominant-baseline": "middle",
                "fill": entity.textColor,
                "font-size": "20px",
                // "font-family": "Arial",
                "font-family": "Consolas,Monaco,Courier,Courier New ",  // 使用等宽字体
                "font-weight": "bold"
            },
            ["name"]
        );
        eName.textContent = entity.name;
        entityFragment.appendChild(eName);
    }
    // 添加别名
    // console.log(entity.aliasName)
    if (entity.aliasName !== "" && entity.aliasName !== entity.name) {
        let eName = createAliasName(entity)
        entityFragment.appendChild(eName);
    }
    // console.log(entity)
    if (entity.hasUpNodes) {
        let upCircle = createSVGElement("circle", {
            "r": 4,
            "cx": entity.upNodeOffset.x,
            "cy": entity.upNodeOffset.y,
            "data-key": entity.id,
            "data-class": "conn-up",
        }, ["connection", "conn-up"]);
        entityFragment.appendChild(upCircle);
    }

    if (entity.hasDownNodes) {
        let downCircle = createSVGElement("circle", {
            "r": 4,
            "cx": entity.downNodeOffset.x,
            "cy": entity.downNodeOffset.y,
            "data-key": entity.id,
            "data-class": "conn-down",
        }, ["connection", "conn-down"]);
        entityFragment.appendChild(downCircle);
    }

    // 添加节点图标
    if (iconName) {
        let img = createSVGElement("image", {
            href: `../assets/node/${iconName}.svg`,
            x: "10",
            y: "15",
            width: "25",
            height: "25"
        });
        entityFragment.appendChild(img);
    }

    // 添加描述信息图标
    if (entity._description) {
        let desIcon = createDesIcon(entity.size.width)
        entityFragment.appendChild(desIcon);
    }

    // 添加端口
    // if (true) {
    //     let foreignObject = createSVGElement("foreignObject", {
    //         x: "20",
    //         y: entity.size.height - 20,
    //         width: entity.size.width - 20,
    //         height: "30"
    //     }, ["clickable"]);

    //     // 创建 input 元素并设置样式
    //     let input = document.createElement("input");
    //     input.setAttribute("type", "text");
    //     input.style.width = "90px"; // 样式调整
    //     input.style.height = "20px";

    //     foreignObject.appendChild(input);
    //     entityFragment.appendChild(foreignObject);
    // }

    entityNode.setAttribute("x", entity.pos.x);
    entityNode.setAttribute("y", entity.pos.y);
    entityNode.setAttribute("id", entity.id);
    entityNode.setAttribute("height", entity.size.height);
    entityNode.setAttribute("width", entity.size.width);
    entityNode.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    entityNode.classList.add("node", "absolute-pos");
    entityNode.appendChild(entityFragment);

    return entityNode;
};

//创建svg标签
function createSVGElement(tagName, attr, classList) {
    let element = doc.createElementNS("http://www.w3.org/2000/svg", tagName);
    // console.log('attr', element, attr)
    for (let key in attr) {
        // if (attr[key])
        element.setAttribute(key, attr[key]);
    }
    let len = classList ? classList.length : 0;
    for (let i = 0; i < len; ++i) {
        element.classList.add(classList[i]);
    }
    return element;
};
//创建dom标签
function createDomElement(tagName, attr, classList) {
    let element = doc.createElement(tagName);
    for (let key in attr) {
        element.setAttribute(key, attr[key]);
    }
    let len = classList ? classList.length : 0;
    for (let i = 0; i < len; ++i) {
        element.classList.add(classList[i]);
    }
    return element;
};
//画线
function createLine(line) {
    let lineG = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    let lineFragment = doc.createDocumentFragment();

    let polyline = createSVGElement(
        "path",
        {
            "d": line.path,
            "data-key": line.id,
            "data-class": "line",
            "stroke": line.color,
            "stroke-width": line.lineWidth,
            "fill": "none",
        },
        ["absolute-pos", "polyline"]);

    let pitch = createSVGElement(
        "path",
        {
            "d": line.path,
            "data-key": line.id,
            "data-class": "line",
        },
        ["absolute-pos", "pitch"]);
    lineFragment.appendChild(pitch);


    lineFragment.appendChild(polyline);

    // lineG.setAttribute("transform", "translate("+line.pos.x+","+line.pos.y+")");
    lineG.setAttribute("x", line.pos.x);
    lineG.setAttribute("y", line.pos.y);
    lineG.setAttribute("id", line.id);
    lineG.setAttribute("height", line.size.height);
    lineG.setAttribute("width", line.size.width);

    //   console.log('line.id', line.id)
    if (line.id == 'newLine') { lineG.setAttribute("stroke-dasharray", "15 4"); }

    lineG.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    lineG.classList.add("line");
    lineG.classList.add("visible");

    lineG.appendChild(lineFragment);

    return lineG;
};

// 创建别名
function createAliasName(entity) {
    let eName = createSVGElement(
        "text",
        {
            "x": entity.size.width / 2.0,
            "y": entity.size.height / 2.0 + 20,
            "text-anchor": "middle",
            "dominant-baseline": "middle",
            "fill": entity.textColor,
            "font-size": "20px",
            "font-family": "Consolas,Monaco,Courier,Courier New ",  // 使用等宽字体
            "font-weight": "bold"
        },
        ["aliasName"]
    );
    eName.textContent = entity.aliasName;
    return eName
}

// 创建描述信息图标
function createDesIcon(width) {
    let img = createSVGElement("image", {
        href: `../assets/node/msg.svg`,
        x: width - 30,
        y: 15,
        width: "25",
        height: "25"
    }, ["desIcon"]);
    return img
}

// 增加节点别名
function addAliasName(entity) {

}

// 移除节点别名
function removeAliasName(entity) {

}

// 修改别名
function updateAliasName(entity) {

}


// 更新实体尺寸
function updateEntitySize(entity, hasAlias = false) {
    const { type, name, aliasName, _description } = entity;
    const len = name.length;
    const nameLength = aliasName?.length || 0;
    const iconName = imgName({ type, name });

    const baseWidth = 20 + (iconName ? 30 : 0) + len * 11 + (_description ? 30 : 0);
    const aliasWidth = nameLength * 11 + 20;
    const width = hasAlias ? Math.max(baseWidth, aliasWidth) : baseWidth;
    const height = hasAlias ? 90 : 60;

    const widthFlag = entity.size.width == width
    entity.size.width = width;
    entity.size.height = height;

    return widthFlag
}

// 更新连接点位置
function updateConnectionPoints(entity) {
    const { size, dom, upNodeOffset, downNodeOffset, hasUpNodes, hasDownNodes } = entity;

    if (hasUpNodes) {
        upNodeOffset.x = size.width / 2;
        const up = dom.querySelector(".conn-up");
        setAttributeByDom(up, { "cx": upNodeOffset.x });
    }

    if (hasDownNodes) {
        downNodeOffset.x = size.width / 2;
        downNodeOffset.y = size.height - 2;
        const down = dom.querySelector(".conn-down");
        setAttributeByDom(down, { "cx": downNodeOffset.x, "cy": downNodeOffset.y });
    }
}

// 更新节点元素
function updateNodeElements(entity, aliasFlag, orgFlag, orgDesIsNull = true) {
    // console.log(aliasFlag, orgFlag, handleDes)
    const { dom, size, type, name, _description } = entity;
    const iconName = imgName({ type, name });

    // 更新节点大小
    const rect = dom.querySelector(".rect");
    setAttributeByDom(rect, { "width": size.width, "height": size.height });

    // 更新节点名位置
    const nodeName = dom.querySelector(".name");
    setAttributeByDom(nodeName, {
        "x": size.width / 2 + (iconName ? 15 : 0) - (_description ? 15 : 0),
    });

    // 更新别名[修改、增加、移除]
    if (aliasFlag) {
        if (orgFlag) removeDomsByClass(dom, ".aliasName");

        const eName = createAliasName(entity);
        dom.appendChild(eName)
    } else {
        if (orgFlag) removeDomsByClass(dom, ".aliasName");
    }

    // 更新描述信息图标[修改、增加、移除]
    if (_description) {
        if (!orgDesIsNull) removeDomsByClass(dom, ".desIcon");
        dom.appendChild(createDesIcon(size.width));
    } else {
        if (!orgDesIsNull) removeDomsByClass(dom, ".desIcon");
    }

}

//添加高亮动画
// function createLineAnimate(ps) {
//     let circle = createSVGElement(
//         "circle",
//         {
//             "cx": 0,
//             "cy": 0,
//             "r": 3,
//             "fill": "#ff7700",
//         },
//         ["lineAnimate"]
//     );
//     let ani = createSVGElement(
//         "animateMotion",
//         {
//             "dur": "3s",
//             "fill": "remove",
//             "repeatCount": "indefinite",
//             "path": "M" + ps
//         },
//         []
//     );
//     circle.appendChild(ani);
//     return circle;
// };

//通过id设置dom节点attr
function setAttributeById(id, attr) {
    let dom = query(id);
    setAttributeByDom(dom, attr);
};
//通过dom设置attr
function setAttributeByDom(dom, attr) {
    for (let key in attr) {
        dom.setAttribute(key, attr[key]);
    }
};

//通过dom移除attr
function removeAttributeByDom(dom, attrs) {
    attrs.forEach(attr => {
        dom.removeAttribute(attr);
    });
};

//拖拽生成新的svg节点
function createNewSVGNode(newSVGNode) {
    let svg = createSVGElement(
        "svg",
        {
            "id": newSVGNode.id,
            "transform": "translate(" + (newSVGNode.pos.x - 110) + "," + newSVGNode.pos.y + ")",
            width: 220,
            height: 26,
        },
        ["none-pointer"]);
    let rect = createSVGElement(
        "rect",
        {
            "width": 220,
            "height": 26,
            "fill": "#eaf4fe"
        },
        []
    );
    let text = createSVGElement(
        "text",
        {
            "x": 110,
            "y": 13,
            "dy": ".35em",
            "text-anchor": "middle",
            "fill": "#606266",
            "font-size": "14px" // 设置字体大小
        },
        []
    );
    text.textContent = newSVGNode.name;

    svg.appendChild(rect);
    svg.appendChild(text);
    return svg;
};

//创建画布
function createCanvas(size) {
    // console.log(size)
    let canvas = createSVGElement(
        "svg",
        {
            "width": size.width,
            "height": size.height,

            "data-class": "canvas",
            "id": "mainSVG",
        },
        [],
    );

    // let backgroundRect = createSVGElement(
    //     "rect",
    //     {
    //         "width": "100%",
    //         "height": "100%",
    //         "fill": "#333344" // 设置背景颜色，例如浅灰色
    //     },
    //     []
    // );

    // // 将背景矩形添加到 SVG 的最底层
    // canvas.appendChild(backgroundRect);
    // canvas.appendChild(createDefs());
    // canvas.appendChild(createTips());
    canvas.appendChild(createLinearGradientDefs());//插入节点渐变背景

    return canvas;
};

// 创建节点渐变背景defs
function createLinearGradientDefs() {
    let defs = createSVGElement("defs", {}, []);
    let linearGradient = createSVGElement("linearGradient", {
        id: "grad1",
        x1: "0%",
        y1: "0%",
        x2: "0%",
        y2: "100%"
    }, []);

    let stop1 = createSVGElement("stop", {
        offset: "0%",
        "stop-color": "#2b3558"
    }, []);
    let stop2 = createSVGElement("stop", {
        offset: "100%",
        "stop-color": "#1a2036"
    }, []);
    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    defs.appendChild(linearGradient);
    return defs;
}

//创建折叠【每个事件右下角的折叠按钮】defs
function createDefs() {
    let defs = createSVGElement(
        "defs",
        {
        },
        [],
    );

    let fold = createFoldCollapseDefs();
    let unfold = createUnfoldCollapseDefs();

    defs.appendChild(fold);
    defs.appendChild(unfold);

    return defs;
}
function createFoldCollapseDefs() {
    let fold = createSVGElement(
        "g",
        {
            "id": "fold",
        },
        [],
    );
    let rect = createSVGElement(
        "rect",
        {
            "x": 0,
            "y": 0,
            "width": 10,
            "height": 10,
            "stroke": "rgba(128, 128, 128, 0.3)",//rgb(30, 30, 30)
            "stroke-width": 0.5,
            "fill": "#f5f7fa",
        },
        []
    );
    fold.appendChild(rect);
    let line = createSVGElement(
        "line",
        {
            "x1": 0.5,//0
            "x2": 9.5,//10
            "y1": 5,
            "y2": 5,
            "stroke": "rgba(128, 128, 128, 0.5)",//rgb(249, 109, 118)
            "stroke-width": 0.5,
        },
        []
    );
    fold.appendChild(line);
    return fold;
};
function createUnfoldCollapseDefs() {
    let unfold = createSVGElement(
        "g",
        {
            "id": "unfold",
        },
        [],
    );
    let rect = createSVGElement(
        "rect",
        {
            "x": 0,
            "y": 0,
            "width": 10,
            "height": 10,
            "stroke": "rgba(128, 128, 128, 0.3)",//rgb(30, 30, 30)
            "stroke-width": 0.5,
            "fill": "#f5f7fa",
        },
        []
    );
    unfold.appendChild(rect);
    let line1 = createSVGElement(
        "line",
        {
            "x1": 0.5,//0
            "x2": 9.5,//10
            "y1": 5,
            "y2": 5,
            "stroke": "rgba(128, 128, 128, 0.5)",//#b7f7a7
            "stroke-width": 0.5,
        },
        []
    );
    unfold.appendChild(line1);
    let line2 = createSVGElement(
        "line",
        {
            "x1": 5,
            "x2": 5,
            "y1": 0.5,//0
            "y2": 9.5,//10
            "stroke": "rgba(128, 128, 128, 0.5)",//#b7f7a7
            "stroke-width": 0.5,
        },
        []
    );
    unfold.appendChild(line2);
    return unfold;
};

//创建网格
function createGrid(grid) {
    let rect = createSVGElement(
        "rect",
        {
            "x": 0,
            "y": 0,
            "width": grid.size.width,
            "height": grid.size.height,
            "fill": "url(#grid)",
            "id": "RectGrid",
        },
        ["none-pointer"]
    );
    let smallGrid = createSVGElement(
        "pattern",
        {
            "width": 8,
            "height": 8,
            "patternUnits": "userSpaceOnUse",
            "id": "smallGrid",
        }
    );
    let path = createSVGElement(
        "path",
        {
            "d": "M 8 0 L 0 0 0 8",
            "fill": "white",
            "stroke": "gray",
            "stroke-width": 0.15,
        }
    );
    let unitGrid = createSVGElement(
        "pattern",
        {
            "width": 80,
            "height": 80,
            "patternUnits": "userSpaceOnUse",
            "id": "grid"
        }
    );
    // let unitRect = createSVGElement(
    //     "rect",
    //     {
    //         "width":80,
    //         "height":80,
    //         "fill":"white",
    //     }
    // );
    let smallRect = createSVGElement(
        "rect",
        {
            "width": 80,
            "height": 80,
            "fill": "url(#smallGrid)",
        }
    );
    let unitPath = createSVGElement(
        "path",
        {
            "d": "M 80 0 L 0 0 0 80",
            "fill": "none",
            "stroke": "gray",
            "stroke-width": 0.3,
        }
    );
    let fragment = doc.createDocumentFragment();

    smallGrid.appendChild(path);

    // unitGrid.appendChild(unitRect);
    unitGrid.appendChild(smallRect);
    unitGrid.appendChild(unitPath);

    rect.appendChild(unitGrid);

    fragment.appendChild(smallGrid);
    fragment.appendChild(unitGrid);
    fragment.appendChild(rect);

    return fragment;
}

function createHeightLightFilter() {
    let filter = createSVGElement("filter", {
        id: "ware",
        "width": "200%",
        "height": "200%",
    }, []);
    let feMorphology = createSVGElement("feMorphology", {
        in: "SourceAlpha",
        result: "DILATED",
        operator: "dilate",
        radius: "1",
    }, []);
    filter.appendChild(feMorphology);
    let animate = createSVGElement("animate", {
        attributeName: "radius",
        dur: "1s",
        values: "1;2;3;4;5;6;7;8;10",
        repeatCount: "indefinite",
    }, []);
    feMorphology.appendChild(animate);

    let feFlood = createSVGElement("feFlood", {
        "flood-color": "green",
        "flood-opacity": "1",
        "result": "flood",
    }, []);
    let animate2 = createSVGElement("animate", {
        attributeName: "flood-opacity",
        dur: "1s",
        values: "1;0.8;0.5;0.3;0.2;0",
        repeatCount: "indefinite",
    }, []);
    feFlood.appendChild(animate2);
    filter.appendChild(feFlood);
    let feComposite = createSVGElement("feComposite", {
        in: "flood",
        in2: "DILATED",
        operator: "in",
        result: "OUTLINE",
    }, []);
    filter.appendChild(feComposite);
    let feMerge = createSVGElement("feMerge", {

    }, []);
    let feMergeNode1 = createSVGElement("feMergeNode", {
        in: "OUTLINE",
    }, []);
    feMerge.appendChild(feMergeNode1);
    let feMergeNode2 = createSVGElement("feMergeNode", {
        in: "SourceGraphic",
    }, []);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feMerge);
    return filter;
}
//创建多选框
function createMarquee(marquee) {
    // let pos = marquee.pos;
    // let size = marquee.size;
    let mDom = createDomElement(
        "div",
        {
            // "x":pos.x,
            // "y":pos.y,
            // "width":size.width,
            // "height":size.height,
            "data-class": "marquee",
            "id": "marquee",
            // "fill":marquee.fill,
            // "stroke":marquee.stroke,
            // "stroke-width":marquee.strokeWidth,
            // "opacity":marquee.opacity,

        },
        ["none-pointer", "absolute-pos", "marquee", "hide"],
    );

    return mDom;
};

//添加element
function addElement(element, parent) {
    (parent ? parent : query("#mainSVG")).appendChild(element);
};

//通过选择器查找单个dom节点
function query(key) {
    // return doms.element[key] || (doms.element[key] = doc.querySelector(key));
    return doc.querySelector(key);
};
//通过选择器查找多个dom节点
function queryAll(key) {
    //return doms.elements[key] || (doms.elements[key] = doc.querySelectorAll(key));
    return doc.querySelectorAll(key);
};
//通过id给指定dom节点移除class
function removeClassByID(key, className) {
    let d = doc.querySelector(key);
    return d ? d.classList.remove(className) : null;
};
//通过id给指定dom节点添加class
function addClassByID(key, className) {
    let d = doc.querySelector(key);
    return d ? addClassByDOM(d, className) : null;
};
//通过dom添加指定class
function addClassByDOM(dom, className) {
    return dom.classList.add(className);
};


// 通过class删除DOM下指定元素
function removeDomsByClass(dom, className) {
    let child = dom.querySelector(className);
    dom.removeChild(child);
}

//通过dom删除指定class
function removeClassByDOM(dom, className) {
    return dom.classList.remove(className);
};
//判断dom是否有指定class
function hasClassByDom(dom, className) {
    return dom.classList.contains(className);
}
//通过class移除domList中的指定class
function removeDomsClass(className, removeClass) {
    let domList = doc.getElementsByClassName(className);
    for (let i = 0, len = domList.length; i < len; ++i) {
        domList[i].classList.remove(removeClass);
    }
}
//通过class添加domList中的指定class
function addDomsClass(className, addClass) {
    let domList = doc.getElementsByClassName(className);
    for (let i = 0, len = domList.length; i < len; ++i) {
        domList[i].classList.add(addClass);
    }
}

//添加图片
function addNodeImg(entity) {
    let file = gContextDao.imgManager.getNodeImg(entity.imgName);
    // console.log(file)
    if (file) {
        let reader = new FileReader();
        reader.onloadend = (e) => {
            if (reader.result) {
                addImg(entity.dom, reader.result, entity);
            }
        }
        reader.readAsDataURL(file);
    }


}

function addImg(svg, imgData, entity) {
    let natSize = entity.img;
    if (!natSize) return;

    let size = { width: 96, height: 96 };
    let offset = { x: 0, y: 0 };
    if (natSize.height < natSize.width) {
        size.width = 96 / natSize.height * natSize.width;
        offset.x = (96 - size.width) / 2;
    }
    else {
        size.height = 96 / natSize.width * natSize.height;
        offset.y = (96 - size.height) / 2;
    }

    let old_img = svg.querySelector(".node-img");
    if (old_img) {
        setAttributeByDom(old_img, {
            "href": imgData,
            "x": offset.x,
            "y": offset.y,
            "width": size.width,
            "height": size.height,
        });
    }
    else {
        let target = svg.querySelector(".pic");
        let defs = createSVGElement("defs", {

        }, []);
        let pattern = createSVGElement("pattern", {
            "height": 1,
            "width": 1,
            "id": entity.id + "img",
            "patternContentUnits": "userSpaceOnUse",
        }, []);

        let img = createSVGElement("image", {
            "href": imgData,
            // "href": '../assets/attributeFence/attr_1.png',
            "x": offset.x,
            "y": offset.y,
            "width": size.width,
            "height": size.height,
        }, ["node-img"]);


        pattern.appendChild(img);
        defs.appendChild(pattern);

        target.parentNode.insertBefore(defs, target);
        let pic_img = svg.querySelector(".pic-img");

        let nameBar = svg.querySelector(".entity-name");
        let ftIdTxt = svg.querySelector(".ft-id-text");

        if (nameBar) {
            setAttributeByDom(nameBar, {
                "fill": statusData.isShowImg ? 'white' : 'black',
                "font-weight": statusData.isShowImg ? 'bold' : 'null',
                "stroke": statusData.isShowImg ? 'black' : 'null',
                "stroke-width": statusData.isShowImg ? '0.5px' : 'null',
            });
        }
        if (ftIdTxt) {
            setAttributeByDom(ftIdTxt, {
                "fill": statusData.isShowImg ? 'white' : 'black',
                "font-weight": statusData.isShowImg ? 'bold' : 'null',
                "stroke": statusData.isShowImg ? 'black' : 'null',
                "stroke-width": statusData.isShowImg ? '0.5px' : 'null',
            });
        }
        setAttributeByDom(pic_img, {
            "fill": "url(#" + entity.id + "img)",
        });



    }
}

function deleteNodeImg(entity) {
    let natSize = entity.img;
    if (!natSize) return;
    let old_img = entity.dom.querySelector(".node-img");
    let pic_img = entity.dom.querySelector(".pic-img")
    old_img.parentNode.parentNode.innerHTML = "";
    setAttributeByDom(pic_img, {
        "fill": "white",
    });
}

// 切换全局实体图片显示
function setFill(show) {
    // console.log('进入setFill', show)
    statusData.isShowImg = show
    let domList = doc.getElementsByClassName("pic-img");
    for (let i = 0, len = domList.length; i < len; ++i) {
        const dom_key = domList[i].getAttribute("data-key")
        const entity = gContextDao.findEntity(dom_key);
        if (entity.imgSrc) {
            setAttributeByDom(domList[i], {
                "fill": show ? `url(#${dom_key}img)` : "white"
            });
        }
        let nameBar = entity.dom.querySelector(".entity-name");
        let ftIdTxt = entity.dom.querySelector(".ft-id-text");

        if (nameBar) {
            setAttributeByDom(nameBar, {
                "fill": show && entity.imgSrc ? 'white' : 'black',
                "font-weight": show && entity.imgSrc ? 'bold' : 'null',
                "stroke": show && entity.imgSrc ? 'black' : 'null',
                "stroke-width": show && entity.imgSrc ? '0.5px' : 'null',
            });
        }
        if (ftIdTxt) {
            setAttributeByDom(ftIdTxt, {
                "fill": show && entity.imgSrc ? 'white' : 'black',
                "font-weight": show && entity.imgSrc ? 'bold' : 'null',
                "stroke": show && entity.imgSrc ? 'black' : 'null',
                "stroke-width": show && entity.imgSrc ? '0.5px' : 'null',
            });
        }
    }
}

function insertAfter(newElement, targetElement) {
    let parentElement = targetElement.parentNode;
    if (parentElement.lastChild === targetElement) {
        parentElement.appendChild(newElement);
    }
    else {
        parentElement.insertBefore(newElement, targetElement.nextElementSibling);
    }
}

// 删除判据线
function deleteUserLine() {
    let elementsArray = Array.from(document.getElementsByClassName("userLine"));
    elementsArray.forEach((element) => {
        element.remove();
    });
    let userLineMap = gContextDao.getGContextProp("userLineMap");
    // userLineMap.length = 0
    userLineMap = {}
}


export default {
    addAliasName,
    removeAliasName,
    updateAliasName,



    updateEntitySize,
    updateConnectionPoints,
    updateNodeElements,

    imgName,
    deleteUserLine,
    createNode,
    createLine,
    doc,//不可删 dom.doc.onmouseup = mouseUp;
    query,
    queryAll,
    setAttributeByDom,
    setAttributeById,
    createNewSVGNode,
    // createDiv,
    createCanvas,
    addElement,
    createMarquee,
    removeClassByID,
    addClassByID,
    removeClassByDOM,
    addClassByDOM,
    createGrid,
    // updateCriterionColorNode,
    appendMultiText,
    updateNameNode,
    // updateEventType,
    updateCollapse,
    hasClassByDom,
    // createLineAnimate,
    removeDomsClass,
    addDomsClass,
    // updateCriterionImgList,
    addNodeImg,
    deleteNodeImg,
    createHeightLightFilter,
    updateStandButton,
    // updateEffectStats,
    // updateDoorMark,
    setFill
}
