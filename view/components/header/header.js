import { g } from "../../../js/structure/gContext.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";
import dom from "../../../js/viewModel/dom.js";
import fileController from "../../../js/controller/fileController.js";
import Utils from "../../../js/utils/utils.js";
import gContextController from "../../../js/controller/gContextController.js";
import draggable from './draggable.js';
import gContextDao from "../../../js/dao/gContextDao.js";

export function headerVm() {
    new Vue({
        el: '#header',
        directives: {
            draggable,
        },
        data: {
            //当前打开的项目列表
            project: g.gContext.project,
            treeMap: g.gContext.treeMap,

            isAdmin: g.gContext.user.role,
            // 导出表单验证规则
            saveFormRules: {
                name: [
                    { required: true, message: '请输入项目名称', trigger: 'blur' },
                    {
                        validator: (rule, value, callback) => {
                            const variableNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
                            const reservedWords = ['class', 'function', 'var', 'const', 'let', 'if', 'else', 'for', 'while', 'return']; // 可扩展
                            if (!variableNameRegex.test(value)) {
                                callback(new Error('文件名称只能包含字母、数字、下划线，且不能以数字开头'));
                            } else if (reservedWords.includes(value)) {
                                callback(new Error('文件名称不能为保留关键字'));
                            } else {
                                callback();
                            }
                        },
                        trigger: 'blur'
                    }
                ],
                exportProject: [{ required: true, message: '请选择一个需要导出的项目', trigger: 'blur' },]
            },

            //粘贴位置随粘贴次数改变,
            optionSettings: false,//选项配置项窗口
            fileExportDialogVisible: false,   //文件保存窗口
            ip: window.location.hostname,
            port: window.location.port,
            user: g.gContext.user,
            info: {
                topIdArr: [],
                treeIdArr: [],
                name: 'xx树',
                mainTreeName: '',
            },
            exportProject: null,
            scale: 100,
            timeout: null,
            softInfoID: false,
            softInfo: {
                sysInfo: null,
                browserInfo: null,
                softVersion: '1.0.0',
                currentDate: '2024-03-18'
            },
            statusData: g.gContext.statusData,
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
                }, 400);
            },
        },
        methods: {
            //新建
            create() {
                window.open("index.html");
            },
            // 打开导出窗口
            openExport() {
                this.info = {
                    name: "",  //文件名称
                    topIdArr: [],
                    treeIdArr: [],
                    mainTreeName: ''
                };
                this.exportProject = null;
                this.fileExportDialogVisible = true;
                // console.log('treeMap', this.treeMap)
            },
            // 导出时选中项目
            selectProject(project) {
                const { label, children } = project;
                this.info.name = label;

                let topIdArr = [], treeIdArr = [];
                let mainTreeName = '';
                children.forEach(item => {
                    topIdArr.push(item.topNodeId);
                    treeIdArr.push(item.treeId);
                    if (item.isMainTree) {
                        mainTreeName = item.label;
                    }
                })

                this.info.topIdArr = topIdArr;
                this.info.treeIdArr = treeIdArr;
                this.info.mainTreeName = mainTreeName;
            },
            //导出zip文件
            fileExport() {
                // console.log('info', this.info);
                const startTimeStamp = new Date().getTime();  // 设置计算开始时间戳为当前时间
                fileController.uploadUserProject({ info: this.info }).then((result) => {
                    console.log('result', result)
                    // if (!result.err) {
                    //     this.fileExportDialogVisible = false;
                    //     const fileNameBase = this.info.name

                    //     const zip = new JSZip();
                    //     // 添加文件到 zip 下载 XML 文件
                    //     if (result.treeContent) {
                    //         zip.file(`config/${fileNameBase}.xml`, result.treeContent);
                    //     }

                    //     // 添加静态资源文件
                    //     if (result.staticFiles && result.staticFiles.length > 0) {
                    //         result.staticFiles.forEach(file => {
                    //             const binary = atob(file.content); // base64 -> binary string
                    //             const len = binary.length;
                    //             const bytes = new Uint8Array(len);
                    //             for (let i = 0; i < len; i++) {
                    //                 bytes[i] = binary.charCodeAt(i);
                    //             }
                    //             zip.file(`${file.path}`, bytes); // 保持路径结构
                    //         });
                    //     }

                    //     // main.CPP 文件
                    //     if (result.cppMainContent) {
                    //         zip.file(`${fileNameBase}/main.cpp`, result.cppMainContent);
                    //     }
                    //     // 同名.CPP 文件
                    //     if (result.cppContent) {
                    //         zip.file(`${fileNameBase}/${fileNameBase}.cpp`, result.cppContent);
                    //     }
                    //     // 同名.vcxproj 文件
                    //     if (result.vcxprojContent) {
                    //         zip.file(`${fileNameBase}/${fileNameBase}.vcxproj`, result.vcxprojContent);
                    //     }
                    //     // 同名.vcxproj.filters 文件
                    //     if (result.filtersContent) {
                    //         zip.file(`${fileNameBase}/${fileNameBase}.vcxproj.filters`, result.filtersContent);
                    //     }
                    //     // 同名.vcxproj.user 文件
                    //     if (result.userContent) {
                    //         zip.file(`${fileNameBase}/${fileNameBase}.vcxproj.user`, result.userContent);
                    //     }
                    //     // 同名.h 文件
                    //     if (result.hContent) {
                    //         zip.file(`${fileNameBase}/${fileNameBase}.h`, result.hContent);
                    //     }
                    //     // dataType.h 文件
                    //     if (result.dataTypeH) {
                    //         zip.file(`${fileNameBase}/DataType.h`, result.dataTypeH);
                    //     }
                    //     // Node文件夹下所有Node.cpp、Node.h
                    //     if (result.nodeStrList && result.nodeStrList.length > 0) {
                    //         result.nodeStrList.forEach(nodeStr => {
                    //             zip.file(`${fileNameBase}/Node/${nodeStr.nodeName}.cpp`, nodeStr.cpp);
                    //             zip.file(`${fileNameBase}/Node/${nodeStr.nodeName}.h`, nodeStr.h);
                    //         });
                    //     }

                    //     // 生成 zip 文件内容
                    //     zip.generateAsync({ type: 'blob' }).then(blob => {
                    //         // 创建下载链接
                    //         const zipUrl = URL.createObjectURL(blob);
                    //         const zipLink = document.createElement('a');
                    //         zipLink.href = zipUrl;
                    //         zipLink.download = `${fileNameBase}.zip`;
                    //         document.body.appendChild(zipLink);
                    //         zipLink.click();

                    //         // 清理资源
                    //         setTimeout(() => {
                    //             document.body.removeChild(zipLink);
                    //             URL.revokeObjectURL(zipUrl);
                    //         }, 100);

                    //         const endTimeStamp = new Date().getTime();
                    //         const totalDuration = (endTimeStamp - startTimeStamp) / 1000 + 's';

                    //         this.$message.success(`导出成功，用时${totalDuration}`);
                    //         this.statusData.canvasChanged = false;
                    //     }).catch((error) => {
                    //         console.error('压缩包创建失败:', error);
                    //         this.$message.error('压缩包创建失败');
                    //     });
                    // } else {
                    //     //文件保存失败
                    //     this.$message.error('保存失败');
                    // }
                });
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
                nodesOPController.copy(this.statusData.currentTreeID);
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
            //打开配置项窗口
            openOptionSettings() {
                this.optionSettings = true
            },
            // 显隐节点端口
            changeShowPort(value) {
                dom.setPortShow(value)
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
            // 登出
            logOut() {
                this.$confirm('确认退出登录？')
                    .then(_ => {
                        fetch('/logout', {
                            method: 'GET',
                            credentials: 'include'
                        }).then(() => {
                            window.location.href = '/'; // 登出后跳转登录
                        });
                    })
                    .catch(_ => { });
            },
            // 用户管理
            userManagement() {
                window.location.href = '/manage';
                // window.open("/public/pages/manage/manage.html");
            },
            triggerFileInput() {
                this.$refs.fileInput.click();
            },
            triggerFolderInput() {
                this.$refs.folderInput.click();
            },
            // 打开本地项目
            handleFileChange(event) {
                // const startTimeStamp = new Date().getTime();  // 设置计算开始时间戳为当前时间
                const files = event.target.files;
                // console.log(files);
                if (files.length == 1) {//xml单文件
                    const file = files[0];
                    const fileName = Utils.splitFileName(file.name)[0];
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.project[0].children = [];
                        fileController.analysisXml({ xml: e.target.result })
                            .then((result) => {
                                // console.log(result)
                                if (result.flag) {
                                    this.project[0].label = fileName;

                                    this.project[0].children.length = 0
                                    for (let key in this.treeMap) {
                                        this.project[0].children.push({
                                            treeId: key,
                                            isMainTree: this.treeMap[key].isMainTree,
                                            label: this.treeMap[key].ID,
                                            topNodeId: this.treeMap[key].topNodeId,
                                            isEditing: false
                                        })
                                    }
                                    // console.log(this.project[0])
                                }
                            }).catch((err) => {
                                console.log('解析失败', err);
                                this.$message.error('解析失败');
                            })
                    }
                    reader.readAsText(file);
                } else if (files.length > 1) {

                    //清空画布树 + 删除复制的子树




                    // project和tabs等都要清除

                    gContextDao.clearContext();
                    nodesOPController.clearTreeDom();
                    // nodesOPController.clearTreeDom()
                    // deleteSubTree()
                    this.fileContents = []; // 清空上次的文件内容

                    for (let file of files) {
                        const nameArr = Utils.splitFileName(file.name);

                        const reader = new FileReader();
                        reader.onload = (e) => {
                            if (nameArr[1] == 'btproj') {
                                fileController.analysisXml({ xml: e.target.result, status: 'proj' }).then((result) => {
                                    this.handerPathArr(result.pathArr, result.projectName)
                                }).catch((err) => {
                                    console.log('解析失败', err);
                                })
                            }
                            else {
                                this.fileContents.push({
                                    fileName: file.name,
                                    name: nameArr[0],
                                    xml: e.target.result
                                });
                            }
                        };

                        reader.onerror = (e) => {
                            console.error(`Error reading file ${file.name}: ${e.target.error}`);
                        };
                        reader.readAsText(file);
                    }
                    // console.log(this.fileContents);
                }
            },

            // 比较 项目文件的路径数组 和 文件夹下的xml文件
            handerPathArr(pathArr, projectName) {
                // console.log(pathArr)
                // console.log(this.fileContents)
                this.project.length = 0;
                pathArr.forEach(item => {
                    const index = this.fileContents.findIndex(file => file.fileName == item);
                    if (index != -1) {
                        const { xml, name } = this.fileContents[index];
                        fileController.analysisXml({ xml, status: 'forXml', name }).then((result) => {
                            // console.log(result.treeNameArr)
                            if (result.treeNameArr.length > 0) {

                                this.project.push({
                                    label: name,
                                    children: result.treeNameArr,
                                    isEditing: false
                                })
                                // this.project[0].children.push({
                                //     label: name,
                                //     children: result.treeNameArr
                                // })
                            }
                        }).catch((err) => {
                            console.log('解析失败', err);
                        })
                    }
                    else {
                        console.log(`${item}不存在`)
                    }
                })
            },
        }
    });
};