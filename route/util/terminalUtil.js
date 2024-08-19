const fs = require('fs');
const { exec } = require('child_process');

function terminal(...targets){
    let terminalStr = "";
    for(let i = 0, len = targets.length; i < len; ++i){
        terminalStr += targets[i] + " ";
    }

    console.log(terminalStr);
    return new Promise((resolve, reject)=>{
        exec(terminalStr, {encoding: 'utf-8'}, (err, stdout, stderr)=>{
            if(err){
                reject(JSON.stringify(err));
            }
            else if(stderr){
                resolve(JSON.stringify(stderr));
            }
            else{
                resolve(JSON.stringify(stdout));
            }
        });
    });
}

module.exports = {
    terminal,
}
