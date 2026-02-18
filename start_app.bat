@echo off
echo ==========================================
echo Fix & Start Filoix Ramadan Planner
echo ==========================================

echo [1/4] Killing existing Node.js processes to free file locks...
taskkill /F /IM node.exe >nul 2>&1
echo Done.

echo [2/4] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Error generating prisma client.
    pause
    exit /b
)

echo [3/4] Syncing Database...
call npx prisma db push

echo [4/4] Starting Development Server...
call npm run dev

pause
