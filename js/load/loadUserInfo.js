import fileController from "../controller/fileController.js";


//加载用户信息
export function loadUserInfo(){

    //获取登录用户
    let user = window.sessionStorage.getItem("user");
    if(!user){
        //默认用户
        window.sessionStorage.setItem("user", "tester");
        user = "tester";
    }

    //初始化添加用户项目列表
    fileController.loadUserProjectList(user);


};
