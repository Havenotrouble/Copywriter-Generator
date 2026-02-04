@echo off
chcp 65001 > nul
echo ========================================
echo   停止 Copywriter Generator 项目
echo ========================================
echo.

echo [1/2] 查找并停止占用端口 3000 的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr LISTENING') do (
    echo 发现进程 PID: %%a
    taskkill /F /PID %%a > nul 2>&1
    if %errorlevel%==0 (
        echo 已停止前端服务 (PID: %%a^)
    )
)

echo.
echo [2/2] 查找并停止占用端口 8080 的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 " ^| findstr LISTENING') do (
    echo 发现进程 PID: %%a
    taskkill /F /PID %%a > nul 2>&1
    if %errorlevel%==0 (
        echo 已停止后端服务 (PID: %%a^)
    )
)

echo.
echo ========================================
echo   停止完成！
echo ========================================
echo.
echo 提示: 启动项目请运行 start-all.bat
echo.
pause
