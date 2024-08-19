import {g} from "../../../js/structure/gContext.js"

export function listVm() {
    new Vue({
        el: '#mainList',
        data: {
            // gContext: gContext,
            doorModelList: g.gContext.doorModelList,
            eventModelList: g.gContext.eventModelList,
            criterionImgList:g.gContext.criterionImgList,
            statusData:g.gContext.statusData
        },
        components: {},
        computed: {
        },
        methods: {

        }
    })
}
