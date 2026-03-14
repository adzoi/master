/**
 * This site uses a local proxy endpoint at /api/chat so the browser never sees an API key.
 * Set your key on the server side instead (preferred):
 * - Put MISTRAL_API_KEY=your-key in .env, then run: npm start
 * (L2L_CHAT_API_KEY is also supported for legacy setups.)
 */
window.L2L_CHAT_API_KEY = 'your-mistral-api-key';
