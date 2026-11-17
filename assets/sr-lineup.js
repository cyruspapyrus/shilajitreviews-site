/* Shots lineup split for the review pages (/best-shilajit/, /shilajit-gummies-vs-shots/), 2026-11-17.
 *
 * Each visitor is put at random, and for good (localStorage, cookie as the fallback), in one of two arms:
 *   "100" -> https://holyshilajit.com/pages/shilajit-shots     (current lander, 10/30/100 packs)
 *   "60"  -> https://holyshilajit.com/pages/shilajit-shots-60  (10/30/60 packs)
 * Only links to the shots lander change; resin and every other link stay as they are. Each page's decorate()
 * passes its links through srLineup.apply(), which also tags utm_content with the arm
 * ("<adset>__<button>__l100" / "<adset>__<button>__l60").
 * While the split is on, the pages show offer-neutral copy (.sr-neutral instead of .sr-offer) to both arms,
 * because the 60 lander has its own "Buy 30 Shots, Get 30 FREE" offer.
 * Any error, or a browser that can keep neither localStorage nor a cookie, leaves the original link.
 *
 * Turn the whole test on or off with this one constant: */
var LINEUP60_SPLIT = false;

(function () {
  var KEY = 'sr_lineup', SHOTS = '/pages/shilajit-shots', SHOTS60 = '/pages/shilajit-shots-60';
  var arm = null;
  function valid(v) { return v === '100' || v === '60'; }
  function fromCookie() {
    var m = document.cookie.match(/(?:^|;\s*)sr_lineup=(100|60)(?:;|$)/);
    return m ? m[1] : null;
  }
  function assign() {
    var v = null, kept = false;
    try { v = window.localStorage.getItem(KEY); } catch (e) {}
    if (!valid(v)) { try { v = fromCookie(); } catch (e) { v = null; } }
    if (!valid(v)) v = Math.random() < 0.5 ? '100' : '60';
    try { window.localStorage.setItem(KEY, v); kept = window.localStorage.getItem(KEY) === v; } catch (e) {}
    try { document.cookie = KEY + '=' + v + '; path=/; max-age=15552000; SameSite=Lax'; kept = fromCookie() === v || kept; } catch (e) {}
    return kept ? v : null;
  }
  try { if (LINEUP60_SPLIT === true) arm = assign(); } catch (e) { arm = null; }
  if (arm) { try { document.documentElement.className += ' sr-lineup-split'; } catch (e) {} }

  window.srLineup = {
    arm: function () { return arm; },
    /* Returns a new URL for this visitor's arm, or null to keep the link as it is. */
    apply: function (u) {
      if (!arm || !/(^|\.)holyshilajit\.com$/.test(u.hostname)) return null;
      var p = u.pathname.replace(/\/+$/, '');
      if (!(p === SHOTS || (p === SHOTS60 && arm === '60'))) return null;
      var out = new URL(u.toString());
      out.pathname = arm === '60' ? SHOTS60 : SHOTS;
      var c = (out.searchParams.get('utm_content') || '').replace(/(^|__)l(100|60)$/, '');
      out.searchParams.set('utm_content', (c ? c + '__' : '') + 'l' + arm);
      return out;
    }
  };
})();
