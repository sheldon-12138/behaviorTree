import {headerVm} from "../../view/components/header/header.js"
import {mainVm} from "../../view/components/main/main.js"
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
    $.ajaxSetup({
        async: true
    });
};