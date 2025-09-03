import { g } from "../../../js/structure/gContext.js"
import gContextController from "../../../js/controller/gContextController.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";

export function treeVm() {
    new Vue({
        el: '#treeList',
        data() {
            return {
                filterNodeText: '',
                fileContents: [],
                pathArr: [],//项目文件中存的路径数组

                project: g.gContext.project,
                model: g.gContext.modelList,
                defaultProps: {
                    children: 'children',
                    label: 'label'
                },
                statusData: g.gContext.statusData,
                attrData: g.gContext.attrData,

                treeMap: g.gContext.treeMap,
                tabsArr: g.gContext.tabsArr,

                addTreeVisible: false,
                newTreeName: '',
                addTreeProj: '',
            };
        },
        watch: {
            filterNodeText(val) {
                this.$refs.tree.filter(val);
            }
        },
        methods: {
            // 新增树的前提
            addTreePre(_, data) {
                // console.log(_, data)
                this.addTreeProj = data.label;
                this.addTreeVisible = true;
            },
            // 新增树
            addTree() {
                this.addTreeVisible = false;

                // 不为空时、无重复时
                if (gContextController.checkTreeName(this.newTreeName)) {
                    alert("树名称已存在，请重新输入");
                } else {
                    gContextController.createNewTree(this.newTreeName, this.addTreeProj);
                }
                this.newTreeName = "";
                this.addTreeProj = '';
            },
            startEdit(node, data) {
                data._oldLabel = data.label; // 缓存旧名
                data.isEditing = true;
            },
            // 修改xml名/树名
            editTreeName(node, data) {
                let trimmedLabel = data.label.trim();
                // 为空，恢复旧值
                if (!trimmedLabel) {
                    this.$message.warning('树名称不能为空');
                    data.label = data._oldLabel || 'Unnamed';
                    data.isEditing = false;
                    return;
                }

                // 判断是否重名
                if (gContextController.checkTreeName(trimmedLabel)) {
                    this.$message.warning('树名称重复，请重新输入');
                    data.label = data._oldLabel || 'Unnamed';
                    data.isEditing = false;
                    return;
                }

                data.label = trimmedLabel;
                data.isEditing = false;

                if (node.level == 1) {//修改xml文件名
                    // 暂无需其他操作
                } else {//修改树名
                    this.treeMap[data.treeId].ID = trimmedLabel;
                    const tab = this.tabsArr.find(tab => tab.id === data.treeId);
                    if (tab) tab.name = trimmedLabel;

                    // 修改树中根节点的modelType 即改树名
                    nodesOPController.editTreeName(this.treeMap[data.treeId].topNodeId,data._oldLabel,trimmedLabel);
                }
            },
            // 删除树
            delteTree(node, data) {
                // 删除project中的树
                const parent = node.parent;
                const children = parent.data.children;
                const index = children.findIndex(d => d.treeId === data.treeId);
                children.splice(index, 1);

                // 删除tab中的树
                const tabIndex = this.tabsArr.findIndex(tab => tab.id === data.treeId);
                if(tabIndex!=-1)nodesOPController.closeTab(tabIndex);

                // 删除内存中的树
                nodesOPController.deleteTree(data.treeId);

                // 删除树相关的自定义节点

            },
            // 过滤节点
            filterNode(value, data) {
                if (!value) return true;
                return data.ID.indexOf(value) !== -1;
            },
            //选中树
            handleTreeClick(node, selected, event) {
                // console.log(node, selected, event)
                if (node.treeId) {
                    const startTimeStamp = new Date().getTime();  // 设置计算开始时间戳为当前时间
                    nodesOPController.selectedTree(node.treeId, node.label);
                    const endTimeStamp = new Date().getTime();  // 获取结束时间
                    const totalDuration = (endTimeStamp - startTimeStamp) / 1000 + 's';  // 计算总耗时 乘以7

                    this.$message.success(`打开成功,用时${totalDuration}`);
                }
            },
            // 右键子节点 设置为主键
            rightClick(event, data, node) {
                // console.log('event', event,'data', data, 'node',node)
                if (node.isLeaf && data.label != 'Project') {

                    if (data.isMainTree == true) {//取消主树
                        data.isMainTree = false;
                        this.treeMap[data.treeId].isMainTree = false;
                    } else {
                        const parent = node.parent;
                        const siblings = parent ? parent.data.children : this.project; // 如果是根节点
                        this.clearIsMain(siblings); // 只清除同级节点状态
                        data.isMainTree = true;
                        this.treeMap[data.treeId].isMainTree = true;
                    }
                }
            },
            // 清除兄弟节点主树状态
            clearIsMain(siblingNodes) {
                siblingNodes.forEach(node => {
                    if (node.isMainTree) {
                        node.isMainTree = false;
                    }
                    // 同时更新 treeMap 中对应的节点
                    if (this.treeMap[node.treeId]) {
                        this.treeMap[node.treeId].isMainTree = false;
                    }
                });
            },
            // 增加新节点
            addNode() {
                this.statusData.isShowProperty = true
                this.statusData.attrID = 2;
                this.attrData.model = null;
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
