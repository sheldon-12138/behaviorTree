const express = require('express');
const router = express.Router();
const fs = require('fs');
const querystring = require('querystring');
const multiparty = require("multiparty");
const bodyParser = require('body-parser');
const jp = bodyParser.json();
const {failureComputer, failureCompile, failureGenerate, failureCompute,
    failureComputeAll, failureComputeGate, failureGenGate, failureCompileGate, failureComputeGateAll,probabilityComputeGateAll,proComputeGateAll, createRi } = require("./compute/failureComputer");
const fileUtil = require("./util/fileUtil");
//const EventEmitter = require("events");

//失效计算
router.ws("/failureComputer/:user/:project", (ws, req) => {

    //console.log(req.params.user);
    //console.log(req.params.project); 
    let user = req.params.user;
    let project = req.params.project;

    if (!user || !project) {
        ws.on('message', function (msg) {
            ws.send(JSON.stringify({close:true, do:tree}));
        });

        ws.on('close', function (e){
            console.log('close connection');
        });
    }


    ws.on('message', function (msg) {
        console.log(`receive message ${msg}`);
        ws.send('default response');
    });

    //项目路径+/项目名
    let proPath = fileUtil.getComputerUserFile(user, project, "");
    let ftPath = fileUtil.getUserFile(user, project, ".ft");

    let currentPath = fileUtil.getRunTimePath();
    let computerPath = currentPath + "/src/computer.exe";
    let gateComputerPath = currentPath + "/src/y.exe";

    let CPPCompilerPath = "g++";

    //生成第一步失效计算xxx.cpp文件
    failureGenerate(computerPath, proPath)
        .then((meg) => {
            //第一步失效计算cpp编译
            let cppPath = proPath + ".cpp";
            let exePath = proPath + ".exe";
            return failureCompile(CPPCompilerPath, cppPath, "-o", exePath);
        }).then((msg) => {
            //编译第一步失效计算cpp成功
            return fileUtil.getContent(ftPath);
        }).then((ftContent)=>{
            //获取ft文件内容，并开启第一步计算
            return failureComputeAll(proPath, ftContent);
        }).then((msg)=>{
            //获取第一步计算的结果
            //后期优化为promise
            console.log("compute success");
            let tree = {};
            let userPath = process.cwd() + '/user/' + user + "/" + project +"/temp";
            let files = fs.readdirSync(userPath);
            let doContent = "";
            for(let i = 0, len = files.length; i < len; ++i){
                let str = fs.readFileSync(userPath + "/" + files[i], 'utf-8');
                //doContent += str +"\r\n";
                str = str.replace(/\r\n/g, "\n");
                let strs = str.split("*DAMAGE_OUTPUT\n");
                doContent += strs[1] + "\r\n";
                let pro = strs[1].split(",");
                tree[pro[0]] = {
                    ftID:pro[0],
                    probability:[],
                    level:pro.length-2,
                };
                for(let j = 1; j < pro.length; ++j){
                    tree[pro[0]].probability.push(parseFloat(pro[j]));
                }
            }
            fs.writeFileSync(proPath+".do", doContent, 'utf-8');
            //生成第二步计算xxx_calc.cpp代码
            return failureGenGate(gateComputerPath, proPath+".ft");
        }).then(()=>{
            //生成第二步xxx_calc.cpp成功 编译xxx_calc.cpp
            return failureCompileGate("g++", proPath + "_calc.cpp", "-o", proPath + "_calc.exe");
        }).then(()=>{
            //编译第二步xxx_calc.cpp成功，调用xxx_calc.exe
            let ftContent = fs.readFileSync(proPath+".ft", 'utf-8');
            return failureComputeGateAll(proPath, ftContent);
        }).then((out)=>{
            //调用xxx_calc.exe成功，读取,返回结果
            let all = fs.readFileSync(proPath + ".fo", 'utf-8');
            let res = all.split("*");
            let foList = res[1].split("\r\n");
            foList = foList.splice(1);
            let tree = {};
            let str = fs.readFileSync(proPath + ".do", 'utf-8');
            str += "\r\n" + foList.join("\r\n");
            let strs = str.split("\r\n");
            for(let i = 0, len = strs.length; i < len; ++i){
                let pro = strs[i].split(",");
                if(pro[0] === "") continue;
                tree[pro[0]] = {
                    ftID:pro[0],
                    probability:[],
                    level:pro.length-2,
                };
                for(let j = 1; j < pro.length; ++j){
                    tree[pro[0]].probability.push(parseFloat(pro[j]));
                }
            }
            let standard = {};
            let standardList = res[2].split("\r\n");
            standardList = standardList.splice(1).join("\r\n");
            strs = standardList.split("\r\n");
            for(let i = 0, len = strs.length; i < len; ++i){
                let pro = strs[i].split(",");
                if(pro[0] === "") continue;
                tree[pro[0]] = {
                    ftID:pro[0],
                    probability:[],
                    level:pro.length-2,
                };
                for(let j = 1; j < pro.length; ++j){
                    tree[pro[0]].probability.push(parseFloat(pro[j]));
                }
            }
            let effect = {};
            let effectList = res[3].split("\r\n");
            effectList = effectList.splice(1).join("\r\n");
            strs = effectList.split("\r\n");
            for(let i = 0, len = strs.length; i < len; ++i){
                let pro = strs[i].split(",");
                if(pro[0] === "") continue;
                effect[pro[0]] = {
                    id:pro[0],
                    stats:[],
                }
                for(let j = 1; j < pro.length; ++j){
                    effect[pro[0]].stats.push(parseFloat(pro[j]));
                }
            }
            //返回结果并关闭websocket
            ws.send(JSON.stringify({close:true, do:tree, standard:standard, effect:effect}));

        }).catch((err) => {
        //编译生成的cpp失败
            console.log(err);
            ws.send(JSON.stringify({close:true, do:{}}));

        });


    // close 事件表示客户端断开连接时执行的回调函数
    ws.on('close', function (e) {
        console.log('close connection');
    });


});


