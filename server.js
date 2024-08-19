const fs = require('fs');
const bodyParser = require('body-parser');
const jp = bodyParser.json();
const querystring = require('querystring');
const os = require('os');
const {
	exec
} = require('child_process');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multiparty = require("multiparty");



const express = require('express');


const app = express();
const expressWs = require('express-ws');
expressWs(app);

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//router
const user = require('./route/userRoute');
const computer = require('./route/computeRoute');

// 加载静态文件

app.use(express.static('./'));
//app.use('/', express.static('public'));
app.use('/user', express.static('user'));
app.use(cookieParser('sessiontest'));
app.use(session({
	secret: 'sessiontest', //与cookieParser中的一致
	resave: true,
	saveUninitialized: true
}));

app.use('/', user);
app.use('/', computer);
//extended:false 不使用第三方模块处理参数，使用Nodejs内置模块querystring处理

app.all("*", function (req, res, next) {
	//设置允许跨域的域名，*代表允许任意域名跨域
	res.header("Access-Control-Allow-Origin", "http://192.168.11.118:8080");
	//允许的header类型
	res.header("Access-Control-Allow-Headers", "content-type");
	//跨域允许的请求方式
	res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
	if (req.method.toLowerCase() == 'options')
		res.send(200);  //让options尝试请求快速结束
	else
		next();
});

app.get('/', function (req, resp) {
	fs.readFile('./public/page/login.html', function (err, data) {
		if (err) {
			resp.send(err);
		} else {
			resp.send(data.toString());
		}
	});
});
app.get('/login', function (req, resp) {
	fs.readFile('./public/page/login.html', function (err, data) {
		if (err) {
			resp.send(err);
		} else {
			resp.send(data.toString());
		}
	})
});
app.get('/login/:user/:pwd', function (req, resp) {
	let user = req.params.user;
	let pwd = req.params.pwd;
	let corrent = false;
	let files = fs.readdirSync('./user');
	if (files.indexOf(user) === -1) {
		fs.mkdirSync('./user/' + user);
		fs.writeFileSync('./user/' + user + '/' + user + '.info', JSON.stringify({
			password: pwd
		}), {
			encoding: "utf-8"
		});
		// fetchRequest.session['user'] = {name:user, password:pwd};
		resp.send('2');
	} else {
		fs.readFile('./user/' + user + '/' + user + '.info', function (err, data) {
			if (err) {
				resp.send('-2');
			} else {
				// console.log(data.toString());
				if (JSON.parse(data.toString())['password'] === pwd) {
					// fetchRequest.sesstion['user'] = {name:user, password:pwd};
					resp.send('1');
				} else {
					resp.send('-1');
				}
			}
		});


	}

});
// 主页面
app.get('/index', function (req, resp) {
	fs.readFile('index.html', function (err, data) {
		if (err) {
			resp.send(err);
		} else {
			resp.send(data.toString());
		}
	})
});
app.get('/indexD3.html', function (req, resp) {
	fs.readFile('indexD3.html', function (err, data) {
		if (err) {
			resp.send(err);
		} else {
			resp.send(data.toString());
		}
	})
});

var getUserFile = function (user, project, suffix) {
	return './user/' + user + "/" + project + "/" + project + suffix;
}


