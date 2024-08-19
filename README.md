# FTree

## 安装node，谷歌浏览器

## 运行

* 在server.js所在的目录下运行node ./server.js
* 打开浏览器输入地址: 端口:9833

## 文件结构

* assets:放置项目所需图片等资源
* css:放置项目所需css(less编写，编译成css)
* js:
  * algorithm:存放项目所需算法，例如自动布局算法
  * codec: 编码器和解码器 用于网络传输，将某些字符替换
  * computerResult: 计算结果显示
  * controller:业务逻辑代码
    1. computeController与计算相关的逻辑代码
    2. fileController与文件相关的逻辑代码
    3. gContextController中心视图操作逻辑代码
    4. nodesOPController节点操作逻辑代码
    5. viewOPController中心视图全局操作逻辑代码
  * dao:数据访问层，访问数据统一通过dao中导出函数访问
  * ext:扩展第三方工具
  * load:模块初始化加载，加载vue编写的前端页面，加载基础图形资源，加载用户信息
  * net:封装fetch和webSocket请求
  * parser:文件解析和序列化操作
  * plugin:插件，存放扩展项目。例如hs相关项目
  * render:文件解析后调用的渲染操作
  * request:业务请求代码封装
  * viewModel:视图操作层
    1. dom封装了部分dom操作
    2. operation中心视图区的鼠标等操作
  * structure:数据结构
    1. criterion判据
    2. entity实体
    3. gContext全局数据  //被vue观察
    4. line线
    5. marquee拖拽框
    6. model模型
    7. svgCanvas中心视图
    8. treeNode树状节点
    9. user用户数据
  * utils:工具库
* view:视图模板(包含Vue实例)
  * index.html主页面
  * app.js入口文件
* route:后端代码目录
  * compute: 计算业务
  * util:后端工具库
* src:计算代码c++编写
  * include:所需头文件
  * computer.exe:生成判据计算代码
  * yang.exe:生成由底层结果算到上层结构代码
* user:存放用户保存的项目
  * tester/airport项目为例
    1. airport.ft 树结构数据
    2. airport.dc 判据数据
    3. airport.info 项目信息
    4. airport.da 判据门代码


## 技术细节

### 前端

* 使用node server.js启动服务器之后, 进入对应地址端口,自动请求index.html文件，index.html中引入了app.js文件。

* app.js

  1. 首先异步请求html文件，将里面的内容添加到index.html的对应dom上。添加之后为每个dom添加vue实例。
  2. 添加全局上下文gContext对象，运行过程中的全部数据都保存在该对象中。
  3. 添加发布订阅管理器并注册一些默认事件，最后挂载到gContext上。
  4. loadResource()函数加载模型资源,可以通过gContextController.createModel函数自行扩展模型。
  5. 绑定鼠标键盘操作到对应dom元素上，鼠标键盘操作实现在operation.js中查看。
  6. 加载用户信息,这里暂时加载了默认用户，可以扩展为登录之后加载对应的用户。
  7. 画板中的刻度线，使用canvas技术跟随画板做动态更新。

* 工具栏

  * 视图文件在view/components/header/header.html,对应的vue实例在view/components/header/header.js中。按钮操作会在header.js中定义，header.js中调用每种操作的具体实现函数。

  1. 项目操作 具体实现在js/controller/fileController.js
    2. 新建、打开、保存、另存为 
  3. 模型栏 具体实现在js/controller/gContextController.js
     1. 顶事件、中间事件、底事件、与或非门
  4. 节点操作 具体实现在js/controller/nodesOPController.js
     1. 复制、粘贴、删除
  5. 全局属性 具体实现在js/controller/viewOPController.js
     1. 自动布局、放大缩小、节点编号显隐
  6. 计算控制 具体实现在js/controller/computeController.js
     1. 3种计算方式
  7. 帮助文档

* 树状视图栏

  * 视图文件在view/components/main/tree.html,对应的vue实例在view/components/main/tree.js中。

* 画板

  * 视图文件在view/components/main/main.html,为了效率的考虑,画板没有挂载相应的vue实例。
  * 画板操作全部通过在js/viewModel/operation.js中进行绑定,并且operation.js中的操作会调用controller中的函数实现。
  * controller中与dom的相关操作封装在js/viewModel/dom.js中。

* 属性编辑栏

  * 视图文件在view/components/main/attributeFence.html,对应的vue实例在view/components/main/attributeFence.js中。具体操作调用了nodeController.js和gContextController.js中的函数。
  * 文件信息栏
    * 显示编辑项目相关信息
  * 事件信息栏
    * 显示编辑事件相关信息
  * 门信息栏
    * 显示编辑门相关信息

* 底部信息栏

  * 视图文件在view/components/bottom/bottom.html,对应的vue实例在view/components/bottom/bottom.js中。
  * 当节点信息需要更新时,调用viewOPController.js中的updateAmount()函数更新节点信息。

### 后端

* 入口函数server.js。
* 后端使用express框架。导入了route/userRoute.js和route/computeRoute.js。
* userRoute.js中是用户相关的请求实现
* computeRoute.js中是计算任务相关的请求实现
* route/util文件夹中封装了工具函数。

