import gContextDao from "../dao/gContextDao.js";
import Utils from "../utils/utils.js";
import fileRequest from "../request/fileRequest.js";
import fileParser from "../parser/fileParser.js";
import renderFTree from "../render/renderFTree.js";
import serialize from "../parser/serialize.js";

import nodesOPController from "./nodesOPController.js";
import cppCode from "../structure/cppCode.js";

//加载系统配置项
function loadSystemInfo() {
    //获取系统配置项
    return fileRequest.getSystemConfig().then((data) => {
        let statusData = gContextDao.getGContextProp("statusData");
        Object.assign(statusData, data)//浅拷贝，即只复制对象的属性值
        return Promise.resolve(data);
    }).catch((err) => {
        console.log(err)
        return Promise.reject(err);
    });
};

//加载用户项目列表
function loadUserProjectList(user) {
    //获取用户项目列表
    return fileRequest.getUserProjectList({ user: user }).then((data) => {
        let proList = [];
        for (let key in data) {
            proList.push({ name: key, value: data[key] });
        }
        // console.log(proList);
        let targetUser = gContextDao.getGContextProp("user");
        gContextDao.setGContextProp("user", Object.assign(targetUser, { username: user, projectList: proList }));
        return Promise.resolve(data);
    }).catch((err) => {
        // console.log(err);
        let targetUser = gContextDao.getGContextProp("user");
        gContextDao.setGContextProp("user", Object.assign(targetUser, { username: user, projectList: [] }));
        return Promise.reject(err);
    });
};

//打开用户项目
function openUserProject(param) {
    return fileRequest.getUserProject(param).then((data) => {
        console.log(data);
        // let xmlContent = JSON.parse(data.xml.content);
        // console.log(xmlContent);
        let progress = gContextDao.getGContextProp("progressData");

        // //清空Context和dom相关数据
        // gContextDao.clearContext();
        // let nodes = dom.queryAll(".node");
        // let lines = dom.queryAll(".line");
        // // let len = nodes.length;
        // let mainSVG = dom.query("#mainSVG");
        // for (let i = nodes.length - 1; i >= 0; --i) {
        //     mainSVG.removeChild(nodes[i]);
        // }
        // for (let i = lines.length - 1; i >= 0; --i) {
        //     mainSVG.removeChild(lines[i]);
        // }


        // progress.openProgress = 10;

        // //解析xml数据并将数据添加到gContext中
        // fileParser.xmlParser(xmlContent);


        // progress.openProgress = 30;
        // //根据数据渲染dom

        // renderFTree.renderByContext();
        // progress.openProgress = 80;

        // // 自动布局
        // nodesOPController.nodeLayout();

        // nodesOPController.updateLayer();

        // viewOPController.updateAmount(["nodeNum", "maxLayer", "topNodeNum", "midNodeNum",
        //     "bottomNodeNum", "doorType", "doorNum", "maxDamageLevel", "criterionNum", "criterionTypeNum",
        //     "criterionRelevanceNum"]);
        progress.openProgress = 100;

        // gContextController.updateMainSVGSizeUp();

        return Promise.resolve(data);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);;
    });
};

// 解析本地xml文件
function analysisXml(param) {
    // console.log(param)
    return fileRequest.analysisXml({ xml: param.xml }).then((data) => {
        if (data.flag) {
            let xmlContent = JSON.parse(data.content);
            if (param.status == 'proj') {//项目文件
                let proj = fileParser.projParser(xmlContent);

                return Promise.resolve(proj);
            } else if (param.status == 'forXml') {//通过项目打开的xml文件
                // console.log(xmlContent, param.name);
                const treeNameArr = fileParser.xmlParser(xmlContent, param.name);
                return Promise.resolve({ treeNameArr });
            } else {//单打开的xml文件

                // console.log(xmlContent);
                // let progress = gContextDao.getGContextProp("progressData");

                //清空Context和dom相关数据
                gContextDao.clearContext();
                nodesOPController.clearTreeDom()
                // let nodes = dom.queryAll(".node");
                // let lines = dom.queryAll(".line");
                // // let len = nodes.length;
                // let mainSVG = dom.query("#mainSVG");
                // for (let i = nodes.length - 1; i >= 0; --i) {
                //     mainSVG.removeChild(nodes[i]);
                // }
                // for (let i = lines.length - 1; i >= 0; --i) {
                //     mainSVG.removeChild(lines[i]);
                // }
                // progress.openProgress = 10;
                //解析xml数据并将数据添加到gContext中
                fileParser.xmlParser(xmlContent);

                // progress.openProgress = 30;
                //根据数据渲染dom
                // let treeMap = gContextDao.getGContextProp("treeMap");
                // console.log(treeMap)

                // renderFTree.renderByContext();
                // progress.openProgress = 80;

                // 自动布局
                // nodesOPController.nodeLayout();
                // progress.openProgress = 100;

                // gContextController.updateMainSVGSizeUp();

                return Promise.resolve(data);
            }

        }

    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);
    });
}

