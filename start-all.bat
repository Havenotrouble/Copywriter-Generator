@echo off
chcp 65001 > nul
echo ========================================
echo   启动 Copywriter Generator 项目
echo ========================================
echo.

echo [1/3] 检查端口占用...
netstat -ano | findstr ":3000 " | findstr LISTENING > nul
if %errorlevel%==0 (
    echo 警告: 端口 3000 已被占用
    echo 请先运行 stop-all.bat 停止服务
    pause
    exit /b 1
)

netstat -ano | findstr ":8080 " | findstr LISTENING > nul
if %errorlevel%==0 (
    echo 警告: 端口 8080 已被占用
    echo 请先运行 stop-all.bat 停止服务
    pause
    exit /b 1
)

echo 端口检查通过
echo.

echo [2/3] 启动后端服务 (端口 8080)...
start "后端服务-8080" cmd /k "cd /d backend-api && start-backend.bat"
timeout /t 3 /nobreak > nul
echo.

echo [3/3] 启动前端服务 (端口 3000)...
start "前端服务-3000" cmd /k "cd /d frontend-web && npm run dev"
echo.

echo ========================================
echo   启动完成！
echo ========================================
echo.
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:8080
echo.
echo 提示: 关闭项目请运行 stop-all.bat
echo.
pause
