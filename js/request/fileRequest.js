import fetchRequest from "../net/fetchRequest.js";

var ip = window.location.hostname;
var port = window.location.port;

//获取用户的项目列表
function getUserProjectList(param) {
    return fetchRequest("http://" + ip + ":" + port + "/api/user/getUserProjectList/" + param.user,
        {
            method: 'GET'
        }, 3000);
};

//获取系统配置项
function getSystemConfig() {
    return fetchRequest("http://" + ip + ":" + port + "/api/getSystemConfig/",
        {
            method: 'GET'
        }, 3000);
};

//获取用户的一个项目
function getUserProject(param) {
    return fetchRequest("http://" + ip + ":" + port + "/api/user/getUserProject/" + param.user + "/" + param.project, {}, 3000);
};

//解析xml
function analysisXml(param) {
    let init = {
        method: 'POST',
        body: JSON.stringify(param),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    }
    return fetchRequest("http://" + ip + ":" + port + "/api/user/analysisXml/", init, 3000);
};

//获取节点图片
function getNodePic(param) {
    return fetchRequest("http://" + ip + ":" + port + "/api/user/getNodePic/" + param.user + "/" + param.project, {}, 20000);
}

//获取所有用户
function getUserList(param) {
    return fetchRequest("http://" + ip + ":" + port + "/api/user/getUserList", {}, 3000);
};

function uploadUserProject(param) {

    let init = {
        method: 'POST',
        body: JSON.stringify(param),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    }
    return fetchRequest("http://" + ip + ":" + port + "/api/user/uploadUserProject", init, 10000);
};


//根据项目名获取用户项目
function findUserProjectByName(param) {
    return fetchRequest("http://" + ip + ":" + port + "/api/user/getUserProjectList/" + param.user, {}, 3000).then((res) => {
        if (res[param.projectName]) {
            return Promise.reject({ err: "项目已存在" });
        } else {
            return Promise.resolve(res);
        }
    });
};

function uploadNodePicture(param) {

    let formData = new FormData();

    for (let key in param["pictures"]) {
        formData.append("img", param["pictures"][key], key);
    }

    let init = {
        method: "POST",
        body: formData,
    };
    return fetchRequest("http://" + ip + ":" + port + "/api/user/uploadNodePicture/" + param.user + "/" + param.projectName, init, 20000);
}

export default {
    analysisXml,
    getSystemConfig,
    getUserProjectList,
    getUserProject,
    getUserList,
    uploadUserProject,
    findUserProjectByName,
    // uploadNodePicture,
    getNodePic,
}