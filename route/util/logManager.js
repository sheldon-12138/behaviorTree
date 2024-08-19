
let logManager = (function(){
    const log4js = require('log4js');
    log4js.configure({
        appenders: {
            defaultLog: { type: "file", filename: "./log/log.log" },
        },
        categories: {
            default: { appenders: ["defaultLog"], level: "debug" },
        },
    });

    let logger = log4js.getLogger();
    return {
        addAppender(key, fileName){
            if(log4js.configure.appenders.hasOwnProperty(key)){
                logger.fatal(`Named ${key} appender already exists!`);
            }else{
                log4js.configure.appenders[key] = {type:"file", fileName:fileName};
                logger.info(`Successfully add appender ${key}.`);
            }
        },

        addLogger(key, appenders){
            if(log4js.configure.categories.hasOwnProperty(key)){
                logger.fatal(`Named ${key} logger already exists!`);
            }else{
                log4js.configure.categories[key] = {appenders:appenders,  level:"debug"};
                logger.info(`Successfully add logger ${key}.`);
            }
        },

        getAppenderList(){
            let list = [];
            for(let key in log4js.configure.appenders){
                list.push(key);
            }
            return list;
        },

        getLogger(name){
            if(typeof name === 'undefined'|| !name){
                return log4js.getLogger();
            }
            return log4js.getLogger(name);
        },

    }


})();

module.exports = logManager;