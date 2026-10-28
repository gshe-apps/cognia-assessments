@echo off
setlocal
cd /d "%~dp0"
set "CAP_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%CAP_NODE%" set "CAP_NODE=node"
set "CAP_OPEN_BROWSER=1"
"%CAP_NODE%" serve.cjs
pause