### 修改工作

* gContext.js
      <!-- svgCanvas: {
          _size: {
              width: 2080,//原2000
              height: 999,//原2000
          },
          _zoom: 1.0,
      },
      axis:{
          axis_x:{
              canvas_width:0,
              canvas_x:0,
              width:1870,
          },
          axis_y:{
              canvas_height:0,
              canvas_y:0,
              height:900,
          }
      }, -->

* 删除了canvasAxis.js中的loadAxis1
  <!-- export function loadAxis1() {
    let axis = gContextDao.getGContextProp("axis");
    let canvas = document.getElementById("canvas_axis_x");
    let axis_x = document.getElementById("axis_x");

    let canvas_y = document.getElementById("canvas_axis_y");
    let axis_y = document.getElementById("axis_y");
    let content = document.getElementById("content");
    let drawBoard = document.getElementById("drawingBoard");
    let svgCanvas = gContextDao.getGContextProp("svgCanvas");

    let axis_x_data = axis.axis_x;
    let axis_y_data = axis.axis_y;


    let width_y = 20;
    let canvas_height = parseFloat(axis_y.clientHeight);
    let ctx_y = canvas_y.getContext('2d');
    let cHeight = parseFloat(axis_y.clientHeight) - parseFloat(window.getComputedStyle(axis_y, null)["padding-top"]) * 2;
    let ratio_y = getPixelRatio(ctx_y);
    let offScrollHeight = (parseFloat(content.offsetHeight) - parseFloat(content.clientHeight)) / ratio_y;
    canvas_y.style.width = width_y + 'px';
    canvas_y.style.height = cHeight + 'px';
    canvas_y.width = width_y * ratio_y;
    canvas_y.height = cHeight * ratio_y;
    ctx_y.scale(ratio_y, ratio_y);
    
    let height = 20;
    let canvas_width = parseFloat(axis_x.clientWidth);
    let ctx = canvas.getContext('2d');
    let cWidth = parseFloat(axis_x.clientWidth) - parseFloat(window.getComputedStyle(axis_x, null)["padding-left"]) * 2;
    let ratio = getPixelRatio(ctx);
    let offScrollWidth = (parseFloat(content.offsetWidth) - parseFloat(content.clientWidth)) / ratio;
    canvas.style.width = cWidth + 'px';
    canvas.style.height = height + 'px';
    canvas.width = cWidth * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    
    let publish = gContextDao.getGContextProp("publish");
    publish.registerListener("canvas_size", setCanvasSize);
    
    let margin = 10;
    
    window.requestAnimationFrame(render);
    
    function render() {


        let width = axis_x_data.width;
        let canvas_x = axis_x_data.canvas_x;
    
        ctx.beginPath();
        ctx.fillStyle = "rgba(236,236,236)";
        ctx.fillRect(0, 0, cWidth, height);
        ctx.fillStyle = "#ffffff";
        if (cWidth - margin * 2 > width) {
            ctx.fillRect(margin, height / 8, width - margin * 2, height / 8 * 6);
        } else {
            ctx.fillRect(margin + canvas_x / width * (cWidth - margin * 2 - offScrollWidth), height / 8, canvas_width / width * (cWidth - margin * 2 - offScrollWidth), height / 8 * 6);
        }


        let offsetWidth = width / 10;
        let offsetCWidth = (cWidth - margin * 2) / 10;
        let current_x = 0 + margin;
        for (let i = 0; i < 11; ++i) {
            ctx.beginPath();
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1.0;
            ctx.moveTo(current_x, height / 4);
            ctx.lineTo(current_x, height / 4 * 3);
            ctx.stroke();
            let offsetCWidth_x = offsetCWidth / 10;
            let current_x_x = current_x + offsetCWidth_x;
            if (i >= 10) continue;
            for (let j = 0; j < 4; ++j) {
                ctx.beginPath();
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1.0;
                ctx.moveTo(current_x_x, height / 8 * 3);
                ctx.lineTo(current_x_x, height / 8 * 5);
                ctx.stroke();
                current_x_x += offsetCWidth_x;
            }
    
            ctx.fontWeight = "200";
            ctx.font = "200 8px Graduate";
            ctx.moveTo(current_x_x, height / 2);
            ctx.strokeText(`${i}`, current_x_x, height / 8 * 5);
            current_x_x += offsetCWidth_x;
    
            for (let j = 0; j < 4; ++j) {
                ctx.beginPath();
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1.0;
                ctx.moveTo(current_x_x, height / 8 * 3);
                ctx.lineTo(current_x_x, height / 8 * 5);
                ctx.stroke();
                current_x_x += offsetCWidth_x;
            }
    
            current_x += offsetCWidth;
        }



        let height_y = axis_y_data.height;
        let canvas_y = axis_y_data.canvas_y;
    
        ctx_y.beginPath();
        ctx_y.fillStyle = "rgba(236,236,236)";
        ctx_y.fillRect(0, 0, width_y, cHeight);
        ctx_y.fillStyle = "#ffffff";
        if (cHeight - margin * 2 > height_y) {
            ctx_y.fillRect(width_y / 8, margin, width_y / 8 * 6, height_y - margin * 2);
        } else {
            ctx_y.fillRect(width_y / 8, margin + canvas_y / height_y * (cHeight - margin * 2 - offScrollHeight), width_y / 8 * 6, canvas_height / height_y * (cHeight - margin * 2 - offScrollHeight));
        }
    
        let offsetHeight = height_y / 10;
        let offsetCHeight = (cHeight - margin * 2) / 10;
        let current_y = 0 + margin;
        for (let i = 0; i < 11; ++i) {
            ctx_y.beginPath();
            ctx_y.strokeStyle = "#000000";
            ctx_y.lineWidth = 1.0;
            ctx_y.moveTo(width_y / 4, current_y);
            ctx_y.lineTo(width_y / 4 * 3, current_y);
            ctx_y.stroke();
            let offsetCHeight_y = offsetCHeight / 10;
            let current_y_y = current_y + offsetCHeight_y;
            if (i >= 10) continue;
            for (let j = 0; j < 4; ++j) {
                ctx_y.beginPath();
                ctx_y.strokeStyle = "#000000";
                ctx_y.lineWidth = 1.0;
                ctx_y.moveTo(width_y / 8 * 3, current_y_y);
                ctx_y.lineTo(width_y / 8 * 5, current_y_y);
                ctx_y.stroke();
                current_y_y += offsetCHeight_y;
            }
    
            ctx_y.fontWeight = "200";
            ctx_y.font = "200 8px Graduate";
            // ctx_y.moveTo(width_y, current_y_y);
            ctx_y.strokeText(`${i}`, width_y / 8 * 3, current_y_y + 2);
            current_y_y += offsetCHeight_y;
    
            for (let j = 0; j < 4; ++j) {
                ctx_y.beginPath();
                ctx_y.strokeStyle = "#000000";
                ctx_y.lineWidth = 1.0;
                ctx_y.moveTo(width_y / 8 * 3, current_y_y);
                ctx_y.lineTo(width_y / 8 * 5, current_y_y);
                ctx_y.stroke();
                current_y_y += offsetCHeight_y;
            }
            current_y += offsetCHeight;
        }
        window.requestAnimationFrame(render);
    
    }
    
    function setCanvasSize() {
        canvas_width = parseFloat(axis_x.clientWidth) / svgCanvas.zoom;
        cWidth = parseFloat(axis_x.clientWidth) - parseFloat(window.getComputedStyle(axis_x, null)["padding-left"]) * 2;
        ratio = getPixelRatio(ctx);
        offScrollWidth = (parseFloat(content.offsetWidth) - parseFloat(content.clientWidth)) / ratio;
        canvas.style.width = cWidth + 'px';
        canvas.style.height = height + 'px';
        canvas.width = cWidth * ratio;
        canvas.height = height * ratio;
        ctx.scale(ratio, ratio);
    
        canvas_height = parseFloat(axis_y.clientHeight) / svgCanvas.zoom;
        cHeight = parseFloat(axis_y.clientHeight) - parseFloat(window.getComputedStyle(axis_y, null)["padding-top"]) * 2;
        ratio_y = getPixelRatio(ctx_y);
        offScrollHeight = (parseFloat(content.offsetHeight) - parseFloat(content.clientHeight)) / ratio_y;
        canvas_y.style.width = width_y + 'px';
        canvas_y.style.height = cHeight + 'px';
        canvas_y.width = width_y * ratio_y;
        canvas_y.height = cHeight * ratio_y;
        ctx_y.scale(ratio_y, ratio_y);
    }

} -->

