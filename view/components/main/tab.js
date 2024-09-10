import { g } from "../../../js/structure/gContext.js"
import gContextDao from "../../../js/dao/gContextDao.js";
import nodesOPController from "../../../js/controller/nodesOPController.js";
import Utils from "../../../js/utils/utils.js";
import fileController from "../../../js/controller/fileController.js";
import fileParser from "../../../js/parser/fileParser.js";
import computeController from "../../../js/controller/computeController.js";
import gContextController from "../../../js/controller/gContextController.js";
import dom from "../../../js/viewModel/dom.js";

export function tabVm() {
    new Vue({
        el: '#tabList',
        data() {
            return {
                tabsArr: g.gContext.tabsArr,
                // avtiveTab: -1,
                // currentTreeID: g.gContext.statusData.currentTreeID,
                statusData: g.gContext.statusData,
            }
        },
        watch: {

        },
        methods: {
            clickTab(treeID) {
                this.statusData.currentTreeID = treeID
                nodesOPController.selectedTree(treeID)
            },
            closeTab(index) {
                const currentTreeID = this.tabsArr[index].id
                this.tabsArr.splice(index, 1)
                if (currentTreeID == this.statusData.currentTreeID) {
                    const item = this.tabsArr[this.tabsArr.length - 1]
                    nodesOPController.selectedTree(item.id)
                }
            }
        }
    });
}