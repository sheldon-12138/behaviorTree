import { g } from "../../../js/structure/gContext.js"
import gContextController from "../../../js/controller/gContextController.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";
import viewOPController from "../../../js/controller/viewOPController.js";
import fileController from "../../../js/controller/fileController.js";
import fileParser from "../../../js/parser/fileParser.js";
import Utils from "../../../js/utils/utils.js";

export function treeVm() {
    new Vue({
        el: '#treeList',
        data() {
            return {
                fileContents: [],
                pathArr: [],//项目文件中存的路径数组

                project: [{
                    label: 'Project',
                    children: []
                }],
                model: g.gContext.modelList,
                defaultProps: {
                    children: 'children',
                    label: 'label'
                },

                statusData: g.gContext.statusData,
                attrData: g.gContext.attrData,

                treeMap: g.gContext.treeMap,
            };
        },

        methods: {
            //选中树
            handleTreeClick(node, selected, event) {
                // console.log(node, selected, event)
                if (node.treeId) {
                    nodesOPController.selectedTree(node.treeId, node.label)
                }
            },
            triggerFileInput() {
                this.$refs.fileInput.click();
            },
            triggerFolderInput() {
                this.$refs.folderInput.click();
            },
            // 打开本地项目
            handleFileChange(event) {
                const files = event.target.files;
                // console.log(files);
                if (files.length == 1) {//xml单文件
                    const file = files[0];
                    const fileName = Utils.splitFileName(file.name)[0];
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.project[0].children = [];
                        fileController.analysisXml({ xml: e.target.result }).then((result) => {
                            // console.log(result) 
                            if (result.flag) {
                                // const treeName = JSON.parse(result.content).root.BehaviorTree[0].$.ID;
                                // console.log(this.treeMap)

                                this.$set(this.project[0], 'children', [{
                                    label: fileName,
                                    children: []
                                }]);
                                // console.log(this.treeMap)
                                // this.project[0].children[0].children.length = 0
                                for (let key in this.treeMap) {
                                    this.project[0].children[0].children.push({
                                        treeId: key,
                                        label: this.treeMap[key].ID,
                                    })
                                }

                            }
                        }).catch((err) => {
                            console.log('解析失败', err);
                            this.$message.error('解析失败');
                        })
                    }
                    reader.readAsText(file);
                } else if (files.length > 1) {
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
                let flag = true;
                pathArr.forEach(item => {
                    const index = this.fileContents.findIndex(file => file.fileName == item);
                    if (index != -1) {
                        const { xml, name } = this.fileContents[index];
                        fileController.analysisXml({ xml, status: 'forXml', name }).then((result) => {
                            if (result.treeNameArr.length > 0) {
                                this.project[0].children.push({
                                    label: name,
                                    children: result.treeNameArr
                                })
                            }
                        }).catch((err) => {
                            console.log('解析失败', err);
                        })
                    }
                    else {
                        if (flag) flag = false
                        console.log(`${item}不存在`)
                    }
                })
                if (flag) {//项目文件中全部路径都存在，才改项目名
                    this.project[0].label = projectName
                }
            },

            downloadFile() {
                const fileInput = document.getElementById('fileInput');
                const file = fileInput.files[0];
                const url = URL.createObjectURL(file);

                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                a.remove();
            },
            // 增加新节点
            addNode() {
                this.statusData.isShowProperty = true
                this.statusData.attrID = 2;
                this.attrData.model = null;
            },
            importNode() { },
            // 保存项目
            saveProject() {
                this.statusData.isShowProperty = true
                this.statusData.attrID = 5;
            },
            // 保存项目
            saveProject1() {
                this.statusData.isShowProperty = true
                this.statusData.attrID = 6;
            },


            // ——————————————————————————————————————————————————————————————————————————————————

            //节点拖拽函数
            nodeDrop(draggingNode, dropNode) {
                gContextController.changeNodeParent(draggingNode.data.id, dropNode.data.id);
            },

            startDrag(event) {
                this.isDragging = true;
                this.startY = event.clientY;
                this.startHeight = this.$refs.topPane.clientHeight;
                document.addEventListener('mousemove', this.onDrag);
                document.addEventListener('mouseup', this.stopDrag);
            },
            onDrag(event) {
                if (!this.isDragging) return;
                const delta = event.clientY - this.startY;
                const newHeight = this.startHeight + delta;
                this.$refs.topPane.style.height = `${newHeight}px`;
                this.$refs.bottomPane.style.height = `calc(100% - ${newHeight + 65}px)`;
            },
            stopDrag() {
                this.isDragging = false;
                document.removeEventListener('mousemove', this.onDrag);
                document.removeEventListener('mouseup', this.stopDrag);
            }
        }
    });
}
