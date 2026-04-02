@echo off
REM Sunshine Medical Center MongoDB Project - Setup Script for Windows
REM Double-click this file to run automated setup

echo ========================================
echo Sunshine Medical Center MongoDB Project Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python 3.7+ from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

REM Run the setup script
echo Running setup script...
echo.
python setup.py

REM Check if setup was successful
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Setup completed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Setup failed. See errors above.
    echo ========================================
)

echo.
echo Press any key to close this window...
pause >nul