//加载dc文件
function loadDcData(content) {
    fileParser.dcParser(content);
    // console.log(gContextDao.getGContextProp("criterionList"));
    //content = content.replaceAll(/\n/g, "\r\n");
    // console.log('dcData', content);
    gContextDao.setGContextProp("dcData", content);
};

//加载节点图片
function loadNodePic(param) {
    return fileRequest.getNodePic(param).then((data) => {
        for (let key in data) {
            let entityMap = gContextDao.filterEventsByImgName(key);

            for (let kk in entityMap) {
                Utils.dataConversion.imgToBase64(data[key].url, (dataURL) => {
                    let file = Utils.dataConversion.base64ToFile(data[key].fileName, dataURL);
                    nodesOPController.addNodeImg(entityMap[kk].id, file);
                });
            }

        }
        // for (let key in data) {
        //     let entity = gContextDao.findEntityByFtID(key);
        //     Utils.dataConversion.imgToBase64(data[key].url, (dataURL) => {
        //         let file = Utils.dataConversion.base64ToFile(data[key].fileName, dataURL);
        //         nodesOPController.addNodeImg(entity.id, file);

        //     });
        // }
    })
}

//保存用户项目
function uploadUserProject(param) {
    // let fileInfo = gContextDao.getGContextProp("fileInfo");
    // fileInfo = Object.assign(fileInfo, param.info);
    //保存项目的具体内容
    let content = serialize.serializeAll({ info: param.info });
    console.log('content', content);

    return fileRequest.uploadUserProject(content)
        .then((data) => {

            let codeObj = generateCode(content);
            Object.assign(codeObj, data);//codeObj中包含深层嵌套，后端返回的data只有message和treeContent两个简单属性，可以浅拷贝进去

            // console.log('codeObj', codeObj);
            return Promise.resolve(codeObj);
        }).catch((err) => {
            console.log('err', err)
            return Promise.resolve(false);
        });
};

// 生成相关代码
function generateCode(content) {
    const className = content.projectName;
    const portTypes = ['input_port', 'output_port', 'inout_port'];
    const types = ["short", "short int", "int", "long", "long int", "long long int", "unsigned short", "unsigned int", "unsigned long", "unsigned long long", "unsigned char", "signed char", "int8_t", "uint8_t", "int16_t", "uint16_t", "int32_t", "uint32_t", "int64_t", "uint64_t", "wchar_t", "char16_t", "char32_t", "float", "double", "long double", "char", "string", "bool"]
    const seenNames = new Set();
    const blackboardVars = [], nodeNameList = [], nodeStrList = [];

    // 处理所有端口生成 nodeNameList、blackboardVars
    for (const node of content.userModelList) {
        nodeNameList.push(node.ID); // 收集节点ID
        for (const type of portTypes) {
            for (const port of node.port[type]) {
                if (!seenNames.has(port.name)) {
                    seenNames.add(port.name);
                    blackboardVars.push({
                        type: port.type,
                        name: port.name
                    });
                }
            }
        }

        const nodeCpp = cppCode.nodeCppCode(node)
        const nodeH = cppCode.nodeHeaderCode(node)
        nodeStrList.push({ nodeName: node.ID, cpp: nodeCpp, h: nodeH })
    }
    // 处理自定义的dataType 去重+过滤types
    let dataTypeList = [...new Set(blackboardVars.map(v => v.type))].filter(t => !types.includes(t));


    let data = {
        cppMainContent: cppCode.returnMainCode({ className }),
        cppContent: cppCode.returnCppCode({ className, nodeNameList, blackboardVars }),

        vcxprojContent: cppCode.vcxprojContent({ className, nodeNameList }),
        filtersContent: cppCode.filtersContent({ className, nodeNameList }),
        userContent: cppCode.userContent({ className, nodeNameList }),

        hContent: cppCode.returnHeaderCode({ className, blackboardVars }),
        dataTypeH: cppCode.dataTypeH({ className, dataTypeList }),
        nodeStrList,
    }
    return data
}

//保存节点图片
function uploadNodePicture(param) {
    let fileInfo = gContextDao.getGContextProp("fileInfo");
    fileInfo = Object.assign(fileInfo, param.info);
    let content = serialize.serializePic({ info: fileInfo });
    // console.log(content)
    return fileRequest.uploadNodePicture(content).then((data) => {
        return Promise.resolve(true);
    }).catch((err) => {
        return Promise.resolve(false);
    });
}



//通过项目名查找用户的项目
function findUserProjectByName(param) {
    return fileRequest.findUserProjectByName(param).then((data) => {
        return Promise.resolve(data);
    }).catch((err) => {
        // console.log(err);
        return Promise.resolve(false);
    });
};


export default {
    analysisXml,
    loadSystemInfo,
    loadUserProjectList,
    openUserProject,
    uploadUserProject,
    findUserProjectByName,
    loadDcData,
    // uploadNodePicture,
    // loadNodePic,
}