/**
 * Leaf 2 Leaf — Booking Confirmation Page
 * Reads name/time from URL params, Add to Calendar (.ics download)
 */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var name = params.get('name') || 'there';
  var time = params.get('time') || 'your requested time';

  var nameEl = document.getElementById('booking-name');
  var timeEl = document.getElementById('booking-time');
  if (nameEl) nameEl.textContent = decodeURIComponent(name);
  if (timeEl) timeEl.textContent = decodeURIComponent(time);

  var addBtn = document.getElementById('add-to-calendar');
  if (addBtn) {
    addBtn.addEventListener('click', function () {
      var today = new Date();
      var year = today.getFullYear();
      var month = String(today.getMonth() + 1).padStart(2, '0');
      var day = String(today.getDate()).padStart(2, '0');
      var timeParts = (time || '10:00').match(/(\d{1,2}):(\d{2})/);
      var hour = timeParts ? parseInt(timeParts[1], 10) : 10;
      var min = timeParts ? parseInt(timeParts[2], 10) : 0;
      var dtStart = year + month + day + 'T' + String(hour).padStart(2, '0') + String(min).padStart(2, '0') + '00';
      var dtEnd = year + month + day + 'T' + String(hour + 1).padStart(2, '0') + String(min).padStart(2, '0') + '00';
      var ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Leaf 2 Leaf Landscapes//Consultation//EN',
        'BEGIN:VEVENT',
        'DTSTART:' + dtStart,
        'DTEND:' + dtEnd,
        'SUMMARY:Leaf 2 Leaf — Free Consultation',
        'DESCRIPTION:Your free consultation with Leaf 2 Leaf Landscapes. Confirmed for ' + time + ' (Irish time).',
        'LOCATION:Unit 4/5, Burton Hall Park, Sandyford, Dublin 18',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');
      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'leaf2leaf-consultation.ics';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
})();
