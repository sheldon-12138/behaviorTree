import { g } from "../../../js/structure/gContext.js"
import gContextController from "../../../js/controller/gContextController.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";
import viewOPController from "../../../js/controller/viewOPController.js";
import fileController from "../../../js/controller/fileController.js";
import Utils from "../../../js/utils/utils.js";

export function treeVm() {
    new Vue({
        el: '#treeList',
        data() {
            return {
                fileList: [],
                fileContent: '',

                project: [{
                    label: 'Project'
                }],
                model: g.gContext.modelList,
                defaultProps: {
                    children: 'children',
                    label: 'label'
                },
                openID2: true,
                currentID: 1,
                visible: false,
                statusData: g.gContext.statusData,
                treeData: g.gContext.entityTree,
                attrData: g.gContext.attrData,
                width: 270,
                startWidth: 0,   //保存拖拽开始时的width值
                dragActive: false,   //拖拽状态
                dragStartCoordinateX: 0,   //保存拖拽开始的位置
                dragMoveCoordinateX: 0,  //拖拽移动的位置
            };
        },
        updated() {
            // if (g.gContext.attrData.entity.id) {
            //     this.$refs.tree.setCurrentKey(g.gContext.attrData.entity.id);
            //     let container = $('#content-el_tree');
            //     let scrollTo = $('#' + g.gContext.attrData.entity.id + '_tree');
            //     if (scrollTo.offset().top) {
            //         container.animate({
            //             scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
            //         });
            //     }
            // }
        },
        watch: {
            // dragMoveCoordinateX(newVal){
            //     let w = this.width + (newVal - this.dragStartCoordinateX);
            //     this.width = w;
            //     console.log(this.width);
            // }
        },
        methods: {
            triggerFileInput() {
                this.$refs.fileInput.click();
            },
            triggerFolderInput() {
                this.$refs.folderInput.click();
            },
            // 打开本地项目
            handleFileChange(event) {
                const files = event.target.files;
                console.log(files);
                if (files.length == 1) {//xml单文件
                    const file = files[0];
                    // const lastDotIndex = file.name.lastIndexOf('.')
                    const fileName = Utils.splitFileName(file.name)[0];
                    // const type = file.name.substring(lastDotIndex + 1);

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        fileController.analysisXml({ xml: e.target.result }).then((result) => {
                            // console.log(result)
                            if (result.flag) {
                                const treeName = JSON.parse(result.content).root.BehaviorTree[0].$.ID;
                                this.$set(this.project[0], 'children', [{
                                    label: fileName,
                                    children: [{
                                        label: treeName,
                                    }]
                                }]);
                            }
                        }).catch((err) => {
                            console.log('解析失败', err);
                            this.$message.error('解析失败');
                        })
                    }
                    reader.readAsText(file);
                } else if (files.length > 1) {
                    for (let key in files) {
                        if (key == 'length') continue;

                        const file = files[key];
                        const nameArr = Utils.splitFileName(file.name);
                        if (nameArr[1] == 'btproj') {
                        }
                    }
                    // files.forEach(file => {
                    //     console.log(file.type);
                    // });
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
            },
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
            importNode() {
                // 删除最后一个节点
                if (this.model.length > 0) {
                    this.model.pop();
                } else {
                    this.$message.warning('没有节点可以删除');
                }
            },
            allowDrop(draggingNode, dropNode, type) {
                //仅允许叶子结点可拖动

                return dropNode.data.children === undefined || dropNode.data.children.length === 0 || type == 'inner';
            },
            handleDragStart(node, event) {
                // 仅当节点是叶节点时才允许拖动
                if (node.data.children && node.data.children.length > 0) {
                    event.preventDefault();
                }
            },



            // ——————————————————————————————————————————————————————————————————————————————————
            //增加节点
            append(data, type, node) {
                gContextController.createChildNode(data.data.ftID, type);
                nodesOPController.updateLayer();
                nodesOPController.updateTreeData();
            },
            //删除节点
            remove(node, data) {
                nodesOPController.deleteTreeByFtID(data.data.ftID);
                nodesOPController.updateTreeData();
            },
            //是否允许被拖拽
            allowDrag(node) {
                if (node.data.type == 'EVENT_TOP') {
                    return false;
                } else {
                    return true;
                }
            },

            //在树中选中节点，同步在画板中聚焦
            tagCollapse(id) {
                console.log(g.gContext.entityTree);
                gContextController.focusEntityByID(id);
                viewOPController.updateOperationStatus();
            },
            //节点拖拽函数
            nodeDrop(draggingNode, dropNode) {
                gContextController.changeNodeParent(draggingNode.data.id, dropNode.data.id);
            },
            dragStart(e) {
                // console.log(e);
                this.dragActive = true;
                this.dragStartCoordinateX = e.clientX;
                this.startWidth = this.width;
                window.addEventListener('mousemove', this.dragMove);
                window.addEventListener('mouseup', this.dragEnd);
            },
            dragEnd() {
                this.dragActive = false;
                window.removeEventListener("mousemove", this.dragMove);
                window.removeEventListener('mouseup', this.dragEnd);

            },
            dragMove(e) {
                this.width = this.startWidth + (e.clientX - this.dragStartCoordinateX);
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
