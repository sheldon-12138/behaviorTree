import gContextDao from "../dao/gContextDao.js";


// 获取设备像素比，即物理设备像素与CSS像素之间的比率。
function getPixelRatio(context) {
    let backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
}

// 计算屏幕的DPI（每英寸点数）。
// 试图获取window.screen对象的deviceXDPI和deviceYDPI属性，否则通过创建临时元素来测量DPI
function js_getDPI() {
    let arrDPI = new Array(2);
    if (window.screen.deviceXDPI) {
        arrDPI[0] = window.screen.deviceXDPI;
        arrDPI[1] = window.screen.deviceYDPI;
    }
    else {
        let tmpNode = document.createElement("DIV");
        tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
        document.body.appendChild(tmpNode);
        arrDPI[0] = parseInt(tmpNode.offsetWidth);
        arrDPI[1] = parseInt(tmpNode.offsetHeight);
        tmpNode.parentNode.removeChild(tmpNode);
    }
    return arrDPI;
}

// 定义转换 cm 到 inch 的函数
let getINByCM = (function () {
    let c = {};//缓存已经计算过的值，以避免重复计算
    return function (cm) {
        if (c.hasOwnProperty(cm)) {
            return c[cm];
        }
        c[cm] = cm * 0.39370079;
        console.log(c);
        return c[cm];
    }
})();

// 定义转换 inch 到 cm 的函数
let getCMByIN = (function () {
    let c = {};
    return function (IN) {
        if (c.hasOwnProperty(IN)) {
            return c[IN];
        }
        c[IN] = IN / 0.39370079;
        return c[IN];
    }
})();

