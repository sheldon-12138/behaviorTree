import computeRequest from "../request/computeRequest.js";
import fr from "../computerResult/failureResult.js";
import gContextDao from "../dao/gContextDao.js";
import dom from "../viewModel/dom.js";
import { g } from "../structure/gContext.js"
import viewOPController from "./viewOPController.js";
import nodesOPController from "./nodesOPController.js";
import gContextController from "./gContextController.js";
import color from "../utils/color.js";

const oriDiObj = {
    "DC_P": '',
    "DC_I": '',
    "DC_D": '',
    "DC_V": '',
    "DC_A": '',
    "DC_DSR": '',
    "DC_DA": '',
    "DC_FN": '',
    "DC_FD": '',
    "DC_FKE": '',
    "DC_PD": '',
    "DC_T": '',
    "DC_HF": '',
    "DC_SF": '',
    "DC_S": '',
}

// 外部di计算
function diToDo(key, userDiObj) {
    const saveArr = ['calculationFlag', 'componentID', 'criterions', 'downEntity',
        'ftID', 'modelType', 'probability', 'rules', 'level']
    let miniEntityMap = miniMap(g.gContext.eventEntityMap, saveArr)
    const dcObj = gContextDao.getGContextProp("dcObj");

    let topKey = ''
    for (let k in miniEntityMap) {

        const { modelType, componentID, criterions } = miniEntityMap[k]
        miniEntityMap[k].probability = []
        if (modelType == "bottom_event" && componentID) {//替换di
            miniEntityMap[k]['di'] = userDiObj[componentID] ? { ...deepClone(oriDiObj), ...deepClone(userDiObj[componentID]) } : deepClone(oriDiObj)
            // console.log('criterions', criterions)
            // 计算底事件判据的各个概率
            for (let c in criterions) {
                const { actived, dcId } = criterions[c]
                criterions[c].p = []
                // console.log(miniEntityMap[k].di)
                // console.log(miniEntityMap[k].di[c])
                if (actived && miniEntityMap[k].di[c]) {
                    const dcItem = dcObj[dcId]
                    let pArr = []
                    const s = Array(+dcItem[5] + 1).fill(0)
                    s[0] = 1

                    if (c == 'DC_PI') {
                        pArr = nodesOPController.criterionP(dcItem, parseFloat(miniEntityMap[k].di['DC_P']), parseFloat(miniEntityMap[k].di['DC_I']))
                    } else pArr = nodesOPController.criterionP(dcItem, parseFloat(miniEntityMap[k].di[c]))
                    // console.log(c, pArr)
                    criterions[c].p = pArr.length > 0 ? pArr : s
                }
            }
        }
        if (modelType == "top_event") topKey = k
    }
    diCalculation(miniEntityMap)
    // console.log(miniEntityMap)
    // console.log(miniEntityMap[topKey].probability)
    // console.log(key, userDiObj)
    let obj = {
        date: new Date().Format("yyyy-MM-dd hh:mm:ss"),
        fileName: key,
        calculationResults: miniEntityMap[topKey].probability,
        totalDuration: '0.1s'
    }

    return obj
}

function miniMap(eventEntityMap, saveArr) {
    let miniEntityMap = {}
    for (let key in eventEntityMap) {
        miniEntityMap[key] = pick(eventEntityMap[key], saveArr)
    }
    return miniEntityMap
}

