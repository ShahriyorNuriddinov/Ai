const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Telegram configuration
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '8675858652:AAF1tIhJmcyjka8IO6O04799aOqB1v7I8Bs';
const TG_CHAT_ID = process.env.TG_CHAT_ID || '-5277306861';

// API endpoint for sending Telegram notifications
app.post('/api/send-telegram', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received Telegram request:', message ? 'Message present' : 'No message');

        if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
            console.error('Telegram config missing:', { hasToken: !!TG_BOT_TOKEN, hasChatId: !!TG_CHAT_ID });
            return res.status(500).json({
                success: false,
                error: 'Telegram configuration missing'
            });
        }

        const telegramUrl = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
        console.log('Sending to Telegram API...');

        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        console.log('Telegram API response:', data);

        if (data.ok) {
            res.json({ success: true, message: 'Notification sent successfully' });
        } else {
            console.error('Telegram API error:', data.description);
            res.status(400).json({ success: false, error: data.description });
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Typeform webhook endpoint - receives quiz answers
app.post('/api/typeform-webhook', async (req, res) => {
    try {
        console.log('Typeform webhook received:', JSON.stringify(req.body, null, 2));

        const formResponse = req.body.form_response;
        if (!formResponse) {
            return res.status(400).json({ success: false, error: 'No form response' });
        }

        // Extract answers from Typeform
        const answers = formResponse.answers || [];
        const fields = {};

        answers.forEach(answer => {
            const questionId = answer.field.id;
            const questionText = answer.field.title;
            let answerText = '';

            if (answer.type === 'choice') {
                answerText = answer.choice.label;
            } else if (answer.type === 'text') {
                answerText = answer.text;
            } else if (answer.type === 'email') {
                answerText = answer.email;
            } else if (answer.type === 'phone_number') {
                answerText = answer.phone_number;
            }

            fields[questionId] = {
                question: questionText,
                answer: answerText
            };
        });

        // Format message for Telegram
        let message = '📝 New Application Form Submission!\n\n';

        Object.values(fields).forEach(field => {
            message += `❓ ${field.question}\n✅ ${field.answer}\n\n`;
        });

        message += `⏰ Submitted: ${new Date().toLocaleString()}`;

        // Send to Telegram
        if (TG_BOT_TOKEN && TG_CHAT_ID) {
            const telegramUrl = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;

            const telegramResponse = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TG_CHAT_ID,
                    text: message
                })
            });

            const telegramData = await telegramResponse.json();
            console.log('Telegram response:', telegramData);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Typeform webhook error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/apply', (req, res) => {
    res.sendFile(path.join(__dirname, 'apply.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'booking.html'));
});

app.get('/thankyou', (req, res) => {
    res.sendFile(path.join(__dirname, 'thankyou.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Telegram Bot configured: ${!!TG_BOT_TOKEN}`);
    console.log(`Chat ID configured: ${!!TG_CHAT_ID}`);
});