// 读文件
app.get('/read/:user/:project', function (req, resp) {


	// console.log('')
	var ft = '',
		di = '',
		// da = '',
		ti = '',
		pi = '',
		dc = '',
		ex = '';
	var ftcontent = '',
		dicontent = '',
		// dacontent = '',
		ticontent = '',
		picontent = '',
		dccontent = '',
		excontent = '';


	ft = getUserFile(req.params.user, req.params.project, '.ft');
	di = getUserFile(req.params.user, req.params.project, '.di');
	// da = getUserFile(req.params.user, req.params.project, '.da');
	ti = getUserFile(req.params.user, req.params.project, '.ti');
	pi = getUserFile(req.params.user, req.params.project, '.pi');
	dc = getUserFile(req.params.user, req.params.project, '.dc');
	ex = getUserFile(req.params.user, req.params.project, '.ex');

	// console.log('ti', ti)

	if (ft === '') {
		resp.send('-1');
		return;
	}
	var success = true;
	// Promise异步读文件
	var getFt = function () {
		return new Promise(function (resolve, reject) {

			fs.readFile(ft, 'utf8', function (err, data) {
				if (err) {
					// resp.send('-2');
					// success = false;
					resolve();
				} else if (success) {
					// console.log(ft+','+data);
					ftcontent = data;
					resolve(data);
				}

			});
		})
	}
	var getDi = function (resolve, reject) {
		return new Promise(function (resolve, reject) {


			if (di === '') {
				resolve('');
			} else {
				fs.readFile(di, 'utf8', function (err, data) {
					if (err) {
						// resp.send('-2');
						// success = false;
						resolve();
					} else if (success) {
						dicontent = data;
						resolve(data);
					}

				});
			}

		});
	}
	// var getDa = function (resolve, reject) {
	// 	return new Promise(function (resolve, reject) {


	// 		if (da === '') {
	// 			resolve('');
	// 		} else {
	// 			fs.readFile(da, 'utf8', function (err, data) {
	// 				if (err) {
	// 					// resp.send('-2');
	// 					// success = false;
	// 					resolve();
	// 				} else if (success) {
	// 					dacontent = data;
	// 					resolve(data);
	// 				}
	// 			});
	// 		}

	// 	});
	// }
	var getDo = function (resolve, reject) {
		return new Promise(function (resolve, reject) {


			if (pi === '') {
				resolve('');
			} else {
				fs.readFile(pi, 'utf8', function (err, data) {
					if (err) {
						// resp.send('-2');
						// success = false;
						resolve();
					} else if (success) {
						picontent = data;
						resolve(data);
					}
				});
			}

		});
	}
	var getDc = function (resolve, reject) {
		return new Promise(function (resolve, reject) {
			if (dc === '') {
				resolve('');
			} else {
				fs.readFile(dc, 'utf8', function (err, data) {
					if (err) {
						// success = false;

						resolve();
					} else if (success) {
						dccontent = data;
						resolve(data);
					}
				})
			}
		});
	}
	var getEx = function (resolve, reject) {
		return new Promise(function (resolve, reject) {
			if (ex === '') {
				resolve('');
			} else {
				fs.readFile(ex, 'utf8', function (err, data) {
					if (err) {
						// success = false;

						resolve();
					} else if (success) {
						excontent = data;
						resolve(data);
					}
				})
			}
		});
	}
	// getDa(),
	Promise.all([getFt(), getDi(), getDo(), getDc(), getEx()]).then(function (data) {
		content = {
			ft: {
				name: ft,
				content: excontent + ftcontent
			},
			di: {
				name: di,
				content: dicontent
			},
			// da: {
			// 	name: da,
			// 	content: dacontent
			// },
			pi: {
				name: pi,
				content: picontent
			},
			dc: {
				name: dc,
				content: dccontent
			}
		}
		console.log(content);
		resp.send(JSON.stringify(content));
	});
	
});

// 文件另存为
app.post('/fold', function (req, resp) {

	var postData = "";
	req.setEncoding('utf-8'); //设置编码

	req.addListener('data', function (postDataStream) {
		postData += postDataStream
	});

	req.addListener('end', function () {
		//数据接收完毕
		var param = querystring.parse(postData);


		let success = true;
		let fileName = param.project;
		let workspace = param.workspace;
		new Promise(function (resolve, reject) {
			let ftcon = param.content.replace(/%2B/g, '+');
			fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.ft', decodeURI(ftcon), {
				encoding: "utf-8"
			}, function (err) {
				if (err) {
					success = false;
					resolve(resolve, reject);
				} else if (success === true) {
					success = true;
					resolve(resolve, reject);
				}
			});
		}).then(function (resolve, reject) {
			fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.di', param.dicontent, {
				encoding: "utf-8"
			}, function (err) {
				if (err) {
					success = false;
					resolve(resolve, reject);
				} else if (success === true) {
					success = true;
					resolve(resolve, reject);
				}
			});
		})
			// .then(function (resolve, reject) {
			// 	let dccon = param.dcacontent.replace(/%2B/g, '+');
			// 	fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.da', decodeURI(dccon), {
			// 		encoding: "utf-8"
			// 	}, function (err) {
			// 		if (err) {
			// 			success = false;
			// 			resolve(resolve, reject);
			// 		} else if (success === true) {
			// 			success = true;

			// 		}
			// 	});
			// })
			.then(function (resolve, reject) {
				fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.pi', param.docontent, {
					encoding: "utf-8"
				}, function (err) {
					if (err) {
						success = false;

					} else if (success === true) {
						success = true;
					}
				});

			}).then(function (resolve, reject) {
				let excon = param.excontent.replace(/%2B/g, '+');
				fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.ex', decodeURI(excon), {
					encoding: "utf-8"
				}, function (err) {
					if (err) {
						success = false;

					} else if (success === true) {
						success = true;
					}
				});
			}).finally(function () {
				if (success) {
					resp.send('1');
				} else {
					resp.send('-1');
				}
			})



	});
});