// 新di计算
function diCalculation(miniEntityMap) {
    // console.log('di计算')
    const { maxLayer } = g.gContext.bottomAmount

    let fileName = gContextDao.getGContextProp("fileInfo").name; // 获取文件名
    let statusData = gContextDao.getGContextProp("statusData");// 获取系统状态数据
    if (statusData.isCompute || !fileName || fileName === "") return;// 如果正在计算，或者文件名为空，则直接返回
    statusData.computeType = "failure"; // 设置计算类型为故障计算，并标记系统正在进行计算
    statusData.isCompute = true;

    const { List } = g.gContext

    let eventEntityMap = {}
    const { doorEntityMap } = g.gContext
    if (miniEntityMap) eventEntityMap = miniEntityMap
    else eventEntityMap = g.gContext.eventEntityMap//浅拷贝：拷贝内存地址，直接修改
    // console.log('eventEntityMap', eventEntityMap)

    // 遍历底事件，计算底事件的概率
    for (let key in eventEntityMap) {
        if (eventEntityMap[key].modelType === 'bottom_event' && eventEntityMap[key].criterions) {
            const { criterions, rules, level } = eventEntityMap[key]

            let P = new Array(21);//从1开始，和用户输入保持一致[即0为空数组不要了]
            for (let i = 0; i < 17; ++i) {
                P[i + 1] = criterions[List[i]] ? criterions[List[i]].p.map(value => parseFloat(value)) : [];
            }

            // console.log('底事件的Parr', P)
            let nullIndex = -1//记录空值索引值

            if (rules.filter(rule => rule !== '').length >= level) {
                // 判断空值数量
                for (let j = 0; j < level + 1; ++j) {//遍历用户定义的计算规则
                    if (rules[j]) {
                        const ruleItem = 'return ' + rules[j]
                        if (checkSyntax(ruleItem)) {//检查语法
                            const executeFunction = new Function('P', 'p=P', ruleItem);
                            try {
                                let outcome = executeFunction(P);
                                outcome = outcome.toFixed(5)
                                // parseInt(outcome * 100000) / 100000
                                eventEntityMap[key].probability[j] = outcome
                                // console.log(`Result: ${outcome}`);
                            } catch (error) {
                                eventEntityMap[key].msg = '输入语法有误'
                                eventEntityMap[key].probability = []
                                eventEntityMap[key].calculationFlag = 0//-1未填写，0计算有误，1正常
                                console.log(`Error: ${error.message}`)
                            }
                        } else {
                            eventEntityMap[key].msg = '输入语法有误'
                            eventEntityMap[key].probability = []
                            eventEntityMap[key].calculationFlag = 0//-1未填写，0计算有误，1正常
                        }
                    } else {
                        nullIndex = j
                    }
                }
                // 检测总值是否超过1
                // if (eventEntityMap[key].probability.length > 1) {
                //     let sum = 0
                // for (let k = 0; k < level + 1; ++k) {
                //     if (k == nullIndex) continue
                //     const m = 10000
                //     sum = (sum * m + eventEntityMap[key].probability[k] * m || 0) / m; // 如果元素为 undefined，则当作 0 处理
                // }
                // if (sum > 1) { //计算结果不符逻辑时
                //     eventEntityMap[key].probability = []
                //     eventEntityMap[key].calculationFlag = 0
                // }
                // if (nullIndex != -1 && sum < 1) {//如果有空值需要填补
                //     eventEntityMap[key].probability[nullIndex] = (1 - sum).toFixed(5)
                //     // parseInt((1 - sum) * 100000) / 100000
                // }
                // }

                // 检测总值是否超过1、检测单项是否小于0
                if (eventEntityMap[key].probability.length > 0) {
                    let sum = 0
                    for (let k = 0; k < level + 1; ++k) {
                        if (eventEntityMap[key].probability[k] < 0) {//检测是否小于0
                            eventEntityMap[key].msg = '计算结果有误'
                            eventEntityMap[key].probability = []
                            break;
                        }
                        if (k == nullIndex) continue
                        const m = 10000
                        sum = (sum * m + eventEntityMap[key].probability[k] * m || 0) / m; // 如果元素为 undefined，则当作 0 处理
                    }
                    // console.log('sum底事件', sum, eventEntityMap[key].probability)
                    if (nullIndex == -1) {//无空
                        //各类判断条件都为计算无误时置为1
                        if (sum == 1) eventEntityMap[key].calculationFlag = 1
                        else {  // 计算结果不符逻辑时
                            eventEntityMap[key].msg = '计算结果有误'
                            eventEntityMap[key].probability = []
                            eventEntityMap[key].calculationFlag = 0
                        }
                    } else {//有空
                        if (sum > 1 || sum < 0) {  // 计算结果不符逻辑时
                            eventEntityMap[key].msg = '计算结果有误'
                            eventEntityMap[key].probability = []
                            eventEntityMap[key].calculationFlag = 0
                        }
                        else {
                            eventEntityMap[key].probability[nullIndex] = (1 - sum).toFixed(5)
                            eventEntityMap[key].calculationFlag = 1
                        }
                    }
                }
            } else {//空值多于1个
                eventEntityMap[key].msg = '请输入计算规则'
                eventEntityMap[key].probability = []
                eventEntityMap[key].calculationFlag = -1
                // console.log('请输入计算规则', eventEntityMap[key].ftID)
            }

            if (!miniEntityMap) {//正常计算
                // 输入有误 黄色感叹号 计算有误 红色感叹号
                dom.updateCriterionColorNode(eventEntityMap[key]);//更新事件色条
                dom.updateTipIconNode(eventEntityMap[key]);//更新感叹号图标  
            }
        }
    }

    // 遍历中层和顶层
    for (let k = maxLayer - 1; k > 0; --k) {
        // console.log('k', k)
        for (let kk in doorEntityMap) {
            const { layer, downEntity, upEntity, upLevel } = doorEntityMap[kk]//layer是层级
            if (downEntity.length == 0) continue
            const { rules } = eventEntityMap[upEntity]//取门上面事件的计算规则
            if (layer == k) {
                // console.log(doorEntityMap[kk])
                // 判断空值数量
                if (rules.filter(rule => rule !== '').length >= upLevel) {

                    // 找出最大的ftID作为P数组边界
                    const maxftID = downEntity.reduce((maxValue, element) => {
                        return Math.max(maxValue, eventEntityMap[element].ftID);
                    }, -Infinity);
                    // console.log('maxftID', maxftID)

                    let P = new Array(maxftID + 1);//从1开始，和用户输入保持一致[即0为空数组不要了]
                    downEntity.forEach(element => { //准备P数据、判断底下事件是否计算状态是否正常
                        const { ftID, probability, calculationFlag } = eventEntityMap[element]//遍历门下面的事件，取出ftID和概率
                        // console.log('event', eventEntityMap[element])
                        if (calculationFlag == 1) {//下面事件的计算无误才可继续计算
                            P[ftID] = probability.map(value => parseFloat(value))
                        } else {
                            eventEntityMap[upEntity].probability = []
                            eventEntityMap[upEntity].calculationFlag = 0
                            doorEntityMap[kk].calculationFlag = 0
                        }
                    })
                    // console.log('P', P)

                    let nullIndex = -1//记录空值索引值 
                    for (let j = 0; j < upLevel + 1; ++j) {//开始计算：遍历用户定义的计算规则
                        if (rules[j]) {
                            const ruleItem = 'return ' + rules[j]
                            if (checkSyntax(ruleItem)) {
                                const executeFunction = new Function('P', 'p=P', ruleItem);
                                try {
                                    let outcome = executeFunction(P);
                                    outcome = outcome.toFixed(5)  // parseInt(outcome * 100000) / 100000
                                    eventEntityMap[upEntity].probability[j] = outcome
                                    // console.log(`非底事件Result: ${outcome}`);
                                } catch (error) {//计算有误:计算规则语法有误、数组没这项（底下事件计算有误时P数组每值）
                                    eventEntityMap[upEntity].msg = '计算语法有误'
                                    eventEntityMap[upEntity].probability = []
                                    eventEntityMap[upEntity].calculationFlag = 0
                                    doorEntityMap[kk].calculationFlag = 0//-1未填写，0计算有误，1正常
                                    console.log(`非底事件Error: ${error.message}`)
                                }
                            } else {
                                eventEntityMap[upEntity].msg = '计算语法有误'
                                eventEntityMap[upEntity].probability = []
                                eventEntityMap[upEntity].calculationFlag = 0
                                doorEntityMap[kk].calculationFlag = 0//-1未填写，0计算有误，1正常
                            }

                        } else {
                            nullIndex = j
                        }
                    }

                    // 检测总值是否超过1、检测单项是否小于0
                    if (eventEntityMap[upEntity].probability.length > 0) {
                        let sum = 0
                        for (let k = 0; k < upLevel + 1; ++k) {
                            if (eventEntityMap[upEntity].probability[k] < 0) {//检测是否小于0
                                eventEntityMap[upEntity].msg = '计算结果有误'
                                eventEntityMap[upEntity].probability = []
                                break;
                            }
                            if (k == nullIndex) continue
                            const m = 10000
                            sum = (sum * m + eventEntityMap[upEntity].probability[k] * m || 0) / m; // 如果元素为 undefined，则当作 0 处理
                        }
                        // console.log('sum', sum, eventEntityMap[upEntity].probability)
                        if (nullIndex == -1) {//无空
                            if (sum == 1) {//各类判断条件都为计算无误时置为1
                                eventEntityMap[upEntity].calculationFlag = 1
                                doorEntityMap[kk].calculationFlag = 1
                            }
                            else {  // 计算结果不符逻辑时
                                eventEntityMap[upEntity].msg = '计算结果有误'
                                eventEntityMap[upEntity].probability = []
                                eventEntityMap[upEntity].calculationFlag = 0
                                doorEntityMap[kk].calculationFlag = 0
                            }
                        } else {//有空
                            if (sum > 1 || sum < 0) {  // 计算结果不符逻辑时
                                eventEntityMap[upEntity].msg = '计算结果有误'
                                eventEntityMap[upEntity].probability = []
                                eventEntityMap[upEntity].calculationFlag = 0
                                doorEntityMap[kk].calculationFlag = 0
                            }
                            else {
                                eventEntityMap[upEntity].probability[nullIndex] = (1 - sum).toFixed(5)
                                eventEntityMap[upEntity].calculationFlag = 1
                                doorEntityMap[kk].calculationFlag = 1
                            }
                        }
                    }
                } else {//空值多于1个 输入有误
                    eventEntityMap[upEntity].msg = '请输入计算规则'
                    eventEntityMap[upEntity].probability = []
                    eventEntityMap[upEntity].calculationFlag = -1
                    doorEntityMap[kk].calculationFlag = -1
                    console.log('请输入计算规则', eventEntityMap[upEntity])
                }
                // console.log('eventEntityMap[upEntity]', eventEntityMap[upEntity])
                // 输入有误 黄色感叹号 计算有误 红色感叹号
                if (!miniEntityMap) {
                    dom.updateCriterionColorNode(eventEntityMap[upEntity]);//更新事件色条
                    dom.updateTipIconNode(eventEntityMap[upEntity]);//更新事件的感叹号图标 
                    // dom.updateTipIconNode(doorEntityMap[kk]);//更新门的感叹号图标 
                }
            }

        }
    }


    // 标记系统计算完成
    gContextDao.getGContextProp("statusData").isCompute = false;
    gContextDao.getGContextProp("statusData").computeType = null;
    gContextDao.getGContextProp("statusData").computeProxy = null;

    // statusData.computeProxy = proxy;// 将计算代理存储到系统状态数据中
}
function checkSyntax(userCode) {
    try {
        // 使用 new Function 构造用户输入的代码
        new Function(userCode);
        // 如果没有抛出异常，表示语法正确
        return true;
    } catch (error) {
        // 捕获异常，表示语法错误
        console.error('语法错误:', error.message);
        return false;
    }
}

