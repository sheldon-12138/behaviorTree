import {headerVm} from "../../view/components/header/header.js"
import {mainVm} from "../../view/components/main/main.js"
import {bottomVm} from "../../view/components/bottom/bottom.js"
export function loadDom(){
    $.ajaxSetup({
        async: false
    });
    $('#header').load('view/components/header/header.html', function(){
        headerVm();
    });
    $('#main').load('view/components/main/main.html',function(responseTxt,statusTxt,xhr){
        mainVm();
    });

    $('#bottom').load('view/components/bottom/bottom.html', function () {
        bottomVm();
    });
    $.ajaxSetup({
        async: true
    });
};