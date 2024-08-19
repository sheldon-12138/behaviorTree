export function WebSocketProxy(url, messageCallback, closeCallback){
    this.url = url;
    this.socket = null;
    this.messageCallback = messageCallback;
    this.closeCallback = closeCallback;

    this.message = (msg)=>{
        //console.log(msg);
        this.messageCallback(this, msg.data);
    };
}
WebSocketProxy.prototype.log = function(msg){
    const prefix = '[WebSocketProxy]'
    console.log(`${prefix}${msg}`)
};

WebSocketProxy.prototype.close = function(){
    if (!this.socket) {
        this.log('socket doesn\'t exist');
        return;
    }
    this.socket.close(); // 关闭连接
    this.socket = null; // 清空当前实例
    this.closeCallback();
    this.log('socket close');
};
WebSocketProxy.prototype.send = function(msg) {
    if (!this.socket) {
        this.log('socket doesn\'t exist')
        return
    }
    msg = msg || 'default message'
    this.socket.send(msg) // 透过实例发送消息
    this.log('message sent')
};
WebSocketProxy.prototype.create = function (messageCallback, closeCallback){
    if (!WebSocket) {
        console.log('Sorry! Your browser doesn\'t support WebSocket');
        return;
    }
    // 检查是否已经有示例存在
    if (this.socket) {
        console.log('Connection already exist');
        console.log(this.socket);
        return;
    }

    try {
        this.log(`create socket with url: ${this.url}`);
        this.socket = new WebSocket(this.url);

        const self = this;
        console.log(this.socket);
        // 连接开启
        this.socket.onopen = function (e) {
            console.log('on open');
        }
        // 连接错误
        this.socket.onerror = function (e) {
            console.log('on error');
            self.close();
        }
        // 消息通知
        // if(messageCallback){
        //     this.messageCallback = messageCallback;
        // }
        // if(closeCallback) {
        //     this.closeCallback = closeCallback;
        // }
        this.socket.onmessage = this.message;

    } catch (err) {
        console.log(err);
        this.close();
    }
};