// 分析计算
function analysisCalculation() {
    let statusData = gContextDao.getGContextProp("statusData");


    // if (statusData.isShowBottomMsg) {
    //     statusData.isShowBottomMsg = false
    //     gContextController.IncreaseMainSVGSize(0, statusData.isShowCriterionPop ? -80 : 0);
    // } else {

    const { eventEntityMap } = g.gContext

    let resultArr = gContextDao.getGContextProp("resultArr");
    resultArr.length = 0

    let warnMsgList = []
    // 获取对象属性的键数组
    let keys = Object.keys(eventEntityMap);
    // for (let key in eventEntityMap) {
    for (let i = 0; i < keys.length; ++i) {
        if (eventEntityMap[keys[i]].modelType === 'bottom_event') {
            let eventEntityMapCopy = deepClone(eventEntityMap)
            const { probability, layer } = eventEntityMapCopy[keys[i]]
            probability.fill(0);
            probability[probability.length - 1] = 1;

            // console.log(`本次是事件${eventEntityMapCopy[keys[i]].ftID}概率置为1`)
            const result = analysis(eventEntityMapCopy, layer)
            // console.log('result', result)
            if (result) {
                resultArr.push({
                    ftIdArr: [eventEntityMapCopy[keys[i]].ftID],
                    result,
                    level: 1,
                    color: '#b5e61d'
                })
            } else {
                console.log(`事件${eventEntityMapCopy[keys[i]].ftID}概率置为1时计算有误`)
                warnMsgList.push(`事件${eventEntityMapCopy[keys[i]].ftID}概率置为1时计算有误`)
            }

            if (statusData.analysisOrder == 2) {
                for (let j = i + 1; j < keys.length; j++) {
                    if (eventEntityMap[keys[j]].modelType === 'bottom_event') {
                        let eventEntityMapCopy2 = deepClone(eventEntityMapCopy)

                        const probability2 = eventEntityMapCopy2[keys[j]].probability
                        // const layer2 = eventEntityMapCopy2[keys[j]].layer

                        probability2.fill(0);
                        probability2[probability2.length - 1] = 1;
                        // console.log(`本次是事件${eventEntityMap[keys[i]].ftID}和${eventEntityMap[keys[j]].ftID}概率置为1`)
                        const result2 = analysis(eventEntityMapCopy2)
                        // console.log('顶事件毁坏概率', result2)
                        if (result2) {
                            resultArr.push({
                                ftIdArr: [eventEntityMapCopy[keys[i]].ftID, eventEntityMapCopy[keys[j]].ftID],
                                result: result2,
                                level: 2,
                                color: '#99d9ea'
                            })
                        } else {
                            console.log(`事件${eventEntityMap[keys[i]].ftID}和${eventEntityMap[keys[j]].ftID}概率置为1时计算有误`)
                            warnMsgList.push(`事件${eventEntityMap[keys[i]].ftID}和${eventEntityMap[keys[j]].ftID}概率置为1时计算有误`)
                        }
                    }
                }
            }
        }


    }


    // 从大到小排序   并取前十【现在需求是全显示】
    // // resultArr = resultArr.sort((a, b) => parseFloat(b.result) - parseFloat(a.result));
    // resultArr = resultArr.filter(item => parseFloat(item.result) > 0.5) //使用filter后会让该数组对象不再被观察
    for (let i = resultArr.length - 1; i >= 0; i--) {
        if (parseFloat(resultArr[i].result) <= 0.5) {
            resultArr.splice(i, 1);
        }
    }
    resultArr = resultArr.sort((a, b) => {
        const resultComparison = parseFloat(b.result) - parseFloat(a.result);
        if (resultComparison !== 0) {
            return resultComparison;
        } else {
            return a.level - b.level;
        }
    });
    // resultArr = resultArr.slice(0, 10) 不改变原数组
    // resultArr.splice(10) //改变原数组

    // console.log('resultArr', g.gContext.resultArr)

    statusData.isShowBottomMsg = true

    if (statusData.isShowCriterionPop) {
        // console.log('jin ')
        gContextController.IncreaseMainSVGSize(0, 90);
        gContextController.scrollToBottom()
    }

    return warnMsgList
    // }

}

