const fs = require('fs');
const logManager = require('./logManager');
const logger = logManager.getLogger();

//读文件
function getContent(file) {
    return new Promise(function (resolve, reject) {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                resolve("");
            } else {
                resolve(data);
            }

        });
    });
};

//获取用户项目文件夹路径
function getUserFolder(user, project) {
    return process.cwd() + '/user/' + user + "/" + project;
};

//获取用户文件路径
function getUserFile(user, project, suffix) {
    return process.cwd() + '/user/' + user + "/" + project + "/" + project + suffix;
};
function getComputerUserFile(user, project) {
    return process.cwd() + '/user/' + user + "/" + project + "/" + project;
}
//写文件
function writeContent(path, content) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(path, content, {

        }, function (err) {
            if (err) {
                reject(path + "文件保存失败" + err);
            }
            else {
                resolve(path + "文件创建成功");
            }
        });
    });
};
function endWidth(target, endStr) {
    let d = target.length - endStr.length;
    return (d >= 0 && target.lastIndexOf(endStr) == d);
};
//删除文件夹
function delDir(path) {
    if (fs.lstatSync(path).isDirectory()) {
        let fileList = fs.readdirSync(path);
        for (let i = 0; i < fileList.length; ++i) {
            let cPath = `${path}/${fileList[i]}`;
            if (fs.lstatSync(cPath).isDirectory()) {
                logger.info(`删除${cPath}文件夹`);
                delDir(cPath);
            }
            else {
                logger.info(`删除${cPath}文件`);
                fs.unlinkSync(cPath);
            }
        }
        fs.rmdirSync(path);
    }
    else {
        logger.warn(`${path} 文件夹不存在`);
        return { err: "文件夹不存在" };
    }
};
//解析do data为文件数据
function analysisDo(data) {
    var file = data.split("*DAMAGE_OUTPUT");
    var doData = [];
    for (let i = 1; i < file.length; i++) {
        let lineData = file[i].split(",");
        let probabilityList = [];
        for (let j = 1; j < lineData.length; j++) {
            probabilityList.push(parseFloat(lineData[j]));
        }
        doData.push(
            {
                ftID: lineData[0],
                probability: probabilityList,
                level: probabilityList.length - 1
            }
        );
    }
    return doData;
};
//获取当前node运行目录
function getRunTimePath() {
    return process.cwd();
}
module.exports = {
    getContent,
    getUserFile,
    getUserFolder,
    writeContent,
    endWidth,
    delDir,
    getComputerUserFile,
    getRunTimePath,
}