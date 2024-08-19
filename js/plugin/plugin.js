//将plugin注入
import gContextDao from "../dao/gContextDao.js";

export function initPlugin(project){
    let plugin = {};

    if(project === "hs") {
        return import("./hsSavePlugin.js")
            .then(module => {
                console.log(module);
                plugin["hsSave"] = module.default;
                plugin["project"] = project;
                gContextDao.setGContextProp("plugin", plugin);
                return Promise.resolve();
            });
    }else{
        return new Promise((resolve, reject)=>{
            resolve();
        });
    }


}

