@echo off
chcp 65001 >nul
setlocal
node "%~dp0scripts\open-preview.mjs"
if errorlevel 1 pause
