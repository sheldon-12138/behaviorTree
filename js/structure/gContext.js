export const g = {

    gContext: {
        projectObj: {},
        publish: null,

        //鼠标位置枚举
        MouseLocation: {
            //工具栏
            RIBBON: 1,
            //模型库
            MODEL: 2,
            //树形列表
            TREE: 3,
            //主画布
            CANVAS: 4,
            //属性配置栏
            PROPERTY: 5,
            //状态栏
            STATUS: 6,
        },

        //当前模式
        Mode: {
            EDIT: 1,
            TABLE: 2,
        },
        tempModel: null,
        modelList: [
            {
                ID: '行为节点',
                type: 'Action',
                children: [{
                    ID: 'AlwaysFailure'
                }, {
                    ID: 'AlwaysSuccess'
                }, {
                    ID: 'Script'
                }, {
                    ID: 'SetBlackboard'
                }, {
                    ID: 'Sleep'
                }]
            }, {
                ID: '条件节点',
                type: 'Condition',
                children: [{
                    ID: 'ScriptCondition'
                }]
            }, {
                ID: '控制节点',
                type: 'Control',
                children: [{
                    ID: 'AsyncFallback'
                }, {
                    ID: 'AsyncSequence'
                }, {
                    ID: 'Fallback'
                }, {
                    ID: 'IfThenElse'
                }, {
                    ID: 'Parallel'
                }, {
                    ID: 'ParallelAll'
                }, {
                    ID: 'ReactiveFallback'
                }, {
                    ID: 'ReactiveSequence'
                }, {
                    ID: 'Sequence'
                }, {
                    ID: 'SequenceWithMemory'
                }, {
                    ID: 'Switch2'
                }, {
                    ID: 'Switch3'
                }, {
                    ID: 'Switch4'
                }, {
                    ID: 'Switch5'
                }, {
                    ID: 'Switch6'
                }, {
                    ID: 'WhileDoElse'
                },]
            }, {
                ID: '装饰节点',
                type: 'Decorator',
                children: [{
                    ID: 'Delay',
                }, {
                    ID: 'ForceFailure',
                }, {
                    ID: 'ForceSuccess',
                }, {
                    ID: 'Inverter',
                }, {
                    ID: 'KeepRunningUntilFailure',
                }, {
                    ID: 'LoopDouble',
                }, {
                    ID: 'LoopString',
                }, {
                    ID: 'Precondition',
                }, {
                    ID: 'Repeat',
                }, {
                    ID: 'RetryUntilSuccessful',
                }, {
                    ID: 'RunOnce',
                }, {
                    ID: 'Timeout',
                }]
            }, {
                ID: '子树',
                type: 'SubTree',
                children: []
            }],

        //资源
        doorModelList: [],  //门模型列表
        eventModelList: [], //事件模型列表

        //实体
        doorEntityMap: {},  //门数据
        eventEntityMap: {}, //事件数据
        treeMap: {},//树数据
        lineMap: {},  //连线数据
        userLineMap: {},//判据和圆圈的连线数据

        //当前选中的实体
        activedLine: null,  //选中的连线数据
        activedEntityMap: {}, //所有选中的节点数据
        activedEntityNode: null,  //选中的节点，用于属性栏
        activedLineMap: {}, //选中的节点相关的线
        layout: null, //自动布局对象

        //节点复制粘贴剪切操作相关
        copyList: {}, //复制的实体id列表
        copyLineList: {},//
        clipBoard: {
            pasteOffset: { x: 0, y: 0 },
        },  //待使用


        //节点信息显隐控制
        infoToggle: null,

        //user,当前用户
        user: {
            projectList: null,
            username: null,
        },

        //当前页面ip
        ip: null,
        //当前页面端口
        port: null,

        viewPort: {
            width: window.innerWidth - 280,//-10
            height: window.innerHeight - 104,
        },

        //svgCanvas
        svgCanvas: {
            _size: {
                width: window.innerWidth - 280,//-280 1872,window.innerWidth 1453 2080
                height: window.innerHeight - 104,// -74 892 999
                // width: window.innerWidth-10,//1872,window.innerWidth 1453 2080
                // height: window.innerHeight-74,//892 999
            },
            _zoom: 1.0,
        },

        //拖拽生成过程中的节点
        newSVGNode: null,
        newNodeNum: 0,//新增节点的数


        //主画布中框选节点使用到的框的数据
        marquee: null,
        //最后松开的位置
        lastMouseUpLocation: null,

        //拖拽过程中生成的线
        newLine: null,


        //当前模式包括 编辑模式/显示模式
        currentMode: null,

        // tab页数据
        // { id: 'dfdsf', name: '测试1tab' }, { id: 'dfddsfsasf', name: '测试2tab' }
        tabsArr: [],

        //各种状态控制
        statusData: {
            currentTreeID: '',//当前树id

            modeID: 1, //视图模式：1-编辑视图， 2-统计视图
            attrID: 1, //属性栏状态： 1-整体属性， 2-模型属性
            isShowFloat: false,//是否收缩浮窗信息框
            isShowModel: true,   //是否收缩模型栏
            isShowTree: true,    //是否收缩结构树栏
            isShowTab: true, //是否显示tab页
            isShowProperty: false,    //是否收缩属性栏  是否显示属性框弹窗
            isShowCriterionPop: false,    //是否显示判据弹窗
            isShowBottomMsg: false,//是否显示分析计算弹窗
            isShowTimeline: false,  //是否显示时间轴： 1-显示， 2-不显示
            isCompute: false,       //是否在计算
            computeType: null,       //计算类型
            operation_copy_delete: false,    //顶部栏复制、删除按钮是否可用
            operation_paste: false,  //顶部栏粘贴按钮是否可用
            autoLayoutMode: false,   //自动布局模式是否开启
            computeProxy: null,  //当前计算代理
            computeStatus: 0,    //0-编辑状态 1-失效计算 2-概率计算 3-PI 4-分析
            isPop: true,//判据显示是否是弹出式，false为排列式
            isEdit: true,//dc文本判据是否可编辑
            lineShowWay: false,//判据线段显示方式，true是曲线式，false为累积式
            canvasChanged: true,//标识画布是否改变
            isShowImg: true,//是否展示事件图片
            analysisOrder: 1//分析阶数
        },
        //属性栏模型数据
        attrData: {
            iscriterion: false,//是否是底事件的判据
            criterionIndex: -1, //判据的索引
            effect: {},
            standard: {},
            criterionItem: {},//选中的判据信息（仅点小圆圈时有）
            entity: {
                di: {},
                name: null,
                type: '与门',
                describe: null,  //描述
                code: null,  //代码
                id: null, //id
                componentID: 1,  //部件id
                level: 1,  //等级
                probability: [0, 0], //概率
                doorType: 1, //门类型
                category: "door",
                ftID: "",
                criterionDoor: { //裁决门数据
                    id: '',
                    type: "",    //与门 - GATE_AND, 或门 - GATE_OR, 自定义门 - GATE_USER_DEFINED
                    // desc: "",
                    code: "",
                },
                criterions: null,
            },
            model: {},
            fileInfo: {
                updateNum: 0,
                version: null,
            }
        },
        //文件整体属性
        fileInfo: {
            name: null,      //文件名称
            version: 1.0,    //版本号
            level: null,        //保密等级
            createTime: null,
            updateTime: null,
            createUnit: null,  //创建单位
            founder: "", //创建人
            contactInformation: null, //联系方式
            describe: null,  //描述
            verification: null,  //验证
            confidence: 1, //置信度
        },
        fileInfoPreview: {
            name: null,      //文件名称
            version: null,    //版本号
            level: null,        //保密等级
            createTime: null,
            updateTime: null,
            createUnit: null,  //创建单位
            founder: "", //创建人
            contactInformation: null, //联系方式
            describe: null,  //描述
            verification: null,  //验证
            confidence: null, //置信度
        },
        fileInfoHoverPreview: {
            name: null,      //文件名称
            version: null,    //版本号
            level: null,        //保密等级
            createTime: null,
            updateTime: null,
            createUnit: null,  //创建单位
            founder: "", //创建人
            contactInformation: null, //联系方式
            describe: null,  //描述
            verification: null,  //验证
            confidence: null, //置信度
        },
        hiddenPopoverData: {
            show: false,
            width: 160,
            data: null,
        },

        //结构树数据
        entityTree: {
            treeData: [],
            isShow: true,
        },
        criterionData: {
            overpressure: [], //超压
            impulse: [],  //冲量
            displacement: [], //位移
            velocity: [], //速度
            acceleration: [], //加速度
            PI: [], //PI
            deflectionSpanRatio: [],  //挠跨比
            damagedArea: [],  //破空面积
            fragmentNumber: [], //破片数量
            fragmentKineticEnergy: [],  //破片动能
            fragmentMomentum: [], //破片动量
            penetrationRange: [], //侵彻距离
            penetrationDepth: [], //侵彻法向深度
            penetrationVolume: [],  //侵彻开坑体积
            heatFlux: [], //热通量
            shockFactor: [],  //冲击因子
            quasiStaticCompression: [], //准静压
            overallLongitudinalStrength: [],  //总纵强度
            inlet: [],  //进水
        },
        //底部信息栏数据
        bottomAmount: {
            nodeNum: 0,
            maxLayer: 0,
            topNodeNum: 0,
            midNodeNum: 0,
            bottomNodeNum: 0,
            doorType: 0,
            doorNum: 0,
            maxDamageLevel: 0,
            criterionNum: 0,
            criterionTypeNum: 0,
            criterionRelevanceNum: 0,
            amountLayer: 0,
            amountLayerNum: [],
        },
        progressData: {
            openProgress: 0, //打开文件进度条
            failureCalculationProgress: 0,   //失效计算进度条
            probabilityCalculationProgress: 0,   //概率计算进度条
        },
        failureComputedData: {//当前计算结果
            computedRenderID: false, //是否显示渲染结果
            // computedRenderList: ['notFlash', 'yellowFlash', 'orangeFlash', 'redFlash', 'greyFlash'],  //显示哪些渲染等级
            computedRenderList: ['notWave', 'yellowWave', 'orangeWave', 'redWave', 'crimsonWave'],  //显示哪些渲染等级
            computeMap: [],
            result: null,  //失效计算结果
            startTimeStamp: null,
            //当前计算完成时间戳
            timeStamp: null,
        },
        computeResult: [//计算结果列表
            //Object
            //time:开始计算时间
            //do:节点ftId及概率集
            //di:当前计算所使用的输入
            //timeStamp时间戳
            //finish:是否完成计算
        ],
        //插件
        plugin: null,
        //判据图标
        criterionImgList: {},

        //hs标准
        hsStandard: {
            currentIndex: -1,
            standardList: {},
            //standard:
            //{
            //  name:"",
            //  level:1,
            //  code:"",
            //  levelCatch:{1:[]},
            //  levelPro:[],
            // }
            //levelDescribe:
            //{
            //  levelName:"",
            //  describe:"",
            //  understandDescribe:"",
            // }
        },
        //hs标准按钮位置信息
        rootPosition: {
            hasRoot: true,  //hs标准按钮是否显示
            x: 0,
            y: 0,
            show: true,
        },

        //效能事件信息
        effectEvent: {
            effectEventList: {
                //key:id,value:{code:"", stats:[]},
            },
        },

        //刻度线
        axis: {
            axis_x: {
                canvas_width: 0,
                canvas_x: 0,
                width: 1870,
            },
            axis_y: {
                canvas_height: 0,
                canvas_y: 0,
                height: 900,
            }
        },

        criterionChartData: {
            //key:DC_TYPE value:{key:DC_KEY}
            //key:DC_KEY value:{result:{}, data:{1, 2, 3..}
            //
        },
        chartData: {
            drawerID: false,
            // #fcf903 <= FAC858 黄色
            color: ['#91CC75', '#fcf903', '#FC8452', '#EE6666', "#AC3B2A", '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
            // color:['#5470c6', '#91cc75', '#fac858', '#ee6666',
            //     '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
            //     '#ea7ccc'],
            areaColor: {
                0: ['rgba(145, 204, 117,1)', 'rgba(145, 204, 117,1)'],
                1: ['rgba(250, 200, 88,0.8)', 'rgba(250, 200, 88,0.3)'],
                2: ['rgba(252, 132, 82,0.8)', 'rgba(252, 132, 82,0.3)'],
                3: ['rgba(238, 102, 102,0.8)', 'rgba(238, 102, 102,0.3)'],
                4: ['rgba(172, 59, 42,0.8)', 'rgba(172, 59, 42,0.3)'],
            },
            DC_type: null,
            DC_goods_type: null,
            // data:{
            //
            // },
        },
        //计算结果渲染参数
        filter: {
            flash: {
                not: 'notFlash',
                yellow: 'yellowFlash',
                orange: 'orangeFlash',
                red: 'redFlash',
                grey: 'greyFlash',
                listData: [
                    ['notFlash', 'greyFlash'],
                    ['notFlash', 'orangeFlash', 'greyFlash'],
                    ['notFlash', 'yellowFlash', 'redFlash', 'greyFlash'],
                    ['notFlash', 'yellowFlash', 'orangeFlash', 'redFlash', 'greyFlash'],
                ]
            },
            wave: {
                not: 'notWave',
                yellow: 'yellowWave',
                orange: 'orangeWave',
                red: 'redWave',
                grey: 'crimsonWave',
                listData: [
                    ['notWave', 'crimsonWave'],
                    ['notWave', 'orangeWave', 'crimsonWave'],
                    ['notWave', 'yellowWave', 'orangeWave', 'crimsonWave'],
                    ['notWave', 'yellowWave', 'orangeWave', 'redWave', 'crimsonWave'],
                ]
            }
        },
        // 存放分析计算的结果
        resultArr: [],
        // { ftIdArr: [1], result: '0.1' }, { ftIdArr: [2], result: '0.1' }

        // 判据列表
        criterionPopList: []
    },

}


