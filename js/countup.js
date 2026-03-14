/**
 * Count-up animation for numeric stats with [data-target].
 * When element is 80% visible, animates from 0 to data-target over 1.8s (easeOutExpo).
 * Runs once per element. Fixed min-width prevents layout shift during animation.
 */
(function () {
  'use strict';

  var DURATION_MS = 1800;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function parseTarget(val) {
    if (val === '' || val === null || val === undefined) return NaN;
    var num = parseFloat(String(val).replace(/[,]/g, ''), 10);
    return isNaN(num) ? NaN : num;
  }

  function getSuffix(text) {
    if (!text || typeof text !== 'string') return '';
    return (text.trim().replace(/^[\d,]+\.?\d*/, '') || '');
  }

  function usesComma(text) {
    return text && /,\d/.test(String(text).trim());
  }

  function getDecimalPlaces(targetStr) {
    if (targetStr === '' || targetStr === null || targetStr === undefined) return 0;
    targetStr = String(targetStr);
    var isDecimal = targetStr.includes('.');
    return isDecimal ? targetStr.split('.')[1].length : 0;
  }

  function formatNumber(value, decimalPlaces, useComma) {
    if (decimalPlaces > 0) {
      return value.toFixed(decimalPlaces);
    }
    var rounded = Math.round(value);
    return useComma && rounded >= 1000 ? rounded.toLocaleString() : String(rounded);
  }

  function runCountUp(el) {
    var targetStr = el.getAttribute('data-target');
    var targetVal = parseTarget(targetStr);
    if (isNaN(targetVal) || targetVal < 0) return;

    var decimalPlaces = getDecimalPlaces(targetStr);
    var rawText = el.textContent || '';
    var suffix = getSuffix(rawText);
    var useComma = usesComma(rawText);
    var finalText = formatNumber(targetVal, decimalPlaces, useComma) + suffix;

    el.textContent = finalText;
    el.style.display = 'inline-block';
    var w = el.getBoundingClientRect().width;
    el.style.minWidth = w + 'px';
    el.textContent = formatNumber(0, decimalPlaces, useComma) + suffix;

    var startTime = null;

    function tick(timestamp) {
      if (startTime === null) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / DURATION_MS, 1);
      var eased = easeOutExpo(progress);
      var current = 0 + (targetVal - 0) * eased;
      el.textContent = formatNumber(current, decimalPlaces, useComma) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = finalText;
      }
    }
    requestAnimationFrame(tick);
  }

  function init() {
    var elements = document.querySelectorAll('[data-target]');
    if (!elements.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach(function (el) {
        var targetStr = el.getAttribute('data-target');
        var targetVal = parseTarget(targetStr);
        if (isNaN(targetVal) || targetVal < 0) return;
        var decimalPlaces = getDecimalPlaces(targetStr);
        var rawText = el.textContent || '';
        var suffix = getSuffix(rawText);
        var useComma = usesComma(rawText);
        el.textContent = formatNumber(targetVal, decimalPlaces, useComma) + suffix;
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          observer.unobserve(el);
          runCountUp(el);
        });
      },
      { threshold: 0.8 }
    );

    elements.forEach(function (el) {
      var targetVal = parseTarget(el.getAttribute('data-target'));
      if (isNaN(targetVal) || targetVal < 0) return;
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
