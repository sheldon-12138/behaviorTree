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


router.post('/kk', function () {
    resp.send('yes');
});

//获取用户所有的项目
router.get('/api/user/getUserProjectList/:user', function (req, resp) {
    let user = req.params.user;
    let files = fs.readdirSync('./user/' + user);
    let projectList = {};

    for (let i = 0; i < files.length; ++i) {
        if (fs.lstatSync('./user/' + user + '/' + files[i]).isDirectory()) {
            let proFiles = fs.readdirSync('./user/' + user + '/' + files[i]);
            projectList[files[i]] = files[i];
            for (let j = 0; j < proFiles.length; ++j) {
                if (fileUtil.endWidth(proFiles[j], "info")) {
                    projectList[files[i]] = fs.readFileSync('./user/' + user + '/' + files[i] + '/' + proFiles[j], 'utf-8');
                }
            }
        }
    }
    resp.send(JSON.stringify(projectList));
});

//保存文件
router.post('/api/user/uploadUserProject', jp, function (req, resp) {
    // console.log(req.body);

    let { user, projectName, userModelList } = req.body;

    // console.log(req.body);
    let treeContent = formatUtil.returnXml(JSON.parse(req.body.treeContent), projectName, userModelList);

    //同步创建目录
    let firstCreate = false;
    let dir = `./user/${user}/${projectName}`;
    if (!fs.existsSync(dir)) {
        firstCreate = true;
        fs.mkdirSync(dir);
    }

    let tree = fileUtil.writeContent(`${dir}/${projectName}.xml`, treeContent);
    let savePromiseList = [tree];
    Promise.all(savePromiseList).then((message) => {
        resp.send({ message });
        // console.log(message);
    }).catch((err) => {
        console.log(err);
        resp.send({ err: err });
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


//打开项目
router.get('/api/user/getUserProject/:user/:project', function (req, resp) {

    const folderPath = fileUtil.getUserFolder(req.params.user, req.params.project);
    let btprojFiles = null
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return console.error(`无法读取文件夹: ${err}`);
        }
        // console.log(files);

        btprojFiles = files.filter(file => path.extname(file) === '.btproj');
        const xmlFiles = files.filter(file => path.extname(file) === '.xml');


        // console.log(xmlFiles);
    });
    console.log(btprojFiles);


    // let btproj = '', projcontent = ''


    // btproj = fileUtil.getUserFile(req.params.user, req.params.project, '.btproj');

    // if (btproj === '') {
    //     resp.send('-1');
    //     return;
    // }

    // Promise异步读文件
    // let getBtproj = fileUtil.getContent(btproj);

    // Promise.all([getBtproj]).then(function (dataList) {
    //     projcontent = dataList[0];
    //     let content = {
    //         xml: {
    //             name: xml,
    //             content: formatUtil.xmlToJson(projcontent),
    //         },
    //     }
    resp.send(JSON.stringify({}));
    //     let logger = logManager.getLogger();
    //     logger.info(`${req.params.user}/${req.params.project} 文件读取成功`);
    // });

});

// 解析xml
router.post('/api/user/analysisXml', jp, function (req, resp) {
    let content = formatUtil.xmlToJson(req.body.xml)
    // console.log(content)
    resp.send(JSON.stringify({ content, flag: true }));
    // let logger = logManager.getLogger();
    // logger.info(`${req.params.user}/${req.params.project} 文件读取成功`);
});

router.get('/api/user/getUserList', function (req, resp) {
    let files = fs.readdirSync('./user');
    let newFiles = files.filter(function (file) {
        return fs.lstatSync('./user/' + file).isDirectory();
    });
    resp.send(JSON.stringify(newFiles));
});

module.exports = router;