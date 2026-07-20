@echo off
REM ============================================================
REM  DSKY Bridge Doctor
REM  Double-click this file on the PC that runs next-dsky.
REM ============================================================
setlocal
cd /d "%~dp0"

echo(
echo  ============================================
echo    DSKY Bridge Doctor
echo  ============================================
echo(
echo  Keep next-dsky RUNNING on this PC while this runs.
echo  Your physical DSKY screen may blink/restart for ~15s
echo  near the end - that is normal.
echo(

REM --- Check Node is installed ---
where node >nul 2>nul
if errorlevel 1 (
  echo  [ERROR] Node.js was not found on this PC.
  echo  Please install it from https://nodejs.org  then run this again.
  echo(
  pause
  exit /b 1
)

REM --- Dependencies are bundled in node_modules. Install only if missing. ---
if not exist "node_modules\node-ssh" (
  echo  Installing helper ^(one time, needs internet^)...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo(
    echo  [ERROR] Could not install the helper. Check your internet connection.
    pause
    exit /b 1
  )
)

echo  Running diagnosis. This takes about 30 seconds...
echo(

REM Save a copy of the output to a file next to this .bat, and show it on screen.
node doctor.js %* > "doctor-report.txt" 2>&1
type "doctor-report.txt"

echo(
echo  ============================================
echo   A copy was saved as: doctor-report.txt
echo   Please send that file back for diagnosis.
echo  ============================================
echo(
pause
