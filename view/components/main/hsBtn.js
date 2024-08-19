import {g} from "../../../js/structure/gContext.js"
import nodesOPController from "../../../js/controller/nodesOPController.js";

export function hsBtnVm() {
    new Vue({
        el: '#hsBtn',
        data: {
            hsStandard:g.gContext.hsStandard,
            rootPosition:g.gContext.rootPosition
        },
        components: {},
        computed: {
        },
        methods: {
            hsChange(id){
                nodesOPController.hsStandard.updateHSStandardIndex(id);
            }
        }
    })
}