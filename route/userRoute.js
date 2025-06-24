const express = require('express');
const router = express.Router();
const fs = require('fs');
const querystring = require('querystring');
const multiparty = require("multiparty");
const bodyParser = require('body-parser');

const jp = bodyParser.json();

const fileUtil = require('./util/fileUtil');
const formatUtil = require('./util/formatUtil');
const logManager = require('./util/logManager');

const path = require('path');
const userRoot = './user';

router.post('/kk', function () {
    resp.send('yes');
});

// 遍历
function readStaticFilesRecursively(dirPath, basePath = dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
            files.push(...readStaticFilesRecursively(fullPath, basePath));
        } else if (entry.isFile()) {
            const content = fs.readFileSync(fullPath);
            files.push({
                path: `behaviortree_cpp/${relativePath}`, // 用于前端 zip 内路径
                content: content.toString('base64') // base64 编码
            });
        }
    }

    return files;
}

//保存文件
router.post('/api/user/uploadUserProject', jp, function (req, resp) {
    const { projectName, userModelList, mainTree } = req.body;

    const treeContent = formatUtil.returnXml(
        JSON.parse(req.body.treeContent),
        projectName,
        userModelList,
        mainTree
    );

    // 读取静态资源目录
    const staticDir = path.resolve(__dirname, '../assets/behaviortree_cpp');
    let staticFiles = [];
    if (fs.existsSync(staticDir)) {
        staticFiles = readStaticFilesRecursively(staticDir);
    }
    // console.log('staticFiles', staticFiles);
    // 返回给前端
    resp.send({
        message: "success",
        treeContent,
        staticFiles
    });
});

//图片上传
router.post('/api/user/uploadNodePicture/:user/:pro', function (req, resp) {

    let user = req.params.user;
    let projectName = req.params.pro;

    let imgPath = './user/' + user + '/' + projectName + '/img';

    let pathExists = fs.existsSync(imgPath);
    if (pathExists) {
        fileUtil.delDir(imgPath);
    }
    fs.mkdirSync(imgPath);



    let form = new multiparty.Form({ uploadDir: imgPath });


    form.parse(req, function (err, fields, files) {
        //console.log(fields);
        if (err) {
            console.log(err);
            resp.send({ message: "" });
        } else {
            let img = files.img;
            if (img) {
                for (let i = 0, len = img.length; i < len; ++i) {
                    // console.log(img[i])
                    fs.renameSync(img[i].path, imgPath + "/" + img[i].originalFilename);
                    img[i].path = imgPath + "/" + img[i].originalFilename;
                }
                let logger = logManager.getLogger();
                logger.info(`${projectName} 图片保存成功`);
                resp.send({ message: "" });
            } else {
                let logger = logManager.getLogger();
                logger.warn(`${projectName} 没有图片`);
                resp.send({ message: "" });
            }
        }
    });

});

router.get('/api/user/getNodePic/:user/:project', function (req, resp) {
    let user = req.params.user;
    let project = req.params.project;
    let imgPath = "./user/" + user + "/" + project + "/img";
    let result = {};
    if (fs.existsSync(imgPath)) {
        let fileNameList = fs.readdirSync(imgPath);
        for (let i = 0, len = fileNameList.length; i < len; ++i) {
            let url = imgPath + "/" + fileNameList[i];
            if (fs.lstatSync(url).isFile()) {
                let fileName = fileNameList[i];
                let filePrefix = fileName.substr(0, fileName.indexOf("."));
                result[filePrefix] = { url: url, fileName: fileName };
            }
        }
    }
    resp.send(JSON.stringify(result));

});



// 解析xml
router.post('/api/user/analysisXml', jp, function (req, resp) {
    let content = formatUtil.xmlToJson(req.body.xml)
    // console.log(content)
    resp.send(JSON.stringify({ content, flag: true }));
    // let logger = logManager.getLogger();
    // logger.info(`${req.params.user}/${req.params.project} 文件读取成功`);
});

