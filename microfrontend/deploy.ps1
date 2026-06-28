<#
.SYNOPSIS
    Builds and deploys all microfrontend apps to IIS wwwroot directories.

.DESCRIPTION
    Builds each Angular app and the .NET backend, then copies output to
    the configured IIS wwwroot paths. Edit the $Sites hashtable to match
    your actual IIS wwwroot paths before running.

.EXAMPLE
    .\deploy.ps1                    # deploy all apps
    .\deploy.ps1 -App shell         # deploy only the shell
    .\deploy.ps1 -App los           # deploy only LOS
#>
param(
    [string]$App = "all"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# --- Edit these paths to match your IIS site wwwroot directories ---
$Sites = @{
    shell      = "C:\inetpub\wwwroot\shell"
    onboarding = "C:\inetpub\wwwroot\onboarding"
    los        = "C:\inetpub\wwwroot\los"
    reporting  = "C:\inetpub\wwwroot\reporting"
    backend    = "C:\inetpub\wwwroot\backend"
}
# ------------------------------------------------------------------

function Deploy-Angular {
    param([string]$Name, [string]$SourceDir, [string]$Dest)
    Write-Host "`n==> Building $Name..." -ForegroundColor Cyan
    Push-Location $SourceDir
    ng build --configuration production
    Pop-Location

    $distPath = Join-Path $SourceDir "dist\$Name\browser"
    if (-not (Test-Path $distPath)) {
        # Angular 21 may use different dist layout
        $distPath = Join-Path $SourceDir "dist\$Name"
    }

    Write-Host "==> Deploying $Name to $Dest..." -ForegroundColor Cyan
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    Copy-Item -Path "$distPath\*" -Destination $Dest -Recurse -Force
    Copy-Item -Path "$SourceDir\web.config" -Destination $Dest -Force
    Write-Host "    $Name deployed." -ForegroundColor Green
}

function Deploy-Backend {
    param([string]$Dest)
    Write-Host "`n==> Publishing .NET backend..." -ForegroundColor Cyan
    Push-Location "backend"
    dotnet publish -c Release -o ".\.publish"
    Pop-Location

    Write-Host "==> Deploying backend to $Dest..." -ForegroundColor Cyan
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    Copy-Item -Path "backend\.publish\*" -Destination $Dest -Recurse -Force
    Copy-Item -Path "backend\web.config" -Destination $Dest -Force
    Write-Host "    Backend deployed." -ForegroundColor Green
}

# Deploy selected app(s)
switch ($App.ToLower()) {
    "shell"      { Deploy-Angular "shell"     "shell"            $Sites.shell }
    "onboarding" { Deploy-Angular "onboarding" "apps\onboarding" $Sites.onboarding }
    "los"        { Deploy-Angular "los"        "apps\los"        $Sites.los }
    "reporting"  { Deploy-Angular "reporting"  "apps\reporting"  $Sites.reporting }
    "backend"    { Deploy-Backend $Sites.backend }
    "all" {
        Deploy-Angular "shell"      "shell"            $Sites.shell
        Deploy-Angular "onboarding" "apps\onboarding" $Sites.onboarding
        Deploy-Angular "los"        "apps\los"        $Sites.los
        Deploy-Angular "reporting"  "apps\reporting"  $Sites.reporting
        Deploy-Backend $Sites.backend
        Write-Host "`nAll apps deployed successfully." -ForegroundColor Green
    }
    default {
        Write-Error "Unknown app '$App'. Valid values: shell, onboarding, los, reporting, backend, all"
    }
}
