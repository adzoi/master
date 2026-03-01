# Enquiry Form — Fields & Google Sheet Mapping

Form submissions are intended for a Google Sheet processed by an AI booking agent. Use the **exact** `name` values below when mapping form data to Sheet columns.

---

## Field list (HTML form)

| # | Question text | Input type | `name` (→ Google Sheet column) | Validation | Placeholder / notes |
|---|----------------|------------|---------------------------------|------------|---------------------|
| 1 | **Full Name** | `text` | `Full Name` | Required. Pattern: letters and spaces only (`[A-Za-z\u00C0-\u024F\s\-']+`). Min 2, max 120 chars. | — |
| 2 | **Email Address** | `email` | `Gmail` | Required. Valid email format. | — |
| 3 | **Phone Number (without country code)** | `tel` | `Phone` | Required. Digits only, 7–15 chars. No + or country code. Pattern: `[0-9]{7,15}`. | e.g. 851234567 |
| 4 | **Preferred Date** | `date` | `Preferred Date` | Required. Cannot select past dates (min set to today in JS). | Format: yyyy-mm-dd (HTML5 date) |
| 5 | **Preferred Time** | `time` | `Preferred Time` | Required. | 24-hour HH:MM |
| 6 | **Additional Comment** | `textarea` | `Additional Comment` | Optional. Max 2000 chars. | "Any extra details (optional)" |

---

## Google Sheet column mapping

| Form field (HTML `name`) | Google Sheet column |
|--------------------------|----------------------|
| `Full Name` | **Full Name** |
| `Gmail` | **Gmail** |
| `Phone` | **Phone** |
| `Preferred Date` | **Preferred Date** |
| `Preferred Time` | **Preferred Time** |
| `Additional Comment` | **Additional Comment** |

---

## Validation rules (summary)

- **Full Name:** Required; only letters (including accented), spaces, hyphens, apostrophes; 2–120 characters.
- **Email Address:** Required; valid email (browser `type="email"`).
- **Phone:** Required; 7–15 digits only; no + or country code.
- **Preferred Date:** Required; `min` = today (set in `js/contact.js`).
- **Preferred Time:** Required; any 24-hour time.
- **Additional Comment:** Optional; max length 2000.

---

## Form location

- **HTML:** `contact.html` — form `#quote-form` inside `#form`.
- **Styles:** `css/contact.css` (`.contact-page__form`, `.contact-page__field`, etc.).
- **Behaviour:** `js/contact.js` (date min, submit success message).