* gContextController.js

  <!--原： newSize.width = maxPosition.x+200;
  newSize.height = maxPosition.y+200; -->
  <!--改后：newSize.width = Math.max(maxPosition.x + 200, 1870)  // 基于最大位置坐标调整新尺寸
  newSize.height = Math.max(maxPosition.y + 200, 900)  // 当尺寸大于全屏时再扩大 -->

* 修改了timeline.js
  <!-- // isShowProperty() {
            //     setTimeout(() => {
            //         this.width = document.getElementById("content").clientWidth;
            //     }, 550);
            // }, -->

* main.css
  class main 去掉了bottom: 27px;

* app.js      
      <!-- gContextController.createNode('top_event',{x: 50, y: 50});//原为20 -->

* loadResource.js
  <!--三种门的size都改小了二分之一
   原sizeList: [{ width: 64, height: 64 }, { width: 200, height: 200 }, { width: 2000, height: 2000 }], -->

 * layout.js 
   <!-- 改为currentPosX = 50,原100 自动排序与边缘的距离-->
    <!-- export default function Layout(currentPosX = 100, currentPosY = 50, spacingX = 125, spacingY = 150){ -->
   <!-- currentPosY = 60 自动布局根节点坐标往下调10 -->

 * dom.css
   <!-- .pitch:hover+.polyline {
     /* cursor: pointer; */
     stroke-width: 1; //原为2
   } -->

* 选中边框变小
  <!-- let distence = 3;//3 -->