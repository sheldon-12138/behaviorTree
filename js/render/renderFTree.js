import gContextDao from "../dao/gContextDao.js";
import dom from "../viewModel/dom.js";

function _renderElement(entity, nodeFragment, lineFragment){
    if(entity){
        let dDom = dom.createNode(entity);
        entity.dom = dDom;
        nodeFragment.appendChild(dDom);
        let len = entity.downEntity.length;
        for(let i = 0; i < len; ++i){
            let entity2 = gContextDao.findEntity(entity.downEntity[i]);
            let newLine = gContextDao.addLine({entityID: entity.id, posX: entity.pos.x+entity.downNodeOffset.x, posY: entity.pos.y+entity.downNodeOffset.y+entity.lineOffset["down"], type: "down"},
                {entityID: entity2.id, posX: entity2.pos.x+entity2.upNodeOffset.x, posY: entity2.pos.y+entity2.upNodeOffset.y+entity.lineOffset["up"], type: "up",});
            let line = dom.createLine(newLine);
            newLine.dom = line;
            lineFragment.appendChild(line);
        }
    }
}
function renderByContext(){
    let nodeFragment = dom.doc.createDocumentFragment();
    let lineFragment = dom.doc.createDocumentFragment();
    // let doors = gContextDao.getGContextProp("doorEntityMap");
    let events = gContextDao.getGContextProp("eventEntityMap");
    let lineMap = gContextDao.getGContextProp("lineMap");
    // for(let key in doors){
    //     _renderElement(doors[key], nodeFragment, lineFragment);
    // }
    for(let key in events){
        _renderElement(events[key], nodeFragment, lineFragment);
    }

    let mainSVG = dom.query("#mainSVG");
    mainSVG.appendChild(lineFragment);
    mainSVG.appendChild(nodeFragment);

}

export default {
    renderByContext,
}