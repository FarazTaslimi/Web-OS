@echo off
title WebOS Server (Admin)
echo Starting WebOS server with administrator privileges...
cd /d "%~dp0"
node boot.js
pause