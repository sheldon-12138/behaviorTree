import { g } from "../../../js/structure/gContext.js"
import utils from "../../../js/utils/utils.js";
import { treeVm } from "./tree.js"
import { tabVm } from "./tab.js"
import { tabVm2 } from "./tab2.js"
import { attributePopVm } from "./attributePop.js"
import { floatMsgVm } from "./floatMsg.js"

var jQuery = $;

export function mainVm() {
    jQuery('#tree').load('view/components/main/tree.html', function () {
        treeVm();
    });
    jQuery('#tab').load('view/components/main/tab.html', function () {
        tabVm();
    });
    jQuery('#tab2').load('view/components/main/tab2.html', function () {
        tabVm2();
    });
    jQuery('#attributePop').load('view/components/main/attributePop.html', function () {
        attributePopVm();
    });
    jQuery('#floatMsg').load('view/components/main/floatMsg.html', function () {
        floatMsgVm();
    });
    jQuery('#content').scroll(utils._debounce(function () {
        let scrollHeight = jQuery('#content').scrollTop();
        let scrollWidth = jQuery('#content').scrollLeft();
    }, 50))
}