@echo off
echo Preparing to upload your code to GitHub...
echo.

:: Add or update the git origin
git remote add origin https://Qubit-Roni@github.com/Qubit-Roni/Bdapps-Server-.git 2>nul
git remote set-url origin https://Qubit-Roni@github.com/Qubit-Roni/Bdapps-Server-.git

:: Push the code to GitHub
echo Uploading... Please wait and authorize GitHub if a browser window opens!
git push -u origin master

echo.
echo If you see "Branch 'master' set up to track remote branch", it means UPLOAD WAS SUCCESSFUL!
pause
