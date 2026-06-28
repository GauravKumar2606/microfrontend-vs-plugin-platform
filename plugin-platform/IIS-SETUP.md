# IIS Deployment Setup — Plugin Banking Platform

## Server Architecture

```
Windows Server
├── IIS Site: Banking Platform Host App  → port 443 (HTTPS)
├── IIS Site: Plugin Registry API        → port 5100 (HTTPS)
└── IIS Site: Sample Plugin Server       → port 4300 (HTTPS, optional)

Vendor Servers (external)
└── Plugin JS bundles served via HTTPS from vendor infrastructure
    OR hosted on the same Windows Server (port 4300)
```

## Prerequisites

Install on ALL IIS servers:
1. **IIS** — enable via Windows Features → Internet Information Services
2. **URL Rewrite Module 2.1** — download from https://www.iis.net/downloads/microsoft/url-rewrite
3. **ASP.NET Core Hosting Bundle (.NET 10)** — download from https://dotnet.microsoft.com/download/dotnet/10.0

## Step 1: Create IIS Sites

Run as Administrator in PowerShell:

```powershell
Import-Module WebAdministration

# Host App
New-Website -Name "banking-platform" -Port 443 -PhysicalPath "C:\inetpub\wwwroot\banking-platform" -Force

# Plugin Registry API
New-Website -Name "plugin-registry" -Port 5100 -PhysicalPath "C:\inetpub\wwwroot\plugin-registry" -Force

# Sample plugin server (optional — use if hosting plugins on same server)
New-Website -Name "sample-plugin" -Port 4300 -PhysicalPath "C:\inetpub\wwwroot\sample-plugin" -Force
```

## Step 2: Configure SSL Certificates

### Option A: Using Existing Certificate (Production)

```powershell
# Import a certificate (replace with your .pfx path and password)
$cert = Import-PfxCertificate -FilePath "C:\certs\yourbank.pfx" `
  -CertStoreLocation Cert:\LocalMachine\My `
  -Password (ConvertTo-SecureString "yourpassword" -AsPlainText -Force)

# Bind SSL to each site
New-WebBinding -Name "banking-platform" -Protocol https -Port 443 -SslFlags 0
(Get-WebBinding -Name "banking-platform" -Protocol https).AddSslCertificate($cert.Thumbprint, "my")

New-WebBinding -Name "plugin-registry" -Protocol https -Port 5100 -SslFlags 0
(Get-WebBinding -Name "plugin-registry" -Protocol https).AddSslCertificate($cert.Thumbprint, "my")

New-WebBinding -Name "sample-plugin" -Protocol https -Port 4300 -SslFlags 0
(Get-WebBinding -Name "sample-plugin" -Protocol https).AddSslCertificate($cert.Thumbprint, "my")
```

### Option B: Self-Signed Certificate (Development/Testing)

```powershell
# Generate a self-signed cert
$cert = New-SelfSignedCertificate `
  -DnsName "localhost", "your-server-name", "banking-platform.local" `
  -CertStoreLocation Cert:\LocalMachine\My `
  -NotAfter (Get-Date).AddYears(1)

# Bind to sites (same as above)
```

## Step 3: Configure CORS

### Host App (Angular Shell)
No CORS configuration needed — the shell serves its own content and controls CORS for embedded micro-frontends via CSP headers in `web.config`.

### Backend API (Plugin Registry)
CORS is handled in code. Update the allowed origins in `appsettings.json`:

```json
{
  "Cors": {
    "AllowedOrigins": [
      "https://your-banking-platform-domain:443",
      "https://localhost:4200"
    ]
  }
}
```

The backend's `Program.cs` configures CORS via:
```csharp
services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins(configuration.GetSection("Cors:AllowedOrigins").Get<string[]>())
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
app.UseCors();
```

### Sample Plugin (Static Assets)
CORS headers are set in `web.config` to allow cross-origin requests from the host app:

```xml
<add name="Access-Control-Allow-Origin" value="https://host-app-server" />
<add name="Access-Control-Allow-Headers" value="Content-Type" />
<add name="Access-Control-Allow-Methods" value="GET, OPTIONS" />
```

## Step 4: Production JWT Secret

**NEVER commit real secrets to source control.**

### Local Development (appsettings.json)
Placeholder values only:
```json
{
  "Jwt": {
    "Key": "dev-placeholder-min-32-characters-long!!!!"
  }
}
```

### Production (Environment Variables)
Replace via Windows environment variables or IIS applicationHost.config:

```powershell
# Set environment variable for IIS application pool
[Environment]::SetEnvironmentVariable("Jwt__Key", "YourProductionSecretMin32CharsLong!!!!", "Machine")

