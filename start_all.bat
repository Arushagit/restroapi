@echo off
echo ========================================================
echo Starting RESTROFLOW Full-Stack Application
echo ========================================================
echo Starting Django Backend on https://restroapi-vvei.onrender.com
start cmd /k "cd /d %~dp0backend && python manage.py runserver 0.0.0.0:8000"
timeout /t 3
echo Starting React Vite Frontend on http://localhost:5173
start cmd /k "cd /d %~dp0frontend && npm run dev"
echo ========================================================
echo RESTROFLOW is running! Open http://localhost:5173 in browser.
echo ========================================================
pause

