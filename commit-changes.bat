@echo off
REM Simple batch script to commit all migration changes
echo ========================================
echo  Committing Migration Changes
echo ========================================
echo.

echo [1/3] Staging all changes...
git add -A
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to stage changes
    pause
    exit /b 1
)
echo Done!
echo.

echo [2/3] Committing changes...
git commit -m "Complete Ignite migration preparation - ready for testing"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to commit
    pause
    exit /b 1
)
echo Done!
echo.

echo [3/3] Showing commit status...
git log -1 --oneline
git status
echo.

echo ========================================
echo  All changes committed successfully!
echo ========================================
echo.
echo You can now clone this repository to a new location without spaces in the path.
echo Recommended: C:\Projects\ai-agent-frontend
echo.
pause