// 加载坐标轴和处理绘制功能。
export function loadAxis() {
    // console.log('进loadAxis')
    let axis_x = document.getElementById("axis_x");
    let axis_y = document.getElementById("axis_y");


    let axis = gContextDao.getGContextProp("axis");

    let dpi = js_getDPI();
    let svgCanvas = gContextDao.getGContextProp("svgCanvas");


    let width_x = svgCanvas.size.width * svgCanvas.zoom;//画布宽*缩放比
    let overall_cm_x = getCMByIN(width_x / dpi[0]);
    // let height_x = 20;
    let height_x = 15;
    let px_pre_cm_x = width_x / overall_cm_x;//每厘米的像素数
    let canvas_x = document.getElementById("canvas_axis_x");
    let ctx_x = canvas_x.getContext('2d');
    let ratio_x = getPixelRatio(ctx_x);
    let aWidth_x = parseFloat(axis_x.clientWidth) - parseFloat(window.getComputedStyle(axis_x, null)["padding-right"]);
    canvas_x.style.width = aWidth_x + 'px';
    canvas_x.style.height = height_x + 'px';
    canvas_x.width = aWidth_x * ratio_x;
    canvas_x.height = height_x * ratio_x;
    ctx_x.scale(ratio_x, ratio_x);

    // let width_y = 20;
    let width_y = 15;
    let height_y = svgCanvas.size.height * svgCanvas.zoom;
    let overall_cm_y = getCMByIN(height_y / dpi[1]);
    let px_pre_cm_y = height_y / overall_cm_y;
    let canvas_y = document.getElementById("canvas_axis_y");
    let ctx_y = canvas_y.getContext('2d');
    let ratio_y = getPixelRatio(ctx_y);
    let aHeight_y = parseFloat(axis_y.clientHeight) - parseFloat(window.getComputedStyle(axis_y, null)["padding-bottom"]);
    canvas_y.style.width = width_y + 'px';
    canvas_y.style.height = aHeight_y + 'px';
    canvas_y.width = width_y * ratio_y;
    canvas_y.height = aHeight_y * ratio_y;
    ctx_y.scale(ratio_y, ratio_y);




    let publish = gContextDao.getGContextProp("publish");
    publish.registerListener("canvas_size", setCanvasSize);//当"canvas_size"事件发生时，将调用setCanvasSize函数



    window.requestAnimationFrame(render);//下一次重绘时执行render函数，从而创建动画效果


    // 一直执行
    function render() {
        //current_cm_x += 0.5;
        let current_cm_x = axis.axis_x.canvas_x;//获取当前水平坐标轴的位置（以厘米为单位）
        ctx_x.clearRect(0, 0, canvas_x.width, canvas_x.height);//清除水平坐标轴画布的内容

        let draw_current_x = -current_cm_x * svgCanvas.zoom;
        let cm_x = 0;


        // 修改部分
        // 根据缩放级别调整步长
        let stepSize = 1;
        if (svgCanvas.zoom === 0.25) {
            stepSize = 5;
        }

        // console.log('overall_cm_x', overall_cm_x)
        // while (cm_x < overall_cm_x) {//绘制水平坐标轴，包括绘制刻度线和文本标签等等。循环绘制多个刻度线和文本
        while (cm_x < (overall_cm_x / svgCanvas.zoom)) {
            ctx_x.beginPath();
            ctx_x.strokeStyle = "#666666";
            ctx_x.lineWidth = 0.5;
            ctx_x.moveTo(draw_current_x, 0);
            ctx_x.lineTo(draw_current_x, height_x / 8 * 3);
            ctx_x.stroke();

            if (cm_x !== 0) {
                ctx_x.fontWeight = "500";
                ctx_x.font = "500 6px Graduate";
                ctx_y.textAlign = "left";
                ctx_y.textBaseline = "top";
                ctx_x.fillText(`${cm_x}`, cm_x === 0 ? draw_current_x : draw_current_x - 2, height_x / 8 * 7);
            }

            let k = 1;
            let off_cm = px_pre_cm_x * svgCanvas.zoom / (stepSize == 5 ? 1.00 : 10.0);//5步为1刻度时，里头的小刻度为1步
            let current_x_x = off_cm;
            while (k <= 9) {
                ctx_x.beginPath();
                ctx_x.strokeStyle = "#999999";
                ctx_x.lineWidth = 0.5;
                ctx_x.moveTo(draw_current_x + current_x_x, 0);
                //5步为1刻度时，里头的小刻度长度为和之前1步1刻度中5的长度一样
                ctx_x.lineTo(draw_current_x + current_x_x, (k === 5 || stepSize == 5) ? height_x / 16 * 5 : height_x / 16 * 3);
                ctx_x.stroke();
                ++k;
                current_x_x += off_cm;
            }

            cm_x += stepSize;// cm_x += 1;
            draw_current_x += px_pre_cm_x * svgCanvas.zoom * stepSize;//draw_current_x += px_pre_cm_x * svgCanvas.zoom

        }


        let current_cm_y = axis.axis_y.canvas_y;
        ctx_y.clearRect(0, 0, canvas_y.width, canvas_y.height);

        let draw_current_y = -current_cm_y * svgCanvas.zoom;
        let cm_y = 0;
        // console.log('overall_cm_y', overall_cm_y)
        // while (cm_y < overall_cm_y) {
        while (cm_y < (overall_cm_y / svgCanvas.zoom)) {
            ctx_y.beginPath();
            ctx_y.strokeStyle = "#666666";
            ctx_y.lineWidth = 0.5;
            ctx_y.moveTo(0, draw_current_y);
            ctx_y.lineTo(width_y / 8 * 3, draw_current_y);
            ctx_y.stroke();

            if (cm_y !== 0) {
                ctx_y.save();
                ctx_y.fontWeight = "500";
                ctx_y.font = "500 6px Graduate";
                ctx_y.textAlign = "right";
                ctx_y.textBaseline = "top";
                let rad = Math.PI / 180 * -90;
                ctx_y.translate(width_y / 8 * 5, cm_y === 0 ? draw_current_y : draw_current_y - 2);
                ctx_y.rotate(rad);
                ctx_y.fillText(`${cm_y}`, 0, 0);
                ctx_y.restore();
            }

            let k = 1;
            let off_cm = px_pre_cm_y * svgCanvas.zoom / (stepSize == 5 ? 1.00 : 10.0);
            let current_y_y = off_cm;
            while (k <= 9) {
                ctx_y.beginPath();
                ctx_y.strokeStyle = "#999999";
                ctx_y.lineWidth = 0.5;
                ctx_y.moveTo(0, draw_current_y + current_y_y);
                ctx_y.lineTo((k === 5 || stepSize == 5) ? width_y / 16 * 5 : width_y / 16 * 3, draw_current_y + current_y_y);

                ctx_y.stroke();
                ++k;
                current_y_y += off_cm;
            }

            cm_y += stepSize;//cm_y += 1;
            draw_current_y += px_pre_cm_y * svgCanvas.zoom * stepSize;//draw_current_y += px_pre_cm_y * svgCanvas.zoom
        }
        window.requestAnimationFrame(render);

    }

    // 根据指定的高度参数或条件来动态调整坐标轴大小
    function setCanvasSize(height) {
        // console.log('height', height)
        // console.log('更新坐标轴大小', svgCanvas.size.width)

        width_x = svgCanvas.size.width * svgCanvas.zoom;// 获取画布宽度并乘以缩放比例 
        // console.log('width_x', width_x)
        if (width_x > 1870) {
            overall_cm_x = getCMByIN(width_x / dpi[0]);// 将像素转换为厘米
            // height_x = 20;// 设定固定的高度
            height_x = 15;
            px_pre_cm_x = width_x / overall_cm_x; // 计算每厘米的像素数
            canvas_x = document.getElementById("canvas_axis_x");// 获取 x 轴画布元素
            ctx_x = canvas_x.getContext('2d');// 获取 2D 上下文
            ratio_x = getPixelRatio(ctx_x);// 获取像素比例
            aWidth_x = parseFloat(axis_x.clientWidth) - parseFloat(window.getComputedStyle(axis_x, null)["padding-right"]);// 计算有效宽度

            canvas_x.style.width = aWidth_x + 'px';// 设置画布元素的宽度
            canvas_x.style.height = height_x + 'px';// 设置画布元素的高度
            canvas_x.width = aWidth_x * ratio_x; // 设置画布的实际宽度（考虑像素比例）
            canvas_x.height = height_x * ratio_x;// 设置画布的实际高度（考虑像素比例）
            ctx_x.scale(ratio_x, ratio_x);// 缩放绘图上下文以适应像素比例   
            // width_y = 20;
            width_y = 15;

            // console.log('setCanvasSize', canvas_x)
        }



        // 计算新的 y 轴画布尺寸
        height_y = svgCanvas.size.height * svgCanvas.zoom;
        if (height_y > 900) {
            overall_cm_y = getCMByIN(height_y / dpi[1]);
            px_pre_cm_y = height_y / overall_cm_y;
            canvas_y = document.getElementById("canvas_axis_y");
            ctx_y = canvas_y.getContext('2d');
            ratio_y = getPixelRatio(ctx_y);
            aHeight_y = parseFloat(axis_y.clientHeight) - parseFloat(window.getComputedStyle(axis_y, null)["padding-bottom"]);
            if (height) {// 考虑指定的高度参数
                aHeight_y -= parseFloat(height);
            }
            canvas_y.style.width = width_y + 'px';
            canvas_y.style.height = aHeight_y + 'px';
            canvas_y.width = width_y * ratio_y;
            canvas_y.height = aHeight_y * ratio_y;
            ctx_y.scale(ratio_y, ratio_y);

            // console.log('setCanvasSize', canvas_y)
        }

    }


}