function analysis(eventEntityMap) {
    const { maxLayer } = g.gContext.bottomAmount
    const { doorEntityMap } = g.gContext

    //   遍历中层和顶层
    for (let k = maxLayer - 1; k > 0; --k) {
        // console.log('k', k)
        for (let kk in doorEntityMap) {
            const { layer, downEntity, upEntity, upLevel } = doorEntityMap[kk]//layer是层级

            const { rules } = eventEntityMap[upEntity]//取门上面事件的计算规则
            if (layer == k) {
                // 判断空值数量
                if (rules.filter(rule => rule !== '').length >= upLevel) {

                    // 找出最大的ftID作为P数组边界
                    const maxftID = downEntity.reduce((maxValue, element) => {
                        return Math.max(maxValue, eventEntityMap[element].ftID);
                    }, -Infinity);

                    let P = new Array(maxftID + 1);//从1开始，和用户输入保持一致[即0为空数组不要了]
                    downEntity.forEach(element => { //准备P数据、判断底下事件是否计算状态是否正常
                        const { ftID, probability, calculationFlag } = eventEntityMap[element]//遍历门下面的事件，取出ftID和概率

                        if (calculationFlag == 1) {//下面事件的计算无误才可继续计算
                            P[ftID] = probability.map(value => parseFloat(value))
                        } else {
                            eventEntityMap[upEntity].probability = []
                            eventEntityMap[upEntity].calculationFlag = 0
                        }
                    })
                    // console.log('P', P)


                    let nullIndex = -1//记录空值索引值 
                    for (let j = 0; j < upLevel + 1; ++j) {//开始计算：遍历用户定义的计算规则
                        if (rules[j]) {
                            const ruleItem = 'return ' + rules[j]
                            if (checkSyntax(ruleItem)) {
                                const executeFunction = new Function('P', 'p=P', ruleItem);
                                try {
                                    let outcome = executeFunction(P);
                                    outcome = outcome.toFixed(5)  // parseInt(outcome * 100000) / 100000
                                    eventEntityMap[upEntity].probability[j] = outcome
                                    // console.log(`非底事件Result: ${outcome}`);
                                } catch (error) {//计算有误:计算规则语法有误、数组没这项（底下事件计算有误时P数组每值）
                                    eventEntityMap[upEntity].msg = '计算语法有误'
                                    eventEntityMap[upEntity].probability = []
                                    eventEntityMap[upEntity].calculationFlag = 0
                                    console.log(`非底事件Error: ${error.message}`)
                                }
                            } else {
                                eventEntityMap[upEntity].msg = '计算语法有误'
                                eventEntityMap[upEntity].probability = []
                                eventEntityMap[upEntity].calculationFlag = 0
                                doorEntityMap[kk].calculationFlag = 0//-1未填写，0计算有误，1正常
                            }

                        } else {
                            nullIndex = j
                        }
                    }

                    // 检测总值是否超过1、检测单项是否小于0
                    if (eventEntityMap[upEntity].probability.length > 0) {
                        let sum = 0
                        for (let k = 0; k < upLevel + 1; ++k) {
                            if (eventEntityMap[upEntity].probability[k] < 0) {//检测是否小于0
                                eventEntityMap[upEntity].msg = '计算结果有误'
                                eventEntityMap[upEntity].probability = []
                                break;
                            }
                            if (k == nullIndex) continue
                            const m = 10000
                            sum = (sum * m + eventEntityMap[upEntity].probability[k] * m || 0) / m; // 如果元素为 undefined，则当作 0 处理
                        }

                        if (nullIndex == -1) {//无空
                            if (sum == 1) {//各类判断条件都为计算无误时置为1
                                eventEntityMap[upEntity].calculationFlag = 1
                            }
                            else {  // 计算结果不符逻辑时
                                eventEntityMap[upEntity].msg = '计算结果有误'
                                eventEntityMap[upEntity].probability = []
                                eventEntityMap[upEntity].calculationFlag = 0
                            }
                        } else {//有空
                            if (sum > 1 || sum < 0) {  // 计算结果不符逻辑时
                                eventEntityMap[upEntity].probability = []
                                eventEntityMap[upEntity].calculationFlag = 0
                            }
                            else {
                                eventEntityMap[upEntity].probability[nullIndex] = (1 - sum).toFixed(5)
                                eventEntityMap[upEntity].calculationFlag = 1
                            }
                        }
                    }


                } else {//空值多于1个 输入有误
                    eventEntityMap[upEntity].msg = '请输入计算规则'
                    eventEntityMap[upEntity].probability = []
                    eventEntityMap[upEntity].calculationFlag = -1
                }
            }

        }
        // 当存在两个事件都置为1时
        // if (upLayer && index && (k == upLayer)) {
        //     let probability2 = eventEntityMap[index].probability
        //     probability2.fill(0);
        //     probability2[probability2.length - 1] = 1;
        // }
        // console.log('eventEntityMap', eventEntityMap)
    }

    // console.log('计算后', eventEntityMap)
    let topP = 0
    for (let key in eventEntityMap) {
        if (eventEntityMap[key].modelType === 'top_event') {
            topP = eventEntityMap[key].probability[eventEntityMap[key].probability.length - 1]
            //  console.log(eventEntityMap[key].probability)
        }
    }
    return topP
}

