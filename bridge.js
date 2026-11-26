/* Lantern Lane: Android app bridge.
   Connects the game to Google Play Billing, AdMob rewarded ads, local notifications
   and a backed-up copy of the save. Does nothing in a normal browser.
   The build workflow fills in the AdMob ids from the repository variables. */
(function () {
  var C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  var P = C.Plugins || {};
  var SAVE_KEY = 'lanternLane.v1';

  var CFG = {
    rewardedId: '__ADMOB_REWARDED_ID__',
    testAds: '__ADMOB_TEST__' !== 'false'
  };
  if (CFG.rewardedId.indexOf('__') === 0) CFG.rewardedId = 'ca-app-pub-3940256099942544/5224354917'; /* Google's test unit */

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Save backup ----------
     The save is mirrored into Android preferences, which Android Backup copies to the
     player's Google account. On a new phone or after a reinstall the save comes back. */
  var Pref = P.Preferences;
  function backup() { var v = ls(SAVE_KEY); if (v && Pref) Pref.set({ key: SAVE_KEY, value: v }).catch(function () {}); }
  if (Pref) {
    Pref.get({ key: SAVE_KEY }).then(function (r) {
      if (r && r.value && !ls(SAVE_KEY)) { ls(SAVE_KEY, r.value); location.reload(); }
    }).catch(function () {});
    setInterval(backup, 20000);
  }

  /* ---------- Notifications ---------- */
  var LN = P.LocalNotifications;
  var TOWN = { lane: 'Lantern Lane', harbor: 'Moonlit Harbor', frost: 'Frost Fair', tokyo: 'Neon Alley' };
  function townName() { try { var g = JSON.parse(ls(SAVE_KEY) || '{}'); return TOWN[g.town] || 'Lantern Lane'; } catch (e) { return 'Lantern Lane'; } }
  function scheduleAway() {
    if (!LN) return;
    var now = Date.now(), t = townName();
    LN.cancel({ notifications: [{ id: 101 }, { id: 102 }, { id: 103 }] }).catch(function () {}).then(function () {
      return LN.schedule({ notifications: [
        { id: 101, title: 'Your tills are full', body: 'Your managers in ' + t + ' have been busy. Come and collect!', schedule: { at: new Date(now + 2 * 3600e3), allowWhileIdle: true } },
        { id: 102, title: 'The lanterns are still lit', body: t + ' kept trading all day. Your earnings are waiting.', schedule: { at: new Date(now + 24 * 3600e3), allowWhileIdle: true } },
        { id: 103, title: 'Your town misses you', body: 'The night market is quiet without you. Pop back in for a free reward.', schedule: { at: new Date(now + 72 * 3600e3), allowWhileIdle: true } }
      ] });
    }).catch(function () {});
  }
  function cancelAway() { if (LN) LN.cancel({ notifications: [{ id: 101 }, { id: 102 }, { id: 103 }] }).catch(function () {}); }
  if (LN) {
    LN.requestPermissions().catch(function () {});
    cancelAway();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { backup(); scheduleAway(); } else cancelAway();
  });

  /* ---------- Rewarded ads (AdMob) ---------- */
  var AD = P.AdMob, adReady = null;
  if (AD) {
    adReady = AD.initialize({ initializeForTesting: CFG.testAds }).catch(function () {});
    window.LL_ADS = {
      show: function (done) {
        if (window.LL_NOADS) { done(true); return; }
        var finished = false, earned = false, subs = [];
        function end() {
          if (finished) return; finished = true;
          subs.forEach(function (s) { s.then(function (h) { h && h.remove && h.remove(); }).catch(function () {}); });
          done(earned);
        }
        subs.push(Promise.resolve(AD.addListener('onRewardedVideoAdReward', function () { earned = true; })));
        subs.push(Promise.resolve(AD.addListener('onRewardedVideoAdDismissed', function () { setTimeout(end, 50); })));
        subs.push(Promise.resolve(AD.addListener('onRewardedVideoAdFailedToShow', function () { end(); })));
        Promise.resolve(adReady)
          .then(function () { return AD.prepareRewardVideoAd({ adId: CFG.rewardedId, isTesting: CFG.testAds }); })
          .then(function () { return AD.showRewardVideoAd(); })
          .then(function (r) { if (r && r.amount !== undefined) earned = true; })
          .catch(function () { end(); });
      }
    };
  }

  /* ---------- Google Play Billing (cordova-plugin-purchase) ---------- */
  document.addEventListener('deviceready', function () {
    var Cdv = window.CdvPurchase;
    if (!Cdv) return;
    var store = Cdv.store, GP = Cdv.Platform.GOOGLE_PLAY, PT = Cdv.ProductType;
    var ONCE = ['retro_pack_8bit', 'no_ads', 'set_candy', 'set_glass', 'set_sky', 'set_candy_welcome', 'set_glass_welcome', 'set_sky_welcome'], GEMS = ['gems_80', 'gems_450', 'gems_1000', 'gems_2600'];
    store.register(ONCE.map(function (id) { return { id: id, type: PT.NON_CONSUMABLE, platform: GP }; })
      .concat(GEMS.map(function (id) { return { id: id, type: PT.CONSUMABLE, platform: GP }; })));
    var pending = {}, granted = {};
    store.when()
      .approved(function (tx) { tx.finish(); })
      .finished(function (tx) {
        (tx.products || []).forEach(function (p) {
          var cb = pending[p.id];
          if (cb) { delete pending[p.id]; cb(true); granted[p.id] = 1; }
          else if (ONCE.indexOf(p.id) < 0 || !granted[p.id]) { granted[p.id] = 1; if (window.LL_GRANT) window.LL_GRANT(p.id); }
        });
      });
    store.error(function () {});
    store.initialize([GP]).then(function () {
      window.LL_BILLING = {
        buy: function (sku, done) {
          var p = store.get(sku, GP), o = p && p.getOffer();
          if (!o) { done(false); return; }
          pending[sku] = done;
          store.order(o).then(function (err) { if (err) { delete pending[sku]; done(false); } });
        },
        restore: function (done) {
          store.restorePurchases().then(function () {
            var n = 0;
            ONCE.forEach(function (id) { if (store.owned(id)) { n++; if (window.LL_GRANT) window.LL_GRANT(id); } });
            done(n);
          }).catch(function () { done(0); });
        }
      };
    });
  }, false);
})();
