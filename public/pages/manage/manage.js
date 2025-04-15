import fileRequest from "../../../js/request/fileRequest.js";
window.onload = function () {
    new Vue({
        el: '#manage',
        data: {
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
