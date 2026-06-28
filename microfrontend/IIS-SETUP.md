# IIS Setup Instructions

## Prerequisites

- Windows Server with IIS installed
- IIS URL Rewrite Module 2.1 (download from Microsoft)
- ASP.NET Core Hosting Bundle for .NET 10 (for the backend site)
- SSL certificates for each site

## IIS Sites Configuration

| App | IIS Site Name | Port | Protocol | Server |
|-----|--------------|------|----------|--------|
| Shell | core-banking-shell | 443 | HTTPS | Main |
| Reporting | core-banking-reporting | 8003 | HTTPS | Main |
| Backend API | core-banking-api | 5000 | HTTPS | Main |
| Onboarding | core-banking-onboarding | 8001 | HTTPS | App Server |
| LOS | core-banking-los | 8002 | HTTPS | App Server |

## Setup Steps

### 1. Install prerequisites on each server

```powershell
# Install IIS URL Rewrite Module (run as Administrator)
# Download from: https://www.iis.net/downloads/microsoft/url-rewrite

# Install ASP.NET Core Hosting Bundle (backend server only)
# Download from: https://dotnet.microsoft.com/download/dotnet/10.0
```

### 2. Create IIS sites (run as Administrator on each server)

```powershell
Import-Module WebAdministration

# Example: create the shell site (Main Server)
New-Website -Name "core-banking-shell" -Port 443 -PhysicalPath "C:\inetpub\wwwroot\shell" -Force
# Bind SSL certificate to the site via IIS Manager or:
# New-WebBinding -Name "core-banking-shell" -Protocol https -Port 443 -SslFlags 0

# Repeat for each site with the appropriate port
```

### 3. Update manifest.json with production URLs

Before deploying the shell, update `shell/public/assets/manifest.json` with your production server hostnames:

```json
{
  "onboarding": "https://appserver.yourbank.local:8001/remoteEntry.json",
  "los":        "https://appserver.yourbank.local:8002/remoteEntry.json",
  "reporting":  "https://mainserver.yourbank.local:8003/remoteEntry.json"
}
```

### 4. Update CORS in web.config

In each micro-app's `web.config`, replace `https://shell-server:443` with your actual shell server hostname.

### 5. Deploy

```powershell
# From the monorepo root (edit $Sites paths in deploy.ps1 first):
.\deploy.ps1          # deploy all
.\deploy.ps1 -App los # deploy only LOS after a change
```

### 6. Registering new micro-apps (no shell redeployment needed)

1. Deploy the new micro-app to its IIS site
2. Edit `manifest.json` on the shell's IIS server — add the new entry:
   ```json
   { "newapp": "https://server:port/remoteEntry.json" }
   ```
3. Users see the new app on next page reload. No shell rebuild required.

## Production JWT Key

Replace the placeholder in `backend/appsettings.json` with a strong secret (min 32 chars):

```json
"Jwt": {
  "Key": "YourProductionSecretKeyMin32CharsHere!!"
}
```

Use environment variables or Azure Key Vault for production — never commit real secrets.
