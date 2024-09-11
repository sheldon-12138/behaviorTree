import { g } from "../../../js/structure/gContext.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";
import viewOPController from "../../../js/controller/viewOPController.js";
import gContextDao from "../../../js/dao/gContextDao.js";
import dom from "../../../js/viewModel/dom.js";
import fileRequest from "../../../js/request/fileRequest.js";
import fileController from "../../../js/controller/fileController.js";
import Utils from "../../../js/utils/utils.js";
import gContextController from "../../../js/controller/gContextController.js";
import computeController from "../../../js/controller/computeController.js";
import fileParser from "../../../js/parser/fileParser.js";
import draggable from './draggable.js';
import serialize from "../../../js/parser/serialize.js";

export function headerVm() {
    new Vue({
        el: '#header',
        directives: {
            draggable,
        },
        data: {
            showDi: false,
            tableData: [{
                date: '2024-05-07 10:56:20',
                fileName: '测试文件1',
                calculationResults: [0.1, 0.2, 0.3, 0.4],
                totalDuration: '200ms'
            }, {
                date: '2024-05-08 10:56:20',
                fileName: '测试文件2',
                calculationResults: [0.1, 0.2, 0.7],
                totalDuration: '200ms'
            }, {
                date: '2024-05-09 10:56:20',
                fileName: '测试文件3',
                calculationResults: [0.1, 0.9],
                totalDuration: '200ms'
            }, {
                date: '2024-05-10 10:56:20',
                fileName: '测试文件4',
                calculationResults: [1],
                totalDuration: '200ms'
            }],
            //hs等级颜色表，颜色越深hs程度越高
            statusColor: {
                1: ["#3CFF00"],
                2: ["#3CFF00", "#890101"],
                3: ["#3CFF00", "#FFC080", "#890101"],
                4: ["#3CFF00", "#FFFF00", "#FFC080", "#890101"],
                5: ["#3CFF00", "#FFFF00", "#FFC080", "#FF0000", "#890101"],
            },

            //粘贴位置随粘贴次数改变,
            optionSettings: false,//选项配置项窗口
            fileSaveDialogVisible: false,   //文件保存窗口
            fileOpenDialogVisible: false,   //打开文件窗口
            saveAsID: false, //另存为窗口
            ip: window.location.hostname,
            port: window.location.port,
            workspace: "",
            user: g.gContext.user,
            saveTitle: "",
            currentSaveProject: "",
            info: {
                name: 'xx树',  //文件名称
                version: 1.0, //版本号
                level: null,  //保密等级
                createTime: '2020-05-17', //创建时间
                updateTime: '2020-05-17', //修改时间
                createUnit: 'xx单位', //创建单位
                founder: "", //创建人
                contactInformation: null, //联系方式
                describe: null, //描述
                verification: null, //验证
                confidence: 1,  //置信度
            },
            saveFormRules: {
                name: [{ required: true, message: '请输入树名称', trigger: 'blur' },],
                createUnit: [{ required: true, message: '请输入创建单位', trigger: 'blur' },],
                founder: [{ required: true, message: '请输入联系人', trigger: 'blur' },],
                contactInformation: [{ required: true, message: '请输入联系方式', trigger: 'blur' },],
            },
            colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
            modeID: g.gContext.statusData.modeID,
            scale: 100,
            timeout: null,
            currentProject: "",
            failureCalculationID: false, //di计算（单次）计算窗口开关控制
            failureCalculationData: {  //di计算（单次）计算相关数据
                frequency: 1000000,
                accuracy: 5,
                isWhole: false,
                isCheck: false,
                condition: '或'
            },
            probabilityCalculationID: false, // di计算（多次） 计算窗口开关控制
            probabilityCalculationData: {  // di计算（多次） 计算相关数据
                frequency: 1000000,
                accuracy: 5,
                isWhole: false,
                isCheck: false,
                condition: '或'
            },
            probabilityCalculationID2: false,    //PI计算窗口开关控制
            progressData: g.gContext.progressData,
            loadID: false,   //打开文件时的进度条
            showProgressID: false,   //是否展示失效计算进度条
            showProgressID2: false,  //是否展示概率计算进度条
            failureComputedData: g.gContext.failureComputedData, //失效计算相关数据
            isShowFtId: true,
            isShowImg: true,
            softInfoID: false,
            softInfo: {
                sysInfo: null,
                browserInfo: null,
                softVersion: '1.0.0',
                currentDate: '2024-03-18'
            },
            statusData: g.gContext.statusData,   //状态集
            fileInfoPreview: g.gContext.fileInfoPreview, //预览信息
            fileInfoHoverPreview: g.gContext.fileInfoHoverPreview, //预览信息
            filInfoShow: 1,  //1-显示选中文件的信息 2-显示悬浮文件的信息
            saveAsForm: {    //另存为名字
                name: null,
            },
            saveAsFormRules: {
                name: [{ required: true, message: '请输入树名称', trigger: 'blur' },],
            },
            doorModelList: g.gContext.doorModelList,
            eventModelList: g.gContext.eventModelList,
            criterionImgList: g.gContext.criterionImgList,
            // statusData:g.gContext.statusData
        },
        watch: {
            //缩放比例发生变化
            scale(val) {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    let newVal = parseInt(val);
                    // console.log(g.gContext.svgCanvas.zoom, this.scale);
                    if (newVal <= 25) {
                        g.gContext.svgCanvas.zoom = 0.25
                        this.scale = 25;
                    } else if (newVal > 25 && newVal < 500) {
                        g.gContext.svgCanvas.zoom = newVal / 100;
                        this.scale = newVal;
                    } else if (newVal >= 500) {
                        g.gContext.svgCanvas.zoom = 5;
                        this.scale = 500;
                    } else if (val == '') {
                        g.gContext.svgCanvas.zoom = 0.25
                        this.scale = 25;
                    }
                    gContextController.updateMainSVGSizeUp();
                    gContextController.updateUserLine()
                }, 400);
            },
            openProgress(val) {
                if (val >= 100) {
                    this.loadID = false;
                }
            },
            failureCalculationProgress(val) {
                if (val == 99) {
                    setTimeout(() => {
                        this.showProgressID = false;
                        this.$notify({
                            title: '失效计算完成',
                            type: 'success',
                            duration: 3000
                        });
                    }, 5000);
                }
            },
            probabilityCalculationProgress(val) {
                if (val == 99) {
                    setTimeout(() => {
                        this.showProgressID2 = false;
                        this.$notify({
                            title: '概率计算完成',
                            type: 'success',
                            duration: 3000
                        });
                    }, 2000);
                }
            }
        },
        computed: {
            //项目列表
            projectList() {
                return g.gContext.user.projectList ? g.gContext.user.projectList : [];
            },
            openProgress() {
                return g.gContext.progressData.openProgress;
            },
            failureCalculationProgress() {
                return g.gContext.progressData.failureCalculationProgress;
            },
            probabilityCalculationProgress() {
                return g.gContext.progressData.probabilityCalculationProgress;
            },
            isActive() {
                return false;
            },
            isAutoLayoutMode() {
                return this.statusData.autoLayoutMode;
            }
        },
        methods: {
            showFtId() {
                this.isShowFtId = !this.isShowFtId;
                viewOPController.toggleFtIdShow(this.isShowFtId);
            },
            showImg() {
                this.isShowImg = !this.isShowImg
                dom.setFill(this.isShowImg)
            },
            setCurrentProject(data) {
                // console.log('data', data);
                //设置选中项目的项目名称
                if (data) {
                    this.currentProject = data.name;
                    fileRequest.getUserProject({
                        user: this.user.username,
                        project: this.currentProject
                    }).then(
                        res => {
                            // fileParser.infoParser2(res.info.content);
                            setTimeout(() => {
                                this.fileInfoPreview = g.gContext.fileInfoPreview;
                                this.filInfoShow = 1;
                                // console.log(g.gContext.fileInfoPreview);
                                this.fileOpen()
                            }, 20);
                        }
                    )
                }
            },
            hoverFile(row) {
                // console.log("hover");

                this.currentProject = row.name;
                fileRequest.getUserProject({
                    user: this.user.username,
                    project: this.currentProject
                }).then(
                    res => {
                        fileParser.infoParser3(res.info.content);
                        setTimeout(() => {
                            this.fileInfoHoverPreview = g.gContext.fileInfoHoverPreview;
                            this.filInfoShow = 2;
                            // console.log(g.gContext.fileInfoPreview);
                        }, 20);
                    }
                )
            },
            leaveFile() {
                // console.log("leave");
                this.filInfoShow = 1;
                this.fileInfoHoverPreview = {
                    name: null,      //文件名称
                    version: null,    //版本号
                    level: null,        //保密等级
                    createTime: null,
                    updateTime: null,
                    createUnit: null,  //创建单位
                    founder: "", //创建人
                    contactInformation: null, //联系方式
                    describe: null,  //描述
                    verification: null,  //验证
                    confidence: 1, //置信度
                };
            },
            //新建
            create() {
                window.open("index.html");
            },
            //打开打开窗口
            open() {
                fileController.loadUserProjectList(this.user.username).then((msg) => {
                    this.fileOpenDialogVisible = true;
                }).catch((err) => {
                    this.fileOpenDialogVisible = false;
                });

            },
            //打开文件
            fileOpen() {
                setTimeout(() => {
                    fileController.openUserProject({ user: this.user.username, project: this.currentProject }).then(
                        res => {
                            // nodesOPController.updateTreeData();
                            loading.close();
                        }
                    );
                }, 100);
                this.fileOpenDialogVisible = false;
                const loading = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
            },
            //文件预览
            filePreview() {
                fileRequest.getUserProject({ user: this.user.username, project: this.currentProject }).then(
                )
            },
            //打开保存窗口
            openSave() {
                // serialize.serializeUserModel()
                this.info = {
                    name: "",  //文件名称
                };
                // this.fileSaveType = 1;
                this.fileSaveDialogVisible = true;

            },
            //保存文件
            fileSave(type) {
                if (type == 'save') {
                    this.$refs['saveForm'].validate((valid) => {
                        if (valid) {
                            Utils._debounce(fileController.findUserProjectByName({
                                user: this.user.username,
                                projectName: this.info.name
                            }).then((res) => {
                                // console.log('res', res)
                                if (res) {
                                    fileController.uploadUserProject({ info: this.info }).then((result) => {
                                        if (!result.err) {
                                            // fileController.uploadNodePicture({ info: this.info }).then(() => {
                                            this.fileSaveDialogVisible = false;
                                            this.$message.success('保存成功');
                                            this.statusData.canvasChanged = false;
                                            // });
                                        } else {
                                            //文件保存失败
                                            this.$message.error('图片保存失败');
                                        }
                                    });
                                } else {
                                    this.$message.error('项目已存在');
                                }
                            }).catch((err) => {
                                console.log('err', err)
                                this.$message.error('项目已存在');
                            })
                            );


                        } else {
                            return false;
                        }
                    });
                } else {
                    this.$refs['saveAsForm'].validate((valid) => {
                        if (valid) {
                            Utils._debounce(fileController.findUserProjectByName({
                                user: this.user.username,
                                projectName: this.saveAsForm.name
                            }).then((res) => {
                                if (res) {
                                    fileController.uploadUserProject({ info: this.saveAsForm }).then((result) => {
                                        if (!result.err) {


                                            // fileController.uploadNodePicture({ info: this.saveAsForm }).then(() => {
                                            //     this.saveAsID = false;
                                            //     this.$message.success('另存为成功');
                                            //     setTimeout(() => {
                                            //         fileController.openUserProject({
                                            //             user: this.user.username,
                                            //             project: this.saveAsForm.name
                                            //         }).then(
                                            //             res => {
                                            //                 // fileController.loadNodePic({
                                            //                 //     user: this.user.username,
                                            //                 //     project: this.saveAsForm.name
                                            //                 // }).then(() => {

                                            //                 // }).catch(() => {

                                            //                 // });
                                            //                 nodesOPController.updateTreeData();
                                            //                 loading.close();
                                            //             }
                                            //         );
                                            //     }, 100);
                                            //     this.fileOpenDialogVisible = false;
                                            //     const loading = this.$loading({
                                            //         lock: true,
                                            //         text: 'Loading',
                                            //         spinner: 'el-icon-loading',
                                            //         background: 'rgba(0, 0, 0, 0.7)'
                                            //     });
                                            // });
                                        } else {
                                            //文件保存失败
                                            this.$message.error('另存为失败');
                                        }
                                    });
                                } else {
                                    this.$message.error('项目已存在');
                                }
                            }).catch(() => {
                                this.$message.error('项目已存在');
                            })
                            );


                        } else {
                            return false;
                        }
                    });
                }


            },

            extractFtID(str) {
                var reg = /\[(.*?)\]/gi;
                var tmp = str.match(reg);
                tmp = Array.from(new Set(tmp));
                var kk = [];
                if (tmp) {
                    for (var i = 0; i < tmp.length; i++) {
                        kk.push(tmp[i].replace(reg, "$1"))
                    }
                }
                // console.log(kk);
                return kk;
            },
            //另存为
            saveAs() {
                this.saveAsForm = JSON.parse(JSON.stringify(g.gContext.fileInfo));
                this.saveAsForm.name = null;
                this.saveAsID = true;
            },
            //打印
            printing() {
                //测试
            },
            //关闭
            close() {

            },
            //粘贴
            paste() {
                nodesOPController.paste();
                gContextController.updateMainSVGSizeUp();
                nodesOPController.updateTreeData();
            },
            //剪切
            cut() {

            },
            //复制
            copy() {
                nodesOPController.copy();
            },
            //删除
            delete_() {
                nodesOPController._delete();
                gContextController.updateMainSVGSizeUp();
                nodesOPController.updateTreeData();
            },
            //布局
            autoLayout() {
                this.statusData.autoLayoutMode = !this.statusData.autoLayoutMode;
                this.statusData.canvasChanged = true;
                if (this.statusData.autoLayoutMode) {
                    // const currentIndex=this.statusData.currentTreeID
                    nodesOPController.nodeLayout(this.statusData.currentTreeID);
                    gContextController.updateMainSVGSizeUp();
                    nodesOPController.openAutoLayoutMode();
                }
            },
            //缩小
            narrow() {
                if (this.scale - 25 <= 25) {
                    this.scale = 25;
                    g.gContext.svgCanvas.zoom = 0.25;
                } else {
                    this.scale = this.scale - 25;
                }
            },
            //放大
            enlarge() {
                if (this.scale + 25 >= 500) {
                    this.scale = 500;
                    g.gContext.svgCanvas.zoom = 5;
                } else {
                    this.scale = this.scale + 25;
                }
            },
            ribbonMouseMove(e) {
                this.gContext.mouseCurrentLocation = this.gContext.MouseLocation.RIBBON;

            },
            // 新di计算
            diCalculation() {
                computeController.diCalculation();
            },
            // 分析计算
            analysisCalculation() {
                setTimeout(() => {
                    const warnMsgList = computeController.analysisCalculation();
                    if (warnMsgList && warnMsgList.length > 0) {
                        const str = warnMsgList.join('<br/>')
                        this.$notify({
                            title: '计算有误',
                            dangerouslyUseHTMLString: true,//允许插入html
                            message: str,
                            duration: 0
                        });
                    }
                    loading.close()
                }, 100)

                const loading = this.$loading({
                    lock: true,
                    text: '计算进度52%',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
            },
            //打开配置项窗口
            openOptionSettings() {
                this.optionSettings = true
            },
            // 改变判据显示方式
            changeCriterionWay() {

            },
            //打开di计算(单次)窗口
            openFailureCalculation() {
                this.failureCalculationID = true;
                //开始失效计算
                computeController.failureCalculation();
            },
            //打开di计算(多次)窗口
            openProbabilityCalculation() {
                this.probabilityCalculationID = true;
            },
            //开始di计算 
            failureCalculation() {
                this.failureCalculationID = false;
                this.showProgressID = true;
                let timer = null;
                for (let i = 0; i < 101; i++) {
                    timer = setTimeout(() => {
                        g.gContext.progressData.failureCalculationProgress = i;
                        clearTimeout(timer);
                    }, 100);
                }
            },
            //开始di计算（多次）
            probabilityCalculation() {
                this.probabilityCalculationID = false;
                g.gContext.statusData.isShowTimeline = true;
                g.gContext.statusData.computeStatus = 2;
                viewOPController.updateCanvasHeight(60);
                computeController.proCalculation();
            },
            //停止di计算（多次）
            stopProbabilityCalculation() {
                // g.gContext.statusData.computeStatus = 0;
                computeController.computeStop();
            },
            //概率计算2
            probabilityCompute() {
                if (g.gContext.statusData.computeStatus != 3) {
                    this.probabilityCalculationID = false;
                    g.gContext.statusData.computeStatus = 3;
                    this.showProgressID2 = true;
                    let timer = null;
                    for (let i = 0; i < 101; i++) {
                        timer = setTimeout(() => {
                            g.gContext.progressData.probabilityCalculationProgress = i;
                            clearTimeout(timer);
                        }, 100);
                    }
                    computeController.probabilityCalculation();
                } else {
                    this.probabilityCalculationID2 = true;
                }
            },
            //退出计算
            quitCompute() {
                computeController.computeStop();
                g.gContext.statusData.modeID = 1;
                g.gContext.rootPosition.show = true;
                viewOPController.showMainSVG();
                this.probabilityCalculationID = false;
                this.probabilityCalculationID2 = false;
                g.gContext.statusData.computeStatus = 0;
                g.gContext.statusData.isShowTimeline = false;
                g.gContext.statusData.isCompute = false;
                g.gContext.failureComputedData.computedRenderList = ['notWave', 'yellowWave', 'orangeWave', 'redWave', 'crimsonWave'];
                g.gContext.computeResult = [];
                viewOPController.calculationResultsRenderRemoveWave();
            },
            //获得系统信息
            getOSAndBrowser() {
                var os = navigator.platform;
                var userAgent = navigator.userAgent;
                // console.log(userAgent);
                var info = "";
                var tempArray = "";
                if (os.indexOf("Win") > -1) {
                    if (userAgent.indexOf("Windows NT 5.0") > -1) {
                        info += "Windows 2000";
                    } else if (userAgent.indexOf("Windows NT 5.1") > -1) {
                        info += "Windows XP";
                    } else if (userAgent.indexOf("Windows NT 5.2") > -1) {
                        info += "Windows 2003";
                    } else if (userAgent.indexOf("Windows NT 6.0") > -1) {
                        info += "Windows Vista";
                    } else if (userAgent.indexOf("Windows NT 6.1") > -1 || userAgent.indexOf("Windows 7") > -1) {
                        info += "Windows 7";
                    } else if (userAgent.indexOf("Windows NT 6.2") > -1 || userAgent.indexOf("Windows NT 6.3") > -1 || userAgent.indexOf("Windows 8") > -1) {
                        info += "Windows 8";
                    } else if (userAgent.indexOf("Windows NT 6.4") > -1 || userAgent.indexOf("Windows NT 10") > -1) {
                        info += "Windows 10";
                    } else {
                        info += "Other";
                    }
                } else if (os.indexOf("Mac") > -1) {
                    info += "Mac";
                } else if (os.indexOf("X11") > -1) {
                    info += "Unix";
                } else if (os.indexOf("Linux") > -1) {
                    info += "Linux";
                } else {
                    info += "Other";
                }
                info += "/";
                if (/[Ff]irefox(\/\d+\.\d+)/.test(userAgent)) {
                    tempArray = /([Ff]irefox)\/(\d+\.\d+)/.exec(userAgent);
                    info += tempArray[1] + tempArray[2];
                } else if (/[Tt]rident(\/\d+\.\d+)/.test(userAgent)) {
                    tempArray = /([Tt]rident)\/(\d+\.\d+)/.exec(userAgent);
                    if (tempArray[2] === "7.0") {
                        tempArray[2] = "11";
                    } else if (tempArray[2] === "6.0") {
                        tempArray[2] = "10";
                    } else if (tempArray[2] === "5.0") {
                        tempArray[2] = "9";
                    } else if (tempArray[2] === "4.0") {
                        tempArray[2] = "8";
                    }
                    tempArray[1] = "IE";
                    info += tempArray[1] + tempArray[2];
                } else if (/[Cc]hrome\/\d+/.test(userAgent)) {
                    tempArray = /([Cc]hrome)\/(\d+)/.exec(userAgent);
                    info += tempArray[1] + tempArray[2];
                } else if (/[Vv]ersion\/\d+\.\d+\.\d+(\.\d)* *[Ss]afari/.test(userAgent)) {
                    tempArray = /[Vv]ersion\/(\d+\.\d+\.\d+)(\.\d)* *([Ss]afari)/.exec(userAgent);
                    info += tempArray[3] + tempArray[1];
                } else if (/[Oo]pera.+[Vv]ersion\/\d+\.\d+/.test(userAgent)) {
                    tempArray = /([Oo]pera).+[Vv]ersion\/(\d+)\.\d+/.exec(userAgent);
                    info += tempArray[1] + tempArray[2];
                } else {
                    info += "unknown";
                }
                this.softInfo = {
                    sysInfo: info.split('/')[0],
                    browserInfo: info.split('/')[1],
                    softVersion: '1.0.0',
                    currentDate: new Date().Format("yyyy-MM-dd")
                }
                this.softInfoID = true;
                // console.log(info);
                // return info;
            },
            // 切换判据显示方式关掉上一个方式的窗口
            changeShowWay(value) {
                // console.log(value)
                if (value) {//切为弹出式
                    let criterionPopList = gContextDao.getGContextProp("criterionPopList");

                    if (criterionPopList.length != 0) {
                        criterionPopList.length = 0
                        gContextController.IncreaseMainSVGSize(0, this.statusData.isShowBottomMsg ? -180 : -80);
                        g.gContext.userLineMap = {};
                    }

                    this.statusData.isShowCriterionPop = false
                    gContextDao.setGContextProp("statusData", this.statusData);

                    dom.deleteUserLine()

                    // 关闭闪烁效果
                    const animateElements = document.getElementsByTagName("animate")
                    for (const oldAnimateElement of animateElements) {
                        if (oldAnimateElement.getAttribute("values") === "1;0;1") {
                            oldAnimateElement.parentNode.classList.remove('redSmallCircle');
                            oldAnimateElement.setAttribute("values", "0");
                            oldAnimateElement.setAttribute("repeatCount", "0");
                            oldAnimateElement.endElement();
                        }
                    }
                } else {//切为排列式
                    this.statusData.isShowProperty = false
                    gContextDao.setGContextProp("statusData", this.statusData);
                    let attrData = gContextDao.getGContextProp("attrData");
                    attrData.iscriterion = false
                    attrData.criterionIndex = -1

                    // 关闭闪烁效果
                    const oldDrawerID = g.gContext.chartData.drawerID
                    const oldAnimateElement = document.getElementById(oldDrawerID);
                    if (oldAnimateElement) {
                        oldAnimateElement.parentNode.classList.remove('redSmallCircle');
                        oldAnimateElement.setAttribute("values", "0");
                        oldAnimateElement.setAttribute("repeatCount", "0");
                        oldAnimateElement.endElement();
                    }
                    g.gContext.chartData.drawerID = null;
                }
            },
            // 打开PDF文件
            openPDF() {
                window.open('assets/test.pdf', '_blank');
            }
        }
    });
};