router.ws("/proComputer/:user/:project", (ws, req) => {
    let user = req.params.user;
    let project = req.params.project;
    if (!user || !project) {
        ws.on('message', function (msg) {
            ws.send(JSON.stringify({close:true}));
        });
        ws.on('close', function (e){
            console.log('close connection');
        });
    }


    //项目路径+/项目名
    let proPath = fileUtil.getComputerUserFile(user, project, "");
    let ftPath = fileUtil.getUserFile(user, project, ".ft");

    let currentPath = fileUtil.getRunTimePath();
    let gateComputerPath = currentPath + "/src/yang.exe";

    let CPPCompilerPath = "g++";

    let i = 0;
    let ftContent = fs.readFileSync(proPath+".ft", 'utf-8');
    // setInterval(()=>{
    //
    //     if(Math.floor(Math.random()*10)%9 === 0){
    //
    //         let timeStamp = new Date().getTime();
    //         ws.send(JSON.stringify(
    //             {
    //                 currentResult:{
    //                     time:++i,
    //                     timeStamp:timeStamp,
    //                     finish:false,
    //                 },
    //             }
    //             ));
    //
    //         failureComputer(ftContent)
    //             .then((value)=>{
    //                 setTimeout(()=> {
    //                     ws.send(JSON.stringify(
    //                         {
    //                             currentResult: {
    //                                 do: value.tree,
    //                                 timeStamp: timeStamp,
    //                                 finish: true,
    //                             },
    //                         }
    //                     ));
    //                 }, 2000);
    //             })
    //             .catch(()=>{
    //
    //             });
    //     }
    //
    // }, 1000);

    let finish = true;
    let loop = setInterval(()=>{

        if(Math.floor(Math.random()*10)%9 === 0&&finish){
            finish = false;
            let timeStamp = new Date().getTime();
            ws.send(JSON.stringify(
                {
                    currentResult:{
                        time:++i,
                        timeStamp:timeStamp,
                        finish:false,
                    },
                }
            ));

            //生成第二步计算xxx_calc.cpp代码
            failureGenGate(gateComputerPath, proPath+".ft").then(()=>{
                //生成第二步xxx_calc.cpp成功 编译xxx_calc.cpp
                return failureCompileGate("g++", proPath + "_calc.cpp", "-o", proPath + "_calc.exe");
            }).then(()=>{
                //编译第二步xxx_calc.cpp成功，调用xxx_calc.exe
                let ftContent = fs.readFileSync(proPath+".ft", 'utf-8');

                createRi(ftContent, proPath + ".ri");

                return proComputeGateAll(proPath, ftContent);
            }).then(()=>{
                //调用xxx_calc.exe成功，读取,返回结果
                let all = fs.readFileSync(proPath + ".fo", 'utf-8');
                let res = all.split("*");
                let foList = res[1].split("\r\n");
                foList = foList.splice(1);
                let tree = {};
                let str = fs.readFileSync(proPath + ".ri", 'utf-8');
                str += "\r\n" + foList.join("\r\n");
                let strs = str.split("\r\n");
                for(let i = 0, len = strs.length; i < len; ++i){
                    let pro = strs[i].split(",");
                    if(pro[0] === "") continue;
                    tree[pro[0]] = {
                        ftID:pro[0],
                        probability:[],
                        level:pro.length-2,
                    };
                    for(let j = 1; j < pro.length; ++j){
                        tree[pro[0]].probability.push(parseFloat(pro[j]));
                    }
                }
                let standard = {};
                let standardList = res[2].split("\r\n");
                standardList = standardList.splice(1).join("\r\n");
                strs = standardList.split("\r\n");
                for(let i = 0, len = strs.length; i < len; ++i){
                    let pro = strs[i].split(",");
                    if(pro[0] === "") continue;
                    tree[pro[0]] = {
                        ftID:pro[0],
                        probability:[],
                        level:pro.length-2,
                    };
                    for(let j = 1; j < pro.length; ++j){
                        tree[pro[0]].probability.push(parseFloat(pro[j]));
                    }
                }
                let effect = {};
                let effectList = res[3].split("\r\n");
                effectList = effectList.splice(1).join("\r\n");
                strs = effectList.split("\r\n");
                for(let i = 0, len = strs.length; i < len; ++i){
                    let pro = strs[i].split(",");
                    if(pro[0] === "") continue;
                    effect[pro[0]] = {
                        id:pro[0],
                        stats:[],
                    }
                    for(let j = 1; j < pro.length; ++j){
                        effect[pro[0]].stats.push(parseFloat(pro[j]));
                    }
                }
                //返回结果并关闭websocket
                //ws.send(JSON.stringify({close:true, do:tree, standard:standard, effect:effect}));
                finish = true;

                ws.send(JSON.stringify(
                    {
                        currentResult: {
                            do: tree,
                            timeStamp: timeStamp,
                            finish: true,
                            standard:standard,
                            effect:effect,
                        },
                    }
                ));

            }).catch((err) => {
                //编译生成的cpp失败
                console.log(err);
                ws.send(JSON.stringify({close:true, do:{}}));

            });
        }

    }, 1000);

    // close 事件表示客户端断开连接时执行的回调函数
    ws.on('close', function (e) {
        if(loop){
            clearInterval(loop);
        }
        console.log('close connection');
    });

});

