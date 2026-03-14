# Live Chat Handoff — n8n Workflow Setup

## 1. Import the workflow

1. Open your n8n instance (e.g. https://adzoo.app.n8n.cloud)
2. Create a new workflow
3. Import `n8n-handoff-workflow.json` (Menu → Import from File)

## 2. Configure the workflow

### Webhook
- Path: `handoff` (already set)
- Full URL: `https://YOUR_N8N_INSTANCE/webhook/handoff`
- Update `HANDOFF_WEBHOOK_URL` in `js/chat-widget.js` if your n8n URL differs

### Gmail node
- Set **To** to your real owner email (replace `bagdaanbagdaan.lol@gmail.com`)
- Add Gmail credentials if not already configured

### Twilio WhatsApp node
- Add Twilio API credentials
- Set **From** to your Twilio WhatsApp number (e.g. `whatsapp:+353XXXXXXXX`)
- **To** is already set to `whatsapp:+995597006664`

## 3. Activate

Save the workflow and activate it. The webhook will start accepting POST requests at `/webhook/handoff`.

## Payload format

The chat widget sends:
```json
{
  "reason": "brief reason why they need help",
  "lastMessage": "user's last message",
  "conversation": [{"role":"user","content":"..."},{"role":"assistant","content":"..."}],
  "timestamp": "2026-03-08T12:00:00.000Z",
  "page": "https://..."
}
```