//对象的深拷贝 不改变原对象
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function pick(obj, keys) {
    return keys.reduce((result, key) => {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
        return result;
    }, {});
}

// {
//     // // console.log(key, eventEntityMap[key])
//     let result = [0, 0] //好数，坏数
//     const { criterions, criterionDoor } = eventEntityMap[key]

//     // 使用 Function 构造函数创建一个函数，传参并在函数内部执行用户输入的代码
//     const executeFunction = new Function('c', criterionDoor.code);

//     const forSum = 10000000  //计算次数
//     for (let ii = 0; ii < forSum; ++ii) {

//         let c = new Array(22).fill(0)//记录底事件每个判据程度
//         for (let i in criterions) {//设置c[pi]=0/1/2/3/4/5  为0是完好
//             if (criterions[i].actived && criterions[i].p.length > 0) {
//                 const { p } = criterions[i]
//                 // console.log(i, p)
//                 const random = Math.random(); // [ 0, 1 )
//                 // console.log('random', random)
//                 if (random < p[0]) {//完好
//                     c[Math.abs(22 - List.indexOf(i))] = 0
//                 } else c[Math.abs(22 - List.indexOf(i))] = 1
//             }
//         }

//         // #region
//         // console.log('c', c)
//         // if (criterionDoor.type == "or_door") {//有一个坏就是坏（都好才是好）
//         //     if (c.indexOf(1) == -1) result[0]++;
//         //     else result[1]++;
//         //     // for (let k in c) {
//         //     //     if (c[k] > 0) { result[1]++; break; }//坏数+1
//         //     //     else continue
//         //     // }
//         // } else if (criterionDoor.type == "and_door") {//都坏才坏（有一个好就是好）
//         //     if (c.indexOf(0) == -1) result[1]++;
//         //     else result[0]++;
//         //     // for (let k in c) {
//         //     //     if (c[k] == 0) { result[0]++; break; }//好数+1
//         //     //     else continue
//         //     // }
//         // } else { }
//         // #endregion 

