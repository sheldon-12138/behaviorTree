import gContextDao from "../dao/gContextDao.js";
import codec from "../codec/codec.js";

function serializeAll(param) {
    let info = param.info;
    // const config = serializeConfig()

    let result = {
        treeContent: "",
        userModelList: [],
        user: gContextDao.getGContextProp("user").username,
        projectName: info.name,
        // config
    };

    result.treeContent = JSON.stringify(gContextDao.returnTree());
    result.userModelList = serializeUserModel()

    return result;
};

function serializeUserModel() {
    let modelList = gContextDao.getGContextProp("modelList");
    let userModelList = [];
    modelList.forEach(item => {
        item.children.forEach(child => {
            let { isUser, port, ...attr } = child
            if (isUser) {
                let model = {
                    ...attr, port: { 'input_port': [], 'output_port': [], 'inout_port': [] }, tagName: item.type
                }

                for (let [key, value] of Object.entries(port)) {
                    let portType = `${value.direction}`;
                    if (portType in model.port) {
                        model.port[portType].push({
                            name: key,
                            default: value.defaultValue,
                            _: value.description
                        });
                    }
                }
                userModelList.push(model)

            }
        })

    });
    return userModelList
    // console.log('userModelList', userModelList)
}


// {
//     for (let key in child.port) {
//         if (child.port[key].direction == 'input_port') {
//             model.port['input_port'].push({
//                 name: key, default: child.port[key].defaultValue,
//                 _: child.port[key].description
//             })
//         } else if (child.port[key].direction == 'output_port') {
//             model.port['output_port'].push({
//                 name: key, default: child.port[key].defaultValue,
//                 _: child.port[key].description
//             })
//         }
//         else if (child.port[key].direction == 'inout_port') {
//             model.port['inout_port'].push({
//                 name: key, default: child.port[key].defaultValue,
//                 _: child.port[key].description
//             })
//         }
//     }
// }

function serializeFt(entity) {
    // console.log('entity', entity)


    let content = "";
    let model = gContextDao.getModelByType(entity.modelType);
    const upEntity = gContextDao.findEntity(entity.upEntity[0])

    const ruless = entity.category == 'door' ? upEntity.rules : entity.rules
    const rulesStr = ruless ? ruless.join(';') : ''
    // console.log('rulesStr', rulesStr)

    content += "*FT_NODE\r\n";
    // console.log('entity.criterionDoor', entity.criterionDoor)
    content += entity.ftID + "," + (model.name) + "," + entity.layer + ",\"" + codec.coder(entity.name) + "\",\"" + codec.coder(entity["desc"] || "") + "\"," +
        entity.pos.x + "," + entity.pos.y + "," + (entity[entity.category == 'door' ? "upLevel" : "level"] || 2) + ","
        + "\"" + codec.coder(rulesStr) + "\",\""
        + codec.coder(entity.imgName || "") + "\""
        + "\r\n";
    // console.log('content', content)
    for (let i = 0, len = entity.downEntity.length; i < len; ++i) {
        content += gContextDao.findEntity(entity.downEntity[i]).ftID + ",";
        if (i === len - 1) {
            content += "\r\n";
        }
    }
    if (model.name == 'EVENT_BOTTOM') {
        content += entity.componentID//保留partId的位置
        for (let key in entity.criterions) {
            // if (entity.criterions[key].actived === true && entity.criterions[key].value !== undefined && entity.criterions[key].value !== "") {
            //     const dc = dcList.filter((item) => {//返回是一个所有满足条件的数组
            //         return item[3] == key && item[1] == entity.criterions[key].value
            //     })
            //     content += "," + dc[0][0];
            //     // content += key + "," + entity.criterions[key].value + "\r\n";
            // }
            // else if (entity.criterions[key].actived === true) content += key + "," + "\r\n";
            if (entity.criterions[key].actived === true && entity.criterions[key].dcId)
                content += "," + entity.criterions[key].dcId
        }
        content += "\r\n";
    }

    return content;
};

// function serializePic(param) {
//     let result = {
//         user: gContextDao.getGContextProp("user").username,
//         projectName: param.info.name,
//         pictures: {},
//     }
//     let events = gContextDao.getGContextProp("eventEntityMap");
//     let imgManager = gContextDao.imgManager;

//     for (let key in events) {
//         if (events[key].hasOwnProperty("img")) {
//             let entity = events[key];
//             let file = imgManager.getNodeImg(entity.imgName);
//             result["pictures"][file.name] = file;

//         }
//     }

//     return result;
// }


function serializeConfig() {
    let statusData = gContextDao.getGContextProp("statusData");// 获取系统状态数据
    let content = {
        isPop: statusData.isPop,
        isEdit: statusData.isEdit,
        lineShowWay: statusData.lineShowWay,
        analysisOrder: statusData.analysisOrder,
    }
    // console.log(content)
    return JSON.stringify(content);
};

export default {
    serializeAll,
    serializeUserModel
    // serializePic,
}