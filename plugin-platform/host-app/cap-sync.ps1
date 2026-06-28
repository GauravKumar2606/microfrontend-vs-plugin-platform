# Run this from host-app/ directory to build and sync to native platforms
Write-Host "Building Angular app..." -ForegroundColor Cyan
ng build --configuration production

Write-Host "Syncing to native platforms..." -ForegroundColor Cyan
npx cap sync

Write-Host "Done. To open in IDE:" -ForegroundColor Green
Write-Host "  iOS (Mac only):  npx cap open ios"
Write-Host "  Android:         npx cap open android"
