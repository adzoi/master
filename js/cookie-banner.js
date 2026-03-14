/**
 * Leaf 2 Leaf — Cookie Consent Banner
 * Fixed bottom banner; Accept/Decline; localStorage l2l_cookie_consent.
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'l2l_cookie_consent';
  var KEYS_TO_CLEAR = ['l2l_conversation', 'l2l_hasOpened', 'l2l_bookingDone', 'l2l_pendingResubmit', 'l2l_handoffDone'];
  var CHAT_BTN_BOTTOM = 28;
  var CHAT_WINDOW_BOTTOM = 98;
  var WHATSAPP_BTN_BOTTOM = 98;
  var TOOLTIP_BOTTOM = 28;

  function hasConsentSet() {
    try {
      var v = localStorage.getItem(CONSENT_KEY);
      return v === 'accepted' || v === 'declined';
    } catch (e) {
      return false;
    }
  }

  function pushChatUp(bannerHeight) {
    var btn = document.querySelector('.l2l-chat-btn');
    var win = document.querySelector('.l2l-chat-window');
    var wa = document.getElementById('whatsapp-float-btn');
    var tooltip = document.getElementById('l2l-chat-tooltip');
    if (btn) btn.style.bottom = (bannerHeight + CHAT_BTN_BOTTOM) + 'px';
    if (win) win.style.bottom = (bannerHeight + CHAT_WINDOW_BOTTOM) + 'px';
    if (wa) wa.style.bottom = (bannerHeight + WHATSAPP_BTN_BOTTOM) + 'px';
    if (tooltip) tooltip.style.bottom = (bannerHeight + TOOLTIP_BOTTOM) + 'px';
  }

  function resetChatPosition() {
    var btn = document.querySelector('.l2l-chat-btn');
    var win = document.querySelector('.l2l-chat-window');
    var wa = document.getElementById('whatsapp-float-btn');
    var tooltip = document.getElementById('l2l-chat-tooltip');
    if (btn) btn.style.bottom = CHAT_BTN_BOTTOM + 'px';
    if (win) win.style.bottom = CHAT_WINDOW_BOTTOM + 'px';
    if (wa) wa.style.bottom = WHATSAPP_BTN_BOTTOM + 'px';
    if (tooltip) tooltip.style.bottom = TOOLTIP_BOTTOM + 'px';
  }

  function hideBanner() {
    var el = document.getElementById('l2l-cookie-banner');
    if (el) {
      el.classList.add('l2l-cookie-banner--hidden');
      resetChatPosition();
      setTimeout(function () { el.remove(); }, 350);
    }
  }

  function onAccept() {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch (e) {}
    hideBanner();
  }

  function onDecline() {
    try {
      localStorage.setItem(CONSENT_KEY, 'declined');
      KEYS_TO_CLEAR.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
    hideBanner();
  }

  function reopenBanner() {
    try {
      var wasDeclined = localStorage.getItem(CONSENT_KEY) === 'declined';
      localStorage.removeItem(CONSENT_KEY);
      if (wasDeclined) KEYS_TO_CLEAR.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
    showBanner();
  }

  function showBanner() {
    var existing = document.getElementById('l2l-cookie-banner');
    if (existing) return;

    var styleEl = document.getElementById('l2l-cookie-banner-styles');
    if (!styleEl) {
      var css = [
        '.l2l-cookie-banner { position: fixed; bottom: 0; left: 0; right: 0; z-index: 9990;',
        'background: #0f1a14; color: #e8f5ee; padding: 16px 20px;',
        'display: flex; flex-wrap: wrap; align-items: center; gap: 16px; justify-content: center;',
        'box-shadow: 0 -4px 20px rgba(0,0,0,0.3); border-top: 1px solid #1e3328;',
        'animation: l2l-cookie-slide 0.4s ease forwards; }',
        '@keyframes l2l-cookie-slide { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
        '.l2l-cookie-banner--hidden { animation: l2l-cookie-slide-out 0.35s ease forwards; }',
        '@keyframes l2l-cookie-slide-out { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }',
        '.l2l-cookie-banner__content { flex: 1; min-width: 260px; }',
        '.l2l-cookie-banner__text { font-size: 14px; line-height: 1.5; }',
        '.l2l-cookie-banner__text a { color: #52b788; text-decoration: underline; }',
        '.l2l-cookie-banner__text a:hover { color: #6b9e82; }',
        '.l2l-cookie-banner__footer { width: 100%; font-size: 12px; color: #6b9e82; margin-top: 8px; text-align: right; }',
        '.l2l-cookie-banner__footer a { color: #52b788; text-decoration: underline; }',
        '.l2l-cookie-banner__footer a:hover { color: #6b9e82; }',
        '.l2l-cookie-banner__actions { display: flex; gap: 10px; flex-shrink: 0; }',
        '.l2l-cookie-banner__btn { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: opacity 0.2s; }',
        '.l2l-cookie-banner__btn:hover { opacity: 0.9; }',
        '.l2l-cookie-banner__btn--accept { background: #52b788; color: #0f1a14; }',
        '.l2l-cookie-banner__btn--decline { background: transparent; color: #e8f5ee; border: 2px solid #52b788; }'
      ].join(' ');
      var style = document.createElement('style');
      style.id = 'l2l-cookie-banner-styles';
      style.textContent = css;
      document.head.appendChild(style);
    }

    var banner = document.createElement('div');
    banner.id = 'l2l-cookie-banner';
    banner.className = 'l2l-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="l2l-cookie-banner__content">' +
        '<span class="l2l-cookie-banner__text">' +
          'We use cookies and local storage to remember your chat history and improve your experience. ' +
          'By clicking \'Accept\', you agree to our <a href="/privacy-policy.html">Privacy Policy</a> and <a href="/terms-of-service.html">Terms of Service</a>.' +
        '</span>' +
        '<div class="l2l-cookie-banner__footer">You can change your preferences at any time via the <a href="#" id="l2l-cookie-settings-inline">Cookie Settings</a> link in our footer.</div>' +
      '</div>' +
      '<div class="l2l-cookie-banner__actions">' +
        '<button type="button" class="l2l-cookie-banner__btn l2l-cookie-banner__btn--accept">Accept</button>' +
        '<button type="button" class="l2l-cookie-banner__btn l2l-cookie-banner__btn--decline">Decline</button>' +
      '</div>';

    banner.querySelector('.l2l-cookie-banner__btn--accept').addEventListener('click', onAccept);
    banner.querySelector('.l2l-cookie-banner__btn--decline').addEventListener('click', onDecline);
    banner.querySelector('#l2l-cookie-settings-inline').addEventListener('click', function (e) {
      e.preventDefault();
      reopenBanner();
    });

    document.body.appendChild(banner);
    var bannerHeight = banner.offsetHeight;
    pushChatUp(bannerHeight);
    setTimeout(function () { pushChatUp(bannerHeight); }, 200);
  }

  function wireCookieSettingsLink() {
    var link = document.getElementById('cookie-settings-link');
    if (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        reopenBanner();
      });
    }
  }

  function init() {
    wireCookieSettingsLink();
    if (hasConsentSet()) return;
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
