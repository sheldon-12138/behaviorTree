import { g } from "../../../js/structure/gContext.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";

export function tabVm2() {
    new Vue({
        el: '#tabList2',
        data() {
            return {
                tabsArr: g.gContext.tabsArr2,
                statusData: g.gContext.statusData,
            }
        },
        methods: {
            // 树切屏
            changeScreen(treeID, index) {
                if (this.tabsArr.length < 2) {
                    //只有一棵树时，直接合屏
                    this.statusData.isSplitScreen = false;
                    nodesOPController.mergeScreen();
                }
                else {
                    nodesOPController.changeScreen(treeID, index, false)
                }
            },
            clickTab(treeID) {
                nodesOPController.selectedAssTree(treeID)
            },
            closeTab(index) {
                nodesOPController.closeAssTab(index);
            },
        }
    });
}