// 获取用户列表
router.get('/api/user/getUserList', function (req, resp) {
    // let files = fs.readdirSync('./user');
    // let newFiles = files.filter(function (file) {
    //     return fs.lstatSync('./user/' + file).isDirectory();
    // });
    // resp.send(JSON.stringify(newFiles));
    const userDir = './user';

    try {
        const users = fs.readdirSync(userDir);
        const result = [];

        users.forEach(user => {
            const infoPath = `${userDir}/${user}/${user}.info`;
            if (fs.existsSync(infoPath)) {
                const data = fs.readFileSync(infoPath, 'utf-8');
                const parsed = JSON.parse(data);
                result.push({
                    username: user,
                    ...parsed // 比如包含 password 字段
                });
            }
        });

        resp.json(result);
    } catch (err) {
        resp.status(500).json({ error: '读取用户信息失败', details: err.message });
    }
});

// 获取当前时间
function getCurrentTime() {
    const date = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}  ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
// 封装的中间件统一进行权限检查
function requireAdmin(req, res, next) {
    console.log(req.session)
    if (req.session?.role === 'Admin') {
        return next();
    }
    return res.status(403).json({ status: '-403', message: '没有权限' });
}

// 新增用户
router.post('/api/user/addUser', jp, (req, res) => {
    const { username } = req.body;

    if (!username || !/\S/.test(username)) {
        return res.json({ status: '-2', message: '用户名不能为空' });
    }

    if (!fs.existsSync(userRoot)) {
        fs.mkdirSync(userRoot, { recursive: true });
    }

    const allUsers = fs.readdirSync(userRoot);
    if (allUsers.includes(username)) {
        return res.json({ status: '0', message: '用户已存在' });
    }

    const userDir = path.join(userRoot, username);
    const infoPath = path.join(userDir, `${username}.info`);

    try {
        fs.mkdirSync(userDir, { recursive: true });

        const userInfo = {
            role: 'user',
            password: '123456',
            loggedIn: false,
            registerTime: getCurrentTime(),
            enabled: true,
            ip: ''
        };

        fs.writeFileSync(infoPath, JSON.stringify(userInfo, null, 2), 'utf-8');
        res.json({ status: '1', message: '新增用户成功' });
    } catch (err) {
        console.error('新增用户出错:', err);
        res.json({ status: '-2', message: '新增用户失败' });
    }
});

// 启用/禁用用户
router.post('/api/user/changeUserStatus', jp, (req, res) => {
    const { username, enabled } = req.body;

    if (typeof enabled !== 'boolean' || !username) {
        return res.json({ status: '-2', message: '参数错误' });
    }

    const infoPath = path.join(userRoot, username, `${username}.info`);
    if (!fs.existsSync(infoPath)) {
        return res.json({ status: '0', message: '用户不存在' });
    }

    try {
        const userInfo = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
        userInfo.enabled = enabled;
        fs.writeFileSync(infoPath, JSON.stringify(userInfo, null, 2), 'utf-8');

        res.json({ status: '1', message: enabled ? '用户已启用' : '用户已禁用' });
    } catch (err) {
        console.error('修改启用状态失败:', err);
        res.json({ status: '-2', message: '操作失败' });
    }
});

// 修改密码
router.post('/api/user/updatePassword', jp, (req, res) => {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
        return res.json({ status: '-2', message: '参数不能为空' });
    }

    const infoPath = path.join(userRoot, username, `${username}.info`);
    if (!fs.existsSync(infoPath)) {
        return res.json({ status: '0', message: '用户不存在' });
    }

    try {
        const userInfo = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
        userInfo.password = newPassword;
        fs.writeFileSync(infoPath, JSON.stringify(userInfo, null, 2), 'utf-8');
        res.json({ status: '1', message: '密码修改成功' });
    } catch (err) {
        console.error('修改密码失败:', err);
        res.json({ status: '-2', message: '修改密码失败' });
    }
});

// 删除用户
router.post('/api/user/deleteUser', jp, (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.json({ status: '-2', message: '用户名不能为空' });
    }

    if (!fs.existsSync(userRoot)) {
        return res.json({ status: '0', message: '用户目录不存在' });
    }

    const allUsers = fs.readdirSync(userRoot);
    if (!allUsers.includes(username)) {
        return res.json({ status: '0', message: '用户不存在' });
    }

    const userDir = path.join(userRoot, username);

    try {
        fs.rmSync(userDir, { recursive: true, force: true });
        res.json({ status: '1', message: '用户已删除' });
    } catch (err) {
        console.error('删除用户失败:', err);
        res.json({ status: '-2', message: '删除失败' });
    }
});

module.exports = router;