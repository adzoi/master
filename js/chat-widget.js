/**
 * Leaf 2 Leaf — AI Chat Widget (vanilla JS, self-contained)
 * Floating button + chat window; Mistral AI for conversation; n8n webhook for booking.
 */
(function () {
  'use strict';

  var CHAT_API_URL = '/api/chat';
  var WEBHOOK_URL = '/api/book';
  var HANDOFF_WEBHOOK_URL = 'https://melkhi.app.n8n.cloud/webhook/appointments';
  var MODEL = 'mistral-small-latest';
  var MAX_TOKENS = 2000;
  var TEMPERATURE = 0.8;

  function getSystemPrompt() {
    var now = new Date();
    var currentYear = now.getFullYear();
    var dateStr = now.toLocaleDateString('en-IE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    var dayOfWeek = now.toLocaleDateString('en-IE', { weekday: 'long' });

    // Build a 14-day calendar of correct day/date pairs
    var calendarDays = [];
    for (var i = 0; i <= 14; i++) {
      var d = new Date(now);
      d.setDate(d.getDate() + i);
      calendarDays.push(
        d.toLocaleDateString('en-IE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    }
    var calendarStr = calendarDays.join('\n');

    return `Today is ${dateStr}.

Here are the correct day/date pairs for the next 14 days — use ONLY these when confirming dates:
${calendarStr}

===CRITICAL TIME PARSING — HIGHEST PRIORITY===
When a user mentions a weekday OR a date AND a number together, the number is ALWAYS the time (hour), NEVER a second date. No exceptions.
Examples:
- "monday 10" = Monday at 10:00am. Do NOT say "March 10th".
- "tuesday 8" = Tuesday at 8:00am. Do NOT say "8th".
- "friday 3" = Friday at 3:00pm or 3:00am — just ask AM or PM.
- "24 march 12" = March 24th at 12:00pm.
- "monday 8am" = Monday at 8:00am.
NEVER respond by saying a weekday and number could be two different dates. Always confirm: "Got it — Monday at 10am. Is that right?"
===END CRITICAL RULE===

CRITICAL DATE RULE:
When a user provides BOTH a day name AND a date number, you MUST verify it against the calendar list above before accepting it.
- "friday 14th" → check calendar → if March 14th is a SATURDAY not Friday → respond: "Just to clarify — March 14th is actually a Saturday. Did you mean Friday 13th or Saturday 14th?"
- "thursday 12" → check calendar → if Thursday is the 12th ✅ → accept immediately
- NEVER accept a day/date combination without checking the calendar list first. NEVER guess or calculate dates yourself — only use the calendar list above.
- Double-check day/date matches before putting it in BOOKING_READY. Never put a date in BOOKING_READY where the day name doesn't match the actual date.

---

You are Leaf, the AI assistant for Leaf 2 Leaf Landscapes on their website chat. You sound like a real, friendly person — natural and conversational, not scripted. Use the facts below to answer accurately. If asked questions unrelated to landscaping, gardening, or our services, politely decline and redirect. Never repeat the same item in a list.

### ABOUT THE COMPANY
**Leaf 2 Leaf Landscapes** — leading paving, landscaping, and gardening specialists in County Dublin, Ireland. Over 35 years of experience.
**Address:** UNIT 4/5, Burton Hall Park, Burton Hall Rd, Sandyford Business Park, Sandyford, Dublin 18, D18 A094
**Phone:** (01) 901 2633 | (085) 118 8081
**Email:** leaf2leaflandscapes@gmail.com
**Social:** Facebook & Instagram @leaf2leaflandscapes
**Website:** leaf2leaflandscapes.ie
We serve all areas across County Dublin (Arbour Hill, Artane, Ashtown, Ballsbridge, Blackrock, Blanchardstown, Bray, Cabinteely, Castleknock, Clontarf, Dundrum, Dun Laoghaire, Finglas, Howth, Lucan, Malahide, Rathmines, Sandyford, Swords, Tallaght, and many more). When a user asks if we work in a specific area, give a direct yes or no; if not on the list, say we primarily serve County Dublin and suggest they call (01) 901 2633.

### SERVICES
**Paving & Driveways:** Driveways, resin-bound surfaces, paving, flagging, gravel driveways, patios, kerbs & walling, porcelain paving.
**Garden Design & Planting:** Landscaping & garden design, planting, flower beds, natural stone, garden features.
**Fencing & Lawn:** New lawn turf, artificial grass, garden fencing.
**Other:** Hedge cutting, tree surgery, waste removal, weeding, garden maintenance.

### PRICING — STRICT RULE
Never mention any prices, price ranges, estimates, or approximate costs. If a user asks about prices, respond with something like: "Every job is completely unique, so we never quote without seeing it first — but the consultation is 100% free and there's no obligation. Want me to book one for you?" Stay friendly but firm. Never reveal any numbers.

### CONNECT TO HUMAN — STRICT
When the user asks to speak to a human or be transferred: Do NOT trigger HANDOFF_READY. Respond: "Of course! You can reach our team at (01) 901 2633 or via the WhatsApp button on the page. We'd love to hear from you! 🌿" Then stop.

### CONVERSATION BEHAVIOUR — STRICT RULES
1. NEVER get stuck in a loop. If the user has said "no", "ok", or "doesn't matter" twice to the same question, move on.
2. NEVER push booking after the user has declined once.
3. When a user gives vague answers ("yes", "any", "idk"), don't keep asking — give useful information and let them respond.
4. Keep responses concise — maximum 3-4 sentences for general chat.
5. Never repeat the exact same question twice in a row.
6. If you've asked twice and got a vague/negative response, say "No worries! Feel free to browse and ask if anything comes to mind 😊" and stop pushing.

### BOOKING A FREE CONSULTATION
Collect in natural conversation: full name, email, phone, preferred date (YYYY-MM-DD), preferred time (24h HH:MM within working hours), optional comment.
- If the user has not provided a time, ask for it. Do NOT suggest or assume a time — only use a time the user has stated.
- NEVER repeat back or ask the user to confirm their email or phone. Accept both and move to the next question.
- Phone: ask for number without country code (e.g. 085 123 4567). Never add +353.
When you have everything, end your reply with exactly this line and nothing after it:
BOOKING_READY:{"Full name":"...","Gmail":"...","Phone":"...","Preferred Date":"YYYY-MM-DD","Preferred Time":"HH:MM","Additional Comment":"..."}
Use the exact keys: Full name, Gmail, Phone, Preferred Date, Preferred Time, Additional Comment. If they want to call instead, give (01) 901 2633.
**Year:** Always book in the current year (${currentYear}). If the user doesn't specify the year, use ${currentYear}. Use Irish date format when speaking (e.g. 3rd March ${currentYear}).

### TIME VALIDATION RULES — STRICT
Working hours: Monday–Friday 8:00am–6:00pm (08:00–18:00); Saturday 9:00am–4:00pm (09:00–16:00); Sunday CLOSED.
Valid weekdays: 8am–5pm (last slot). Valid Saturday: 9am–3pm (last slot).
12pm = midday (12:00). 12am = midnight — invalid. NEVER confuse 12pm with midnight.
NEVER tell a user that 8am–5pm on a weekday or 9am–3pm on Saturday is outside working hours.
Sundays closed. Past dates/times — do NOT proceed. Only after the user confirms a valid date and time, collect remaining details and send BOOKING_READY.`;
  }

  var SYSTEM_PROMPT = getSystemPrompt();

  var GREETING = "Hi! I'm Leaf, your Leaf 2 Leaf assistant 🌿 I can answer questions about our services or help you book a free consultation. What can I help you with?";
  var SENDING_BOOKING = 'Sending your booking...';
  var BOOKING_SUCCESS = "✅ You're all booked! Check your email for confirmation details.";
  var BOOKING_ERROR = 'Something went wrong. Please try calling us on (01) 901 2633.';

  var chatConfigured = true;

  var conversation = [];
  var hasOpened = false;
  var bookingDone = false;
  var handoffDone = false;
  /** When webhook returns time_unavailable: full payload stored for resubmit. Next user message is used as new Preferred Time. */
  var pendingResubmit = null;
  var lastBookingPayload = {};
  var $btn, $window, $messages, $inputWrap, $textarea, $sendBtn;

  function hasConsent() {
    return localStorage.getItem('l2l_cookie_consent') === 'accepted';
  }

  function savePersistedState() {
    try {
      if (hasConsent()) {
        localStorage.setItem('l2l_conversation', JSON.stringify(conversation));
        localStorage.setItem('l2l_hasOpened', hasOpened ? 'true' : 'false');
        localStorage.setItem('l2l_bookingDone', bookingDone ? 'true' : 'false');
        localStorage.setItem('l2l_handoffDone', handoffDone ? 'true' : 'false');
        localStorage.setItem('l2l_pendingResubmit', pendingResubmit ? JSON.stringify(pendingResubmit) : '');
      }
    } catch (e) {}
  }

  function injectStyles() {
    var css = [
      '.l2l-chat-btn { position: fixed; bottom: 28px; right: 28px; width: 58px; height: 58px; border-radius: 50%;',
      'background: linear-gradient(135deg, #2d6a4f, #52b788); border: none; cursor: pointer;',
      'box-shadow: 0 4px 20px rgba(82,183,136,0.4); z-index: 9998; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }',
      '.l2l-chat-btn:hover { transform: scale(1.08); }',
      '.l2l-chat-btn svg { width: 28px; height: 28px; fill: #fff; }',
      '.l2l-chat-window { position: fixed; bottom: 98px; right: 28px; width: 360px; height: 520px; border-radius: 18px;',
      'background: #0f1a14; box-shadow: 0 8px 32px rgba(0,0,0,0.4); z-index: 9999; display: flex; flex-direction: column; overflow: hidden; border: 1px solid #1e3328; }',
      '.l2l-chat-window.hidden { display: none; }',
      '.l2l-chat-window.open { animation: l2l-pop 0.35s ease forwards; }',
      '@keyframes l2l-pop { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }',
      '.l2l-chat-header { padding: 14px 16px; background: linear-gradient(135deg, #1a3a28, #2d6a4f); display: flex; align-items: center; gap: 10px; flex-shrink: 0; }',
      '.l2l-chat-header-avatar { font-size: 24px; line-height: 1; }',
      '.l2l-chat-header-text { flex: 1; }',
      '.l2l-chat-header-title { color: #e8f5ee; font-weight: 600; font-size: 15px; }',
      '.l2l-chat-header-status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b9e82; margin-top: 2px; }',
      '.l2l-chat-header-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #52b788; }',
      '.l2l-chat-close { width: 32px; height: 32px; border: none; background: rgba(255,255,255,0.15); border-radius: 8px; color: #e8f5ee; cursor: pointer; font-size: 18px; line-height: 1; display: flex; align-items: center; justify-content: center; }',
      '.l2l-chat-close:hover { background: rgba(255,255,255,0.25); }',
      '.l2l-chat-clear { width: 32px; height: 32px; border: none; background: rgba(255,255,255,0.15); border-radius: 8px; color: #e8f5ee; cursor: pointer; font-size: 18px; line-height: 1; display: flex; align-items: center; justify-content: center; }',
      '.l2l-chat-clear:hover { background: rgba(255,255,255,0.25); }',
      '.l2l-chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }',
      '.l2l-chat-messages::-webkit-scrollbar { width: 6px; }',
      '.l2l-chat-messages::-webkit-scrollbar-track { background: #0f1a14; }',
      '.l2l-chat-messages::-webkit-scrollbar-thumb { background: #1e3328; border-radius: 3px; }',
      '.l2l-msg { max-width: 85%; padding: 10px 14px; font-size: 14px; line-height: 1.5; animation: l2l-msg-in 0.3s ease; }',
      '@keyframes l2l-msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }',
      '.l2l-msg-bot { align-self: flex-start; background: #1a2e20; color: #d4edda; border-radius: 14px 14px 14px 4px; }',
      '.l2l-msg-user { align-self: flex-end; background: linear-gradient(135deg, #2d6a4f, #1e4d38); color: #e8f5ee; border-radius: 14px 14px 4px 14px; }',
      '.l2l-msg-sys { align-self: center; background: #0d1f14; color: #52b788; font-size: 12px; text-align: center; }',
      '.l2l-typing { display: flex; gap: 4px; padding: 12px 16px; align-self: flex-start; }',
      '.l2l-typing span { width: 8px; height: 8px; border-radius: 50%; background: #52b788; animation: l2l-bounce 1.4s ease-in-out infinite both; }',
      '.l2l-typing span:nth-child(2) { animation-delay: 0.2s; } .l2l-typing span:nth-child(3) { animation-delay: 0.4s; }',
      '@keyframes l2l-bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }',
      '.l2l-chat-input-wrap { padding: 12px 16px 16px; border-top: 1px solid #1e3328; flex-shrink: 0; background: #0f1a14; }',
      '.l2l-chat-input-wrap.disabled { opacity: 0.6; pointer-events: none; }',
      '.l2l-chat-row { display: flex; gap: 8px; align-items: flex-end; }',
      '.l2l-chat-textarea { flex: 1; min-height: 44px; max-height: 80px; padding: 10px 14px; border-radius: 12px; background: #1a2e20; border: 1px solid #2d4a38; color: #e8f5ee; font-size: 14px; resize: none; font-family: inherit; transition: border-color 0.2s; }',
      '.l2l-chat-textarea:focus { outline: none; border-color: #52b788; }',
      '.l2l-chat-textarea::placeholder { color: #6b9e82; }',
      '.l2l-chat-send { width: 40px; height: 40px; border-radius: 10px; border: none; cursor: pointer; background: linear-gradient(135deg, #2d6a4f, #52b788); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '.l2l-chat-send:hover { opacity: 0.95; } .l2l-chat-send svg { width: 18px; height: 18px; }',
      '.l2l-handoff-chip { align-self: flex-start; background: transparent; border: 1px solid #52b788; color: #52b788; border-radius: 20px; padding: 8px 16px; font-size: 13px; cursor: pointer; margin-top: 4px; transition: all 0.2s; font-family: inherit; }',
      '.l2l-handoff-chip:hover { background: #52b788; color: #fff; }',
      '#whatsapp-float-btn { position: fixed; bottom: 98px; right: 28px; width: 58px; height: 58px; border-radius: 50%;',
      'background: #2d6a4f; box-shadow: 0 4px 20px rgba(45,106,79,0.4); z-index: 9998; display: flex; align-items: center; justify-content: center;',
      'transition: transform 0.2s ease; text-decoration: none; }',
      '#whatsapp-float-btn:hover { transform: scale(1.08); }',
      '#whatsapp-float-btn svg { width: 28px; height: 28px; }',
      '#whatsapp-float-btn::before { content: "Chat on WhatsApp"; position: absolute; right: 100%; margin-right: 10px; white-space: nowrap; top: 50%; transform: translateY(-50%);',
      'background: #0f1a14; color: #e8f5ee; padding: 6px 10px; border-radius: 8px; font-size: 13px; font-family: inherit;',
      'opacity: 0; pointer-events: none; transition: opacity 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }',
      '#whatsapp-float-btn:hover::before { opacity: 1; }',
      '@media (max-width: 480px) { #whatsapp-float-btn, .l2l-chat-btn { right: 16px; } #whatsapp-float-btn { bottom: 92px; } .l2l-chat-btn { bottom: 24px; } .l2l-chat-window { right: 16px; bottom: 90px; width: calc(100vw - 32px); height: 70vh; } }'
    ].join(' ');
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function parseMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\s*[\*\-]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function addMessage(role, text, isSystem) {
    var wrap = document.createElement('div');
    wrap.className = 'l2l-msg l2l-msg-' + (isSystem ? 'sys' : role);

    // Assistant/bot messages: render markdown
    if (role === 'bot' && !isSystem) {
      var safe = escapeHtml(text);
      wrap.innerHTML = parseMarkdown(safe);
    } else {
      // User and system messages: plain text for safety
      wrap.textContent = text;
    }

    $messages.appendChild(wrap);
    $messages.scrollTop = $messages.scrollHeight;
  }

  function addTyping() {
    var wrap = document.createElement('div');
    wrap.className = 'l2l-typing';
    wrap.setAttribute('data-typing', '1');
    wrap.innerHTML = '<span></span><span></span><span></span>';
    $messages.appendChild(wrap);
    $messages.scrollTop = $messages.scrollHeight;
    return wrap;
  }

  function removeTyping() {
    var el = $messages.querySelector('[data-typing="1"]');
    if (el) el.remove();
  }

  function stripBookingReady(text) {
    if (!text || typeof text !== 'string') return { display: '', json: null };
    var idx = text.indexOf('BOOKING_READY:');
    if (idx === -1) return { display: sanitizeForDisplay(text), json: null };
    var rest = text.substring(idx + 14).replace(/^\s+/, '');
    if (rest.charAt(0) !== '{') return { display: sanitizeForDisplay(text.substring(0, idx)), json: null };
    var depth = 1;
    var i = 1;
    while (i < rest.length && depth > 0) {
      var c = rest.charAt(i);
      if (c === '"' || c === "'") {
        var q = c;
        i++;
        while (i < rest.length && rest.charAt(i) !== q) {
          if (rest.charAt(i) === '\\') i++;
          i++;
        }
        i++;
        continue;
      }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      i++;
    }
    var jsonStr = rest.substring(0, i);
    try {
      var json = JSON.parse(jsonStr);
      var before = text.substring(0, idx).replace(/\s+$/, '');
      var after = rest.substring(i).replace(/^\s*[\n\r]*/, '');
      var display = sanitizeForDisplay((before + ' ' + after).replace(/\s+/g, ' ').trim());
      return { display: display, json: json };
    } catch (e) {
      return { display: sanitizeForDisplay(text.substring(0, idx)), json: null };
    }
  }

  function sanitizeForDisplay(s) {
    if (!s || typeof s !== 'string') return '';
    return s
      .replace(/\s*BOOKING_READY\s*:[\s\S]*$/g, '')
      .replace(/\s*HANDOFF_READY\s*:[\s\S]*$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function messageOffersHandoff(text) {
    if (!text || typeof text !== 'string') return false;
    var lower = text.toLowerCase();
    return /connect you|connect me|speak to a real person|connect you with a real person/.test(lower) || lower.indexOf('would you like me to connect') !== -1;
  }

  function stripHandoffReady(text) {
    var idx = text.indexOf('HANDOFF_READY:');
    if (idx === -1) return { display: text, json: null };
    var display = text.substring(0, idx).replace(/\s+$/, '');
    var rest = text.substring(idx + 14).trim();
    var end = rest.indexOf('}');
    if (end !== -1) rest = rest.substring(0, end + 1);
    try {
      return { display: display, json: JSON.parse(rest) };
    } catch (e) {
      return { display: text, json: null };
    }
  }

  function showHandoffChip(data) {
    if (!$messages || handoffDone) return;
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'l2l-handoff-chip';
    chip.textContent = '👤 Yes, connect me to someone';
    chip.addEventListener('click', function () {
      chip.remove();
      doHandoff(data || { reason: 'User requested via button', lastMessage: 'User clicked connect button' });
    });
    $messages.appendChild(chip);
    $messages.scrollTop = $messages.scrollHeight;
  }

  function doHandoff(data) {
    addMessage('bot', "I've notified the team and someone will be in touch with you shortly! In the meantime, you can also reach us on (01) 901 2633 or WhatsApp us directly.");
    fetch(HANDOFF_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'handoff',
        reason: data.reason,
        lastMessage: data.lastMessage,
        conversation: conversation.slice(-6),
        timestamp: new Date().toISOString(),
        page: window.location.href
      })
    }).catch(function () {});
    handoffDone = true;
    savePersistedState();
    if ($inputWrap) $inputWrap.classList.add('disabled');
  }

  function sendToWebhook(payload) {
    return fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (data) {
        return { ok: r.ok, data: data };
      }).catch(function () {
        return { ok: false, data: null };
      });
    });
  }

  function getWebhookStatus(data) {
    if (!data) return null;
    if (data.status) return data.status;
    if (data.data && data.data.status) return data.data.status;
    if (data.body && data.body.status) return data.body.status;
    return null;
  }

  function getWebhookValue(data, key) {
    if (data && data[key] != null) return data[key];
    if (data && data.data && data.data[key] != null) return data.data[key];
    if (data && data.body && data.body[key] != null) return data.body[key];
    return null;
  }

  function formatSlots(slots) {
    if (Array.isArray(slots)) return slots.join(', ');
    if (typeof slots === 'string') return slots;
    return String(slots || '');
  }

  function doBooking(json) {
    lastBookingPayload = Object.assign({}, json);
    addMessage(null, SENDING_BOOKING, true);
    $messages.scrollTop = $messages.scrollHeight;
    removeTyping();
    sendToWebhook(json)
      .then(function (result) {
        var sys = $messages.querySelector('.l2l-msg-sys:last-of-type');
        if (sys) sys.remove();
        var data = result.data;
        var status = getWebhookStatus(data);
        if (status === 'success') {
          var bookedTime = getWebhookValue(data, 'bookedTime');
          var userName = getWebhookValue(data, 'name') ||
            (lastBookingPayload && lastBookingPayload['Full name']) ||
            '';
          var displayName = (lastBookingPayload && lastBookingPayload['Full name']) || userName || 'there';
          bookingDone = true;
          pendingResubmit = null;
          savePersistedState();
          if ($inputWrap) $inputWrap.classList.add('disabled');
          window.location.href = '/booking-confirmed.html?name=' +
            encodeURIComponent(displayName) +
            '&time=' + encodeURIComponent(bookedTime || 'your requested time');
          return;
        }
        if (status === 'time_unavailable') {
          var availableSlots = getWebhookValue(data, 'availableSlots');
          var slotsStr = formatSlots(availableSlots);
          pendingResubmit = Object.assign({}, lastBookingPayload);
          savePersistedState();
          var timeUnavailableMsg = 'Sorry, that time is already booked! Here are the available slots on your requested day: ' + slotsStr + '. Which one would you prefer?';
          addMessage('bot', timeUnavailableMsg);
        } else {
          pendingResubmit = null;
          savePersistedState();
          addMessage(null, BOOKING_ERROR, true);
        }
        $messages.scrollTop = $messages.scrollHeight;
      })
      .catch(function () {
        var sys = $messages.querySelector('.l2l-msg-sys:last-of-type');
        if (sys) sys.remove();
        pendingResubmit = null;
        savePersistedState();
        addMessage(null, BOOKING_ERROR, true);
        $messages.scrollTop = $messages.scrollHeight;
      });
  }

  function callChat(userText) {
    if (!chatConfigured) {
      addMessage('bot', 'The chat is not configured right now. Please call us on (01) 901 2633.');
      return;
    }
    conversation.push({ role: 'user', content: userText });
    savePersistedState();
    var recentConversation = conversation.slice(-20);
    var messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ].concat(recentConversation.map(function (m) {
      return { role: m.role, content: m.content };
    }));

    addTyping();
    fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        stream: false
      })
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        }).catch(function () {
          return { ok: false, data: { error: { message: 'Invalid response from server' } } };
        });
      })
      .then(function (result) {
        removeTyping();
        var data = result.data;
        if (data.error) {
          var errMsg = (data.error.message || '').toLowerCase();
          if (errMsg.indexOf('credits') !== -1 || errMsg.indexOf('licenses') !== -1) {
            addMessage('bot', 'The chat service is temporarily unavailable. Please call us on (01) 901 2633 or email leaf2leaflandscapes@gmail.com.');
          } else if (errMsg.indexOf('api key') !== -1 || errMsg.indexOf('invalid') !== -1 || errMsg.indexOf('authentication') !== -1 || errMsg.indexOf('forbidden') !== -1 || errMsg.indexOf('access') !== -1) {
            addMessage('bot', 'The chat is not configured correctly right now. Please call us on (01) 901 2633 or email leaf2leaflandscapes@gmail.com.');
          } else if (errMsg.indexOf('rate') !== -1 || errMsg.indexOf('quota') !== -1) {
            addMessage('bot', 'Too many requests — please wait a moment and try again, or call us on (01) 901 2633.');
          } else if (errMsg.indexOf('context') !== -1 || errMsg.indexOf('token') !== -1 || errMsg.indexOf('length') !== -1) {
            addMessage('bot', "Our conversation has gotten quite long! To continue, I\'ll need to start fresh. Click the ↺ button above to clear the chat and start again.");
          } else {
            addMessage('bot', 'Sorry, I had trouble with that. Please try again or call us on (01) 901 2633.');
          }
          $messages.scrollTop = $messages.scrollHeight;
          return;
        }
        var rawContent = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        var content = '';
        if (typeof rawContent === 'string') {
          content = rawContent;
        } else if (Array.isArray(rawContent) && rawContent.length > 0) {
          var part = rawContent[0];
          content = (part && (part.text || part.content)) ? (part.text || part.content) : '';
        } else if (rawContent && typeof rawContent === 'object' && rawContent.text) {
          content = rawContent.text;
        }
        if (!content) {
          addMessage('bot', 'Sorry, I had trouble with that. Please try again or call us on (01) 901 2633.');
          $messages.scrollTop = $messages.scrollHeight;
          return;
        }
        var handoff = stripHandoffReady(content);
        var parsed = stripBookingReady(content);
        var safeDisplay = function (raw) {
          var d = (raw || '').trim();
          if (!d || d.indexOf('BOOKING_READY') !== -1 || d.indexOf('HANDOFF_READY') !== -1) return null;
          return d;
        };
        if (handoff.json) {
          var hDisplay = safeDisplay(handoff.display);
          if (hDisplay) {
            conversation.push({ role: 'assistant', content: content });
            savePersistedState();
            addMessage('bot', hDisplay);
          }
          showHandoffChip(handoff.json);
        } else if (safeDisplay(parsed.display)) {
          conversation.push({ role: 'assistant', content: content });
          savePersistedState();
          addMessage('bot', safeDisplay(parsed.display));
          if (!handoffDone && !bookingDone && messageOffersHandoff(parsed.display)) {
            showHandoffChip({ reason: 'User requested via button', lastMessage: 'User clicked connect button' });
          }
        }
        if (parsed.json) {
          doBooking(parsed.json);
        }
        $messages.scrollTop = $messages.scrollHeight;
        if (conversation.length > 20) {
          conversation = conversation.slice(-20);
          if (typeof hasConsent === 'function' && hasConsent()) {
            localStorage.setItem('l2l_conversation', JSON.stringify(conversation));
          }
        }
      })
      .catch(function () {
        removeTyping();
        addMessage('bot', 'Something went wrong. Please try again or call us on (01) 901 2633.');
        $messages.scrollTop = $messages.scrollHeight;
      });
  }

  function sendMessage() {
    var text = ($textarea && $textarea.value) ? $textarea.value.trim() : '';
    if (!text || bookingDone || handoffDone) return;
    $textarea.value = '';
    if ($textarea.style.height) $textarea.style.height = 'auto';

    if (pendingResubmit) {
      var userMsg = text;
      addMessage('user', userMsg);

      // Try to parse a full time (HH:MM or H[H] with optional am/pm)
      var timeMatch = userMsg.match(/\b(\d{1,2})(?::(\d{2}))?/);
      if (timeMatch) {
        var hour = parseInt(timeMatch[1], 10);
        var minutes = timeMatch[2] != null ? parseInt(timeMatch[2], 10) : 0;
        if (/pm/i.test(userMsg) && hour < 12) hour += 12;
        if (/am/i.test(userMsg) && hour === 12) hour = 0;
        if (!isFinite(hour) || hour < 0 || hour > 23) {
          addMessage('bot', 'I couldn\u2019t understand that time. Please reply with one of the available times, like "3pm" or "15:30".');
          $messages.scrollTop = $messages.scrollHeight;
          return;
        }
        if (!isFinite(minutes) || minutes < 0 || minutes > 59) minutes = 0;
        var newTime = String(hour).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
        pendingResubmit['Preferred Time'] = newTime;
      } else {
        addMessage('bot', 'I couldn\u2019t see a clear time in that message. Please reply with one of the available times, like "3pm" or "15:30".');
        $messages.scrollTop = $messages.scrollHeight;
        return;
      }

      var payload = Object.assign({}, pendingResubmit);
      pendingResubmit = null;
      savePersistedState();
      doBooking(payload);
      $messages.scrollTop = $messages.scrollHeight;
      return;
    }

    addMessage('user', text);
    callChat(text);
  }

  function openChat() {
    var tooltip = document.getElementById('l2l-chat-tooltip');
    if (tooltip) {
      tooltip.classList.add('hidden');
      try { sessionStorage.setItem('l2l_chat_tooltip_dismissed', '1'); } catch (e) {}
    }
    if (window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    }
    $window.classList.remove('hidden');
    $window.classList.add('open');
    if (hasOpened && $messages.children.length === 0) {
      if (conversation.length === 0) {
        addMessage('bot', GREETING);
      } else {
        conversation.forEach(function (m) {
          var text = m.content;
          if (m.role === 'assistant') {
            var p = stripBookingReady(text);
            var h = stripHandoffReady(p.display);
            text = h.display;
          }
          if (m.role === 'assistant' && text.trim() === '') return;
          addMessage(m.role === 'assistant' ? 'bot' : 'user', text);
        });
      }
      if ((bookingDone || handoffDone) && $inputWrap) {
        $inputWrap.classList.add('disabled');
      }
    } else if (!hasOpened) {
      hasOpened = true;
      savePersistedState();
      addMessage('bot', GREETING);
    }
  }

  function closeChat() {
    document.body.style.overflow = '';
    $window.classList.add('hidden');
  }

  function buildWidget() {
    try {
      if (hasConsent()) {
        var saved = localStorage.getItem('l2l_conversation');
        if (saved) conversation = JSON.parse(saved);
        hasOpened = localStorage.getItem('l2l_hasOpened') === 'true';
        bookingDone = localStorage.getItem('l2l_bookingDone') === 'true';
        handoffDone = localStorage.getItem('l2l_handoffDone') === 'true';
        // If a booking was completed but we're no longer on the booking-confirmed page,
        // clear the previous booking state so the chat isn't frozen on other pages.
        if (localStorage.getItem('l2l_bookingDone') === 'true' &&
          !window.location.pathname.includes('booking-confirmed')) {
          try {
            localStorage.removeItem('l2l_bookingDone');
            localStorage.removeItem('l2l_conversation');
            localStorage.removeItem('l2l_pendingResubmit');
          } catch (e3) {}
          bookingDone = false;
          conversation = [];
        }
        var savedPending = localStorage.getItem('l2l_pendingResubmit');
        if (savedPending) {
          try {
            var parsed = JSON.parse(savedPending);
            pendingResubmit = (parsed && parsed.payload) ? Object.assign({}, parsed.payload) : parsed;
          } catch (e2) {}
        }
      }
    } catch (e) {}
    injectStyles();
    $btn = document.createElement('button');
    $btn.className = 'l2l-chat-btn';
    $btn.setAttribute('aria-label', 'Open chat');
    $btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>';
    $btn.addEventListener('click', openChat);

    $window = document.createElement('div');
    $window.className = 'l2l-chat-window hidden';
    $window.innerHTML =
      '<div class="l2l-chat-header">' +
        '<span class="l2l-chat-header-avatar">🌿</span>' +
        '<div class="l2l-chat-header-text">' +
          '<div class="l2l-chat-header-title">Leaf — L2L Assistant</div>' +
          '<div class="l2l-chat-header-status"><span class="l2l-chat-header-status-dot"></span> Online</div>' +
        '</div>' +
        '<button type="button" class="l2l-chat-clear" aria-label="Clear chat" title="Clear chat">↺</button>' +
        '<button type="button" class="l2l-chat-close" aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="l2l-chat-messages"></div>' +
      '<div class="l2l-chat-input-wrap">' +
        '<div class="l2l-chat-row">' +
          '<textarea class="l2l-chat-textarea" placeholder="Type a message..." rows="1"></textarea>' +
          '<button type="button" class="l2l-chat-send" aria-label="Send"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
        '</div>' +
      '</div>';
    $messages = $window.querySelector('.l2l-chat-messages');
    $inputWrap = $window.querySelector('.l2l-chat-input-wrap');
    $textarea = $window.querySelector('.l2l-chat-textarea');
    $sendBtn = $window.querySelector('.l2l-chat-send');

    $window.querySelector('.l2l-chat-close').addEventListener('click', closeChat);
    $window.querySelector('.l2l-chat-clear').addEventListener('click', function () {
      localStorage.removeItem('l2l_conversation');
      localStorage.removeItem('l2l_hasOpened');
      localStorage.removeItem('l2l_bookingDone');
      localStorage.removeItem('l2l_handoffDone');
      localStorage.removeItem('l2l_pendingResubmit');
      conversation = [];
      hasOpened = false;
      bookingDone = false;
      handoffDone = false;
      pendingResubmit = null;
      $messages.innerHTML = '';
      addMessage('bot', GREETING);
      if ($inputWrap) $inputWrap.classList.remove('disabled');
      savePersistedState();
    }); // savePersistedState persists cleared state when consent exists
    $sendBtn.addEventListener('click', sendMessage);
    $textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    $textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });

    var $whatsapp = document.createElement('a');
    $whatsapp.id = 'whatsapp-float-btn';
    $whatsapp.href = 'https://wa.me/995597006664';
    $whatsapp.target = '_blank';
    $whatsapp.rel = 'noopener noreferrer';
    $whatsapp.setAttribute('aria-label', 'Chat on WhatsApp');
    $whatsapp.innerHTML = '<svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.06 23.41a.75.75 0 00.945.945l5.548-1.472A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 01-4.95-1.355l-.355-.212-3.668.972.987-3.588-.232-.371A9.694 9.694 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>';

    document.body.appendChild($whatsapp);
    document.body.appendChild($btn);
    document.body.appendChild($window);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