# Restart the app pool
Restart-WebAppPool -Name "plugin-registry"
```

The .NET configuration system automatically reads environment variables prefixed with `Jwt__` and maps them to the `Jwt:Key` configuration key.

In `Program.cs`:
```csharp
var jwtKey = configuration["Jwt:Key"];
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
```

## Step 5: Deploy

### Using the deploy.ps1 Script

Edit the `$Sites` hashtable in `deploy.ps1` to match your IIS physical paths:

```powershell
$Sites = @{
    "host-app"     = "C:\inetpub\wwwroot\banking-platform"
    "backend"      = "C:\inetpub\wwwroot\plugin-registry"
    "sample-plugin" = "C:\inetpub\wwwroot\sample-plugin"
}
```

Then run:

```powershell
# Deploy everything
.\deploy.ps1 -App all

# Deploy only backend (after API change)
.\deploy.ps1 -App backend

# Deploy only host app (after UI change)
.\deploy.ps1 -App host-app

# Deploy only sample plugin (after plugin change)
.\deploy.ps1 -App sample-plugin
```

### Manual Deployment Steps (if not using deploy.ps1)

1. **Host App:**
   ```powershell
   cd host-app
   ng build --configuration production
   Copy-Item "dist\host-app\browser\*" "C:\inetpub\wwwroot\banking-platform" -Recurse -Force
   Copy-Item "web.config" "C:\inetpub\wwwroot\banking-platform" -Force
   ```

2. **Backend:**
   ```powershell
   cd backend
   dotnet publish -c Release -o ".\.publish"
   Copy-Item ".\.publish\*" "C:\inetpub\wwwroot\plugin-registry" -Recurse -Force
   Copy-Item "web.config" "C:\inetpub\wwwroot\plugin-registry" -Force
   ```

3. **Sample Plugin:**
   ```powershell
   cd sample-plugin
   npm run build  # or appropriate build command
   Copy-Item "dist\*" "C:\inetpub\wwwroot\sample-plugin" -Recurse -Force
   Copy-Item "web.config" "C:\inetpub\wwwroot\sample-plugin" -Force
   ```

## Step 6: Register New Plugins (No Redeployment)

The plugin registry uses SQLite (`plugin-registry.db`). To register a new plugin **without redeploying**:

### Via Admin UI
1. Open `https://your-server/admin/marketplace` 
2. Login as `PLATFORM_ADMIN` role
3. Click "Register Plugin"
4. Fill in metadata: name, version, bundle URL, checksum, placements, permissions
5. Submit for approval
6. Approve via "Pending Plugins" tab
7. Assign to tenants via "Tenant Management"

### Via API
```powershell
# Get admin JWT token (replace credentials)
$tokenResponse = Invoke-WebRequest -Uri "https://your-server:5100/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"username":"admin@bank.local","password":"YourPassword"}' `
  -SkipCertificateCheck:$true

$token = ($tokenResponse.Content | ConvertFrom-Json).token

# Register plugin
Invoke-WebRequest -Uri "https://your-server:5100/api/marketplace/plugins" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body @{
    name = "My Plugin"
    version = "1.0.0"
    bundleUrl = "https://vendor.com/myplugin.js"
    checksum = "sha256:abc123..."
    tagName = "my-plugin"
    placements = @("dashboard")
    permissions = @("auth.getCurrentUser", "data.read")
  } | ConvertTo-Json `
  -SkipCertificateCheck:$true
```

## Step 7: Monitor Plugin Checksums

Before each deployment, verify plugin bundle checksums to detect tampering:

