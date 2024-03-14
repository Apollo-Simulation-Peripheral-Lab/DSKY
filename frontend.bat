@echo off 

echo Starting web interface...
cd Programs\web-dsky
call npm install
call npm run build
start "" http://localhost:3000
call npm start