// 获取文件名
function getFileName(path) {
	var pos1 = path.lastIndexOf('/');
	var pos2 = path.lastIndexOf('\\');
	var pos = Math.max(pos1, pos2);

	return path.substring(pos + 1, path.length);
}
// 获取文件除后缀以外的路径
function getFilePath(path) {
	var pos = path.lastIndexOf('.');
	if (pos < 0)
		return path;
	else
		return path.substring(0, pos);
}

// 文件保存
app.post('/save', function (req, resp) {

	var postData = "";
	req.setEncoding('utf-8'); //设置编码

	req.addListener('data', function (postDataStream) {
		postData += postDataStream
	});

	req.addListener('end', function () {
		//数据接收完毕
		var param = querystring.parse(postData);
		// console.log(param.name);
		// console.log(postData);
		let fileName = param.project;
		let workspace = param.workspace;
		if (param.name === '') {



			let success = true;

			// console.log(result.filePaths + "," + fileName);
			new Promise(function (resolve, reject) {
				// console.log(param.content);
				let ftcon = param.content.replace(/%2B/g, '+');
				fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.ft', decodeURI(ftcon), {
					encoding: "utf-8"
				}, function (err) {
					if (err) {
						success = false;
						resolve(resolve, reject);
					} else if (success === true) {
						success = true;
						resolve(resolve, reject);
					}
				});
			}).then(function (resolve, reject) {

				fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.di', param.dicontent, {
					encoding: "utf-8"
				}, function (err) {
					if (err) {
						success = false;
						resolve(resolve, reject);
					} else if (success === true) {
						success = true;
						resolve(resolve, reject);
					}
				});
			}).then(function (resolve, reject) {
				let dccon = param.dcacontent.replace(/%2B/g, '+');
				fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.da', decodeURI(dccon), {
					encoding: "utf-8"
				}, function (err) {
					if (err) {
						success = false;
						resolve(resolve, reject);
					} else if (success === true) {
						success = true;
						// resolve(resolve, reject);
					}
				});
			}).then(function (resolve, reject) {

				fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.pi', param.docontent, {
					encoding: "utf-8"
				}, function (err) {
					if (err) {
						success = false;

					} else if (success === true) {
						success = true;
					}
				});
			}).then(function (resolve, reject) {
				let excon = param.excontent.replace(/%2B/g, '+');
				fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.ex', decodeURI(excon), {
					encoding: "utf-8"
				}, function (err) {
					if (err) {
						success = false;

					} else if (success === true) {
						success = true;
					}
				});
			}).finally(function () {
				if (success) {
					resp.send(workspace + '/' + fileName);
				} else {
					resp.send('-1');
				}
			})

		} else {
			let success = true;

			let filePath = getFilePath(param.name);
			(new Promise(function (resolve, reject) {


				let ftcon = param.content.replace(/%2B/g, '+');
				fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.ft', unescape(ftcon), {
					encoding: "utf-8"
				}, function (err) {

					console.log('./user/' + workspace + '/' + fileName + '/' + fileName + '.ft');
					console.log(unescape(param.content));

					if (err) {
						success = false;
						resolve(resolve, reject);
					} else if (success === true) {
						success = true;
						resolve(resolve, reject);
					}
				});
			}).then(new Promise(function (resolve, reject) {

				fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.di', param.dicontent, {
					encoding: "utf-8"
				}, function (err) {



					if (err) {
						success = false;
						resolve(resolve, reject);
					} else if (success === true) {
						success = true;
						resolve(resolve, reject);
					}
				});
			}))
				// .then(new Promise(function (resolve, reject) {
				// 	let dccon = param.dcacontent.replace(/%2B/g, '+');
				// 	fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.da', unescape(dccon), {
				// 		encoding: "utf-8"
				// 	}, function (err) {
				// 		if (err) {
				// 			success = false;
				// 			resolve(resolve, reject);
				// 		} else if (success === true) {
				// 			success = true;
				// 			resolve(resolve, reject);
				// 		}
				// 	});
				// }))
				.then(new Promise(function (resolve, reject) {

					fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.pi', param.docontent, {
						encoding: "utf-8"
					}, function (err) {
						if (err) {
							success = false;

						} else if (success === true) {
							success = true;

						}
					});
				})).then(function (resolve, reject) {
					let excon = param.excontent.replace(/%2B/g, '+');
					fs.writeFile('./user/' + workspace + '/' + fileName + '/' + fileName + '.ex', decodeURI(excon), {
						encoding: "utf-8"
					}, function (err) {
						if (err) {
							success = false;

						} else if (success === true) {
							success = true;
						}
					});
				}).finally(function () {
					if (success) {

						resp.send(workspace + '/' + fileName);
					} else {
						resp.send('-1');
					}
				}))
		}
	});
})


