@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title 本地图片(WebP/JPG/PNG)转AVIF并压缩
cls

:: ==============================================
echo 【前置检测】检查运行依赖是否就绪...
echo ----------------------------------------------

:: 1. 检测Node.js环境
echo 1. 检测Node.js环境...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js环境，请先安装！
    echo 下载地址：https://nodejs.org/ （推荐LTS长期支持版）
    echo.
    echo 按任意键关闭窗口...
    pause >nul
    exit /b 1
)
echo ✅ Node.js环境已就绪

:: 2. 检测package.json配置文件
echo 2. 检测项目依赖配置...
if not exist "%~dp0package.json" (
    echo ❌ 未找到package.json文件，请确保脚本在项目根目录执行！
    echo.
    echo 按任意键关闭窗口...
    pause >nul
    exit /b 1
)

:: 3. 自动安装/更新缺失依赖
echo 3. 检查并安装缺失依赖
call npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败！请检查网络或package.json配置
    echo 手动执行命令尝试：cd /d "%~dp0" && npm install
    echo.
    echo 按任意键关闭窗口...
    pause >nul
    exit /b 1
)
echo ✅ 所有依赖已安装完成
echo ----------------------------------------------
echo.

:: ==============================================
echo 【检测】检查local-images是否有可转换图片
dir /b "%~dp0local-images\*.jpg" "%~dp0local-images\*.jpeg" "%~dp0local-images\*.png" "%~dp0local-images\*.webp" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ local-images目录下无WebP/JPG/PNG图片，无法执行！
    echo 请将需要转换的图片放入该目录后重试。
    echo.
    echo 按任意键关闭窗口...
    pause >nul
    exit /b 0
)
echo ✅ 检测到可转换图片，开始执行转换流程...
echo.

:: ==============================================
:: 执行转换：WebP/JPG/PNG → AVIF（输出到avif-output）
:: ==============================================
echo 【1/2】执行转换脚本 → WebP/JPG/PNG 转 AVIF（输出到avif-output）...
node "%~dp0convert.js"
:: 转换失败则终止并提示
if %errorlevel% neq 0 (
    echo.
    echo ❌ 图片转AVIF失败！请检查convert.js脚本或图片文件是否损坏
    echo.
    echo 按任意键关闭窗口...
    pause >nul
    exit /b 1
)
echo ✅ 图片转AVIF完成！所有AVIF文件已输出到avif-output目录
echo.

:: ==============================================
echo 【检测】检查avif-output目录是否有生成的AVIF文件...
dir /b "%~dp0avif-output\*.avif" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ avif-output目录下无AVIF文件，转换未生成有效文件，无法压缩！
    echo.
    echo 按任意键关闭窗口...
    pause >nul
    exit /b 0
)
echo ✅ 检测到AVIF文件，开始执行2K+200KB压缩...
echo.

:: ==============================================
echo 【2/2】执行压缩脚本 → 2K分辨率+文件大小≤200KB（输出到batch-avif-2k）...
node "%~dp0batch-compress-avif-2k.js"
echo.

echo ====================== 转换完成 ======================
echo  最终压缩文件位置:batch-avif-2k 文件夹
pause >nul