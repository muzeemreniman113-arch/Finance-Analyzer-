# PowerShell GitHub Deploy Script
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  AuraFinance - Push to GitHub Repository" -ForegroundColor Yellow
Write-Host "  Repo: https://github.com/muzeemreniman113-arch/Finance-Analyzer-" -ForegroundColor Green
Write-Host "==============================================================="

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Warning: 'git' was not found in your PATH." -ForegroundColor Red
    Write-Host "Please install Git for Windows (https://git-scm.com) or run this in Git Bash." -ForegroundColor Yellow
    Exit
}

git init
git remote remove origin 2>$null
git remote add origin https://github.com/muzeemreniman113-arch/Finance-Analyzer-.git
git branch -M main
git add .
git commit -m "feat: complete industrial personal finance analyzer website"
Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`nSuccessfully pushed! Enable GitHub Pages in your repo settings:" -ForegroundColor Green
Write-Host "Settings -> Pages -> Source: GitHub Actions" -ForegroundColor Yellow
Write-Host "Live URL: https://muzeemreniman113-arch.github.io/Finance-Analyzer-/" -ForegroundColor Cyan
