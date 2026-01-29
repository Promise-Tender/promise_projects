@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title 图片转AVIF并压缩(仅完成后停留)
cls

:: 1. 检测local-images是否有普通图片，无则直接提示并停留
echo 【检测】检查local-images是否有普通图片...
dir /b "%~dp0local-images\*.jpg" "%~dp0local-images\*.jpeg" "%~dp0local-images\*.png" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ local-images目录下无JPG/PNG图片，无法执行！
    echo.
    echo 按任意键关闭窗口...
    pause >nul
    exit /b 0
)
echo ✅ 检测到普通图片，开始执行流程...
echo.

:: 2. 执行convert.js转AVIF（无中途停顿）
echo 【1/2】执行convert.js → 转换普通图到avif-output...
node "%~dp0convert.js"
:: 转AVIF失败则直接终止并停留
if %errorlevel% neq 0 (
    echo.
    echo ❌ convert.js执行失败！
    echo.
    echo 按任意键关闭窗口...
    pause >nul
    exit /b 1
)
echo ✅ convert.js执行完成！AVIF已输出到avif-output
echo.

:: 3. 检测avif-output是否有AVIF文件，无则终止并停留
echo 【检测】检查avif-output是否有AVIF文件...
dir /b "%~dp0avif-output\*.avif" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ avif-output目录下无AVIF文件，无法压缩！
    echo.
    echo 按任意键关闭窗口...
    pause >nul
    exit /b 0
)
echo ✅ 检测到AVIF文件，开始压缩...
echo.

:: 4. 执行压缩脚本（无中途停顿）
echo 【2/2】执行压缩脚本 → 2K+200KB压缩...
node "%~dp0batch-compress-avif-2k.js"
echo.

:: 5. 仅完成后统一停顿，不闪退
echo ====================== 执行结束 ======================
echo 👉 最终文件：batch-avif-2k文件夹（2K+≤200KB AVIF）
echo 按任意键关闭窗口...
pause >nul