import Publish from "../core/publish.js"
import gContextDao from "../dao/gContextDao.js";
import Utils from "../utils/utils.js";

export function loadManager() {
    let publish = gContextDao.getGContextProp("publish");
    if (!publish) {
        gContextDao.setGContextProp("publish", new Publish());
    }
    registerDefaultListener();
}

function registerDefaultListener() {
    let publish = gContextDao.getGContextProp("publish");
    let handler = function (entity) {
        if (entity.dom) {
            // let hiddenPopoverData = gContextDao.getGContextProp("hiddenPopoverData");
            // if(entity.modelType.includes("door")){
            //     hiddenPopoverData.show = false;
            // }
            // else{
            //     hiddenPopoverData.show = true;
            // }
            // hiddenPopoverData.data = Utils.jsonClone(entity);
            // entity.dom.querySelector(".pic").classList.add("node-height-light");
            // 鼠标悬浮节点时显示描述信息
            if (entity.dom.querySelector(".desG")) {
                entity.dom.querySelector(".desG").classList.remove("hide");
            }
        }
    };
    let explantationHadnler = function () {
        // console.log("explantation-node");
        let doms = document.querySelectorAll(".desG");
        if (!doms) return;
        // let hiddenPopoverData = gContextDao.getGContextProp("hiddenPopoverData");
        // hiddenPopoverData.show = false;
        // hiddenPopoverData.data = null;
        for (let i = 0; i < doms.length; ++i) {
            // doms[i].classList.remove("node-height-light");
            doms[i].parentNode.querySelector(".desG").classList.add("hide");
        }
    };

    let rootPositionHandler = function (id) {
        let root = gContextDao.findEntity(id);
        if (root && root.modelType.includes("top")) {
            let rootPosition = gContextDao.getGContextProp("rootPosition");
            rootPosition.hasRoot = true;
            rootPosition.x = root.pos.x;
            rootPosition.y = root.pos.y;
        }
    };

    let rootHSStandardShow = function (show) {
        let rootPosition = gContextDao.getGContextProp("rootPosition");
        rootPosition.show = show;
    }

    publish.registerListener("hover-node", handler);

    publish.registerListener("explantation-node", explantationHadnler);

    publish.registerListener("root-position", rootPositionHandler);

    publish.registerListener("root-show", rootHSStandardShow);
}

