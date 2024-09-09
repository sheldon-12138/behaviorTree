import gContextController from "../controller/gContextController.js";
import nodesOPController from "../controller/nodesOPController.js";

export function loadResource() {

    // 创建不同类型的节点，设置其属性信息
    gContextController.createModel({
        path: "./assets/model/top_event.svg",
        type: "Top",
        name: "Root",
        aliasName: "顶节点",
        textColor: '#fff',
        sizeList: [{ width: 30, height: 30 }, { width: 100, height: 60 }],
        hasUpNodes: false,
        hasDownNodes: true,
        category: "event",
    });
    gContextController.createModel({
        path: "./assets/model/bottom_event.svg",
        type: "Action",
        name: "Action",
        aliasName: "Action",
        textColor: '#fff',
        sizeList: [{ width: 30, height: 30 }, { width: 100, height: 60 }],
        hasUpNodes: true,
        hasDownNodes: false,
        category: "event",
    });
    gContextController.createModel({
        path: "./assets/model/bottom_event.svg",
        type: "Condition",
        name: "Condition",
        aliasName: "Condition",
        textColor: '#fff',
        sizeList: [{ width: 30, height: 30 }, { width: 100, height: 60 }],
        hasUpNodes: true,
        hasDownNodes: false,
        category: "event",
    });
    gContextController.createModel({
        path: "./assets/model/mid_event.svg",
        type: "Control",
        name: "Control",
        aliasName: "Control",
        textColor: '#ff69c3',
        sizeList: [{ width: 30, height: 30 }, { width: 100, height: 60 }],
        hasUpNodes: true,
        hasDownNodes: true,
        category: "event",
    });
    gContextController.createModel({
        path: "./assets/model/mid_event.svg",
        type: "Decorator",
        name: "Decorator",
        aliasName: "Decorator",
        textColor: '#81e1f9',
        sizeList: [{ width: 30, height: 30 }, { width: 100, height: 60 }],
        hasUpNodes: true,
        hasDownNodes: true,
        category: "event",
    });
    gContextController.createModel({
        path: "./assets/model/mid_event.svg",
        type: "SubTree",
        name: "SubTree",
        aliasName: "SubTree",
        textColor: '#fff',
        sizeList: [{ width: 30, height: 30 }, { width: 100, height: 60 }],
        hasUpNodes: true,
        hasDownNodes: true,
        category: "event",
    });


    // 创建拖拽框对象，用于框选
    gContextController.createMarquee({
        pos: { x: 1, y: 1 },
        size: { width: 1, height: 1 },
        stroke: "blue",
        strokeWidth: 1,
        fill: "skyblue",
        opacity: 0.2,
    });

    // 创建节点布局
    nodesOPController.createLayout(100, 50, 125, 150);

    // 给 Date 原型添加一个方法，用于格式化日期
    Date.prototype.Format = function (fmt) {
        let o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    // 给 String 原型添加一个方法，用于去除字符串两端的空格 用空字符串替代。
    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }
};

