import fileRequest from "../../../js/request/fileRequest.js";
import { g } from "../../../js/structure/gContext.js"
window.onload = function () {
    new Vue({
        el: '#manage',
        data: {
            user: g.gContext.user,
            tableData: [
                // { role: '普通用户', registerTime: '2025-03-02', username: 'tester', password: '123456', email: '1112223333@qq.com', tel: '11122223333', ip: '192.168.11.199', status: '启用' },
                // { role: '普通用户', registerTime: '2025-03-04', username: 'user1', password: '123098', email: '1112223333@qq.com', tel: '11122223333', ip: '192.168.11.199', status: '启用' },
                // { role: '普通用户', registerTime: '2025-03-01', username: 'user2', password: '123321', email: '1112223333@qq.com', tel: '11122223333', ip: '192.168.11.199', status: '启用' },
                // { role: '普通用户', registerTime: '2025-03-03', username: 'user3', password: '123234', email: '1112223333@qq.com', tel: '11122223333', ip: '192.168.11.199', status: '启用' }
            ]
        },
        created() {
            this.getUserList();
        },
        methods: {
            getUserList() {
                const userInfo = JSON.parse(window.sessionStorage.getItem("userInfo"));
                console.log('userInfo', userInfo);
                if (userInfo.username == 'tester') {
                    fileRequest.getUserList()
                        .then((data) => {
                            this.tableData = data.map(user => ({
                                ip: '未知',
                                tel: '',
                                email: '',
                                status: '启用',
                                ...user,
                                role: user.role == 'Admin' ? '管理员' : '普通用户',
                                status: user.enabled === false ? '禁用' : '启用' // 如果返回有enabled字段
                            }));
                            // console.log(this.tableData);
                        })
                        .catch((error) => { console.log(error); })
                } else {
                    // 普通用户只能查看自己的信息
                    this.tableData.push({
                        tel: '',
                        email: '',
                        status: '启用',
                        ...userInfo,
                        role: userInfo.role == 'Admin' ? '管理员' : '普通用户',
                        status: userInfo.enabled === false ? '禁用' : '启用' // 如果返回有enabled字段
                    });
                    console.log(this.tableData);
                }


            },
            handleAdd() { },
            handleSelectionChange() { },
            handleEdit() { },
            handleDelete(index, row) {
                console.log('row', row);
            }
        }
    });
};
