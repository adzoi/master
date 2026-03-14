/**
 * Leaf 2 Leaf Landscapes — Reviews Page
 * Fetches Google reviews from /api/reviews and renders cards.
 */
(function () {
  'use strict';

  var GOOGLE_MAPS_URL = 'https://www.google.com/maps?ll=53.276982,-6.205679&z=14&t=m&hl=en&gl=IE&mapclient=embed&cid=7389538408450652316';
  var STAR_FILLED = '<svg class="review-card__star review-card__star--filled" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  var STAR_EMPTY = '<svg class="review-card__star review-card__star--empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  var GOOGLE_SVG = '<svg class="review-card__google" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>';
  var TRUNCATE_LEN = 180;

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getInitials(name) {
    if (!name) return '?';
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name[0].toUpperCase();
  }

  function formatDate(unixTime) {
    if (!unixTime) return '';
    var d = new Date(unixTime * 1000);
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function buildStars(rating) {
    var r = Math.round(rating) || 5;
    var filled = Math.min(5, Math.max(0, r));
    var html = '';
    for (var i = 0; i < filled; i++) html += STAR_FILLED;
    for (var i = filled; i < 5; i++) html += STAR_EMPTY;
    return html;
  }

  function renderCard(review) {
    var card = document.createElement('article');
    card.className = 'review-card reveal';
    var avatarHtml = review.profile_photo_url
      ? '<img class="review-card__avatar" src="' + escapeHtml(review.profile_photo_url) + '" alt="" loading="lazy">'
      : '<span class="review-card__avatar review-card__avatar--initials">' + escapeHtml(getInitials(review.author_name)) + '</span>';
    var fullText = review.text || '';
    var truncated = fullText.length > TRUNCATE_LEN ? fullText.slice(0, TRUNCATE_LEN) : fullText;
    var showReadMore = fullText.length > TRUNCATE_LEN;
    var textBlock =
      '<div class="review-card__text-wrap">' +
        (showReadMore
          ? '<span class="review-card__text">' + escapeHtml(truncated) + '</span> <button type="button" class="review-card__read-more">Read more</button>'
          : '<span class="review-card__text">' + escapeHtml(fullText) + '</span>') +
      '</div>';
    card.innerHTML =
      '<div class="review-card__header">' +
        avatarHtml +
        '<div class="review-card__header-text">' +
          '<h3 class="review-card__name">' + escapeHtml(review.author_name) + '</h3>' +
          '<span class="review-card__stars">' + buildStars(review.rating) + '</span>' +
        '</div>' +
      '</div>' +
      textBlock +
      '<p class="review-card__date">' + escapeHtml(formatDate(review.time)) + '</p>' +
      '<div class="review-card__google-wrap">' + GOOGLE_SVG + '<span class="review-card__verified">Verified Google Review</span></div>';
    if (showReadMore) {
      var wrap = card.querySelector('.review-card__text-wrap');
      var textEl = card.querySelector('.review-card__text');
      var btn = card.querySelector('.review-card__read-more');
      btn.addEventListener('click', function () {
        var expanded = wrap.getAttribute('data-expanded') === 'true';
        if (expanded) {
          textEl.textContent = truncated;
          btn.textContent = 'Read more';
          wrap.removeAttribute('data-expanded');
        } else {
          textEl.textContent = fullText;
          btn.textContent = 'Read less';
          wrap.setAttribute('data-expanded', 'true');
        }
      });
    }
    return card;
  }

  function run() {
    var errorEl = document.getElementById('reviews-error');
    var summaryEl = document.getElementById('reviews-summary');
    var gridEl = document.getElementById('reviews-grid');

    if (errorEl) errorEl.hidden = true;

    fetch('/api/reviews')
      .then(function (r) {
        if (!r.ok) throw new Error('Reviews not available');
        return r.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.reviews)) throw new Error('No reviews');
        if (data.reviews.length === 0) throw new Error('No reviews');

        if (summaryEl) {
          var rating = data.rating || 0;
          var total = data.total || 0;
          var starsHtml = '';
          for (var i = 0; i < 5; i++) starsHtml += (i < Math.round(rating)) ? '★' : '☆';
          summaryEl.innerHTML =
            '<span class="reviews-summary__rating">' + starsHtml + ' ' + (rating ? rating.toFixed(1) : '—') + '</span>' +
            '<span class="reviews-summary__meta">Based on ' + total + ' Google reviews</span>' +
            '<a href="' + GOOGLE_MAPS_URL + '" target="_blank" rel="noopener noreferrer" class="reviews-summary__link">See all reviews on Google</a>';
        }

        if (gridEl) {
          gridEl.innerHTML = '';
          data.reviews.forEach(function (r) {
            gridEl.appendChild(renderCard(r));
          });
        }

        initReveal();
      })
      .catch(function () {
        if (errorEl) {
          errorEl.innerHTML = 'Couldn\'t load reviews right now. <a href="' + GOOGLE_MAPS_URL + '" target="_blank" rel="noopener noreferrer">Read our reviews directly on Google</a>.';
          errorEl.hidden = false;
        }
      });
  }

  function initReveal() {
    var cards = document.querySelectorAll('.review-card.reveal');
    if (!cards.length || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
    );
    cards.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 0.06 + 's';
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
