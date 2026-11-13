@echo off
title Pixora — Social Media Platform
echo Starting Pixora Server & Opening Browser...
set PATH=C:\Users\dell\nodejs;%PATH%
cd /d "C:\Users\dell\.gemini\antigravity\scratch\pixora\server"
start http://localhost:5000
node server.js
pause
