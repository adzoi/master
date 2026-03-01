/**
 * Leaf 2 Leaf — Service pages: FAQ accordion + scroll reveal
 */
(function () {
  'use strict';
  var faqButtons = document.querySelectorAll('.service-faq [data-faq-toggle]');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var answer = item.querySelector('.faq-item__answer');
      var isOpen = item.classList.contains('open');
      if (isOpen) {
        item.classList.remove('open');
        this.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
  var revealEls = document.querySelectorAll('.service-process__step, .service-pricing__card, .service-why__card, .service-related__card');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { rootMargin: '0px 0px -30px 0px', threshold: 0.05 });
    revealEls.forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
})();
