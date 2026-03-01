/**
 * Leaf 2 Leaf Landscapes — Main JavaScript
 * Handles: sticky nav scroll state, mobile menu, scroll reveal
 */

(function () {
  'use strict';

  const NAV = document.getElementById('nav');
  const HAMBURGER = document.getElementById('nav-hamburger');
  const OVERLAY = document.getElementById('nav-overlay');
  const OVERLAY_LINKS = document.getElementById('nav-overlay-links');
  const NAV_LINKS = document.querySelector('.nav__links');
  const NAV_CTA = document.querySelector('.nav__cta');

  // ----- Sticky nav: add frosted class on scroll -----
  function updateNavOnScroll() {
    if (window.scrollY > 60) {
      NAV.classList.add('scrolled');
    } else {
      NAV.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', function () {
    updateNavOnScroll();
  }, { passive: true });
  updateNavOnScroll();

  // ----- Build mobile overlay links from desktop nav if empty (e.g. service pages) -----
  if (OVERLAY && OVERLAY_LINKS && NAV_LINKS && !OVERLAY_LINKS.children.length) {
    var primaryLinks = [];

    Array.prototype.forEach.call(NAV_LINKS.children, function (child) {
      if (child.tagName === 'A') {
        primaryLinks.push(child);
      } else if (child.classList && child.classList.contains('nav__link-wrap')) {
        var topLink = child.querySelector('a');
        if (topLink) primaryLinks.push(topLink);
      }
    });

    primaryLinks.forEach(function (link) {
      var clone = link.cloneNode(true);
      OVERLAY_LINKS.appendChild(clone);
    });

    if (NAV_CTA) {
      var ctaClone = NAV_CTA.cloneNode(true);
      ctaClone.classList.add('nav__overlay-cta');
      OVERLAY_LINKS.appendChild(ctaClone);
    }
  }

  // Create a dedicated close button inside the overlay (mobile)
  if (OVERLAY && !OVERLAY.querySelector('.nav__overlay-close')) {
    var overlayClose = document.createElement('button');
    overlayClose.type = 'button';
    overlayClose.className = 'nav__overlay-close';
    overlayClose.setAttribute('aria-label', 'Close menu');
    overlayClose.textContent = '×';
    OVERLAY.appendChild(overlayClose);
    overlayClose.addEventListener('click', function (event) {
      event.stopPropagation();
      closeMenu();
    });
  }

  // ----- Mobile menu -----
  function openMenu() {
    if (!HAMBURGER || !OVERLAY) return;
    HAMBURGER.setAttribute('aria-label', 'Close menu');
    HAMBURGER.classList.add('active');
    OVERLAY.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('nav-menu-open');
  }

  function closeMenu() {
    if (!HAMBURGER || !OVERLAY) return;
    HAMBURGER.setAttribute('aria-label', 'Open menu');
    HAMBURGER.classList.remove('active');
    OVERLAY.classList.remove('open');
    document.body.style.overflow = '';
    document.body.classList.remove('nav-menu-open');
  }

  function toggleMenu() {
    if (OVERLAY.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (HAMBURGER) {
    HAMBURGER.addEventListener('click', toggleMenu);
  }

  if (OVERLAY) {
    OVERLAY.addEventListener('click', function (event) {
      // Close when tapping on the dark background
      if (event.target === OVERLAY) {
        closeMenu();
        return;
      }
      var node = event.target;
      while (node && node !== OVERLAY && node.nodeType === 1) {
        if (node.tagName === 'A') {
          closeMenu();
          break;
        }
        node = node.parentNode;
      }
    });
  }

  // ----- Active nav state: highlight link matching current page -----
  (function () {
    var path = (location.pathname || '').replace(/^\/+/, '').replace(/\/$/, '') || 'index.html';
    if (path === 'index.html' || path === '') path = 'home/index.html';
    if (path === 'about' || path === 'gallery' || path === 'reviews' || path === 'services') path = path + '/index.html';
    document.querySelectorAll('.nav__links a[href]').forEach(function (link) {
      var href = (link.getAttribute('href') || '').replace(/^\/+/, '').split('#')[0];
      if (href === path) link.classList.add('active');
    });
  })();

  // ----- Enquiry forms: Preferred Date min = today -----
  var today = new Date().toISOString().split('T')[0];
  var dateInputHome = document.getElementById('field-preferred-date-home');
  if (dateInputHome) dateInputHome.setAttribute('min', today);
  var dateInputShowroom = document.getElementById('field-preferred-date-showroom');
  if (dateInputShowroom) dateInputShowroom.setAttribute('min', today);

  // ----- Home page enquiry form: submit to n8n webhook -----
  var homeForm = document.getElementById('quote-form-home');
  if (homeForm) {
    var webhookUrl = 'https://adzoo.app.n8n.cloud/webhook/appointments';
    var submitBtnText = 'Send My Enquiry →';
    var errorAlert = 'Something went wrong. Please try again or call us directly on 01 234 5678.';

    homeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!homeForm.checkValidity()) return;

      var btn = homeForm.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : submitBtnText;

      function getVal(name) {
        var el = homeForm.querySelector('[name="' + name + '"]');
        return el ? (el.value || '').trim() : '';
      }

      var payload = {
        'Full name': getVal('Full Name'),
        'Gmail': getVal('Gmail'),
        'Phone': getVal('Phone'),
        'Preferred Date': getVal('Preferred Date'),
        'Preferred Time': getVal('Preferred Time'),
        'Additional Comment': getVal('Additional Comment')
      };

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          }).catch(function () {
            return { ok: false, data: null };
          });
        })
        .then(function (result) {
          // Handle both { status: 'success' } and { data: { status: 'success' } }
          var body = (result.data && result.data.data) ? result.data.data : result.data;
          if (result.ok && body && body.status === 'success') {
            if (btn) btn.textContent = '✅ Confirmed! Check your email.';
            setTimeout(function () {
              homeForm.reset();
              if (btn) {
                btn.textContent = submitBtnText;
                btn.disabled = false;
              }
            }, 5000);
          } else {
            alert(errorAlert);
            if (btn) {
              btn.disabled = false;
              btn.textContent = submitBtnText;
            }
          }
        })
        .catch(function () {
          alert(errorAlert);
          if (btn) {
            btn.disabled = false;
            btn.textContent = submitBtnText;
          }
        });
    });
  }

  // ----- Mobile Showroom visit form: submit to same n8n webhook -----
  var showroomForm = document.getElementById('showroom-visit-form');
  if (showroomForm) {
    var webhookUrl = 'https://adzoo.app.n8n.cloud/webhook/appointments';
    var showroomBtnText = 'Request My Showroom Visit →';
    var showroomErrorAlert = 'Something went wrong. Please try again or call us on (01) 901 2633.';

    showroomForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!showroomForm.checkValidity()) return;

      var btn = showroomForm.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : showroomBtnText;

      function getVal(name) {
        var el = showroomForm.querySelector('[name="' + name + '"]');
        return el ? (el.value || '').trim() : '';
      }

      var payload = {
        'Full name': getVal('Full Name'),
        'Gmail': getVal('Gmail'),
        'Phone': getVal('Phone'),
        'Preferred Date': getVal('Preferred Date'),
        'Preferred Time': getVal('Preferred Time'),
        'Additional Comment': getVal('Additional Comment')
      };

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          }).catch(function () {
            return { ok: false, data: null };
          });
        })
        .then(function (result) {
          var body = (result.data && result.data.data) ? result.data.data : result.data;
          if (result.ok && body && body.status === 'success') {
            if (btn) btn.textContent = '✅ Request received! We\'ll be in touch.';
            setTimeout(function () {
              showroomForm.reset();
              if (btn) {
                btn.textContent = showroomBtnText;
                btn.disabled = false;
              }
            }, 5000);
          } else {
            alert(showroomErrorAlert);
            if (btn) {
              btn.disabled = false;
              btn.textContent = showroomBtnText;
            }
          }
        })
        .catch(function () {
          alert(showroomErrorAlert);
          if (btn) {
            btn.disabled = false;
            btn.textContent = showroomBtnText;
          }
        });
    });
  }

  // ----- Scroll reveal (IntersectionObserver) -----
  const revealEls = document.querySelectorAll(
    '.services__title, .services__sub, .service-card, .about-strip__quote-col, .about-strip__list, ' +
    '.gallery__title, .gallery__item, .gallery__more, .testimonials__title, .testimonial-card, ' +
    '.contact__info, .contact__form-wrap'
  );

  function addRevealClass(el) {
    el.classList.add('reveal');
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.05
    }
  );

  revealEls.forEach(function (el) {
    addRevealClass(el);
    observer.observe(el);
  });

  // ----- Chat tooltip above floating button (show on load, hide after 6s or dismiss) -----
  var CHAT_TOOLTIP_KEY = 'l2l_chat_tooltip_dismissed';
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (sessionStorage.getItem(CHAT_TOOLTIP_KEY)) return;
      var chatBtn = document.querySelector('.l2l-chat-btn');
      if (!chatBtn) return;

      var tooltip = document.createElement('div');
      tooltip.className = 'l2l-chat-tooltip';
      tooltip.setAttribute('id', 'l2l-chat-tooltip');
      tooltip.innerHTML =
        '<button type="button" class="l2l-chat-tooltip__close" aria-label="Dismiss">×</button>' +
        '💬 Ask our AI Assistant anything!';

      document.body.appendChild(tooltip);

      function hideTooltip() {
        tooltip.classList.add('hidden');
        sessionStorage.setItem(CHAT_TOOLTIP_KEY, '1');
      }

      var closeBtn = tooltip.querySelector('.l2l-chat-tooltip__close');
      if (closeBtn) closeBtn.addEventListener('click', hideTooltip);

      setTimeout(hideTooltip, 20000);
    }, 0);
  });

  // ----- "Chat With Us Now" section button opens chat widget -----
  document.addEventListener('DOMContentLoaded', function () {
    var sectionBtn = document.getElementById('open-chat-from-section');
    if (sectionBtn) {
      sectionBtn.addEventListener('click', function () {
        var chatBtn = document.querySelector('.l2l-chat-btn');
        if (chatBtn) chatBtn.click();
      });
    }
  });

  // ----- Home page: Carousel (left visited | center active | right upcoming, bounce 1↔5, 10s auto-advance) -----
  document.addEventListener('DOMContentLoaded', function () {
    var carousel = document.getElementById('home-carousel');
    if (!carousel) return;

    var panels = carousel.querySelectorAll('.home-carousel__panel');
    var dots = carousel.querySelectorAll('.home-carousel__dot');
    var total = panels.length;
    var currentIndex = 0;
    var direction = 1; /* 1 = forward (left→right), -1 = backward (right→left) */
    var autoAdvanceTimer = null;
    var ROTATE_MS = 10000;

    function applyState(index) {
      var prevIndex = currentIndex;
      currentIndex = index;

      panels.forEach(function (panel, i) {
        var isActive = i === index;
        var isVisited = (direction === 1 && i < index) || (direction === -1 && i > index);
        var isUpcoming = (direction === 1 && i > index) || (direction === -1 && i < index);
        panel.classList.toggle('home-carousel__panel--active', isActive);
        panel.classList.toggle('home-carousel__panel--visited', !isActive && isVisited);
        panel.classList.toggle('home-carousel__panel--upcoming', !isActive && isUpcoming);
        panel.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive) panel.classList.remove('home-carousel__panel--compressing');
      });

      if (prevIndex !== index) {
        panels[prevIndex].classList.add('home-carousel__panel--compressing');
        var onWidthEnd = function (e) {
          if (e.propertyName !== 'width') return;
          panels[prevIndex].removeEventListener('transitionend', onWidthEnd);
          panels[prevIndex].classList.remove('home-carousel__panel--compressing');
        };
        panels[prevIndex].addEventListener('transitionend', onWidthEnd);
      }

      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function advance() {
      var next = currentIndex + direction;
      if (next > total - 1) {
        next = total - 1;
        direction = -1;
      } else if (next < 0) {
        next = 0;
        direction = 1;
      }
      applyState(next);
      scheduleAutoAdvance();
    }

    function goTo(index) {
      if (index === currentIndex) return;
      if (index > currentIndex) direction = 1;
      else if (index < currentIndex) direction = -1;
      applyState(index);
      scheduleAutoAdvance();
    }

    function scheduleAutoAdvance() {
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = setTimeout(advance, ROTATE_MS);
    }

    panels.forEach(function (panel) {
      panel.addEventListener('click', function () {
        var i = parseInt(panel.getAttribute('data-index'), 10);
        goTo(i);
      });
    });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var i = parseInt(dot.getAttribute('data-index'), 10);
        goTo(i);
      });
    });

    applyState(0);
    scheduleAutoAdvance();
  });
})();