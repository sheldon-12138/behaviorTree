import { g } from "../../../js/structure/gContext.js"
import utils from "../../../js/utils/utils.js";
import { listVm } from "./list.js"
import { treeVm } from "./tree.js"
import { tabVm } from "./tab.js"
// import { treeTableVm } from "./treeTable.js";
import { attributePopVm } from "./attributePop.js"


import { timelineVm } from "./timeline.js";
import { hiddenPopoverVm } from "./hiddenPopover.js"
import { renderModeVm } from './renderMode.js'
import { hsBtnVm } from './hsBtn.js'
import { chartVm } from './chart.js'
import { hierarchyBarVm } from './hierarchyBar.js'

var jQuery = $;

export function mainVm() {
    // jQuery('#list').load('view/components/main/list.html', function () {
    //     listVm();
    // });
    jQuery('#tree').load('view/components/main/tree.html', function () {
        treeVm();
    });
    jQuery('#tab').load('view/components/main/tab.html', function () {
        tabVm();
    });
    // jQuery('#treeTable').load('view/components/main/treeTable.html', function () {
    //     treeTableVm();
    // });


    jQuery('#attributePop').load('view/components/main/attributePop.html', function () {
        attributePopVm();
    });

    jQuery('#timeline').load('view/components/main/timeline.html', function () {
        timelineVm();
    });
    jQuery('#hiddenPopover').load('view/components/main/hiddenPopover.html', function () {
        hiddenPopoverVm();
    });
    jQuery('#renderMode').load('view/components/main/renderMode.html', function () {
        renderModeVm();
    });
    // jQuery('#chart').load('view/components/main/chart.html', function () {
    //     chartVm();
    // });
    jQuery('#hierarchyBar').load('view/components/main/hierarchyBar.html', function () {
        hierarchyBarVm();
    });
    // jQuery('#hsBtn').load('view/components/main/hsBtn.html', function () {
    //     hsBtnVm();
    // });
    jQuery('#content').scroll(utils._debounce(function () {
        let scrollHeight = jQuery('#content').scrollTop();
        let scrollWidth = jQuery('#content').scrollLeft();
    }, 50))
}