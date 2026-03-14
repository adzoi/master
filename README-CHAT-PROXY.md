# Chat widget – local proxy (testing)

The chat talks to **Mistral AI** via a small proxy so the API key never runs in the browser.

## Run for testing

1. Install and start the server with your Mistral API key:
   ```bash
   npm install
   MISTRAL_API_KEY=your-mistral-key npm start
   ```
   (Or put `MISTRAL_API_KEY=...` in `.env` and just run `npm start`.)
2. Open the URL printed in the terminal (by default: **http://localhost:3000/home/index.html**). If port 3000 is already in use, the server will automatically try 3001, 3002, etc.
3. Use the chat; it will call `/api/chat` on this server, which forwards to Mistral.

## API key

- The key is read from the **`MISTRAL_API_KEY`** environment variable (preferred).
- For backwards compatibility, **`L2L_CHAT_API_KEY`** is also supported.
- Do not commit your key.

## Static-only (no Node)

If you serve the site with `npx serve` or similar, `/api/chat` does not exist and the chat will get a 404. Use `npm start` from this project to run the proxy + static files together.