//概率计算
router.ws("/probabilityComputer/:user/:project", (ws, req) => {

    let user = req.params.user;
    let project = req.params.project;

    if (!user || !project) {
        ws.on('message', function (msg) {
            ws.send(JSON.stringify({close:true, do:tree}));
        });

        ws.on('close', function (e){
            console.log('close connection');
        });
    }


    ws.on('message', function (msg) {
        console.log(`receive message ${msg}`);
        ws.send('default response');
    });

    //项目路径+/项目名
    let proPath = fileUtil.getComputerUserFile(user, project, "");
    let ftPath = fileUtil.getUserFile(user, project, ".ft");

    let currentPath = fileUtil.getRunTimePath();
    let computerPath = currentPath + "/src/computer.exe";
    let gateComputerPath = currentPath + "/src/y.exe";

    let CPPCompilerPath = "g++";


    //生成第二步计算xxx_calc.cpp代码
    failureGenGate(gateComputerPath, proPath+".ft").then(()=>{
        //生成第二步xxx_calc.cpp成功 编译xxx_calc.cpp
        return failureCompileGate("g++", proPath + "_calc.cpp", "-o", proPath + "_calc.exe");
    }).then(()=>{
        //编译第二步xxx_calc.cpp成功，调用xxx_calc.exe
        let ftContent = fs.readFileSync(proPath+".ft", 'utf-8');
        return probabilityComputeGateAll(proPath, ftContent);
    }).then(()=>{
        //调用xxx_calc.exe成功，读取,返回结果
        let all = fs.readFileSync(proPath + ".fo", 'utf-8');
        let res = all.split("*");
        let foList = res[1].split("\r\n");
        foList = foList.splice(1);
        let tree = {};
        let str = fs.readFileSync(proPath + ".pi", 'utf-8');
        str += "\r\n" + foList.join("\r\n");
        let strs = str.split("\r\n");
        for(let i = 0, len = strs.length; i < len; ++i){
            let pro = strs[i].split(",");
            if(pro[0] === "") continue;
            tree[pro[0]] = {
                ftID:pro[0],
                probability:[],
                level:pro.length-2,
            };
            for(let j = 1; j < pro.length; ++j){
                tree[pro[0]].probability.push(parseFloat(pro[j]));
            }
        }
        let standard = {};
        let standardList = res[2].split("\r\n");
        standardList = standardList.splice(1).join("\r\n");
        strs = standardList.split("\r\n");
        for(let i = 0, len = strs.length; i < len; ++i){
            let pro = strs[i].split(",");
            if(pro[0] === "") continue;
            tree[pro[0]] = {
                ftID:pro[0],
                probability:[],
                level:pro.length-2,
            };
            for(let j = 1; j < pro.length; ++j){
                tree[pro[0]].probability.push(parseFloat(pro[j]));
            }
        }
        let effect = {};
        let effectList = res[3].split("\r\n");
        effectList = effectList.splice(1).join("\r\n");
        strs = effectList.split("\r\n");
        for(let i = 0, len = strs.length; i < len; ++i){
            let pro = strs[i].split(",");
            if(pro[0] === "") continue;
            effect[pro[0]] = {
                id:pro[0],
                stats:[],
            }
            for(let j = 1; j < pro.length; ++j){
                effect[pro[0]].stats.push(parseFloat(pro[j]));
            }
        }
        //返回结果并关闭websocket
        ws.send(JSON.stringify({close:true, do:tree, standard:standard, effect:effect}));

    }).catch((err) => {
        //编译生成的cpp失败
        console.log(err);
        ws.send(JSON.stringify({close:true, do:{}}));

    });


    // close 事件表示客户端断开连接时执行的回调函数
    ws.on('close', function (e) {
        console.log('close connection');
    });
});

module.exports = router;