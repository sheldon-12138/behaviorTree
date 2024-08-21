function splitFileName(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.')
    const name = fileName.substring(0, lastDotIndex);
    const type = fileName.substring(lastDotIndex + 1)
    return [name, type];
}

function GenNonDuplicateID() {
    let str = Math.random().toString(36).substr(3);
    str += Date.now().toString(16).substr(4);
    return str;
};

function jsonClone(obj) {
    return JSON.parse(JSON.stringify(obj));
};

function cloneObj(from) {
    return Object.keys(from)
        .reduce((obj, key) => (obj[key] = clone(from[key]), obj), {});
}

//数组深复制，不考虑循环引用的情况
function cloneArr(from) {
    return from.map((n) => clone(n));
}

// 复制输入值
function clone(from) {
    if (from instanceof Array) {
        return cloneArr(from);
    } else if (from instanceof Object) {
        return cloneObj(from);
    } else {
        return (from);
    }
}

function deepClone(targetObj) {
    let targetProto = Object.getPrototypeOf(targetObj);
    return Object.assign(Object.create(targetProto), targetObj);
};

//判断对象是否为空
function isEmpty(obj) {
    for (let key in obj) {
        return false;
    }
    return true;
}

// 防抖
function _debounce(fn, delay) {

    var delay = delay || 200;
    var timer;
    return function () {
        var th = this;
        var args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            timer = null;
            fn.apply(th, args);
        }, delay);
    };
};
// 节流
// function _throttle(fn, interval) {
//   var last;
//   var timer;
//   var interval = interval || 200;
//   return function () {
//     var th = this;
//     var args = arguments;
//     var now = +new Date();
//     if (last && now - last < interval) {
//       clearTimeout(timer);
//       timer = setTimeout(function () {
//         last = now;
//         fn.apply(th, args);
//       }, interval);
//     } else {
//       last = now;
//       fn.apply(th, args);
//     }
//   }
// };

let _now = Date.now;

function _throttle(func, wait, options) {
    var lastTime = 0
    var timeOut = null
    var result
    if (!options) {
        options = { leading: false, trailing: false }
    }

    return function (...args) {  // 节流函数
        var now = _now();

        // 首次执行看是否配置了 leading = false = 默认，阻止立即执行
        if (!lastTime && options.leading === false) {
            lastTime = now
        }
        // 配置了 leading = true 时，初始值 lastTime = 0，即可以立即执行

        var remaining = lastTime + wait - now
        // > 0 即间隔内
        // < 0 即超出间隔时间

        // 超出间隔时间，或首次的立即执行
        if (remaining <= 0) {     // trailing=false
            if (timeOut) {
                // 如果不是首次执行的情况，需要清空定时器
                clearTimeout(timeOut)
                timeOut = null
            }
            lastTime = now      // #
            result = func.apply(null, args)
        } else if (!timeOut && options.trailing !== false) {    // leading
            // 没超出间隔时间，但配置了 leading=fasle 阻止了立即执行，
            // 即需要执行一次却还未执行，等待中，且配置了 trailing=true
            // 那就要在剩余等待毫秒时间后触发
            timeOut = setTimeout(() => {
                lastTime = options.leading === false ? 0 : _.now()      // # !lastTime 的判断中需要此处重置为0
                timeOut = null
                result = func.apply(null, args)
            }, remaining);
        }

        return result
    }
}

function removeElement(arr, item) {
    return arr.filter(function (i) {
        return i != item;
    })
};

// 阻止默认事件
function stopDefault(e) {
    //阻止默认浏览器动作(W3C)
    if (e && e.preventDefault)
        e.preventDefault();
    //IE中阻止函数器默认动作的方式
    else
        window.event.returnValue = false;
    return false;
};

// 阻止冒泡
function stopBubble(e) {
    //如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation)
        //因此它支持W3C的stopPropagation()方法
        e.stopPropagation();
    else
        //否则，我们需要使用IE的方式来取消事件冒泡
        window.event.cancelBubble = true;
};

function splitByLine(str, max, fontsize) {
    let curLen = 0;
    let result = [];
    let start = 0, end = 0;
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        let pixelLen = code > 255 ? fontsize : fontsize / 2;
        curLen += pixelLen;
        if (curLen > max) {
            end = i;
            result.push(str.substring(start, end));
            start = i;
            curLen = pixelLen;
        }
        if (i === str.length - 1) {
            end = i;
            result.push(str.substring(start, end + 1));
        }
    }
    return result;
};

let dataConversion = (function () {
    let canvas = document.createElement("canvas");

    class Converter {
        Base64ToBase64(base64, callback) {
            let img = new Image();
            img.src = base64;
            img.onload = function () {
                let arr = base64.split(','),
                    type = arr[0].match(/:(.*?);/)[1];
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, img.width, img.height);
                let dataURL = canvas.toDataURL(type);
                callback(dataURL);
            }
        }

        getSizeByBase64(dataURL, callback) {
            let img = new Image();
            img.src = dataURL;
            img.onload = function () {
                let size = { width: img.naturalWidth, height: img.naturalHeight };
                callback(size);
            }
        }

        imgToBase64(url, callback) {
            let img = new Image();
            img.src = url;
            img.onload = function () {
                let ext = url.substr(url.lastIndexOf(".") + 1);
                let type = `image/${ext}`;
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, img.width, img.height);
                let dataURL = canvas.toDataURL(type);
                callback(dataURL);
            }

        }

        base64ToFile(fileName, dataURL) {
            let arr = dataURL.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            let blob = new Blob([u8arr], {
                type: mime
            });

            blob.lastModified = new Date();
            blob.name = fileName;
            return blob;
        }
    }

    return new Converter();
})();

//解决浮点运算
function fixMath(m, n, op) {
    var m = Number(m);
    var n = Number(n);
    var a = String(m);
    var b = String(n);
    var x = 1;
    var y = 1;
    var c = 1;
    if (a.indexOf(".") > 0) {
        x = Math.pow(10, a.length - a.indexOf("."));
    }
    if (b.indexOf(".") > 0) {
        y = Math.pow(10, b.length - b.indexOf("."));
    }
    switch (op) {
        case '+':
        case '-':
            c = Math.max(x, y);
            m = Math.round(m * c);
            n = Math.round(n * c);
            break;
        case '*':
            c = x * y
            m = Math.round(m * x);
            n = Math.round(n * y);
            break;
        case '/':
            c = Math.max(x, y);
            m = Math.round(m * c);
            n = Math.round(n * c);
            c = 1;
            break;
    }
    return eval("( " + m + op + n + ")/ " + c);
}

export default {
    splitFileName,
    GenNonDuplicateID,
    jsonClone,
    _debounce,
    removeElement,
    _throttle,
    stopDefault,
    stopBubble,
    deepClone,
    clone,
    splitByLine,
    isEmpty,
    dataConversion,
    fixMath
}
