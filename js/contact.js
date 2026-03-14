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

  // ----- Form: submit to n8n webhook, redirect on success, show slots or error -----
  const form = document.getElementById('quote-form');
  const successEl = document.getElementById('form-success');
  const slotsBox = document.getElementById('form-slots');
  const errorBox = document.getElementById('form-error');
  const formCol = form && form.closest('.contact-page__right');
  const WEBHOOK_URL = '/api/book';
  const SUBMIT_BTN_TEXT = 'Send My Enquiry →';

  function dateToYYYYMMDD(val) {
    if (!val || typeof val !== 'string') return val || '';
    var trimmed = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    var m = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
    return trimmed;
  }

  if (form && formCol) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : SUBMIT_BTN_TEXT;

      function getValue(name) {
        var el = form.querySelector('[name="' + name + '"]');
        return el ? (el.value || '').trim() : '';
      }

      var preferredDate = getValue('Preferred Date');
      var payload = {
        'Full name': getValue('Full Name'),
        'Gmail': getValue('Gmail'),
        'Phone': getValue('Phone'),
        'Preferred Date': dateToYYYYMMDD(preferredDate),
        'Preferred Time': getValue('Preferred Time'),
        'Additional Comment': getValue('Additional Comment') || ''
      };

      if (slotsBox) slotsBox.hidden = true;
      if (errorBox) errorBox.hidden = true;
      if (successEl) successEl.hidden = true;

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
          var raw = result.data;
          var body = (raw && raw.status) ? raw
            : (raw && raw.data && raw.data.status) ? raw.data
            : (raw && raw.body && raw.body.status) ? raw.body
            : raw;
          if (body && body.status === 'success') {
            var name = (body.name || payload['Full name'] || '').trim() || 'there';
            var time = (body.bookedTime || payload['Preferred Time'] || 'your requested time').trim();
            window.location.href = '/booking-confirmed.html?name=' + encodeURIComponent(name) + '&time=' + encodeURIComponent(time);
            return;
          }
          if (body && body.status === 'time_unavailable') {
            var slots = body.availableSlots;
            var slotsStr = Array.isArray(slots) ? slots.join(', ') : (typeof slots === 'string' ? slots : String(slots || ''));
            if (slotsBox) {
              var listEl = slotsBox.querySelector('.slots-list');
              if (listEl) listEl.textContent = slotsStr || 'None available';
              slotsBox.hidden = false;
              slotsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return;
          }
          if (errorBox) {
            errorBox.textContent = 'Something went wrong. Please call us on (01) 901 2633.';
            errorBox.hidden = false;
            errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        })
        .catch(function () {
          if (errorBox) {
            errorBox.textContent = 'Something went wrong. Please call us on (01) 901 2633.';
            errorBox.hidden = false;
            errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
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
  const revealEls = document.querySelectorAll('.page-contact .contact-page__block, .page-contact .contact__social, .page-contact .contact-page__trust');
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