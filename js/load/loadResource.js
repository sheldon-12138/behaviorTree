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
        sizeList: [{ width: 30, height: 30 }, { width: 115, height: 60 }],
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
        sizeList: [{ width: 30, height: 30 }, { width: 250, height: 100 }],
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
        sizeList: [{ width: 30, height: 30 }, { width: 250, height: 100 }],
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
        sizeList: [{ width: 30, height: 30 }, { width: 117, height: 50 }],
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
        sizeList: [{ width: 30, height: 30 }, { width: 117, height: 50 }],
        hasUpNodes: true,
        hasDownNodes: true,
        category: "event",
    });

    // 创建不同类型的门，设置其属性信息
    gContextController.createModel({
        path: "./assets/model/and_door.svg",
        type: "and_door",
        name: "GATE_AND",
        aliasName: "与门",
        sizeList: [{ width: 32, height: 32 }, { width: 100, height: 100 }, { width: 1000, height: 1000 }],
        hasUpNodes: true,
        hasDownNodes: true,
        category: "door",
    });
    gContextController.createModel({
        path: "./assets/model/or_door.svg",
        type: "or_door",
        name: "GATE_OR",
        aliasName: "或门",
        sizeList: [{ width: 32, height: 32 }, { width: 100, height: 100 }, { width: 1000, height: 1000 }],
        hasUpNodes: true,
        hasDownNodes: true,
        category: "door",
    });
    gContextController.createModel({
        path: "./assets/model/door.svg",
        type: "user_door",
        name: "GATE_USER_DEFINED",
        aliasName: "自定义门",
        sizeList: [{ width: 32, height: 32 }, { width: 100, height: 100 }, { width: 1000, height: 1000 }],
        hasUpNodes: true,
        hasDownNodes: true,
        category: "door",
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

    // 配置属性的标准信息 判据
    gContextController.configureCriterion({
        "DC_P": {
            path: "assets/attributeFence/attr_1.png",
            name: "DC_P",
            chinese: "峰值超压",
            unit: 'MPa',
            width: 12,
            height: 12,

        },
        "DC_I": {
            path: "assets/attributeFence/attr_2.png",
            name: "DC_I",
            chinese: "冲量",
            unit: 'MPa*s',
            width: 12,
            height: 12
        },
        "DC_PI": {
            path: "assets/attributeFence/attr_3.png",
            // path: "assets/attributeFence/DC_load_PI-curve.png",
            name: "DC_PI",
            chinese: "PI",
            unit: 'MPa',
            width: 12,
            height: 12
        },
        "DC_D": {
            path: "assets/attributeFence/attr_4.png",
            name: "DC_D",
            chinese: "位移/挠度",
            unit: 'm',
            width: 12,
            height: 12
        },
        "DC_V": {
            path: "assets/attributeFence/attr_5.png",
            name: "DC_V",
            chinese: "速度",
            unit: 'm/s',
            width: 12,
            height: 12
        },
        "DC_A": {
            path: "assets/attributeFence/attr_6.png",
            name: "DC_A",
            chinese: "加速度",
            unit: 'm/s²',
            width: 12,
            height: 12
        },
        "DC_DSR": {
            path: "assets/attributeFence/attr_7.png",
            name: "DC_DSR",
            chinese: "挠跨比",
            unit: '',
            width: 12,
            height: 12
        },
        "DC_FN": {
            path: "assets/attributeFence/attr_8.png",
            name: "DC_FN",
            chinese: "破片数",
            unit: '个',
            width: 12,
            height: 12
        },
        "DC_FD": {
            path: "assets/attributeFence/attr_9.png",
            name: "DC_FD",
            chinese: "破片数密度",
            unit: '个/m²',
            width: 12,
            height: 12
        },
        "DC_FKE": {
            path: "assets/attributeFence/attr_10.png",
            name: "DC_FKE",
            chinese: "破片动能",
            unit: '焦',
            width: 12,
            height: 12
        },
        // "DC_FM": {
        //     path: "assets/attributeFence/attr_12.png",
        //     name: "DC_FM",
        //     chinese: "破片动量",
        //     width: 12,
        //     height: 12
        // },
        // 不要了
        // "DC_FNKE": {
        //     path: "assets/attributeFence/DC_load_Fragment_Number-Kinetic_Energy.png",
        //     name: "DC_FNKE",
        //     chinese: "破片数密度和动能联合",
        //     width: 12,
        //     height: 12
        // },
        "DC_DA": {
            path: "assets/attributeFence/attr_11.png",
            name: "DC_DA",
            chinese: "破损面积",
            unit: 'm²',
            width: 12,
            height: 12
        },
        // "DC_PL": {
        //     path: "assets/attributeFence/attr_12.png",
        //     name: "DC_PL",
        //     chinese: "侵彻开孔直径",
        //     width: 12,
        //     height: 12
        // },
        "DC_PD": {
            path: "assets/attributeFence/attr_12.png",
            name: "DC_PD",
            chinese: "侵彻深度",
            unit: 'm',
            width: 12,
            height: 12
        },
        // PV不要了
        // "DC_PV": {
        //     path: "assets/attributeFence/attr_16.png",
        //     name: "DC_PV",
        //     chinese: "侵彻穿透开坑体积",
        //     width: 12,
        //     height: 12
        // },
        "DC_HF": {
            path: "assets/attributeFence/attr_13.png",
            name: "DC_HF",
            chinese: "热通量",
            unit: 'W/m²',
            width: 12,
            height: 12
        },
        "DC_T": {
            path: "assets/attributeFence/attr_14.png",
            name: "DC_T",
            chinese: "温度",
            unit: '℃',
            width: 12,
            height: 12
        },
        "DC_SF": {
            path: "assets/attributeFence/attr_15.png",
            name: "DC_SF",
            chinese: "冲击因子",
            unit: '',
            width: 12,
            height: 12
        },
        "DC_S": {
            path: "assets/attributeFence/attr_16.png",
            name: "DC_S",
            chinese: "总体强度",
            unit: '',
            width: 12,
            height: 12
        },
        // "DC_Time": {
        //     path: "assets/attributeFence/attr_19.png",
        //     name: "DC_Time",
        //     chinese: "时间",
        //     width: 12,
        //     height: 12
        // },
        // "DC_U": {
        //     path: "assets/attributeFence/attr_20.png",
        //     name: "DC_U",
        //     chinese: "自定义",
        //     width: 12,
        //     height: 12
        // },

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

