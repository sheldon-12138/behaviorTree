import { loadDom } from "./js/load/loadDom.js"
import { loadResource } from "./js/load/loadResource.js"
import { loadOperation } from "./js/viewModel/operation.js";
import { loadUserInfo } from "./js/load/loadUserInfo.js";
import { loadSystemInfo } from "./js/load/loadSystemInfo.js";
import { initPlugin } from "./js/plugin/plugin.js";
import { loadManager } from "./js/load/loadManager.js"
import { loadAxis } from "./js/viewModel/canvasAxis.js";
import gContextController from "./js/controller/gContextController.js"


window.onload = function () {

    init();
};
window.onbeforeunload = function () {
    return "还未保存当前改动，您确定要退出页面吗？";
}
function init() {


    new Promise((resolve, reject) => {
        //加载dom并绑定VUE实例
        loadDom();
        //resolve();
        //初始化插件，将插件注入
        return initPlugin("hs").then(() => {
            resolve();
        });
    }).then(() => {
        //加载管理器
        loadManager();
        //加载资源
        loadResource();
        //绑定操作
        loadOperation();
        //加载系统配置项
        loadSystemInfo();
        //加载用户信息
        loadUserInfo();
        //加载刻度线
        loadAxis();
        // gContextController.createNode('top_event',{x: 20, y: 20});
        gContextController.createNode('Top', { x: 60, y: 60 });
    });

};
