# GitHub Releases OTA workflow

## 1. Tag a release

```bash
git tag -a v1.0.1 -m "Billo 1.0.1"
git push origin v1.0.1
```

## 2. Create a GitHub Release

- On GitHub: **Releases → Draft a new release**
- Choose the tag `v1.0.1`
- Title: e.g. `1.0.1`
- Upload `app-release.apk` as a release asset
- Publish

## 3. App check (already scaffolded)

The mobile **More** screen includes a placeholder `fetch` to:

`GET https://api.github.com/repos/OWNER/REPO/releases/latest`

Wire your real `OWNER` and `REPO`, then compare `tag_name` (e.g. `v1.0.1`) with the app version in `mobile/app.json` / `package.json`.

## 4. Mandatory vs optional updates

- If `tag_name` is newer and `mandatory` is indicated (e.g. via release body JSON or a custom field in your backend), block the UI until download completes.
- Optional: show a dismissible banner.

## 5. Download & install (Android)

Use `react-native-fs` to download the APK asset URL to external storage, then open with an `Intent` (install). This requires `REQUEST_INSTALL_PACKAGES` and a `FileProvider` entry in `AndroidManifest.xml` — implement before production.

## Rate limits

Unauthenticated GitHub API is rate-limited; for production, proxy version checks through your Node backend or use a GitHub token with higher limits.
