# AgriTrack Git Setup Script
# Run this in PowerShell to push to GitHub

Write-Host "Setting up Git configuration..." -ForegroundColor Green

# Configure git user (replace with your details)
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Commit all files
Write-Host "Committing files..." -ForegroundColor Green
git commit -m "Initial commit: AgriTrack farm management system"

# Add remote repository
Write-Host "Adding remote repository..." -ForegroundColor Green
git remote add origin https://github.com/sydney-debug/AgriTrack.git

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main

Write-Host "Done! Files pushed to GitHub successfully!" -ForegroundColor Green
