import { g } from "../../../js/structure/gContext.js"

export function floatMsgVm() {
    new Vue({
        el: '#float',
        data: {
            statusData: g.gContext.statusData,
            fileInfo: g.gContext.fileInfo,
            bottomAmount: g.gContext.bottomAmount,
        },
    })
}
