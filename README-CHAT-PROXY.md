# Chat widget – local proxy (testing)

The chat talks to **Mistral AI** via a small proxy so the API key never runs in the browser.

## Run for testing

1. Install and start the server with your Mistral API key:
   ```bash
   npm install
   L2L_CHAT_API_KEY=your-mistral-key npm start
   ```
   (You can copy the key from `js/l2l-secret.js` if you have it there for reference; that file is gitignored.)
2. Open in the browser: **http://localhost:3000/home/index.html** (or `/contact.html`, etc.).
3. Use the chat; it will call `/api/chat` on this server, which forwards to Mistral.

## API key

- The key is read from the **`L2L_CHAT_API_KEY`** environment variable. Set it when starting the server.
- Do not commit your key. Use `js/l2l-secret.js` (gitignored) only for your local copy.

## Static-only (no Node)

If you serve the site with `npx serve` or similar, `/api/chat` does not exist and the chat will get a 404. Use `npm start` from this project to run the proxy + static files together.
