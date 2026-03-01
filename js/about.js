/**
 * Leaf 2 Leaf Landscapes — About Page
 * IntersectionObserver for scroll reveal (timeline, team cards, values)
 */

(function () {
  'use strict';

  var revealSelectors = [
    '.page-about .timeline__item',
    '.page-about .team-card',
    '.page-about .value-item'
  ];

  var revealEls = document.querySelectorAll(revealSelectors.join(', '));

  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
    );

    revealEls.forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
})();
