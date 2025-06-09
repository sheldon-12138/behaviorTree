import { g } from "../../../js/structure/gContext.js"
import gContextDao from "../../../js/dao/gContextDao.js";
import nodesOPController from "../../../js/controller/nodesOPController.js";
import Utils from "../../../js/utils/utils.js";
import Color from "../../../js/utils/color.js";
import fileController from "../../../js/controller/fileController.js";
import fileParser from "../../../js/parser/fileParser.js";
import computeController from "../../../js/controller/computeController.js";
import gContextController from "../../../js/controller/gContextController.js";
import color from "../../../js/utils/color.js";
import dom from "../../../js/viewModel/dom.js";

export function attributePopVm() {
    new Vue({
        el: '#attributePopList',
        data() {
            return {
                // 位置拖动
                dragging: false,
                rel: null,
                top: 110,
                left: 480,

                // 宽高拖动
                mouseMoveHandler: null,
                mouseUpHandler: null,
                widthDrag: false,
                width: 670,//500
                height: 470,//462

                statusData: g.gContext.statusData,
                attrData: g.gContext.attrData,  //属性栏（模型）数据
                modelList: g.gContext.modelList, //模型列表
                // 编辑节点 新增节点模型  编辑节点模型 编辑已有节点模型  选择项目路径 选择项目目录
                headTextArr: ['Node Editor', 'Node Model Editor', 'Node Model Editor', 'Node Model (not editable)', 'Choose project path', 'Choose project directory',],

                preTextArr: ['_skipif', '_successif', '_failureif', '_while'],
                postTextArr: ['_onSuccess', '_onFailure', '_onHalted', '_post'],
                // 节点信息
                entityInfo: {
                    modelType: '',
                    name: '',
                    aliasName: '',
                    _description: '',

                    _skipif: '',
                    _successif: '',
                    _failureif: '',
                    _while: '',

                    _onSuccess: '',
                    _onFailure: '',
                    _onHalted: '',
                    _post: '',
                },
                isOk: false,
                // 新增节点模型
                newModel: {
                    typeIndex: 0,
                    nodeTypeIndex:0,
                    name: '',
                },
                typeList: ['Action', 'Condition', 'Control', 'Decorator'],
                nodeTypeList: ['StatefulActionNode', 'SyncActionNode', 'ConditionNode'],
                tipText: '模型名不可为空',
                tipTextList: ['模型名不可为空', '模型名已存在', '模型名无效:仅允许使用字母、数字和下划线',
                    '端口名不可为空', '端口名重复', '端口名无效:仅允许使用字母、数字和下划线,且不允许以数字开头'],
                tableData: [],
                nodePortData: [],
                nodePortItem: { portName: 'port_name', value: '{tree_port_name}' },
                tableItem: { id: 'newId', portName: 'key_name', direction: 'input_port', dataType: '', defaultValue: '', description: '' },
                selectPortIndex: -1,//选中的端口索引
                selectNodePortIndex: -1,//选中的端口索引
                tabsArr: ['Port Remapping', 'Pre Conditions', 'Post Conditions', 'Description'],
                avtiveTab: 0,
            }
        },
        computed: {
            entity() {
                return g.gContext.attrData.entity;
            },
            model() {
                return g.gContext.attrData.model;
            },
        },
        watch: {
            entity() {
                if (this.entity) {
                    this.nodePortData.length = 0;
                    // console.log(this.entity.name)
                    console.log('attr的entity', this.entity)
                    this.entityInfo = {
                        ...this.entity
                        // modelType: this.entity.modelType,
                        // name: this.entity.name,
                        // aliasName: this.entity.aliasName,
                        // description: this.entity.description,

                        // _skipif: this.entity._skipif,
                        // _successif: this.entity._successif,
                        // _failureif: this.entity._failureif,
                        // _while: this.entity._while,

                        // _onSuccess: this.entity._onSuccess,
                        // _onFailure: this.entity._onFailure,
                        // _onHalted: this.entity._onHalted,
                        // _post: this.entity._post,
                    }
                    // 节点端口
                    for (let key in this.entity.port) {
                        this.nodePortData.push({
                            portName: key,
                            direction: this.entity.port[key].direction,
                            dataType: this.entity.port[key].dataType,
                            defaultValue: this.entity.port[key].defaultValue,
                            description: this.entity.port[key].description,
                            value: this.entity.port[key].value,
                        })
                    }
                    // console.log('nodePortData', this.nodePortData)
                    this.isOk = true
                }
            },
            model() {
                this.tableData.length = 0;
                console.log('attr的model', this.model)
                if (this.model) {
                    this.newModel = {
                        typeIndex: this.typeList.indexOf(this.model.type),
                        name: this.model.ID,
                        type: this.model.type,
                        nodeTypeIndex: this.nodeTypeList.indexOf(this.model.nodeType),
                    }
                    for (let key in this.model.port) {
                        this.tableData.push({
                            id: Math.random().toString(36).slice(2, 11),
                            portName: key,
                            direction: this.model.port[key].direction,
                            dataType: this.model.port[key].dataType,
                            defaultValue: this.model.port[key].defaultValue,
                            description: this.model.port[key].description,
                        })
                    }
                    this.tipText = '';
                    this.isOk = true;
                    // console.log('model', this.model)
                } else {
                    // console.log('新增 model is null')
                    this.newModel = {
                        typeIndex: 0,
                        nodeTypeIndex:0,
                        name: '',
                    }
                }
            }
        },
        // updated() {
        //     setTimeout(() => {
        //         nodesOPController.getNodeImg(this.attrData.entity.imgName, data => {
        //             this.img = data;
        //         })
        //     }, 100);
        // },
        methods: {
            //-----------------函数-----------------------
            // 检查输入 给出提示文字
            // 检查输入并给出提示文字
            selectTipTxt() {
                const value = this.newModel.name;
                const nameResult = this.checkNameValue(value);
                const portResult = this.checkPortNameValue();

                if (nameResult === -1 && portResult === -1) {
                    // 没有错误时清空提示
                    this.tipText = '';
                    this.isOk = true;
                    return;
                }

                this.isOk = false;

                // 检查模型名结果
                if (nameResult !== -1) {
                    switch (nameResult) {
                        case 0:
                            this.tipText = this.tipTextList[0]; // 提示不能为空
                            break;
                        case 1:
                            this.tipText = this.tipTextList[1]; // 提示模型名已存在
                            break;
                        case 2:
                            this.tipText = this.tipTextList[2]; // 提示模型名不合法
                            break;
                    }
                    return;
                }

                // 如果模型名没问题，检查端口名结果
                switch (portResult) {
                    case 3:
                        this.tipText = this.tipTextList[3]; // 提示端口名不能为空
                        break;
                    case 4:
                        this.tipText = this.tipTextList[4]; // 提示端口名重复
                        break;
                    case 5:
                        this.tipText = this.tipTextList[5]; // 提示端口名不合法
                        break;
                }

                // console.log('nameResult', nameResult, 'portResult', portResult);
            },

            // 检查模型名是否合法
            checkNameValue() {
                const value = this.newModel.name;
                if (value.length > 0) {
                    if (this.checkInput(value)) {
                        if (this.checkExists(value, this.statusData.attrID == '3' ? this.model.ID : null)) {
                            return 1
                        } else {
                            return -1;
                        }
                    }
                    else {//提示输入不合法
                        return 2
                    }
                } else {
                    return 0
                }
            },
            // 检查模型名是否存在
            checkExists(name, currentName = null) {
                const found = this.modelList.some(node =>
                    node.children.filter(child => child.ID !== currentName)
                        .some(child => child.ID === name)
                );
                return found;
            },
            // 检查输入
            checkInput(str, flag = false) {
                let regex = /^[a-zA-Z0-9_]+$/;
                if (flag) regex = /^(?![0-9])[a-zA-Z0-9_]+$/;
                return regex.test(str);
            },
            // 检查端口名是否合法
            checkPortNameValue() {
                for (const item of this.tableData) {
                    const value = item.portName;
                    if (value.length === 0) { // 代号 3: 端口名为空
                        return 3;
                    }
                    if (!this.checkInput(value, true)) { // 代号 5: 端口名不合法
                        return 5;
                    }
                }
                if (this.checkPortNameRepeat()) { // 代号 4: 端口名重复               
                    return 4;
                }
                return -1;// 代号 -1: 所有检查通过
            },
            // checkPortNameValue() {
            //     let flag = true
            //     for (const item of this.tableData) {
            //         const value = item.portName;
            //         if (value.length > 0) {//检查端口名是否为空
            //             if (this.checkInput(value, true)) {//检查是否合法
            //             } else {
            //                 flag = false
            //                 return 5
            //             }
            //         } else {
            //             flag = false
            //             return 3
            //         }
            //     }

            //     // 检查端口重复
            //     let repeatFlag = this.checkPortNameRepeat()
            //     if (repeatFlag) {
            //         flag = false
            //         return 4
            //     }
            //     if (flag) return -1
            //     console.log('flag', flag)
            // },

            // 增加端口
            addPort(flag) {
                if (flag) {
                    this.tableData.push(JSON.parse(JSON.stringify({
                        ...this.tableItem, id: Math.random().toString(36).slice(2, 11)
                    })));//深拷贝,避免改变tableItem

                    this.selectTipTxt()
                }
                else {//子树新增端口
                    this.nodePortData.push(JSON.parse(JSON.stringify(this.nodePortItem)));
                }
            },
            // 删除端口
            deletePort(flag) {
                if (flag) {
                    if (this.selectPortIndex == -1) return
                    this.tableData.splice(this.selectPortIndex, 1)
                    if (this.tableData.length == 0) this.selectPortIndex = -1
                    this.selectTipTxt()
                }
                else {//子树删除端口
                    if (this.selectNodePortIndex == -1) return
                    this.nodePortData.splice(this.selectNodePortIndex, 1)
                    if (this.nodePortData.length == 0) this.selectNodePortIndex = -1
                }
            },
            // checkPortName() {
            //     let repeatFlag = this.checkPortNameRepeat()
            //     if (repeatFlag) {
            //         this.tipText = this.tipTextList[4];
            //         this.isOk = false
            //     } else {
            //         this.tipText = this.tipTextList[4];
            //         this.isOk = false
            //     }
            // },
            // 检查端口重复
            checkPortNameRepeat() {
                const portNames = new Set();
                for (const item of this.tableData) {
                    if (portNames.has(item.portName)) {
                        return true; // 找到重复的 portName
                    }
                    portNames.add(item.portName);
                }

                return false; // 没有重复的 portName
            },
            // 保存
            handleSave(attrID) {
                let eventEntityMap = g.gContext.eventEntityMap
                if (attrID == '1') {//编辑节点信息
                    if (this.entityInfo.aliasName == '') this.entityInfo.aliasName = this.entityInfo.name
                    const tableObj = this.handleTableData(this.nodePortData);
                    this.entityInfo.port = tableObj
                    Vue.set(eventEntityMap, this.entity.id, {
                        ...this.entity,
                        ...this.entityInfo
                    })

                    const aliasFlag = (this.entityInfo.aliasName !== this.entityInfo.name) //有别名
                    const orgFlag = (this.entity.aliasName !== this.entity.name) //原本有别名 
                    const orgDesIsNull = (!this.entity._description) //原本描述为空

                    nodesOPController.handleNodeSurface(eventEntityMap[this.entity.id], aliasFlag, orgFlag, orgDesIsNull)
                }
                else if (attrID == '2') {//新增节点模型
                    const tableObj = this.handleTableData(this.tableData);
                    // console.log('tableObj', tableObj)
                    this.modelList[this.newModel.typeIndex].children.push({
                        ID: this.newModel.name,
                        isUser: true,
                        port: tableObj,

                        nodeType: this.nodeTypeList[this.newModel.nodeTypeIndex],
                    })
                } else if (attrID == '3') {//编辑自定义的节点模型
                    const tableObj = this.handleTableData(this.tableData);

                    const index = this.modelList[this.newModel.typeIndex].children.findIndex(item => item.ID === this.model.ID);

                    Vue.set(this.modelList[this.newModel.typeIndex].children, index, {
                        ID: this.newModel.name,
                        isUser: true,
                        port: tableObj,

                        nodeType: this.nodeTypeList[this.newModel.nodeTypeIndex],
                    })
                    // console.log(tableObj, this.model.port)
                    nodesOPController.handleModelChange(this.newModel.name, tableObj)
                    // this.modelList[this.newModel.typeIndex].children[index] = {
                    //     ID: this.newModel.name,
                    //     isUser: true,
                    //     port: tableObj
                    // };
                    // console.log('modelList', this.modelList)
                }
                this.handleClose()
            },
            // 将节点模型的端口数组转成对象
            handleTableData(tableData) {
                const result = tableData.reduce((acc, item) => {
                    const { portName, value, defaultValue, id, ...rest } = item;
                    acc[portName] = { ...rest, value: value || defaultValue };
                    return acc;
                }, {});
                return result;
            },

            // 关闭弹窗
            handleClose() {
                // console.log('')
                let { attrID } = this.statusData

                // 
                let attrData = gContextDao.getGContextProp("attrData");
                if (attrID == 1) {//节点信息
                    this.entityInfo = {
                        modelType: '',
                        name: '',
                        aliasName: '',
                        _description: '',

                        _skipif: '',
                        _successif: '',
                        _failureif: '',
                        _while: '',

                        _onSuccess: '',
                        _onFailure: '',
                        _onHalted: '',
                        _post: '',

                        port: ''
                    }
                    this.nodePortData.length = 0;
                    attrData.entity = null;
                }
                // 新增节点
                else if (attrID == 2 || attrID == 3 || attrID == 4) {
                    this.isOk = false
                    this.newModel = {
                        typeIndex: 0,
                        name: '',
                        nodeTypeIndex:0,
                    }
                    this.tableData.length = 0;
                    attrData.model = null;
                }

                // this.selectorPosition = 0
                this.statusData.isShowProperty = false
                attrID = -1
                gContextDao.setGContextProp("statusData", this.statusData);
                this.tipText = this.tipTextList[0];
            },
            //-----------------弹出框本身的拖拽函数--------------------------------------
            startDrag(e) {
                // console.log('e', e)
                // 计算鼠标位置与组件左上角的相对位置
                this.rel = {
                    x: e.clientX - this.left,
                    y: e.clientY - 62 - this.top,
                };
                // console.log('开始拖', this.rel)
                this.dragging = true;
                document.addEventListener('mousemove', this.drag);
                document.addEventListener('mouseup', this.stopDrag);
            },
            drag(e) {
                if (this.dragging) {
                    // 计算组件新的 left 和 top 值
                    this.left = Math.min(Math.max(e.clientX - this.rel.x, -300), 1360)
                    this.top = Math.min(Math.max(e.clientY - 62 - this.rel.y, 10), 800);
                }
            },
            stopDrag() {
                console.log('entity', this.attrData.entity)
                this.dragging = false;
                document.removeEventListener('mousemove', this.drag);
                document.removeEventListener('mouseup', this.stopDrag);
            },
            //-----------------调整宽度的拖拽函数-------
            startDragW(e, type) {
                this.widthDrag = true;

                this.mouseMoveHandler = (event) => {
                    this.dragW(event, type);
                };
                this.mouseUpHandler = () => {
                    this.stopDragW(type);
                };

                document.addEventListener('mousemove', this.mouseMoveHandler);
                document.addEventListener('mouseup', this.mouseUpHandler);
            },
            dragW(e, type) {
                // console.log('type', type)
                // console.log('this.widthDrag', this.widthDrag)
                if (this.widthDrag && type == 'right') {
                    this.width = Math.max(e.clientX - this.left, 680)
                    this.height = Math.max(e.clientY - this.top, 200);
                } else if (this.widthDrag && type == 'left') {
                    const newWidth = this.width + this.left - e.clientX;
                    const newLeft = e.clientX;
                    if (newWidth >= 680) { // 检查新的宽度是否满足最小宽度要求（680）
                        this.width = newWidth;
                        this.left = newLeft;
                    }
                    // 计算新的高度，同时满足最小高度要求（200）
                    this.height = Math.max(e.clientY - this.top, 200);
                }
                if (this.myChart) {
                    this.myChart.resize({
                        width: this.width - 30,//150
                        height: this.showDcData ? (this.height - 128) : (this.height - 98)
                        // this.height - 118//98 158
                    })
                }

            },
            stopDragW(type) {
                // console.log('stop')
                this.widthDrag = false;
                // document.removeEventListener('mousemove', (event) => {
                //     this.dragW(event, type);
                // });
                // document.removeEventListener('mouseup', () => {
                //     this.stopDragW(type);
                // })
                document.removeEventListener('mousemove', this.mouseMoveHandler);
                document.removeEventListener('mouseup', this.mouseUpHandler);
            },
        },
    })
}