var running = function (ftid, user, pro, time, precision, type) {
	return new Promise(function (resolve) {
		exec('.\\user\\' + user + '\\' + pro + '\\' + pro + '.exe ' + './user/' + user + '/' + pro + '/' + pro + '.di ' + ftid + ' ' + time + ' ' + precision + ' ' + type, function (err, stdout, stderr) {
			if (err) {
				resolve('');
			} else {
				console.log(stdout);
				resolve('');
			}
		})
	});
}

var readDo = function (path, file) {
	return new Promise(function (resolve) {
		fs.readFile(path + file, function (err, data) {
			if (err) {
				resolve('');
			} else {
				console.log(data.toString());
				resolve(data.toString());
			}
		})
	});
}

var delFile = function (file) {
	fs.unlink(file, function () { });
}

function delDir(path, callback) {
	let files = [];
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path);
		let proList = [];
		let newFiles = files.concat();
		newFiles.forEach((file, index) => {

			console.log(index);
			let curPath = path + "/" + file;
			// fs.unlinkSync(curPath); //删除文件
			delFile(curPath);


		});

		let timer = setInterval(function () {

			fs.readdir(path, function (err, files) {
				if (files.length === 0) {
					clearInterval(timer);
					callback();
				}

			})



		}, 500);



	}
}

var conSort = function (a, b) {
	let str1 = a.split(',');
	let str2 = b.split(',');
	if (parseInt(str1[0]) < parseInt(str2[0])) {
		return -1;
	} else {
		return 1;
	}
}



