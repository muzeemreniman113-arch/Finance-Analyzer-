@echo off
echo ===============================================================
echo   AuraFinance - Push to GitHub Repository
echo   Repo: https://github.com/muzeemreniman113-arch/Finance-Analyzer-
echo ===============================================================

git init
git remote remove origin 2>nul
git remote add origin https://github.com/muzeemreniman113-arch/Finance-Analyzer-.git
git branch -M main
git add .
git commit -m "feat: complete industrial personal finance analyzer website"
echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo Done! Once pushed, enable GitHub Pages under:
echo Repository Settings -^> Pages -^> Source: GitHub Actions
echo Your site will be live at: https://muzeemreniman113-arch.github.io/Finance-Analyzer-/
pause
