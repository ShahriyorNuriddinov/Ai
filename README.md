# Decentralized Masters - Landing Page Clone

A full clone of the Dec Masters training funnel site with:

1. **Landing Page** (`index.html`) - Video sales letter with Vidalytics embed
2. **Application/Survey** (`apply.html`) - TypeForm-style quiz questionnaire  
3. **Booking Page** (`booking.html`) - Calendar booking with Telegram notifications
4. **Thank You Page** (`thankyou.html`) - Confirmation with video steps

## Setup

### Telegram Bot Configuration

Edit `js/tg-config.js` and replace the placeholder values:

```javascript
window.TG_CONFIG = {
    botToken: 'YOUR_BOT_TOKEN_HERE',  // Get from @BotFather on Telegram
    chatId: 'YOUR_CHAT_ID_HERE'       // Your group chat ID
};
```

### Deployment

This is a static site - deploy to any static hosting (Netlify, Vercel, GitHub Pages, etc.)

## Features

- Fully responsive (mobile-first design)
- Vidalytics video player integration
- TypeForm-style questionnaire flow
- Calendar booking with timezone support
- Telegram group notification on booking
- Trust indicators (Trustpilot, member count)
- Matching design with original site

## Security

- Telegram bot token and chat ID are kept in a separate config file
- The `tg-config.js` file should NOT be committed with real credentials
- For production, use a backend proxy for the Telegram API calls