// 运行
app.get('/running/:user/:pro/:maxId/:isUse/:time', function (req, resp) {


	let user = req.params.user;
	let pro = req.params.pro;
	let maxId = parseInt(req.params.maxId);
	let useDo = parseInt(req.params.isUse);
	let time = parseInt(req.params.time);
	// 创建文件夹
	if (!fs.existsSync('./user/' + user + '/' + pro + '/temp')) {
		fs.mkdirSync('./user/' + user + '/' + pro + '/temp');
	}
	if (!fs.existsSync('./user/' + user + '/' + pro + '/log')) {
		fs.mkdirSync('./user/' + user + '/' + pro + '/log');
	}
	if (!fs.existsSync('./user/' + user + '/' + pro + '/temp2')) {
		fs.mkdirSync('./user/' + user + '/' + pro + '/temp2');
	}

	// 使用 c++ 编译一个 C++ 源文件为可执行文件
	exec('m.exe ' + './user/' + user + '/' + pro + '/' + pro + '.ft', function (err, stdout, stderr) {
		if (err) {
			resp.send(JSON.stringify({
				err: err.message
			}));
		} else {

			// 读文件夹中的a.exe文件，如果不存在,调用M.exe生成a.exe
			fs.readdir('./user/' + user + '/' + pro, function (err, files) {
				if (err) {
					resp.send(JSON.stringify({
						err: err.message
					}));
					// console.log(err);
				} else {
					exec('c++ ./user/' + user + '/' + pro + '/' + pro + '.cpp ' + '-o ./user/' + user + '/' + pro + '/' + pro + '.exe', function (err, stdout, stderr) {
						if (err) {
							resp.send(JSON.stringify({
								err: err.message
							}));
						}

						{
							let proList = [];
							for (let i = 1, len = maxId; i <= len; ++i) {
								// console.log(i);
								proList.push(running(i, user, pro, time, 1, 'Cd'));
							}

							Promise.all(proList).then(function () {


								fs.readdir('./user/' + user + '/' + pro + '/temp', function (err, files) {

									let newFiles = files.filter(function (file) {
										var d = file.length - 3;
										return (d >= 0 && file.lastIndexOf('.do') == d)

									});
									proList = [];
									for (let i = 0, len = files.length; i < len; ++i) {
										console.log(files[i]);
										proList.push(readDo('./user/' + user + '/' + pro + '/temp/', newFiles[i]));
									}

									exec('y.exe ' + './user/' + user + '/' + pro + '/' + pro + '.ft', function (err, stdout, stderr) {


										if (err) {
											resp.send(JSON.stringify({
												err: err.message
											}));
										} else {
											exec('c++ ./user/' + user + '/' + pro + '/' + pro + '_calc.cpp ' + '-o ./user/' + user + '/' + pro + '/' + pro + '_calc.exe', function () {




												Promise.all(proList).then(function (result) {
													result.sort(conSort);
													let content = result.join('\n');
													console.log(content);

													let fws = fs.createWriteStream('./user/' + user + '/' + pro + '/' + pro + '.do', {
														encoding: 'utf8',
														autoClose: false,
														start: 0
													});
													fws.write(content, function () {
														exec('.\\user\\' + user + '\\' + pro + '\\' + pro + '_calc.exe ' + './user/' + user + '/' + pro + '/' + pro + '.ft ' + './user/' + user + '/' + pro + '/' + pro + '.do ' + time + ' ' + useDo + ' 0', function (err, stdout, stderr) {

															if (err) {
																resp.send(JSON.stringify({
																	err: err.message
																}));
															} else {
																delDir('./user/' + user + '/' + pro + '/temp', function () {
																	// resp.send(content);
																	fs.readFile('./user/' + user + '/' + pro + '/' + pro + '.fo', function (err, data) {
																		let focontent = data.toString().replace(/(\*FAULT_OUTPUT\\n)/g, '');
																		fs.readFile('./user/' + user + '/' + pro + '/' + pro + '_log.txt', function (err, data) {
																			let log = (data.toString());
																			console.log(log);
																			resp.send(JSON.stringify({
																				docontent: content,
																				focontent: focontent,
																				log: log
																			}));
																		});

																	});

																});

															}
														})
													})
												})



											})
										}


									})




								});




							});



						}
					})
				}
			})
		}
	})
});

app.get('/read', function (req, resp) {
	let files = fs.readdirSync('./user');
	let newFiles = files.filter(function (file) {
		return fs.lstatSync('./user/' + file).isDirectory();
	});
	resp.send(JSON.stringify(newFiles));
});

function endWidth(target, endStr) {
	let d = target.length - endStr.length;
	return (d >= 0 && target.lastIndexOf(endStr) == d);
}


//获取用户所有的项目
app.get('/api/getUserProjectList/:user', function (req, resp) {
	let user = req.params.user;
	let files = fs.readdirSync('./user/' + user);
	let projectList = {};
	// let newFiles = files.filter(function (file) {
	// 	return fs.lstatSync('./user/' + user + '/' + file).isDirectory();
	// });

	for (let i = 0; i < files.length; ++i) {
		if (fs.lstatSync('./user/' + user + '/' + files[i]).isDirectory()) {
			let proFiles = fs.readdirSync('./user/' + user + '/' + files[i]);
			projectList[files[i]] = files[i];
			for (let j = 0; j < proFiles.length; ++j) {
				if (endWidth(proFiles[j], "infomation")) {
					projectList[files[i]] = fs.readFileSync('./user/' + user + '/' + files[i] + '/' + proFiles[j], 'utf-8');
				}
			}
		}
	}


	resp.send(JSON.stringify(projectList));

});