```powershell
function Get-BundleChecksum {
    param([string]$BundlePath)
    $bytes = [System.IO.File]::ReadAllBytes($BundlePath)
    $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    return "sha256:" + (($hash | ForEach-Object { $_.ToString("x2") }) -join "")
}

# Example
$checksum = Get-BundleChecksum "C:\inetpub\wwwroot\sample-plugin\dist\plugin.js"
Write-Host "Checksum: $checksum"
```

Then update the plugin registry:
```powershell
Invoke-WebRequest -Uri "https://your-server:5100/api/marketplace/plugins/my-plugin" `
  -Method PUT `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"checksum":"sha256:..."}' `
  -SkipCertificateCheck:$true
```

## Troubleshooting

### 404 on Angular Deep Links
**Symptom:** Navigating to `/dashboard/accounts` returns 404 instead of loading the Angular app.

**Solution:** Ensure URL Rewrite module is installed and `host-app/web.config` has the SPA rewrite rule:
```xml
<rule name="Angular SPA" stopProcessing="true">
  <match url=".*" />
  <conditions>
    <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
  </conditions>
  <action type="Rewrite" url="/index.html" />
</rule>
```

### 502 Bad Gateway for Backend API
**Symptom:** API calls return HTTP 502 "Bad Gateway".

**Solution:** 
1. Ensure .NET 10 Hosting Bundle is installed (check `dotnet --info` on server)
2. Check that the app pool for "plugin-registry" is running:
   ```powershell
   Start-WebAppPool -Name "plugin-registry"
   ```
3. Check IIS logs: `%SystemRoot%\System32\LogFiles\W3SVC\...`

### CORS Errors in Browser Console
**Symptom:** `Access-Control-Allow-Origin` missing from API responses.

**Solution:** 
1. Verify the host app's exact URL and port (e.g., `https://mybank.local:443`)
2. Update `appsettings.json` to match:
   ```json
   "Cors": {
     "AllowedOrigins": ["https://mybank.local"]
   }
   ```
3. Restart the backend app pool

### Plugin Checksum Mismatch
**Symptom:** Plugin registration fails with "Checksum mismatch".

**Solution:** Recalculate the SHA-256 hash:
```powershell
$content = [System.IO.File]::ReadAllBytes("plugin.js")
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($content)
$checksum = "sha256:" + (($hash | ForEach-Object { $_.ToString("x2") }) -join "")
Write-Host $checksum
```

Update the plugin record in the database or via API.

### Plugin Bundle 404
**Symptom:** Plugin loads in browser but bundle fails with 404.

**Solution:**
1. Verify the bundle exists at the declared URL
2. If using internal CDN, check CORS headers on sample-plugin site:
   ```powershell
   # Verify web.config has correct Access-Control-Allow-Origin
   Get-Content "C:\inetpub\wwwroot\sample-plugin\web.config"
   ```
3. Update the origin in `web.config` if the host app domain changed

## Quick Reference: Port Assignments

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Banking Platform (Host App) | 443 | HTTPS | Angular shell + micro-frontends |
| Plugin Registry API | 5100 | HTTPS | Plugin registration, tenant config |
| Sample Plugin Server | 4300 | HTTPS | Plugin JS bundles (optional) |
| HTTP Redirect | 80 | HTTP | Redirect to HTTPS |

For external plugins, use your CDN/vendor HTTPS URL instead of port 4300.

## Security Checklist

- [ ] SSL certificates installed and valid (check expiration dates)
- [ ] JWT secret set via environment variable (not in appsettings.json)
- [ ] CORS AllowedOrigins whitelist is strict (not wildcard "*")
- [ ] URL Rewrite rules tested for SPA deep links
- [ ] Logs directory writable by app pool identity
- [ ] Plugin registry database (SQLite) has file permissions for app pool user
- [ ] IIS logs monitored for 5xx errors
- [ ] Firewall rules restrict access to 5100 (plugin registry) to internal networks only
- [ ] HTTPS enabled on all sites; HTTP redirects to HTTPS on port 443
- [ ] Admin UI (/admin/*) requires PLATFORM_ADMIN role