//         try {
//             const outcome = executeFunction(c);
//             // console.log(`Result: ${outcome}`); //返回1即是坏了
//             if (outcome == 0) result[0]++
//             else if (outcome == 1) result[1]++
//         } catch (error) {
//             console.log(`Error: ${error.message}`)
//         }
//     }

//     console.log(result)

//     eventEntityMap[key].probability[0] = result[0] / forSum
//     eventEntityMap[key].probability[1] = result[1] / forSum
// }

// 故障计算
function failureCalculation() {

    let fileName = gContextDao.getGContextProp("fileInfo").name; // 获取文件名
    let statusData = gContextDao.getGContextProp("statusData");// 获取系统状态数据
    if (statusData.isCompute || !fileName || fileName === "") return;// 如果正在计算，或者文件名为空，则直接返回
    statusData.computeType = "failure"; // 设置计算类型为故障计算，并标记系统正在进行计算
    statusData.isCompute = true;

    // 获取故障计算相关的数据 
    let failureComputedData = gContextDao.getGContextProp("failureComputedData");
    failureComputedData.startTimeStamp = new Date().getTime();  // 设置计算开始时间戳为当前时间

    // 发起故障计算请求，并设置回调函数处理计算结果
    let proxy = computeRequest.failureProxy("tester", fileName, (webSocket, msg) => {
        let message = JSON.parse(msg);  // 解析收到的消息

        if (message.close) {// 如果收到的消息包含 close 属性，则表示计算完成

            // 更新计算结果 
            let failureComputedData = gContextDao.getGContextProp("failureComputedData");
            failureComputedData.result = message.do;

            // 渲染计算结果的波形图
            viewOPController.calculationResultsRenderWave();
            console.log(message);
            fr.updateLevelAndPro(message.do);// 更新级别和概率
            // console.log(message.standard);
            fr.updateStandardPro(message.standard);// 更新标准属性

            fr.updateEffect(message.effect); // 更新效果属性 
            webSocket.close();// 关闭 WebSocket 连接

            // 标记系统计算完成
            gContextDao.getGContextProp("statusData").isCompute = false;
            gContextDao.getGContextProp("statusData").computeType = null;
            gContextDao.getGContextProp("statusData").computeProxy = null;
        }
    }, () => {
        //console.log(1);
    });
    statusData.computeProxy = proxy;// 将计算代理存储到系统状态数据中
};

