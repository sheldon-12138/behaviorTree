import gContextDao from "../dao/gContextDao.js";

function save(content){


    content[".fta"] = "";
    //let roots = [];
    let queue = [];

    let traver = gContextDao.traverseNode();
    let node = traver.next();
    while(!node.done) {
        let value = node.value;
        if(value.upEntity.length <= 0){
            queue.push(value.id);
        }
        node = traver.next();
    }

    let allContent = "";
    while(queue.length !== 0){
        let ftId = queue.shift();
        let entity = gContextDao.findEntity(ftId);
        let ftaContent = "";
        if(entity&&entity.category === "event"){
            ftaContent = "*Damage_Probability_FTA\r\n";
            if(entity.downEntity.length > 0){
                let door = gContextDao.findEntity(entity.downEntity[0]);
                if(door.category === "door") {
                    ftaContent += entity.name + "," + entity.desc + "\r\n";
                    ftaContent += entity.ftID + "\r\n";
                    let type = "UD";
                    if(door.type.indexOf("or"))
                        type = "OR";
                    else if(door.type.indexOf("and"))
                        type = "AND";
                    else if(door.type.indexOf("user"))
                        type = "UD";
                    ftaContent += type;
                    for(let i = 0, len = door.downEntity.length; i < len; ++i){
                        ftaContent +=  "," + gContextDao.findEntity(door.downEntity[i]).ftID;
                        queue.push(door.downEntity[i]);
                    }
                    ftaContent += "\r\n";
                }
            }
            else{
                ftaContent += entity.name + "," + entity.desc + "\r\n";
                ftaContent += entity.ftID + "\r\n";
                ftaContent += "\r\n\r\n";
            }
        }
        allContent += ftaContent;
    }

    content[".fta"] += allContent;


}

export default {
    save,
}