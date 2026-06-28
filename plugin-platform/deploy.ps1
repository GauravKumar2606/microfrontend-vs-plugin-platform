<#
.SYNOPSIS
    Builds and deploys the plugin banking platform to IIS.
.EXAMPLE
    .\deploy.ps1 -App all
    .\deploy.ps1 -App host-app
    .\deploy.ps1 -App backend
#>
param([string]$App = "all")
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Sites = @{
    "host-app"      = "C:\inetpub\wwwroot\plugin-platform"
    "backend"       = "C:\inetpub\wwwroot\plugin-registry"
    "sample-plugin" = "C:\inetpub\wwwroot\sample-plugin"
}

function Deploy-Angular {
    param([string]$Name, [string]$Dest)
    Write-Host "`n==> Building $Name..." -ForegroundColor Cyan
    Push-Location $Name
    ng build --configuration production
    Pop-Location
    $dist = Join-Path $Name "dist\$Name\browser"
    if (-not (Test-Path $dist)) { $dist = Join-Path $Name "dist\$Name" }
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    Copy-Item "$dist\*" $Dest -Recurse -Force
    Copy-Item "$Name\web.config" $Dest -Force
    Write-Host "    $Name deployed." -ForegroundColor Green
}

function Deploy-Backend {
    param([string]$Dest)
    Write-Host "`n==> Publishing backend..." -ForegroundColor Cyan
    Push-Location backend
    dotnet publish -c Release -o ".\.publish"
    Pop-Location
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    Copy-Item "backend\.publish\*" $Dest -Recurse -Force
    Copy-Item "backend\web.config" $Dest -Force
    Write-Host "    Backend deployed." -ForegroundColor Green
}

function Deploy-SamplePlugin {
    param([string]$Dest)
    Write-Host "`n==> Building sample plugin..." -ForegroundColor Cyan
    Push-Location sample-plugin
    # Run npm build if package.json exists
    if (Test-Path "package.json") {
        npm run build
    }
    Pop-Location
    $dist = "sample-plugin\dist"
    if (-not (Test-Path $dist)) {
        Write-Error "sample-plugin dist directory not found. Ensure npm run build completes successfully."
    }
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    Copy-Item "$dist\*" $Dest -Recurse -Force
    Copy-Item "sample-plugin\web.config" $Dest -Force
    Write-Host "    Sample plugin deployed." -ForegroundColor Green
}

switch ($App.ToLower()) {
    "host-app"      { Deploy-Angular "host-app" $Sites["host-app"] }
    "backend"       { Deploy-Backend $Sites["backend"] }
    "sample-plugin" { Deploy-SamplePlugin $Sites["sample-plugin"] }
    "all" {
        Deploy-Angular "host-app" $Sites["host-app"]
        Deploy-Backend $Sites["backend"]
        Deploy-SamplePlugin $Sites["sample-plugin"]
        Write-Host "`nAll deployed successfully." -ForegroundColor Green
    }
    default { Write-Error "Unknown app '$App'. Valid: host-app, backend, sample-plugin, all" }
}
