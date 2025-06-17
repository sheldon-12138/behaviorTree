import { g } from "../../../js/structure/gContext.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";

export function tabVm() {
    new Vue({
        el: '#tabList',
        data() {
            return {
                tabsArr: g.gContext.tabsArr,
                statusData: g.gContext.statusData,
            }
        },
        computed: {
            boardWidth() {
                // 'calc((100vw - 272px)/2)'
                return this.statusData.isSplitScreen
                    ? 'calc(50vw - 140px)'
                    : 'calc(100vw - 270px)';
            },
            boardHeight() {
                return 'calc(100vh - 106px)'; //-110
            }
        },
        methods: {
            // 树切屏
            changeScreen(treeID, index) {
                if (this.tabsArr.length < 2) {
                    //主屏只有一棵树时，直接合屏
                    this.statusData.isSplitScreen = false;
                    nodesOPController.mergeScreen();
                }
                else {
                    nodesOPController.changeScreen(treeID, index, true)
                }
            },
            clickTab(treeID) {
                nodesOPController.selectedTree(treeID)
            },
            closeTab(index) {
                nodesOPController.closeTab(index);
            },
            // 分屏
            splitScreen() {
                this.statusData.isSplitScreen = true;
            },
            // 合屏
            mergeScreen() {
                this.statusData.isSplitScreen = false;
                nodesOPController.mergeScreen();
            },
        }
    });
}