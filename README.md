# Lantern Lane: Android app package

This folder is the game wrapped as an Android app. A free GitHub build turns it into an APK file you can install on your phone.

## Get the APK (about 10 minutes, no coding)

1. Make a free account at github.com and create a new empty repository (private is fine), for example `lantern-lane`.
2. Upload everything from this folder to the repository, keeping the folder structure. The hidden `.github` folder matters most, because it holds the build recipe. On a computer, drag the whole unzipped folder into the repository page ("uploading an existing file").
3. Open the repository's **Actions** tab. If asked, click "I understand my workflows, go ahead and enable them".
4. Pick **Build Android APK** in the left list and click **Run workflow**. The first build takes about 5 to 8 minutes.
5. When it turns green, open the repository's **Releases** section (right side of the main page). The release called **Lantern Lane (latest)** has `app-debug.apk` ready to download.
6. Open that page on your Android phone, tap `app-debug.apk` and allow "install unknown apps" when asked.

### A link you can share

Make the repository **public** (Settings, then Danger Zone, then Change visibility). Then this link downloads the newest APK for anyone, and never changes:

`https://github.com/harisaliuu05-dev/pop/releases/latest/download/app-debug.apk`

Send it to friends or testers. (Your save stays on each phone, and the repository only holds the game, no personal data.)

The game saves on the phone, works without internet and is locked to portrait.

## Update the game later

Replace `www/index.html` with the new game file (same name) and upload it. The build runs again by itself.

## Not done yet

- **Play Store release.** This APK is a test build signed with a debug key. For the Play Store you need a Google Play developer account, a signing key and an app bundle (.aab). The same workflow can be extended for that.
- **Real purchases and ads.** The diamond store and the ads run in test mode. The store needs a billing plugin that sets `window.LL_BILLING = { buy(sku, done), restore(done) }`. The 8-Bit Retro Pack (`retro_pack_8bit`, $2.99) and No Ads (`no_ads`, $4.99) are one-time products. When No Ads is owned the game sets `window.LL_NOADS = true`, so the app should then show no other ads; the other products are the diamond packs `gems_80`, `gems_450`, `gems_1000` and `gems_2600`. Ads need a rewarded-ads plugin that sets `window.LL_ADS = { show(done) }` and calls `done(true)` when the reward is earned.
- **Fonts offline.** The handwritten map labels use Google Fonts and fall back to a similar font when the phone is offline. Bundling the fonts into `www/` fixes that.

## What is inside

- `www/index.html`: the game
- `capacitor.config.json`: app name (Lantern Lane) and id (`com.lanternlane.game`). Change the id before publishing if you want your own.
- `assets/`: app icon and splash screen
- `.github/workflows/build-apk.yml`: the build recipe
