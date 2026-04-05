# Android APK build (React Native)

## Prerequisites

- JDK 17 (Android Studio bundled or Temurin)
- Android SDK with `ANDROID_HOME` set
- Node 18+

## Debug APK

```bash
cd mobile
npm install
cd android
./gradlew assembleDebug
```

Output: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

## Release APK (signed)

1. Generate a keystore (once):

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore billo-release.keystore -alias billo -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `mobile/android/gradle.properties` entries (do not commit secrets):

```
MYAPP_UPLOAD_STORE_FILE=billo-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=billo
MYAPP_UPLOAD_STORE_PASSWORD=***
MYAPP_UPLOAD_KEY_PASSWORD=***
```

3. Edit `mobile/android/app/build.gradle` `signingConfigs.release` to reference the keystore file path and the variables above (see [React Native signed APK docs](https://reactnative.dev/docs/signed-apk-android)).

4. Build:

```bash
cd mobile/android
./gradlew assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`

## Versioning

- Bump `versionName` / `versionCode` in `mobile/android/app/build.gradle` and keep `mobile/app.json` / `package.json` version aligned for OTA checks.

## Emulator networking

The dev client uses `http://10.0.2.2:4000` to reach the host machine from the Android emulator. On a physical device, change `mobile/src/api/client.ts` `API_BASE` to your computer’s LAN IP (same Wi‑Fi).
