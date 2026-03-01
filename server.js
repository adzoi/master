/**
 * Simple local proxy for the Leaf 2 Leaf chat widget.
 * Forwards /api/chat to Mistral AI so the browser never sends the API key.
 *
 * Run: npm install && node server.js (set MISTRAL_API_KEY and REPLICATE_API_KEY in .env)
 * Then open http://localhost:3000 (e.g. home/index.html)
 */
require('dotenv').config();
var express = require('express');
var app = express();

var MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
var API_KEY = process.env.MISTRAL_API_KEY;

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/chat', function (req, res) {
  if (!API_KEY) {
    return res.status(500).json({ error: { message: 'MISTRAL_API_KEY not set (add to .env)' } });
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

var port = parseInt(process.env.PORT, 10) || 3000;

function tryListen(p) {
  var server = app.listen(p, function () {
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
tryListen(port);
