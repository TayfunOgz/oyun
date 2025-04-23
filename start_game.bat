@echo off
echo Starting Kelime Tahmin Oyunu...
echo.
echo Step 1: Setting up environment and starting server...
start cmd /k python setup.py
echo.
echo Step 2: Waiting for server to start...
timeout /t 5
echo.
echo Step 3: Opening the game in your browser...
start index.html
echo.
echo Game started successfully! Enjoy playing!
echo.
echo Note: If you encounter any issues, make sure Python and all dependencies
echo are installed correctly. Check the command window for more details.
echo.
pause
