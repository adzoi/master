# Appointments Webhook — n8n Success Response

The contact form and chat widget both POST to the appointments webhook. For the confirmation page to work correctly, the n8n **Respond to Webhook** node (or equivalent success response) must return the following JSON when a booking is confirmed:

## Success response format

```json
{
  "status": "success",
  "message": "Your appointment is confirmed!",
  "bookedTime": "{{ $('Find Slot').first().json.slotFormatted }}",
  "name": "{{ $('Find Slot').first().json.name }}"
}
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `status` | Yes | Must be `"success"` for redirect to confirmation page |
| `message` | No | Shown in some flows; optional |
| `bookedTime` | Yes | The confirmed time slot (e.g. "Monday 10 March at 14:00") — used in confirmation page heading |
| `name` | Yes | Customer's full name — used in "You're all booked, [name]!" heading |

### n8n expression examples

If your workflow uses different node names, adjust the expressions:

- **bookedTime**: Use the output from your slot-finding/booking node (e.g. `$('Find Slot').first().json.slotFormatted` or `$json.slotFormatted`)
- **name**: Use the customer name from the incoming payload (e.g. `$('Webhook').first().json['Full name']` or `$json['Full name']`)

## time_unavailable response

When the requested slot is taken, return:

```json
{
  "status": "time_unavailable",
  "availableSlots": ["09:00", "10:30", "14:00", "15:30"]
}
```

The contact form will display these slots in a styled box and ask the user to pick a different time.
