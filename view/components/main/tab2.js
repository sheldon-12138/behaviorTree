import { g } from "../../../js/structure/gContext.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";

export function tabVm2() {
    new Vue({
        el: '#tabList2',
        data() {
            return {
                tabsArr: g.gContext.tabsArr,
                statusData: g.gContext.statusData,
            }
        },
        methods: {
            clickTab(treeID) {
                nodesOPController.selectedTree(treeID)
            },
            closeTab(index) {
                nodesOPController.closeTab(index);
            },
            // 分屏
            splitScreen() {
                this.statusData.ifSplitScreen = true;
                nodesOPController.splitScreen();
            },
            // 合屏
            mergeScreen() {
                this.statusData.ifSplitScreen = false;
                nodesOPController.mergeScreen();
            },
        }
    });
}