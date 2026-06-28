# Mobile Build Instructions

## Prerequisites

### iOS (Mac only)
- macOS with Xcode 15+
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer account

### Android (Windows or Mac)
- Android Studio with Android SDK
- Java 17+

## Build Steps

### Step 1: Build and sync
```powershell
cd host-app
ng build --configuration production
npx cap sync
```

### Step 2: Open in native IDE
```bash
# iOS (run on Mac)
npx cap open ios
# Then: Product → Archive → Distribute App in Xcode

# Android (Windows or Mac)
npx cap open android
# Then: Build → Generate Signed Bundle in Android Studio
```

## Production URL Configuration

Before building for production, update `capacitor.config.ts` to point to your production API:

```typescript
server: {
  androidScheme: 'https',
  // For development with live reload:
  // url: 'https://your-dev-machine:4200',
  // cleartext: true
}
```

And update `host-app/src/environments/environment.prod.ts` with your production API base URL.

## Plugin Support on Mobile

Web Component plugins work inside Capacitor's WebView without any changes — vendors build once, runs everywhere.

The `PluginApi.native.platform()` method returns `'ios'` or `'android'` when running natively, allowing plugins to adapt their UI.
