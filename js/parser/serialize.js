import gContextDao from "../dao/gContextDao.js";

function serializeAll(param) {
    const { info } = param;
    // const config = serializeConfig()
    let result = {
        treeContent: "",
        userModelList: [],
        user: gContextDao.getGContextProp("user").username,
        projectName: info.name,
        mainTree: info.mainTreeName || '',//主树的名字
    };
    //批量保存时需要再补充文件与主树名对应的代码
    result.treeContent = JSON.stringify(gContextDao.returnTreeArr(info.topIdArr));
    const nodeNameArr = gContextDao.filterUserModel(info.treeIdArr)
    result.userModelList = serializeUserModel(nodeNameArr);//筛选出当前树用到的自定义模型

    return result;
    // return '';
};

function serializeUserModel(nodeNameArr) {
    let modelList = gContextDao.getGContextProp("modelList");
    let userModelList = [];
    for (let i = 0; i < 4; i++) {
        modelList[i].children.forEach(child => {
            let { isUser, port, ID, ...attr } = child
            const index = nodeNameArr.findIndex(item => item == ID)
            if (isUser && (index != -1)) {
                // 过滤掉空值属性、过滤掉type属性
                const cleanedAttr = {};
                for (let key in attr) {
                    const value = attr[key];
                    if (key !== 'type' && value !== '' && value !== undefined && value !== null) {
                        cleanedAttr[key] = value;
                    }
                }
                let model = {
                    ID, ...cleanedAttr, port: { 'input_port': [], 'output_port': [], 'inout_port': [] }, tagName: modelList[i].type
                }
                // console.log('port', port)
                if (port && Object.keys(port).length > 0) {
                    for (let [key, value] of Object.entries(port)) {
                        let portType = `${value.direction}`;
                        if (portType in model.port) {
                            model.port[portType].push({
                                name: key,
                                dataType: value.dataType,
                                default: value.defaultValue,
                                _: value.description
                            });
                        }
                    }
                }
                userModelList.push(model)

            }
        })
    }
    // modelList.forEach(item => {
    //     item.children.forEach(child => {
    //         let { isUser, port, ...attr } = child
    //         if (isUser) {
    //             let model = {
    //                 ...attr, port: { 'input_port': [], 'output_port': [], 'inout_port': [] }, tagName: item.type
    //             }
    //             // console.log('port', port)
    //             if (port && Object.keys(port).length > 0) {
    //                 for (let [key, value] of Object.entries(port)) {
    //                     let portType = `${value.direction}`;
    //                     if (portType in model.port) {
    //                         model.port[portType].push({
    //                             name: key,
    //                             default: value.defaultValue,
    //                             _: value.description
    //                         });
    //                     }
    //                 }
    //             }
    //             userModelList.push(model)

    //         }
    //     })
    // });
    return userModelList
    // console.log('userModelList', userModelList)
}
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
}