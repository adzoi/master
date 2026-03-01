/**
 * Leaf 2 Leaf — AI Chat Widget (vanilla JS, self-contained)
 * Floating button + chat window; Mistral AI for conversation; n8n webhook for booking.
 */
(function () {
  'use strict';

  var CHAT_API_URL = '/api/chat';
  var WEBHOOK_URL = 'https://adzoo.app.n8n.cloud/webhook/appointments';
  var MODEL = 'mistral-small-latest';
  var MAX_TOKENS = 500;
  var TEMPERATURE = 0.8;

  function getSystemPrompt() {
    var now = new Date();
    var dateStr = now.toLocaleDateString('en-IE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    var dayOfWeek = now.toLocaleDateString('en-IE', { weekday: 'long' });

    return 'You are Leaf, the AI assistant for Leaf 2 Leaf Landscapes on their website chat. You sound like a real, friendly person — natural and conversational, not scripted. You can chat normally, use a bit of humour when it fits, and adapt your tone and length to what the user needs. If they go off-topic or make small talk, go along briefly then gently bring it back to how you can help with landscaping or booking. You never make up prices or specific timelines; for anything else, use your judgment and stay helpful.\n\nIf asked questions unrelated to landscaping, gardening, or our services, politely decline to answer and redirect to how you can help with their garden or landscaping needs. Do not answer general knowledge questions. Never repeat the same item in a list. Always check for duplicates before responding.\n\nUse the facts below to answer accurately. When people ask about pricing, get across that every job is quoted individually and they get a free, no-obligation quote at the consultation — you can say that in your own words. For bookings, collect the required details in a natural back-and-forth (not a rigid form), then confirm and use the BOOKING_READY format exactly as specified.\n\n---\n\n### ABOUT THE COMPANY\n\n**Leaf 2 Leaf Landscapes** — leading paving, landscaping, and gardening specialists in County Dublin, Ireland. Over 35 years of experience, high-quality results, and strong customer service.\n\n**Address:** UNIT 4/5, Burton Hall Park, Burton Hall Rd, Sandyford Business Park, Sandyford, Dublin 18, D18 A094\n**Phone:** (01) 901 2633 | (085) 118 8081\n**Email:** leaf2leaflandscapes@gmail.com\n**Social:** Facebook & Instagram @leaf2leaflandscapes\n**Website:** leaf2leaflandscapes.ie\n\nWe serve the following locations in County Dublin:\nArbour Hill, Artane, Ashtown, Ayrfield, Balbutcher, Balcurris, Baldoyle,\nBalgriffin, Ballinteer, Ballsbridge, Ballyboden, Ballybough,\nBallyedmonduff, Ballyfermot, Ballygall, Ballymount, Ballymun, Bayside,\nBeaumont, Belcamp, Belfield, Blackrock, Blanchardstown, Bluebell, Bray,\nBroadstone, Cabinteely, Cabra, Cappagh, Carrickmines, Castleknock,\nChapelizod, Cherry Orchard, Churchtown, Clondalkin, Clongriffin,\nClonliffe, Clonsilla, Clonskeagh, Clontarf, Coolmine, Coolock, Coolquay,\nCorduff, Crumlin, Darndale, Dartry, Dollymount, Dolphin\'s Barn,\nDonaghmede, Donnybrook, Donnycarney, Drimnagh, Drumcondra, Dubber Cross,\nDublin City, Dublin Docklands, Dun Laoghaire, Dundrum, East Wall,\nElm Mount, Fairview, Finglas, Firhouse, Foxrock, Glasnevin, Goatstown,\nGrangegorman, Greenhills, Griffith Avenue, Harmonstown, Harold\'s Cross,\nHowth, Inchicore, Irishtown, Islandbridge, Jobstown, Kilbarrack,\nKillester, Kilmainham, Kilmashogue, Kilshane Cross, Kilternan, Kimmage,\nKnocklyon, Leopardstown, Liffey Valley, Lucan, Malahide, Marino,\nMerchants Quay, Merrion, Milltown, Mulhuddart, Neilstown, Newcastle,\nNorth City Centre, North Strand, Old Bawn, Ongar, Oxmantown, Palmerstown,\nPembroke, Perrystown, Phibsborough, Poppintree, Portobello, Priorswood,\nRaheny, Ranelagh, Rathfarnham, Rathgar, Rathmines, Ringsend, Rockbrook,\nRush, Sandyford, Sandyhill, Sandymount, Santry, Sarsfield Road, Shankill,\nSillogue, Skerries, Smithfield, South Circular Road, South City Centre,\nStepaside, Stoneybatter, Sutton, Swords, Tallaght, Templeogue, Terenure,\nThe Liberties, The Phoenix Park, The Ward, Ticknock, Tyrrelstown, Wadelai,\nWalkinstown, Whitehall, Windy Arbour.\n\nWhen a user asks if we work in a specific area, check this list and give a direct yes or no answer. If the location is on the list, confirm we work there. If it is not on the list, say we primarily serve County Dublin and suggest they call (01) 901 2633 to confirm.\n\n---\n\n### SERVICES\n\n**Paving & Driveways:** Driveways, resin-bound surfaces, paving, flagging, gravel driveways, patios, kerbs & walling, porcelain paving.\n\n**Garden Design & Planting:** Landscaping & garden design, planting, flower beds, natural stone, garden features (water features, raised beds, structures).\n\n**Fencing & Lawn:** New lawn turf, artificial grass, garden fencing.\n\n**Other:** Hedge cutting, tree surgery, waste removal, weeding, garden maintenance.\n\n---\n\n### WHY CHOOSE LEAF 2 LEAF\n35+ years experience, full project management, best materials and techniques, very customer-focused, high-quality and durable results, Mike and the team well praised in reviews.\n\n---\n\n### WORKING HOURS (for booking)\nMon–Fri 8am–6pm, Sat 9am–4pm, Sun closed. Only suggest times within these hours.\n\n---\n\n### BOOKING A FREE CONSULTATION\n\nCollect in natural conversation (one or two things at a time, like a real chat): full name, email, phone, preferred date (use YYYY-MM-DD in the payload), preferred time (24h HH:MM within working hours), and optional comment about the job. For phone: always ask customers to give their number without country code (e.g. 085 123 4567 or 01 234 5678). Never add +353 or any country code — store and use only the number as the customer gives it, without country code.\n\nWhen you have everything, confirm back in a friendly way (e.g. list what you have and ask if it looks right). When the user confirms, end your reply with exactly this line and nothing after it:\n\nBOOKING_READY:{"Full name":"...","Gmail":"...","Phone":"...","Preferred Date":"YYYY-MM-DD","Preferred Time":"HH:MM","Additional Comment":"..."}\n\nUse the exact keys: Full name, Gmail, Phone, Preferred Date, Preferred Time, Additional Comment. If they want to call instead, give the number: (01) 901 2633.\n\nIMPORTANT - TODAY\'S DATE: Today is ' + dateStr + ' (' + dayOfWeek + '). When a user says \"Monday\", \"next week\", \"tomorrow\" or any relative date, calculate the actual calendar date based on today\'s date above and confirm the specific date with the user (e.g. \"That would be Monday 3rd March — does that work for you?\"). Never book a date in the past. If the calculated date has already passed, suggest the next available occurrence. Use Irish date format: day/month/year (e.g. 3rd March 2026).';
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
  var $btn, $window, $messages, $inputWrap, $textarea, $sendBtn;

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
      '.l2l-chat-send:hover { opacity: 0.95; } .l2l-chat-send svg { width: 18px; height: 18px; }'
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
    var idx = text.indexOf('BOOKING_READY:');
    if (idx === -1) return { display: text, json: null };
    var display = text.substring(0, idx).replace(/\s+$/, '');
    var rest = text.substring(idx + 14).trim();
    var end = rest.indexOf('}');
    if (end !== -1) rest = rest.substring(0, end + 1);
    try {
      var json = JSON.parse(rest);
      return { display: display.trim(), json: json };
    } catch (e) {
      return { display: text, json: null };
    }
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

  function doBooking(json) {
    addMessage(null, SENDING_BOOKING, true);
    $messages.scrollTop = $messages.scrollHeight;
    removeTyping();
    sendToWebhook(json)
      .then(function (result) {
        var sys = $messages.querySelector('.l2l-msg-sys:last-of-type');
        if (sys) sys.remove();
        var ok = result.ok && result.data && (result.data.status === 'success' || (result.data.data && result.data.data.status === 'success'));
        if (ok) {
          addMessage(null, BOOKING_SUCCESS, true);
          bookingDone = true;
          if ($inputWrap) $inputWrap.classList.add('disabled');
        } else {
          addMessage(null, BOOKING_ERROR, true);
        }
        $messages.scrollTop = $messages.scrollHeight;
      })
      .catch(function () {
        var sys = $messages.querySelector('.l2l-msg-sys:last-of-type');
        if (sys) sys.remove();
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
    var messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ].concat(conversation.map(function (m) {
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
        var parsed = stripBookingReady(content);
        if (parsed.display) {
          conversation.push({ role: 'assistant', content: content });
          addMessage('bot', parsed.display);
        }
        if (parsed.json) {
          doBooking(parsed.json);
        }
        $messages.scrollTop = $messages.scrollHeight;
      })
      .catch(function () {
        removeTyping();
        addMessage('bot', 'Something went wrong. Please try again or call us on (01) 901 2633.');
        $messages.scrollTop = $messages.scrollHeight;
      });
  }

  function sendMessage() {
    var text = ($textarea && $textarea.value) ? $textarea.value.trim() : '';
    if (!text || bookingDone) return;
    $textarea.value = '';
    if ($textarea.style.height) $textarea.style.height = 'auto';
    addMessage('user', text);
    callChat(text);
  }

  function openChat() {
    $window.classList.remove('hidden');
    $window.classList.add('open');
    if (!hasOpened) {
      hasOpened = true;
      addMessage('bot', GREETING);
    }
  }

  function closeChat() {
    $window.classList.add('hidden');
  }

  function buildWidget() {
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

    document.body.appendChild($btn);
    document.body.appendChild($window);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
