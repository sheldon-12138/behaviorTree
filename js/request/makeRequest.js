import fetchRequest from "../net/fetchRequest.js";

var ip = window.location.hostname;
var port = window.location.port;
const baseUrl = `http://${ip}:${port}`;

/**
 * 构建带 body 的 POST 请求
 */
function postRequest(path, data, timeout = 3000) {
    return fetchRequest(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }, timeout);
}

/**
 * 构建 GET 请求
 */
function getRequest(path, timeout = 3000) {
    return fetchRequest(`${baseUrl}${path}`, {
        method: 'GET'
    }, timeout);
}

/**
 * 构建自定义请求（如果有特殊需求）
 */
function customRequest(path, init, timeout = 3000) {
    return fetchRequest(`${baseUrl}${path}`, init, timeout);
}

export {
    postRequest,
    getRequest,
    customRequest,
    baseUrl,
};
