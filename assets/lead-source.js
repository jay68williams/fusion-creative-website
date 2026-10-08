// First-touch traffic source for lead forms (8 Oct 2026). Lead rows could not say whether a lead came from an ad,
// Instagram, Google or a shared link, so every lead form appends fcLeadSource() to its notes.
// fbclid = the click came from Facebook or Instagram (Meta adds it to ad clicks AND organic link clicks).
(function () {
  var KEY = 'fc_lead_src';
  function read() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  var src = read();
  if (!src) {
    var p = new URLSearchParams(location.search), utm = [];
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'r'].forEach(function (k) { if (p.get(k)) utm.push(k + '=' + p.get(k).slice(0, 60)); });
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { ref = ''; }
    if (ref === location.hostname) ref = '';
    src = { fb: p.has('fbclid'), g: p.has('gclid'), utm: utm.join(' '), ref: ref, land: location.pathname, t: new Date().toISOString() };
    try { sessionStorage.setItem(KEY, JSON.stringify(src)); } catch (e) { /* private mode: still returned below */ }
  }
  window.fcLeadSource = function () {
    var parts = ['Traffic:', src.fb ? 'Meta click (fbclid)' : (src.g ? 'Google Ads click (gclid)' : 'no ad click id')];
    if (src.utm) parts.push('| ' + src.utm);
    parts.push('| referrer ' + (src.ref || 'none'));
    parts.push('| landed ' + src.land);
    var ua = navigator.userAgent || '';
    if (/Instagram/i.test(ua)) parts.push('| in Instagram app'); else if (/FBAN|FBAV/i.test(ua)) parts.push('| in Facebook app');
    return parts.join(' ');
  };
})();