app.get('/new/:user', function (req, resp) {
	let user = req.params.user;
	if (!fs.existsSync('./user/' + user)) {
		fs.mkdirSync('./user/' + user);
		let files = fs.readdirSync('./user');
		let newFiles = files.filter(function (file) {
			return fs.lstatSync('./user/' + file).isDirectory();
		});
		resp.send(JSON.stringify(newFiles));
	} else {
		resp.send('-2');
	}

});
app.get('/new/:user/:pro', function (req, resp) {
	let user = req.params.user;
	let pro = req.params.pro;
	if (!fs.existsSync('./user/' + user + '/' + pro)) {
		fs.mkdirSync('./user/' + user + '/' + pro);
		let files = fs.readdirSync('./user/' + user);
		fs.writeFileSync('./user/' + user + '/' + pro + '/' + pro + '.ft', '', {
			encoding: "utf-8"
		});
		// fs.writeFileSync('./user/' + user + '/' + pro + '/' + pro + '.da', '', {
		// 	encoding: "utf-8"
		// });
		fs.writeFileSync('./user/' + user + '/' + pro + '/' + pro + '.dc', '', {
			encoding: "utf-8"
		});
		fs.writeFileSync('./user/' + user + '/' + pro + '/' + pro + '.di', '', {
			encoding: "utf-8"
		});
		fs.writeFileSync('./user/' + user + '/' + pro + '/' + pro + '.pi', '', {
			encoding: "utf-8"
		});
		fs.writeFileSync('./user/' + user + '/' + pro + '/' + pro + '.ex', '', {
			encoding: "utf-8"
		});
		let newFiles = files.filter(function (file) {
			return fs.lstatSync('./user/' + user + '/' + file).isDirectory();
		});
		resp.send(JSON.stringify(newFiles));
	} else {
		resp.send('-2');
	}
});

// 读取系统配置项
app.get('/api/getSystemConfig', function (req, resp) {
	fs.readFile('./config.json', 'utf-8', function (err, data) {
		if (err) {
			console.error('读取系统配置项时出错：', err);
			resp.status(500).send('服务器内部错误');
			return;
		}
		const systemConfig = JSON.parse(data);
		// console.log(systemConfig)
		resp.send(systemConfig);
	});
});


// 进度条
app.get('/progress/running/:user/:pro', function (req, resp) {
	// let array = ['30', '50', '80', '100'];
	// let ran = parseInt(Math.random()*4);
	// resp.send(array[ran]);
	let user = req.params.user;
	let pro = req.params.pro;
	if (!fs.existsSync('./user/' + user + '/' + pro + '/' + pro + '.cpp') || fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.cpp')['mtime'] < fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.ft')['mtime']) {
		resp.send('10');
	} else if (!fs.existsSync('./user/' + user + '/' + pro + '/' + pro + '.exe') || fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.exe')['mtime'] < fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.ft')['mtime']) {
		resp.send('30');
	} else if (!fs.existsSync('./user/' + user + '/' + pro + '/' + pro + '.do') || fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.do')['mtime'] < fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.ft')['mtime']) {
		resp.send('50');
	} else if (!fs.existsSync('./user/' + user + '/' + pro + '/' + pro + '.fo') || fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.fo')['mtime'] < fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.ft')['mtime']) {
		resp.send('80');
	} else {
		resp.send('100');
	}
});
// 进度条
app.get('/progress/running2/:user/:pro', function (req, resp) {
	// let array = ['30', '50', '80', '100'];
	// let ran = parseInt(Math.random()*4);
	// resp.send(array[ran]);
	let user = req.params.user;
	let pro = req.params.pro;
	if (!fs.existsSync('./user/' + user + '/' + pro + '/' + pro + '_calc.cpp') || fs.statSync('./user/' + user + '/' + pro + '/' + pro + '_calc.cpp')['mtime'] < fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.ft')['mtime']) {
		resp.send('10');
	} else if (!fs.existsSync('./user/' + user + '/' + pro + '/' + pro + '.fo') || fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.fo')['mtime'] < fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.ft')['mtime']) {
		resp.send('80');
	} else {
		resp.send('100');
	}
});


