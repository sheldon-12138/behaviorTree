@echo off
:: 启动 server.js 并保存 PID
start "" /b node server.js
echo %ERRORLEVEL% > server.pid

:: 等待 2 秒，确保 server_url.txt 写好
timeout /t 2 >nul

:: 读取 server_url.txt 并打开浏览器
for /f "usebackq tokens=*" %%i in ("server_url.txt") do (
    start "" %%i
)