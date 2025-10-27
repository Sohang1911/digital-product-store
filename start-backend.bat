@echo off
echo ========================================
echo   Digital Store - Backend Server
echo ========================================
echo.

cd backend

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting backend server...
echo Backend will run on: http://localhost:5001
echo.
echo Keep this window open!
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm run dev

pause
