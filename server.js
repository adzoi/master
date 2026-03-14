console.log('server.js starting...');
/**
 * Simple local proxy for the Leaf 2 Leaf chat widget.
 * Forwards /api/chat to Mistral AI so the browser never sends the API key.
 *
 * Run: npm install && node server.js (set MISTRAL_API_KEY in .env)
 * Then open http://localhost:3000 (e.g. home/index.html)
 */
require('dotenv').config();
var path = require('path');
var express = require('express');
var app = express();
console.log('1. requires loaded');

var MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
// Prefer MISTRAL_API_KEY; keep L2L_CHAT_API_KEY for backwards compatibility with older docs.
var API_KEY = process.env.MISTRAL_API_KEY || process.env.L2L_CHAT_API_KEY;
console.log('2. env loaded');

console.log('3. app created');

app.use(express.json());
app.use(express.static(path.join(__dirname)));
console.log('4. middleware set');

app.get('/', function (req, res) {
  res.redirect('/home/index.html');
});

app.post('/api/chat', function (req, res) {
  if (!API_KEY) {
    return res.status(500).json({ error: { message: 'API key not set (set MISTRAL_API_KEY in .env, or L2L_CHAT_API_KEY for legacy setups)' } });
  }
  var body = req.body || {};
  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY
    },
    body: JSON.stringify({
      model: body.model || 'mistral-small-latest',
      messages: body.messages || [],
      max_tokens: body.max_tokens != null ? body.max_tokens : 500,
      temperature: body.temperature != null ? body.temperature : 0.8,
      stream: false
    })
  };
  fetch(MISTRAL_URL, options)
    .then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) {
          console.error('Mistral API error', r.status, data.error || data);
        }
        res.status(r.status).json(data);
      });
    })
    .catch(function (err) {
      console.error('/api/chat proxy error:', err.message);
      res.status(502).json({ error: { message: err.message || 'Proxy error' } });
    });
});

// Google Places API returns max 5 reviews — this is a hard Google limit and cannot be increased via this API
var GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.PLACES_API_KEY;
var GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID;
var reviewsCache = null;
var reviewsCacheTime = 0;
var REVIEWS_CACHE_MS = 60 * 60 * 1000;

app.get('/api/reviews', function (req, res) {
  if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
    return res.status(503).json({ error: 'Reviews not configured' });
  }
  if (reviewsCache && Date.now() - reviewsCacheTime < REVIEWS_CACHE_MS) {
    return res.json(reviewsCache);
  }
  var url = 'https://maps.googleapis.com/maps/api/place/details/json' +
    '?place_id=' + encodeURIComponent(GOOGLE_PLACE_ID) +
    '&fields=name,rating,reviews,user_ratings_total' +
    '&reviews_sort=most_relevant' +
    '&key=' + encodeURIComponent(GOOGLE_PLACES_API_KEY);
  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('/api/reviews Google API error:', data.status, data.error_message || '');
        return res.status(502).json({ error: 'Could not fetch reviews' });
      }
      var result = data.result || {};
      var rawReviews = result.reviews || [];
      var filtered = rawReviews.filter(function (r) { return r.rating >= 4; });
      filtered.sort(function (a, b) {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.time || 0) - (a.time || 0);
      });
      var payload = {
        rating: result.rating || 0,
        total: result.user_ratings_total || 0,
        reviews: filtered.map(function (r) {
          return {
            author_name: r.author_name || 'Anonymous',
            rating: r.rating || 5,
            text: r.text || '',
            time: r.time || 0,
            profile_photo_url: r.profile_photo_url || null
          };
        })
      };
      reviewsCache = payload;
      reviewsCacheTime = Date.now();
      res.json(payload);
    })
    .catch(function (err) {
      console.error('/api/reviews error:', err.message);
      res.status(500).json({ error: 'Could not fetch reviews' });
    });
});

var N8N_BOOK_URL = 'https://melkhi.app.n8n.cloud/webhook/appointments';
app.post('/api/book', function (req, res) {
  fetch(N8N_BOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body || {})
  })
    .then(function (r) {
      return r.json().then(function (data) {
        res.status(r.status).json(data);
        console.log('/api/book n8n response:', r.status, JSON.stringify(data));
      }).catch(function () {
        res.status(r.status).json({ status: 'error', message: 'Invalid response from n8n' });
      });
    })
    .catch(function (err) {
      console.error('/api/book proxy error:', err.message);
      res.status(500).json({ status: 'error', message: err.message });
    });
});

app.get('*', function (req, res) {
  res.status(404).send('Cannot find: ' + req.url);
});

console.log('Routes registered:', app._router.stack.filter(function (r) { return r.route; }).map(function (r) { return r.route.path; }));
console.log('5. routes defined');

const PORT = parseInt(process.env.PORT, 10) || 3000;

console.log('Registered routes:');
app._router.stack.forEach(function (r) {
  if (r.route && r.route.path) {
    console.log(r.route.methods, r.route.path);
  }
});

console.log('6. about to listen');

function tryListen(p) {
  var server = app.listen(p, '0.0.0.0', function () {
    console.log('Server running on port ' + p);
    console.log('L2L chat proxy running at http://localhost:' + p);
    console.log('Open http://localhost:' + p + '/home/index.html (or any page) and use the chat.');
  });
  server.on('error', function (err) {
    if (err.code === 'EADDRINUSE' && p < 3010) {
      console.log('Port ' + p + ' in use, trying ' + (p + 1) + '...');
      tryListen(p + 1);
    } else {
      throw err;
    }
  });
}
tryListen(PORT);
