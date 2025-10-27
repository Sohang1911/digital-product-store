@echo off
echo ========================================
echo   Digital Store - Frontend
echo ========================================
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting frontend development server...
echo Frontend will run on: http://localhost:3000
echo.
echo Keep this window open!
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm run dev

pause
