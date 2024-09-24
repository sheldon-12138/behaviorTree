import gContextDao from "../dao/gContextDao.js";
import dom from "../viewModel/dom.js";

function _renderElement(entity, nodeFragment, lineFragment, treeId) {
    if (entity) {
        let dDom = dom.createNode(entity);
        entity.dom = dDom;
        nodeFragment.appendChild(dDom);
        let len = entity.downEntity.length;
        for (let i = 0; i < len; ++i) {
            let entity2 = gContextDao.findEntity(entity.downEntity[i]);
            let newLine = gContextDao.addLine({ entityID: entity.id, posX: entity.pos.x + entity.downNodeOffset.x, posY: entity.pos.y + entity.downNodeOffset.y + entity.lineOffset["down"], type: "down" },
                { entityID: entity2.id, posX: entity2.pos.x + entity2.upNodeOffset.x, posY: entity2.pos.y + entity2.upNodeOffset.y + entity.lineOffset["up"], type: "up" },
                treeId);
            let line = dom.createLine(newLine);
            newLine.dom = line;
            lineFragment.appendChild(line);
        }
    }
}
function renderByContext(treeId) {
    let nodeFragment = dom.doc.createDocumentFragment();
    let lineFragment = dom.doc.createDocumentFragment();
    // let doors = gContextDao.getGContextProp("doorEntityMap");
    let events = gContextDao.getGContextProp("eventEntityMap");
    let lineMap = gContextDao.getGContextProp("lineMap");
    // for(let key in doors){
    //     _renderElement(doors[key], nodeFragment, lineFragment);
    // }
    // for (let key in events) {
    //     if (events[key].treeId == treeId) {
    //         if (events[key].type == "SubTree") {
    //             // console.log(events[key]);
    //             const downId = findSubTree(events[key].name);
    //             if (downId) {
    //                 events[key].downEntity.push(downId);
    //                 let downEntity = gContextDao.findEntity(downId)
    //                 downEntity.upEntity.splice(0, downEntity.upEntity.length, events[key].id);
    //             }
    //             console.log(events[key].name, downId)
    //             // 
    //         }
    //         // console.log(events[key]);
    //     }
    // }

    for (let key in events) {
        if (events[key].treeId == treeId)
            _renderElement(events[key], nodeFragment, lineFragment, treeId);

        // console.log(events[key],treeId);
    }

    let mainSVG = dom.query("#mainSVG");
    mainSVG.appendChild(lineFragment);
    mainSVG.appendChild(nodeFragment);

}

// 通过树名找到树ID
function findTreeId(treeName) {
    const treeMap = gContextDao.getGContextProp("treeMap");
    for (const [key, value] of Object.entries(treeMap)) {
        if (value.ID === treeName) {
            return key;
        }
    }
    return undefined; // 显式地返回 undefined，以确保函数始终有返回值
}

function findSubTree(name) {
    let events = gContextDao.getGContextProp("eventEntityMap");
    for (let key in events) {
        if (events[key].type == 'Top' && events[key].modelType == name)
            return events[key].downEntity[0]
    }
}

export default {
    renderByContext,
}