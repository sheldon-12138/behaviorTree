@echo off
if exist server.pid (
    :: 读取文件内容到 PID，去掉空格和换行
    for /f "usebackq tokens=* delims= " %%a in ("server.pid") do set PID=%%a

    if "%PID%"=="" (
        echo server.pid 文件存在但为空，无法获取 PID！
    ) else (
        echo 正在关闭 Node 进程 PID=%PID% ...
        taskkill /f /pid %PID%
    )
    del server.pid
) else (
    echo 未找到 server.pid，可能服务没启动？
)
pause
