import {WebSocketProxy} from "../net/webSocketProxy.js";

let ip = window.location.hostname;
let port = window.location.port;

function failureProxy(user, project, messageCallback, closeCallback){
    //传入url
    let proxy = new WebSocketProxy("ws://"+ip+":"+port+"/failureComputer/"+user+"/"+project, messageCallback, closeCallback);
    //创建websocket实例并传入回调
    proxy.create();
    return proxy;

}

//蔡调用
function proProxy(user, project, messageCallback, closeCallback){
    //传入url
    let proxy = new WebSocketProxy("ws://"+ip+":"+port+"/proComputer/"+user+"/"+project, messageCallback, closeCallback);
    //创建websocket实例并传入回调
    proxy.create();
    return proxy;
}

//概率计算
function probabilityProxy(user, project, messageCallback, closeCallback){
    //传入url
    let proxy = new WebSocketProxy("ws://"+ip+":"+port+"/probabilityComputer/"+user+"/"+project, messageCallback, closeCallback);
    //创建websocket实例并传入回调
    proxy.create();
    return proxy;
}

export default {
    failureProxy,
    proProxy,
    probabilityProxy,
}