
let replaceStr = {
    ",":"(%2C)",
    "\r":"(%5Cr)",
    "\n":"(%5Cn)",
}
//编码器
function coder(str){
    let newStr = str;
    for(let key in replaceStr){
        newStr = newStr.replaceAll(key, replaceStr[key]);
    }
    return newStr;
}
//解码器
function encoder(str){
    let newStr = str;
    for(let key in replaceStr){
        newStr = newStr.replaceAll(replaceStr[key], key);
    }
    return newStr;
}

export default {
    coder,
    encoder,
}