//对接蔡的计算
function proCalculation() {

    let fileName = gContextDao.getGContextProp("fileInfo").name;
    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.isCompute || !fileName || fileName === "") return;
    statusData.isCompute = true;
    let failureComputedData = gContextDao.getGContextProp("failureComputedData");
    failureComputedData.startTimeStamp = new Date().getTime();


    let proxy = computeRequest.proProxy("tester", fileName, (webSocket, msg) => {
        let message = JSON.parse(msg);
        if (message.currentResult) {
            let computeResult = gContextDao.getGContextProp("computeResult");
            if (!message.currentResult.finish) {
                computeResult.push(message.currentResult);
            }
            else {
                for (let i = 0, len = computeResult.length; i < len; ++i) {
                    if (computeResult[i].timeStamp === message.currentResult.timeStamp) {
                        computeResult[i].finish = true;
                        computeResult[i].do = message.currentResult.do;
                    }
                }

                //为滤镜添加数据
                let failureComputedData = gContextDao.getGContextProp("failureComputedData");
                failureComputedData.result = message.currentResult.do;
                failureComputedData.timeStamp = message.currentResult.timeStamp;
                //渲染滤镜
                viewOPController.calculationResultsRenderWave();
                //更新等级及概率
                fr.updateLevelAndPro(message.currentResult.do);
                fr.updateStandardPro(message.currentResult.standard);

                fr.updateEffect(message.currentResult.effect);
                //webSocket.close();
                viewOPController.filterResultsRender();
                nodesOPController.updateTreeData();
            }

        }
    }, () => {
        gContextDao.getGContextProp("statusData").isCompute = false;
        gContextDao.getGContextProp("statusData").computeType = null;
        gContextDao.getGContextProp("statusData").computeProxy = null;
    });
    statusData.computeProxy = proxy;
}


