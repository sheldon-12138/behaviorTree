import {g} from "../../../js/structure/gContext.js"

export function bottomVm() {
    new Vue({
        el: '#bottom',
        data: {
            fileInfo: g.gContext.fileInfo,
            bottomAmount: g.gContext.bottomAmount,
        },
        created() {

        },
        methods: {}
    })
}
