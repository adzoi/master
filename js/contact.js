/**
 * Leaf 2 Leaf Landscapes — Contact Page
 * FAQ accordion toggle + form success message + scroll reveal for contact blocks
 */

(function () {
  'use strict';

  // ----- FAQ Accordion -----
  const faqButtons = document.querySelectorAll('[data-faq-toggle]');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      const answer = item.querySelector('.faq-item__answer');

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

  // ----- Enquiry form: set Preferred Date min to today (no past dates) -----
  const dateInput = document.getElementById('field-preferred-date');
  if (dateInput) {
    var today = new Date();
    dateInput.setAttribute('min', today.toISOString().split('T')[0]);
  }

  // ----- Form: submit to n8n webhook, show success or alert -----
  const form = document.getElementById('quote-form');
  const successEl = document.getElementById('form-success');
  const formCol = form && form.closest('.contact-page__right');
  const WEBHOOK_URL = 'https://adzoo.app.n8n.cloud/webhook/appointments';
  const SUBMIT_BTN_TEXT = 'Send My Enquiry →';
  const ERROR_ALERT = 'Something went wrong. Please try again or call us directly on 01 234 5678.';

  if (form && successEl && formCol) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : SUBMIT_BTN_TEXT;

      function getValue(name) {
        var el = form.querySelector('[name="' + name + '"]');
        return el ? (el.value || '').trim() : '';
      }

      var payload = {
        'Full name': getValue('Full Name'),
        'Gmail': getValue('Gmail'),
        'Phone': getValue('Phone'),
        'Preferred Date': getValue('Preferred Date'),
        'Preferred Time': getValue('Preferred Time'),
        'Additional Comment': getValue('Additional Comment')
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      fetch(WEBHOOK_URL, {
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
            successEl.textContent = body.message || 'Your appointment is confirmed! Check your email for details.';
            successEl.hidden = false;
            formCol.classList.add('form-submitted');
            successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            form.reset();
          } else {
            alert(ERROR_ALERT);
          }
        })
        .catch(function () {
          alert(ERROR_ALERT);
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = SUBMIT_BTN_TEXT;
          }
        });
    });
  }

  // ----- Scroll reveal for contact page left column -----
  const revealEls = document.querySelectorAll('.page-contact .contact-page__block, .page-contact .contact-page__social-wrap, .page-contact .contact-page__trust');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { rootMargin: '0px 0px -30px 0px', threshold: 0.05 }
    );
    revealEls.forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
})();