/**
 * Leaf 2 Leaf Landscapes — Gallery Page
 * 1. Filter logic (toggle .hidden / .visible)
 * 2. Lightbox (open, close, prev/next, keyboard, backdrop)
 * 3. Stats count-up on scroll
 */

(function () {
  'use strict';

  var NAV_HEIGHT = 72; // match --nav-height 4.5rem for filter bar sticky

  // ----- 1. FILTER LOGIC -----
  var filterBar = document.getElementById('filter-bar');
  var filterBtns = document.querySelectorAll('.filter-bar__btn');
  var galleryItems = document.querySelectorAll('.gallery-item[data-category]');

  function getVisibleItems() {
    var activeBtn = document.querySelector('.filter-bar__btn.is-active');
    var filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    if (filter === 'all') {
      return Array.from(galleryItems);
    }
    return Array.from(galleryItems).filter(function (el) {
      return el.getAttribute('data-category') === filter;
    });
  }

  function setFilter(filter) {
    filterBtns.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-filter') === filter);
    });
    galleryItems.forEach(function (item) {
      var category = item.getAttribute('data-category');
      var show = filter === 'all' || category === filter;
      item.classList.toggle('hidden', !show);
      item.classList.toggle('visible', show);
    });
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setFilter(this.getAttribute('data-filter'));
    });
  });

  // ----- 2. LIGHTBOX -----
  var lightbox = document.getElementById('lightbox');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var lightboxBackdrop = document.getElementById('lightbox-backdrop');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxType = document.getElementById('lightbox-type');
  var lightboxLocation = document.getElementById('lightbox-location');

  var currentIndex = 0;
  var visibleItems = [];

  function openLightbox(index) {
    visibleItems = getVisibleItems();
    if (visibleItems.length === 0) return;
    currentIndex = index;
    if (currentIndex >= visibleItems.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = visibleItems.length - 1;
    showLightboxItem();
    lightbox.hidden = false;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onLightboxKeydown);
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onLightboxKeydown);
  }

  function showLightboxItem() {
    var item = visibleItems[currentIndex];
    if (!item) return;
    var imgEl = item.querySelector('.gallery-item__img');
    var typeEl = item.querySelector('.gallery-item__type');
    var locationEl = item.querySelector('.gallery-item__location');
    if (imgEl) {
      var img = imgEl.querySelector('img');
      var src = img && img.getAttribute('src');
      if (src) {
        lightboxImg.style.backgroundImage = 'url(' + src + ')';
      } else {
        var bg = window.getComputedStyle(imgEl).backgroundImage;
        lightboxImg.style.backgroundImage = bg;
      }
      lightboxImg.style.backgroundSize = 'cover';
      lightboxImg.style.backgroundPosition = 'center';
    }
    lightboxType.textContent = typeEl ? typeEl.textContent : '';
    lightboxLocation.textContent = locationEl ? locationEl.textContent : '';
  }

  function prevItem() {
    currentIndex--;
    if (currentIndex < 0) currentIndex = visibleItems.length - 1;
    showLightboxItem();
  }

  function nextItem() {
    currentIndex++;
    if (currentIndex >= visibleItems.length) currentIndex = 0;
    showLightboxItem();
  }

  function onLightboxKeydown(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevItem();
    if (e.key === 'ArrowRight') nextItem();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function (e) { e.stopPropagation(); prevItem(); });
  if (lightboxNext) lightboxNext.addEventListener('click', function (e) { e.stopPropagation(); nextItem(); });

  galleryItems.forEach(function (item, i) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      visibleItems = getVisibleItems();
      var idx = visibleItems.indexOf(item);
      if (idx === -1) return;
      openLightbox(idx);
    });
  });

  // ----- 3. STATS COUNT-UP -----
  var statDriveways = document.getElementById('stat-driveways');
  var statGardens = document.getElementById('stat-gardens');
  var statPatios = document.getElementById('stat-patios');
  var statsStrip = document.getElementById('stats-strip');

  function animateValue(el, target, duration) {
    if (!el || target === 0) return;
    var start = 0;
    var startTime = null;
    target = parseInt(target, 10);
    if (isNaN(target)) return;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easeOut = 1 - Math.pow(1 - progress, 2);
      var current = Math.round(easeOut * target);
      el.textContent = current;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  function runCountUps() {
    if (statDriveways) animateValue(statDriveways, statDriveways.getAttribute('data-target'), 1500);
    if (statGardens) animateValue(statGardens, statGardens.getAttribute('data-target'), 1500);
    if (statPatios) animateValue(statPatios, statPatios.getAttribute('data-target'), 1500);
  }

  var countUpsDone = false;
  if (statsStrip && typeof IntersectionObserver !== 'undefined') {
    var statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !countUpsDone) {
            countUpsDone = true;
            runCountUps();
          }
        });
      },
      { threshold: 0.2 }
    );
    statsObserver.observe(statsStrip);
  }

  // ----- 4. SCROLL REVEAL FOR GALLERY ITEMS -----
  var revealItems = document.querySelectorAll('.page-gallery .gallery-item.reveal, .page-gallery .stats-strip__item.reveal');
  if (revealItems.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
    );
    revealItems.forEach(function (el) {
      revealObserver.observe(el);
    });
  }
})();
