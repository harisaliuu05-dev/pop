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

## Play in the browser (always the newest version)

Turn this on once: repository **Settings**, then **Pages**, then under "Build and deployment" set **Source** to **GitHub Actions**.
After that, every change to the game publishes it here automatically:

`https://harisaliuu05-dev.github.io/pop/`

On a phone, open the link and choose **Add to Home screen** to get an icon that always opens the newest version.

## What the app does

- **Save backup.** The save is copied into Android's app storage, which Android Backup sends to the player's Google account. On a new phone or after a reinstall the save comes back.
- **Notifications.** When the player leaves, reminders are scheduled for 2 hours, 1 day and 3 days later. They are cancelled when the player comes back.
- **Rewarded ads.** AdMob. Until you add your own ids it shows Google's test ads, so it is safe to try.
- **Purchases.** Google Play Billing for the 8-Bit Retro Pack (`retro_pack_8bit`), No Ads (`no_ads`), the three theme sets and the diamond packs (`gems_80`, `gems_450`, `gems_1000`, `gems_2600`). The Restore button gives back one-time purchases.

All of this lives in `www/bridge.js` and only runs inside the app. In a normal browser the game stays in test mode.

## Putting it on the Play Store

1. **Signing key.** Add four repository secrets (Settings, then Secrets and variables, then Actions): `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`. From then on every build also makes `app-release.aab`, under the run's **Artifacts** in the Actions tab. Keep the key file safe and never put it in this repository.
2. **Google Play Console** ($25 one-time, play.google.com/console). Create the app, turn on Play App Signing, and upload `app-release.aab` to **Internal testing** first.
3. **In-app products.** In Play Console, under Monetize, create these products with these exact ids:
   - one-time, non-consumable: `retro_pack_8bit` ($2.99), `no_ads` ($4.99)
   - one-time, non-consumable theme sets: `set_candy`, `set_glass`, `set_sky` ($1.99 each) and their welcome versions `set_candy_welcome`, `set_glass_welcome`, `set_sky_welcome` ($0.99 each, shown only for a player's first set)
   - consumable: `gems_80` ($0.99), `gems_450` ($4.99), `gems_1000` ($9.99), `gems_2600` ($24.99)
4. **AdMob** (admob.google.com). Add the app and make one **Rewarded** ad unit. Then add two repository variables (Settings, then Secrets and variables, then Actions, then Variables): `ADMOB_APP_ID` (looks like `ca-app-pub-…~…`) and `ADMOB_REWARDED_ID` (looks like `ca-app-pub-…/…`). Real ads switch on with the next build.
5. **Store listing.** Fill in the description, screenshots, content rating, the data safety form (the app shows ads and has purchases, and stores no personal data), and the privacy policy link: `https://github.com/harisaliuu05-dev/pop/blob/main/PRIVACY.md`.

## Still to do

- **Fonts offline.** The handwritten map labels use Google Fonts and fall back to a similar font when the phone is offline. Bundling the fonts into `www/` fixes that.

## What is inside

- `www/index.html`: the game
- `www/bridge.js`: billing, ads, notifications and save backup for the app
- `PRIVACY.md`: privacy policy for the store listing
- `capacitor.config.json`: app name (Lantern Lane) and id (`com.lanternlane.game`). Change the id before publishing if you want your own.
- `assets/`: app icon and splash screen
- `.github/workflows/build-apk.yml`: the build recipe
