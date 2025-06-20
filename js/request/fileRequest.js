import { postRequest, getRequest, customRequest, baseUrl } from './makeRequest.js';

// 获取系统配置项
function getSystemConfig() {
    return getRequest('/api/getSystemConfig/');
}

// 解析 XML
function analysisXml(param) {
    return postRequest('/api/user/analysisXml/', param);
}

// 获取节点图片
function getNodePic({ user, project }) {
    return customRequest(`/api/user/getNodePic/${user}/${project}`, {}, 20000);
}

// 用户管理接口
function getUserList() {
    return getRequest('/api/user/getUserList');
}

function addUser(param) {
    return postRequest('/api/user/addUser', param);
}

function changeUserStatus(param) {
    return postRequest('/api/user/changeUserStatus', param);
}

function updatePassword(param) {
    return postRequest('/api/user/updatePassword', param);
}

function deleteUser(param) {
    return postRequest('/api/user/deleteUser', param);
}

function uploadUserProject(param) {
    return postRequest('/api/user/uploadUserProject', param, 10000);
}

export default {
    getSystemConfig,
    analysisXml,
    getNodePic,

    getUserList,
    addUser,
    changeUserStatus,
    updatePassword,
    deleteUser,
    uploadUserProject,
};