function probabilityCalculation() {
    let fileName = gContextDao.getGContextProp("fileInfo").name;
    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.isCompute || !fileName || fileName === "") return;
    statusData.computeType = "probability";
    statusData.isCompute = true;
    let failureComputedData = gContextDao.getGContextProp("failureComputedData");
    failureComputedData.startTimeStamp = new Date().getTime();
    let proxy = computeRequest.probabilityProxy("tester", fileName, (webSocket, msg) => {
        let message = JSON.parse(msg);
        if (message.close) {
            let failureComputedData = gContextDao.getGContextProp("failureComputedData");
            failureComputedData.result = message.do;
            viewOPController.calculationResultsRenderWave();
            fr.updateLevelAndPro(message.do);
            fr.updateStandardPro(message.standard);
            fr.updateEffect(message.effect);
            webSocket.close();
            gContextDao.getGContextProp("statusData").isCompute = false;
            gContextDao.getGContextProp("statusData").computeType = null;
            gContextDao.getGContextProp("statusData").computeProxy = null;
        }
    }, () => {
    });
    statusData.computeProxy = proxy;
}

function computeStop() {
    let statusData = gContextDao.getGContextProp("statusData");
    if (statusData.computeProxy) {
        statusData.isCompute = false;
        statusData.computeType = null;
        statusData.computeProxy.close();
        statusData.computeProxy = null;
    }
}


export default {
    diToDo,
    diCalculation,
    analysisCalculation,
    failureCalculation,
    proCalculation,
    computeStop,
    probabilityCalculation,
}