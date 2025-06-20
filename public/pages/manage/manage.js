import fileRequest from "../../../js/request/fileRequest.js";
window.onload = function () {
    new Vue({
        el: '#manage',
        data: {
            columnArr: [{ label: '角色', prop: 'role', width: '200' },
            { label: 'Ip地址', prop: 'ip', width: '200' },
            { label: '用户名', prop: 'username', width: '200' },
            { label: '密码', prop: 'password', width: '200' },
            { label: '注册时间', prop: 'registerTime', width: '200' },
            { label: '登录状态', prop: 'loginStatus', width: '200' },
            { label: '用户状态', prop: 'status', width: '200' },
            ],
            tableData: [],
            userInfo: {}
        },
        created() {
            this.getUserInfo();
            this.getUserList();
        },
        methods: {
            getUserInfo() {
                const userInfo = JSON.parse(window.sessionStorage.getItem("userInfo"));
                // console.log('userInfo', userInfo);
                this.userInfo = userInfo;
            },
            getUserList() {
                const userInfo = this.userInfo;
                if (userInfo.role == 'Admin') {
                    fileRequest.getUserList()
                        .then((data) => {
                            this.tableData = data.map(user => ({
                                // ip: '未知',
                                // status: '启用',
                                ...user,
                                role: user.role == 'Admin' ? '管理员' : '普通用户',
                                loginStatus: user.loggedIn === true ? '已登录' : '未登录',
                                status: user.enabled === false ? '禁用' : '启用', // 如果返回有enabled字段
                                ip: user.ip || '未知',
                            }));
                            // console.log(this.tableData);
                        })
                        .catch((error) => { console.log(error); })
                } else {
                    // 普通用户只能查看自己的信息
                    this.tableData.push({
                        status: '启用',
                        ...userInfo,
                        role: userInfo.role == 'Admin' ? '管理员' : '普通用户',
                        loginStatus: '已登录',
                        status: userInfo.enabled === false ? '禁用' : '启用' // 如果返回有enabled字段
                    });
                    // console.log(this.tableData);
                }


            },
            // 新增用户
            addUser() {
                this.$prompt('请输入新用户名(密码默认为123456)', '新增用户', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /\S+/,
                    inputErrorMessage: '用户名不能为空'
                }).then(({ value }) => {
                    // 发请求
                    fileRequest.addUser({ username: value }).then(resp => {
                        if (resp.status === '1') {
                            this.$message.success(resp.message);
                            this.getUserList();
                        } else {
                            this.$message.error(resp.message || '添加失败');
                        }
                    }).catch((err) => {
                        console.log('请求错误', err.message);
                        this.$message.error('请求错误');
                    });
                }).catch(() => { });
            },
            // 切换用户状态
            changeUserStatus(row, enabled) {
                this.$confirm(`确定要${enabled === false ? '禁用' : '启用'}用户 ${row.username} 吗？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    fileRequest.changeUserStatus({ username: row.username, enabled }) // 假设用户有 id 字段
                        .then(() => {
                            this.$message.success(`${enabled === false ? '禁用' : '启用'}成功`);
                            this.getUserList();
                        })
                        .catch(() => {
                            this.$message.error('操作失败');
                        });
                }).catch(() => { });
            },

            // 修改密码
            editPwd(row, havePwd) {
                const handleUpdate = (newPwd, successMsg, errorMsg) => {
                    fileRequest.updatePassword({ username: row.username, newPassword: newPwd })
                        .then(() => {
                            this.$message.success(successMsg);
                            this.getUserList();
                        })
                        .catch(() => {
                            this.$message.error(errorMsg);
                        });
                };

                if (havePwd) {
                    this.$prompt('请输入新密码', '重置密码', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputType: 'password',
                    }).then(({ value }) => {
                        handleUpdate(value, '密码修改成功', '密码修改失败');
                    }).catch(() => { });
                } else {
                    handleUpdate('123456', '密码重置成功', '密码重置失败');
                }
            },

            // 删除用户
            deleteUser(row) {
                this.$confirm(`确定要删除用户 ${row.username} 吗？此操作不可撤销。`, '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'danger'
                }).then(() => {
                    fileRequest.deleteUser({ username: row.username, })
                        .then(() => {
                            this.$message.success('删除成功');
                            this.getUserList();
                        })
                        .catch(() => {
                            this.$message.error('删除失败');
                        });
                }).catch(() => { });
            },
        }
    });
};
