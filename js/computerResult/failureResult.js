import gContextDao from "../dao/gContextDao.js";
import dom from "../viewModel/dom.js";
let flash = [
    ['notWave','crimsonWave'],
    ['notWave','orangeWave','crimsonWave'],
    ['notWave','yellowWave','orangeWave','crimsonWave'],
    ['notWave','yellowWave','orangeWave','redWave','crimsonWave'],
];
function updateLevelAndPro(data){
    let computeMap = gContextDao.getGContextProp("failureComputedData").computeMap;
    computeMap = [];
    let res = 1;
    for(let key in data){
        let d = data[key];
        let entity = gContextDao.findEntityByFtID(d.ftID);
        if(entity.category !== "event") continue ;
        gContextDao.setLevelAndProByEntity(entity, d.level, d.probability);
        dom.updateCriterionColorNode(entity);
        if(res < d.level){
            res = d.level;
        }
    }
    computeMap = flash[res-1];
}

function updateStandardPro(data){
    let computeMap = gContextDao.getGContextProp("failureComputedData").computeMap;
    computeMap = [];
    let res = 1;
    for(let key in data){
        let d = data[key];
        let entity = gContextDao.findEntityByFtID(d.id);
        if(entity.category !== "event") continue ;
        gContextDao.setLevelAndProByEntity(entity, entity.level, d.probability);
        dom.updateCriterionColorNode(entity);
        if(res < d.level){
            res = d.level;
        }
    }
    computeMap = flash[res-1];
}

function updateEffect(data){
    for(let key in data){
        let d = data[key];
        let entity = gContextDao.findEntityByFtID(d.id);
        if(entity && entity.modelType === "effect_event"){
            gContextDao.effectProxy.setEffectStats(d.id, d.stats);
            //let stats = [0.2, 0.1, 0.1, 0.3, 0.1, 0, 0, 0.1, 0.1, 0];
            dom.updateEffectStats(entity, d.stats);
        }

    }
}

export default {
    updateLevelAndPro,
    updateStandardPro,
    updateEffect,
}