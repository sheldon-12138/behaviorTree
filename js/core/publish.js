export default function Publish(){

    this.listeners = {};

}

Publish.prototype.registerListener = function(key, handler){
    if(!this.listeners.hasOwnProperty(key)){
        this.listeners[key] = [];
    }
    this.listeners[key].push(handler);
}

Publish.prototype.removeListener = function(key, handler){
    if(this.listeners.hasOwnProperty(key)){
        let listener = this.listeners[key];
        for(let i = listener[key].length-1; i >= 0; ++i){
            if(listener[key][i]===handler){
                listener[key].splice(i, 1);
            }
        }
        if(listener.length === 0){
            delete this.listeners[key];
        }
    }
}

Publish.prototype.emit = function(key){
    let handlerArgs = Array.prototype.slice.call(arguments, 1);
    if(this.listeners.hasOwnProperty(key)){
        let listener = this.listeners[key];
        for(let i = 0, len = listener.length; i < len; ++i){
            listener[i].apply(this, handlerArgs);
        }
    }
}