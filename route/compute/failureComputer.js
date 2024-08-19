const {terminal} = require("../util/terminalUtil");
const fs = require("fs");
let nodeName = {
    ftNode:"FT_NODE",

};
function parseFtNode(ftNode){
    //console.log(ftNode);
    let reg = /([0-9a-zA-Z]+),(.*),(\d+),"(.*)","(.*)",(.*),(.*),(\d+),"(.*)"/ms;
    reg.test(ftNode);
    let ftID = RegExp.$1;
    let type = RegExp.$2;
    let depth = parseInt(RegExp.$3);
    let level = parseInt(RegExp.$8);
    return {
        ftID:ftID,
        type:type,
        depth:depth,
        level:level,
        children:[],
        probability:[],
    };
};
function addChild(node, line){
    let children = line.split(",");
    for(let i = 0, len = children.length; i < len; ++i){
        if(children[i] !== "" && children[i] !== "\r"){
            node.children.push(children[i]);
        }
    }
};
function parserFt(content){
    let tree = {};
    let ftContent = content.replace(/\r\n/, "\n");
    let ftNode = ftContent.split("*");
    ftNode.splice(0, 1);
    for(let i = 0, len = ftNode.length; i < len; ++i){
        let lineList = ftNode[i].split("\n");
        if(lineList.length > 0 && lineList[0].includes(nodeName.ftNode)){
            lineList.splice(0, 1);
            let lineContent = lineList.join("\n");
            let ft = parseFtNode(lineContent);
            let hasChild = (lineList.length >= 2);
            if(hasChild){
                addChild(ft, lineList[1]);
            }
            tree[ft.ftID] = ft;
        }
    }
    return tree;
};
//生成闭区间的随机浮点数
function fullClose(n,m) {
    let result = (Math.random()*(m+1-n)+n);
    while(result>m) {
        result = (Math.random()*(m+1-n)+n);
    }
    return (result);
}
//生成闭区间上的随机整数
function fullRoundClose(max, min){
    return Math.floor(Math.random()*(max-min+1))+min;
}
function createDo(tree){
    for(let key in tree){
        let node = tree[key];
        if(node.type.includes("EVENT")){
            let level = fullRoundClose(1, 4);
            node.level = level;
            let p = 1;
            for(let i = 0; i < level; ++i){
                let k = fullClose(0, p);
                node.probability.push(k);
                p = p - k;
            }
            node.probability.push(p);
        }
    }
};
function failureComputer(content){

    //解析ft文件
    let tree = parserFt(content);
    //获取模拟do
    createDo(tree);
    return new Promise(function (resolve, reject) {
        resolve({tree:tree});
    });

}
//生成ri文件
function createRi(content, file){
    //解析ft文件
    let tree = parserFt(content);
    let riContent = "";
    for(let key in tree){
        let node = tree[key];
        if(node.type.includes("EVENT_BOTTOM")){
            riContent += node.ftID+",";

            let level = fullRoundClose(1, 4);
            node.level = level;
            let p = 1;
            for(let i = 0; i < level; ++i){
                let k = fullClose(0, p);
                node.probability.push(k);
                p = p - k;
                riContent += k+",";
            }
            node.probability.push(p);
            riContent += p+"\r\n";
        }
    }
    fs.writeFileSync(file, riContent);
}

//失效计算cpp编译
function failureCompile(compiler, source, ...targets){
    let terminalStr = "";
    for(let i = 0, len = targets.length; i < len; ++i){
        terminalStr += targets[i] + " ";
    }
    return terminal(compiler, terminalStr, source);
};
//生成失效计算cpp文件
function failureGenerate(exeAddr, generatePro){
    return terminal(exeAddr, generatePro);
};
//
function failureCompute(exeAddr, pro, ftId, N, epsilon, flag){

    return terminal(exeAddr, pro, ftId, N, epsilon, flag);
};

function failureComputeAll(proPath, ftContent){
    //解析ft文件
    let tree = parserFt(ftContent);

    let exePath = proPath + ".exe";
    console.log(exePath);
    console.log(proPath);
    let computeList = [];

    for(let key in tree) {
        let node = tree[key];
        if(!node.type.includes("EVENT")) continue;

        let nodeCompute = failureCompute(exePath, proPath, node.ftID, "1000000", "0.000001", "Cd");

        computeList.push(nodeCompute);
    }

    return Promise.all(computeList);

}
function failureComputeGate(exePath, ftPath, doPath, ftId, useDo, gpu){
    return terminal(exePath, ftPath, doPath, ftId, useDo, gpu);
}

function failureComputeGateAll(proPath, ftContent){
    //解析ft文件
    let tree = parserFt(ftContent);
    let exePath = proPath+"_calc.exe";
    let computeList = [];

    // for(let key in tree) {
    //     let node = tree[key];
    //     if(!node.type.includes("EVENT")) continue;
    //
    //     computeList.push(nodeCompute);
    // }
    return failureComputeGate(exePath, proPath+".ft", proPath+".do", "100", "1", "1");

    //return Promise.all(computeList);

}
//概率计算使用的文件
function probabilityComputeGateAll(proPath, ftContent){
    //解析ft文件
    let tree = parserFt(ftContent);
    let exePath = proPath+"_calc.exe";
    let computeList = [];

    return failureComputeGate(exePath, proPath+".ft", proPath+".pi", "100", "1", "1");

}

//多次模拟计算模式
function proComputeGateAll(proPath, ftContent){
    //解析ft文件
    let tree = parserFt(ftContent);
    let exePath = proPath+"_calc.exe";
    let computeList = [];

    return failureComputeGate(exePath, proPath+".ft", proPath+".ri", "100", "1", "1");

}

function failureGenGate(exeAddr, ftPath){
    return terminal(exeAddr, ftPath);
}

function failureCompileGate(compiler, source, ...targets){
    let terminalStr = "";
    for(let i = 0, len = targets.length; i < len; ++i){
        terminalStr += targets[i] + " ";
    }
    return terminal(compiler, terminalStr, source);
}

module.exports = {
    failureComputer,
    failureCompile,
    failureGenerate,
    failureCompute,
    failureComputeAll,
    failureComputeGate,
    failureCompileGate,
    failureGenGate,
    failureComputeGateAll,
    probabilityComputeGateAll,
    proComputeGateAll,
    createRi,
}