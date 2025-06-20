window.onload = function () {
    new Vue({
        el: '#login',
        data: {
            username: '',
            password: '',
            msg: '',
            msgColor: ''
        },

        methods: {
            login() {
                if (!this.username || !this.password) {
                    this.msg = '请输入用户名和密码';
                    this.msgColor = 'red';
                    return;
                }

                fetch(`/login/${encodeURIComponent(this.username)}/${encodeURIComponent(this.password)}`)
                    .then(res => res.json())
                    .then(res => {
                        const code = res.status;
                        switch (code) {
                            case '1':
                                this.msgColor = 'green';
                                this.msg = '登录成功，跳转中...';
                                window.sessionStorage.setItem("userInfo", JSON.stringify(res.user));
                                setTimeout(() => window.location.href = '/index', 1000);
                                break;
                            case '2':
                                this.msgColor = 'orange';
                                this.msg = '用户不存在';
                                break;
                            case '-1':
                                this.msgColor = 'red';
                                this.msg = '密码错误';
                                break;
                            case '-2':
                                this.msgColor = 'red';
                                this.msg = '读取用户信息失败';
                                break;
                            case '-3':
                                this.msgColor = 'red';
                                this.msg = '该账户已在其他设备登录，请先退出';
                                break;
                            case '-4':
                                this.msgColor = 'red';
                                this.msg = '该账户已被禁用';
                                break;
                            default:
                                this.msgColor = 'red';
                                this.msg = '未知错误';
                        }
                    })
                    .catch(err => {
                        this.msgColor = 'red';
                        this.msg = '网络错误';
                        console.error(err);
                    });
            },
            register() {
                if (!this.username || !this.password) {
                    this.msg = '请输入用户名和密码';
                    this.msgColor = 'red';
                    return;
                }

                if (this.username.trim().toLowerCase() === 'admin') {
                    this.msg = '禁止注册管理员账户';
                    this.msgColor = 'red';
                    return;
                }

                fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password
                    })
                })
                    .then(res => res.json())
                    .then(res => {
                        switch (res.status) {
                            case '1':
                                this.msgColor = 'green';
                                this.msg = '注册成功，请登录';
                                break;
                            case '0':
                                this.msgColor = 'orange';
                                this.msg = '用户已存在';
                                break;
                            case '-2':
                                this.msgColor = 'red';
                                this.msg = '注册失败';
                                break;
                            default:
                                this.msgColor = 'red';
                                this.msg = res.message || '未知错误';
                        }
                    })
                    .catch(err => {
                        this.msgColor = 'red';
                        this.msg = '网络错误';
                        console.error(err);
                    });
            }

        }
    });
};