var running2Exe = function (str) {
	return new Promise(function (resolve) {
		exec(str, function (err, stdout, stderr) {
			if (err) {
				resolve('');
			} else {
				// console.log(stdout);
				resolve('');
			}
		})
	});
}




app.get('/running2/:user/:pro/:time', function (req, resp) {


	let user = req.params.user;
	let pro = req.params.pro;
	let time = parseInt(req.params.time) * 10000;

	if (!fs.existsSync('./user/' + user + '/' + pro + '/log')) {
		fs.mkdirSync('./user/' + user + '/' + pro + '/log');
	}
	if (!fs.existsSync('./user/' + user + '/' + pro + '/temp2')) {
		fs.mkdirSync('./user/' + user + '/' + pro + '/temp2');
	}

	if (fs.existsSync('./user/' + user + '/' + pro + '/' + pro + '.fo') && fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.fo')['mtime'] >= fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.ft')['mtime']) {
		let data = fs.readFileSync('./user/' + user + '/' + pro + '/' + pro + '.fo');
		let focontent = data.toString().replace(/(\*FAULT_OUTPUT\\n)/g, '')
		resp.send(JSON.stringify({
			focontent: focontent
		}));
	} else {


		exec('y.exe ' + './user/' + user + '/' + pro + '/' + pro + '.ft', function (err, stdout, stderr) {

			if (err) {
				// running2Flag = false;
				resp.send(JSON.stringify({
					err: err.message
				}));
			} else {
				// if (!fs.existsSync('./user/' + user + '/' + pro + '/' + pro + '_calc.exe') || fs.statSync('./user/' + user + '/' + pro + '/' + pro + '_calc.exe')['mtime'] < fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.ft')['mtime']) {
				console.log(1);
				exec('c++ ./user/' + user + '/' + pro + '/' + pro + '_calc.cpp ' + '-o ./user/' + user + '/' + pro + '/' + pro + '_calc.exe', function (err) {

					if (err) {
						if (err.message.indexOf('Permission') >= 0) {
							resp.send(JSON.stringify({
								calculate: '计算中请等待'
							}));
						} else {
							resp.send(JSON.stringify({
								err: err.message
							}));
						}

					} else {

						// exec('.\\user\\'+user+'\\'+pro+'\\'+pro+'_calc.exe ' + './user/'+user+'/'+pro+'/'+pro+'.ft ' + './user/'+user+'/'+pro+'/'+pro+'.pi ' + '1 ' + time  + ' ' + '1', function(err, stdout, stderr){
						// 	if(err){
						// 		resp.send(JSON.stringify({err:err}));
						// 	}
						// 	let data = fs.readFileSync('./user/'+user+'/'+pro+'/'+pro+'.fo');
						// 	let focontent = data.toString().replace(/(\*FAULT_OUTPUT\\n)/g, '');
						// 	let log = fs.readFileSync('./user/'+user+'/'+pro+'/'+pro+'_log.txt').toString();
						// 	console.log(log);
						//  resp.send(JSON.stringify({focontent:focontent, log:log}));
						// })

						let foList = [];
						for (let i = 0; i < 4; ++i) {
							foList.push(running2Exe('.\\user\\' + user + '\\' + pro + '\\' + pro + '_calc.exe ' + './user/' + user + '/' + pro + '/' + pro + '.ft ' + './user/' + user + '/' + pro + '/' + pro + '.pi ' + (i + 1) + ' ' + time + ' ' + '1'));
						}
						Promise.all(foList).then(function (result) {
							let dataMap = {};
							fs.readdir('./user/' + user + '/' + pro + '/temp2', function (err, files) {

								for (let i = 0, len = files.length; i < len; ++i) {
									let d = files[i].length - 3;
									if (d >= 0 && files[i].lastIndexOf('.fo') == d) {

										let data = fs.readFileSync('./user/' + user + '/' + pro + '/temp2/' + files[i]).toString();
										data = data.replace(/\r\n/g, '\n');
										let datas = data.split('\n');
										for (let j = 0, len = datas.length; j < len; ++j) {
											if (datas[j] !== '') {
												let strs = datas[j].split(',');
												if (dataMap[strs[0]] === undefined) {
													dataMap[strs[0]] = [];
													for (let k = 1, len = strs.length; k < len; ++k) {
														dataMap[strs[0]].push(parseFloat(strs[k]));
													}
												} else {
													for (let k = 1, len = strs.length; k < len; ++k) {
														dataMap[strs[0]][k - 1] += parseFloat(strs[k]);
													}
												}

											}
										}
									} else {

									}
								}
								let focontent = '';
								for (let d in dataMap) {
									dataMap[d] = dataMap[d].map(function (item) {
										return (item * 1.0 / 4).toFixed(10)
									});
									// console.log(dataMap[d]);
									focontent += (d + ',' + dataMap[d].join(',') + '\r\n');
								}
								// console.log(focontent);
								fs.writeFile('./user/' + user + '/' + pro + '/' + pro + '.fo', focontent, {
									encoding: 'utf-8'
								}, function (err) {
									// console.log(focontent);
									// resp.json({focontent:focontent, log:focontent});
									fs.readFile('./user/' + user + '/' + pro + '/' + pro + '.fo', function (err, data) {
										// running2Flag = false;
										if (err) {
											resp.json({
												err: err.message
											});
										} else {
											resp.json({
												focontent: data.toString(),
												log: data.toString()
											});
										}
									})

								});
							});

						})

						// if(err){
						// 	// running2Flag = false;
						// 	resp.json({err:err.message});
						// }
					}


				})

				// }
			}


		})
	}
});

