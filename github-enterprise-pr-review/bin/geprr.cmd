@echo off
setlocal
set SCRIPT_DIR=%~dp0
set ROOT_DIR=%SCRIPT_DIR%..
node "%ROOT_DIR%\dist\src\cli.js" %*
endlocal
