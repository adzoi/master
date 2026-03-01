/**
 * Leaf 2 Leaf Landscapes — Reviews Page
 * 1. Filter logic (toggle .hidden by data-category)
 * 2. Read more toggle for long review text
 * 3. Count-up animation for rating bar stats
 * 4. Render review cards from data array
 */

(function () {
  'use strict';

  var CHAR_LIMIT = 180;
  var STAR_SVG = '<svg class="review-card__star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  var GOOGLE_SVG = '<svg class="review-card__google" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>';

  var reviews = [
    { name: 'Kevin B.', location: 'Rathfarnham', service: 'Driveways', category: 'driveways', date: 'January 2024', text: 'Mike and his team did a fantastic job on our driveway and front garden. Really hardworking, friendly lads. Completely changed the look of our home. Kids love the new space.', featured: false },
    { name: 'Sarah M.', location: 'Foxrock', service: 'Garden Design', category: 'garden-design', date: 'March 2024', text: 'Absolutely incredible work from start to finish. Our back garden is unrecognisable. Every detail was thought through and the quality of the finish is outstanding.', featured: true },
    { name: 'James R.', location: 'Stillorgan', service: 'Patios & Paving', category: 'patios-paving', date: 'November 2023', text: 'Best patio in the estate now, no question. Fair price, great communication and the lads were tidy and professional throughout.', featured: false },
    { name: 'Aoife K.', location: 'Dundrum', service: 'Resin-Bound', category: 'resin-bound', date: 'February 2024', text: 'The resin driveway is stunning. So easy to clean and it\'s made such a difference to the front of the house. Highly recommend.', featured: false },
    { name: 'Declan F.', location: 'Cabinteely', service: 'Driveways', category: 'driveways', date: 'October 2023', text: 'Got three quotes and Leaf 2 Leaf were not the cheapest, but they were clearly the most professional. Zero regrets. The driveway is perfect.', featured: false },
    { name: 'Niamh O\'Brien', location: 'Blackrock', service: 'Planting', category: 'planting', date: 'April 2024', text: 'Transformed our bare garden into something beautiful. The planting plan was exactly what we wanted — colourful but low maintenance. Brilliant service.', featured: false },
    { name: 'Tom Walsh', location: 'Dún Laoghaire', service: 'Garden Design', category: 'garden-design', date: 'January 2023', text: 'Mike came out within a few days, gave us a detailed written quote and the job was done exactly as promised. Professional from first call to final tidy-up.', featured: false },
    { name: 'Claire D.', location: 'Terenure', service: 'Lawns & Fencing', category: 'lawns-fencing', date: 'August 2023', text: 'New lawn and fence done in two days. The garden looks completely different — like a different house. The team were great, would absolutely use again.', featured: false },
    { name: 'Paul M.', location: 'Sandyford', service: 'Patios & Paving', category: 'patios-paving', date: 'June 2023', text: 'Porcelain patio laid to perfection. Very happy with the finish and the team kept us informed throughout. Neat, professional, great result.', featured: false },
    { name: 'Sinéad L.', location: 'Templeogue', service: 'Resin-Bound', category: 'resin-bound', date: 'March 2023', text: 'Couldn\'t be happier. The resin surface looks amazing and it was done in a day. Mike was really helpful in choosing the right colour blend for our house.', featured: false },
    { name: 'Brian C.', location: 'Clonskeagh', service: 'General', category: 'general', date: 'September 2023', text: 'Used Leaf 2 Leaf for a full garden overhaul — paving, planting, new lawn, the lot. Took a week and the result is incredible. Already recommended to three neighbours.', featured: false },
    { name: 'Mary T.', location: 'Dalkey', service: 'Planting', category: 'planting', date: 'May 2024', text: 'The flower beds are absolutely gorgeous. The team really listened to what we wanted and the result is even better than we imagined.', featured: false },
    { name: 'Seán H.', location: 'Rathgar', service: 'Driveways', category: 'driveways', date: 'December 2023', text: 'Block paving driveway done to a very high standard. Competitive price, no messing, and they left the place spotless. Five stars easily.', featured: false },
    { name: 'Rachel N.', location: 'Glasthule', service: 'Garden Design', category: 'garden-design', date: 'July 2023', text: 'Mike has a real eye for design. He suggested a layout we hadn\'t considered and it works perfectly. The garden is our favourite room now.', featured: false },
    { name: 'David P.', location: 'Killiney', service: 'Patios & Paving', category: 'patios-paving', date: 'February 2023', text: 'Natural stone patio and steps — beautifully done. The attention to detail is evident in every piece of stone. Worth every penny.', featured: false },
    { name: 'Fiona B.', location: 'Mount Merrion', service: 'Lawns & Fencing', category: 'lawns-fencing', date: 'October 2022', text: 'Artificial grass installed quickly and looks fantastic. The kids love it and it\'s been brilliant through the winter — always green, never muddy.', featured: false },
    { name: 'Liam O\'Connor', location: 'Shankill', service: 'General', category: 'general', date: 'April 2023', text: 'Complete garden transformation — couldn\'t be happier. Fair quote, great team, perfect result. Would give six stars if I could.', featured: false },
    { name: 'Emma K.', location: 'Leopardstown', service: 'Resin-Bound', category: 'resin-bound', date: 'January 2023', text: 'The resin driveway has completely lifted the front of our house. It was done in a day and a half and the finish is flawless. Really impressed.', featured: false },
    { name: 'Padraig S.', location: 'Ballinteer', service: 'Driveways', category: 'driveways', date: 'August 2022', text: 'Gravel driveway installed quickly and looks great. Mike was very professional and the price was exactly as quoted — no hidden extras.', featured: false },
    { name: 'Caroline F.', location: 'Monkstown', service: 'Garden Design', category: 'garden-design', date: 'November 2022', text: 'We\'ve used Leaf 2 Leaf twice now and they never disappoint. Mike and the team are true professionals who take real pride in their work.', featured: false },
    { name: 'Ronan D.', location: 'Stepaside', service: 'Patios & Paving', category: 'patios-paving', date: 'June 2022', text: 'Flagging and kerbing done to a really high standard. The lads worked hard, kept everything tidy and the result speaks for itself.', featured: false },
    { name: 'Yvonne M.', location: 'Harold\'s Cross', service: 'Planting', category: 'planting', date: 'September 2022', text: 'Beautiful planting scheme — every plant perfectly chosen and placed. Our garden finally looks the way we always hoped it would.', featured: false },
    { name: 'Conor B.', location: 'Ranelagh', service: 'General', category: 'general', date: 'March 2022', text: 'Full garden redesign from scratch. Leaf 2 Leaf managed the whole project professionally and the result is stunning. Highly recommend without hesitation.', featured: false },
    { name: 'Anne-Marie L.', location: 'Goatstown', service: 'Lawns & Fencing', category: 'lawns-fencing', date: 'May 2022', text: 'New turf laid beautifully — perfectly flat and lush. The fencing was done at the same time and everything lines up perfectly. Very happy.', featured: false }
  ];

  // Exclude featured (Sarah M.) from grid — she's in the hero testimonial
  var gridReviews = reviews.filter(function (r) { return !r.featured; });

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function buildStars() {
    var html = '';
    for (var i = 0; i < 5; i++) html += STAR_SVG;
    return html;
  }

  function renderCards() {
    var grid = document.getElementById('reviews-grid');
    if (!grid) return;
    grid.innerHTML = '';
    gridReviews.forEach(function (r, i) {
      var isLong = r.text.length > CHAR_LIMIT;
      var shortText = isLong ? r.text.slice(0, CHAR_LIMIT).trim() + '...' : r.text;
      var displayText = isLong ? shortText : r.text;
      var card = document.createElement('article');
      card.className = 'review-card reveal';
      card.setAttribute('data-category', r.category);
      card.setAttribute('data-index', i);
      card.innerHTML =
        '<div class="review-card__top">' +
          '<span class="review-card__stars">' + buildStars() + '</span>' +
          '<span class="review-card__google-wrap">' + GOOGLE_SVG + '</span>' +
        '</div>' +
        '<h3 class="review-card__name">' + escapeHtml(r.name) + '</h3>' +
        '<p class="review-card__meta">' + escapeHtml(r.location) + ' · ' + escapeHtml(r.service) + '</p>' +
        '<p class="review-card__date">' + escapeHtml(r.date) + '</p>' +
        '<div class="review-card__text-wrap' + (isLong ? '' : ' is-expanded') + '">' +
          '<p class="review-card__text">' + escapeHtml(displayText) + '</p>' +
          (isLong ? '<button type="button" class="review-card__read-more" aria-expanded="false">Read more</button>' : '') +
        '</div>';
      grid.appendChild(card);
    });
    initReadMore();
    initReveal();
    initFilter();
  }

  function initReadMore() {
    document.querySelectorAll('.review-card__read-more').forEach(function (btn) {
      var wrap = btn.closest('.review-card__text-wrap');
      var textEl = wrap && wrap.querySelector('.review-card__text');
      if (!textEl) return;
      var shortText = textEl.textContent;
      var fullText = shortText.replace(/\s*\.\.\.$/, '');
      var card = wrap.closest('.review-card');
      var nameEl = card && card.querySelector('.review-card__name');
      var idx = card ? parseInt(card.getAttribute('data-index'), 10) : -1;
      var rev = idx >= 0 ? gridReviews[idx] : null;
      if (rev) fullText = rev.text;
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          textEl.textContent = shortText;
          wrap.classList.remove('is-expanded');
          btn.textContent = 'Read more';
          btn.setAttribute('aria-expanded', 'false');
        } else {
          textEl.textContent = fullText;
          wrap.classList.add('is-expanded');
          btn.textContent = 'Read less';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initFilter() {
    var btns = document.querySelectorAll('.reviews-filter-bar__btn');
    var cards = document.querySelectorAll('.review-card[data-category]');
    function setFilter(filter) {
      btns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-filter') === filter); });
      cards.forEach(function (card) {
        var show = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('hidden', !show);
        card.classList.toggle('visible', show);
      });
    }
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () { setFilter(btn.getAttribute('data-filter')); });
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

  function runCountUps() {
    function animateValue(el, target, duration, suffix) {
      if (!el) return;
      suffix = suffix || '';
      var num = parseFloat(target);
      var isFloat = target.toString().indexOf('.') !== -1;
      var startTime = null;
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var easeOut = 1 - Math.pow(1 - progress, 2);
        var current = isFloat ? (easeOut * num).toFixed(1) : Math.round(easeOut * num);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var statRating = document.getElementById('stat-rating');
    var statReviews = document.getElementById('stat-reviews');
    var statRecommend = document.getElementById('stat-recommend');
    var statYears = document.getElementById('stat-years');
    if (statRating) animateValue(statRating, '5.0', 1500, '★');
    if (statReviews) animateValue(statReviews, '200', 1500, '+');
    if (statRecommend) animateValue(statRecommend, '98', 1500, '%');
    if (statYears) animateValue(statYears, '35', 1500, '+');
  }

  var ratingBar = document.getElementById('rating-bar');
  if (ratingBar && 'IntersectionObserver' in window) {
    var countUpDone = false;
    var ratingObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            ratingBar.querySelectorAll('.rating-bar__item.reveal').forEach(function (el) { el.classList.add('visible'); });
            if (!countUpDone) {
              countUpDone = true;
              runCountUps();
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    ratingObserver.observe(ratingBar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCards);
  } else {
    renderCards();
  }
})();