app.get('/changePWD/:user/:oldPWD/:newPWD', function (req, resp) {
	let oldPWD = req.params.oldPWD;
	let newPWD = req.params.newPWD;
	let user = req.params.user;
	fs.readFile('./user/' + user + '/' + user + ".info", function (err, data) {
		if (err) {
			resp.send('-1');
		} else {
			if (JSON.parse(data)['password'] === oldPWD) {
				fs.writeFile('./user/' + user + '/' + user + ".info", JSON.stringify({
					'password': newPWD
				}), function (err) {
					if (err) {
						resp.send('-1');
					} else {
						resp.send('1');
					}
				})
			}
		}
	})
});


app.get('/findFo/:user/:pro', function (req, resp) {
	let user = req.params.user;
	let pro = req.params.pro;
	if (fs.existsSync('./user/' + user + '/' + pro + '/' + pro + '.fo') && fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.fo')['mtime'] >= fs.statSync('./user/' + user + '/' + pro + '/' + pro + '.ft')['mtime']) {
		fs.readFile('./user/' + user + '/' + pro + '/' + pro + '.fo', function (err, data) {
			resp.json({ focontent: data.toString(), log: data.toString() });
		})
	} else {
		resp.json({ err: '计算中...' });
	}
})

app.post('/upload/:user/:pro/:id', function (req, resp) {

	let user = req.params.user;
	let pro = req.params.pro;
	let id = req.params.id;
	var form = new multiparty.Form({ uploadDir: './user/' + user + '/' + pro + '/img/' });
	form.parse(req, function (err, fields, files) {
		console.log(fields, files, ' fields2')
		if (err) {
		} else {
			console.log(files.file[0].path);
			resp.json({ img: files.file[0].path })
		}
	});

})




// 使用Node.js的os模块来获取本地计算机的IPv4地址
var ip = showObj(os.networkInterfaces());


function showObj(obj) {//遍历obj（即网络接口信息），查找符合条件的IPv4地址
	// for(var devName in obj){
	//     var iface = obj[devName];
	//     for(var i=0;i<iface.length;i++){
	//         var alias = iface[i];
	//         if(alias.family === 'IPv4' && alias.address !== '127.0.0.1'){
	// 			return alias.address;
	// 		}
	//     }
	// }

	//	return '192.168.11.199';
	return 'localhost';
}





console.log(ip);
app.listen(9800, ip);
