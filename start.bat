@echo off 

@REM Start Frontend

echo Checking if port 3000 is open...
timeout /t 2 >nul
netstat -ano | find "LISTENING" | find ":3000" >nul
if errorlevel 1 (
    echo Web interface is not yet running.
    setlocal enabledelayedexpansion
    set /p startweb=Do you want to start the web interface? [Y/N]
    if /I "!startweb!" EQU "Y" (
        start cmd /k "frontend.bat"
    )
) else (
    echo Web interface is already running.
)

@REM Start API

echo Checking if port 3001 is open...
timeout /t 2 >nul
netstat -ano | find "LISTENING" | find ":3001" >nul
if errorlevel 1 (
    echo Starting API...
    cd Programs\api-dsky
    call npm install
    call npm start
    echo API process ended.
) else (
    echo API is already running.
)
exit
