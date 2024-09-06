import { g } from "../../../js/structure/gContext.js"
import gContextDao from "../../../js/dao/gContextDao.js";
import nodesOPController from "../../../js/controller/nodesOPController.js";
import Utils from "../../../js/utils/utils.js";
import Color from "../../../js/utils/color.js";
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
                statusData: g.gContext.statusData,
                avtiveTab: -1,
            }
        },
        methods: {
            clickTab(index) {
                this.avtiveTab = index
            },
            closeTab(index) {
                this.tabsArr.splice(index, 1)
            }

        }
    });
}