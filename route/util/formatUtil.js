const { create } = require('xmlbuilder2');
const xml2js = require('xml2js');//xml转json

// 函数将字符串的首字母转换为大写
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function buildTree(node, xmlDoc, projectName) {
    // console.log('node', node.attrObj);
    if (node && typeof node === 'object') {
        // 创建当前节点并设置其属性
        let tagName = capitalize(node.tagName || 'node')
        if (node.type == 'Top') {
            tagName = 'BehaviorTree'
            // let id = (node.tagName == 'Root') ? projectName : node.tagName
            node.attrObj.ID = capitalize(node.tagName)
        } else if (node.type == 'SubTree') {
            tagName = 'SubTree'
            node.attrObj.ID = capitalize(node.tagName)
            node.children = []//子树去除子标签
        }
        let currentElement = xmlDoc.ele(tagName, node.attrObj || {});

        // 递归处理子节点
        if (Array.isArray(node.children)) {
            node.children.forEach(child => buildTree(child, currentElement));
        }

    }
}

// TreeNodesModel 自定义节点端口固定属性有dataType、default、name等
function buildModel(userModelList, xmlDoc) {
    const treeNodes = xmlDoc.ele('TreeNodesModel');
    userModelList.forEach(model => {
        let { tagName, port, ...attrObj } = model;
        let node = treeNodes.ele(tagName, attrObj || {})
        // console.log('port', port)
        for (let key in port) {
            port[key].forEach(item => {
                let attributes = {};
                if (item.name) attributes.name = item.name;
                if (item.default) attributes.default = item.default;
                if (item.dataType || item.type) attributes.dataType = item.dataType || item.type;
                node.ele(key, attributes).txt(item._);;
            })
        }
    })
    xmlDoc.txt('\n');
}

function returnXml(treeArr, projectName, userModelList, mainTree) {
    let obj = { "BTCPP_format": "4" };
    if (mainTree) {//增加指定主树
        obj["main_tree_to_execute"] = mainTree;
    }
    const xmlDoc = create({ version: '1.0', encoding: 'UTF-8' }).ele('root', obj);

    treeArr.forEach(tree => {
        buildTree(tree, xmlDoc, projectName);// 直接传递 tree 而不是 tree.root
        xmlDoc.txt('\n')
    })
    xmlDoc.com('Description of Node Models (used by Groot)');
    buildModel(userModelList, xmlDoc);
    const xmlString = xmlDoc.end({ prettyPrint: true });
    // console.log('xmlString', xmlString);
    return xmlString;
}

function xmlToJson(xmlString) {
    // const parser = new DOMParser();//用原生DOMParser解析xml
    // const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    let xmlJson = ''
    xml2js.parseString(xmlString, (err, result) => {
        if (err) { throw err; }
        xmlJson = JSON.stringify(result, null, 2)//JSON.parse(result); 结果对象中包含嵌套对象会报错
    });
    return xmlJson;
}


module.exports = {
    returnXml,
    xmlToJson
};
