// Quiz Questions Data
const questions = [
    {
        id: 1,
        text: "To confirm, you are filling this out because you want to be part of an exclusive community who shares the most lucrative opportunities within Decentralized Finance?",
        type: "choice",
        options: [
            { letter: "A", text: "Yes - I'm a serious investor." },
            { letter: "B", text: "No - I will leave this page immediately." }
        ]
    },
    {
        id: 2,
        text: "How much do you currently have invested in crypto?",
        type: "choice",
        options: [
            { letter: "A", text: "Less than $20,000" },
            { letter: "B", text: "$20,000 - $50,000" },
            { letter: "C", text: "$50,000 - $100,000" },
            { letter: "D", text: "$100,000 - $500,000" },
            { letter: "E", text: "$500,000+" }
        ]
    },
    {
        id: 3,
        text: "What is your primary goal with crypto investing?",
        type: "choice",
        options: [
            { letter: "A", text: "Generate passive income" },
            { letter: "B", text: "Grow my portfolio long-term" },
            { letter: "C", text: "Learn about DeFi opportunities" },
            { letter: "D", text: "Protect my wealth from inflation" },
            { letter: "E", text: "All of the above" }
        ]
    },
    {
        id: 4,
        text: "How would you describe your experience with DeFi (Decentralized Finance)?",
        type: "choice",
        options: [
            { letter: "A", text: "Complete beginner - never used DeFi" },
            { letter: "B", text: "I've heard of it but haven't tried it" },
            { letter: "C", text: "I've used some basic DeFi protocols" },
            { letter: "D", text: "I'm experienced with DeFi" }
        ]
    },
    {
        id: 5,
        text: "Are you ready to commit time and resources to building real wealth through crypto?",
        type: "choice",
        options: [
            { letter: "A", text: "Yes - I'm ready to take action now" },
            { letter: "B", text: "I need more information first" },
            { letter: "C", text: "I'm just browsing" }
        ]
    },
    {
        id: 6,
        text: "What is your first name?",
        type: "text",
        placeholder: "Type your first name..."
    },
    {
        id: 7,
        text: "What is your email address?",
        type: "email",
        placeholder: "Type your email..."
    },
    {
        id: 8,
        text: "What is your phone number?",
        type: "tel",
        placeholder: "Type your phone number..."
    }
];

let currentQuestion = 0;
let answers = {};

function renderQuestion() {
    const q = questions[currentQuestion];
    const progress = ((currentQuestion) / questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    let html = '<div class="quiz-question">';
    html += `<span class="quiz-question-number">${q.id}</span>`;
    html += `<span class="quiz-question-text">${q.text}</span>`;
    html += '</div>';

    if (q.type === 'choice') {
        html += '<ul class="quiz-options">';
        q.options.forEach((opt) => {
            const selected = answers[q.id] === opt.text ? ' selected' : '';
            html += `<li class="quiz-option${selected}" onclick="selectOption(${q.id}, '${opt.text.replace(/'/g, "\\'")}', this)">`;
            html += `<span class="quiz-option-letter">${opt.letter}</span>`;
            html += `<span>${opt.text}</span>`;
            html += '</li>';
        });
        html += '</ul>';
    } else {
        const inputType = q.type === 'email' ? 'email' : q.type === 'tel' ? 'tel' : 'text';
        const value = answers[q.id] || '';
        html += `<input type="${inputType}" class="quiz-input" id="quizInput" placeholder="${q.placeholder}" value="${value}" onkeypress="if(event.key==='Enter')nextQuestion()">`;
    }

    // Navigation buttons
    html += '<div style="display:flex; gap:10px; margin-top:25px;">';
    if (currentQuestion > 0) {
        html += '<button class="quiz-btn" style="background:#f0f0f0; color:#333;" onclick="prevQuestion()">← Back</button>';
    }
    if (q.type !== 'choice') {
        html += '<button class="quiz-btn" onclick="nextQuestion()">OK ✓</button>';
    }
    html += '</div>';

    document.getElementById('quizContent').innerHTML = html;

    if (q.type !== 'choice') {
        setTimeout(() => {
            const input = document.getElementById('quizInput');
            if (input) input.focus();
        }, 100);
    }
}

function selectOption(questionId, answer, el) {
    answers[questionId] = answer;

    // Visual feedback
    document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');

    // Auto-advance after short delay
    setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            renderQuestion();
        } else {
            submitQuiz();
        }
    }, 400);
}

function nextQuestion() {
    const q = questions[currentQuestion];
    if (q.type !== 'choice') {
        const input = document.getElementById('quizInput');
        if (input && input.value.trim()) {
            answers[q.id] = input.value.trim();
        } else {
            input.style.borderColor = '#ef4444';
            return;
        }
    }

    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        submitQuiz();
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
}

async function submitQuiz() {
    // Prepare data for Telegram with full questions
    const quizData = {
        q1: {
            question: "To confirm, you are filling this out because you want to be part of an exclusive community who shares the most lucrative opportunities within Decentralized Finance?",
            answer: answers[1] || 'N/A'
        },
        q2: {
            question: "How much do you currently have invested in crypto?",
            answer: answers[2] || 'N/A'
        },
        q3: {
            question: "What is your primary goal with crypto investing?",
            answer: answers[3] || 'N/A'
        },
        q4: {
            question: "How would you describe your experience with DeFi (Decentralized Finance)?",
            answer: answers[4] || 'N/A'
        },
        q5: {
            question: "Are you ready to commit time and resources to building real wealth through crypto?",
            answer: answers[5] || 'N/A'
        },
        firstName: answers[6] || 'N/A',
        email: answers[7] || 'N/A',
        phone: answers[8] || 'N/A'
    };

    // Save to localStorage for booking page
    localStorage.setItem('quizAnswers', JSON.stringify(quizData));

    // Format message for Telegram with full questions
    const message = `📝 New Application Form Submission!\n\n` +
        `❓ ${quizData.q1.question}\n✅ ${quizData.q1.answer}\n\n` +
        `❓ ${quizData.q2.question}\n✅ ${quizData.q2.answer}\n\n` +
        `❓ ${quizData.q3.question}\n✅ ${quizData.q3.answer}\n\n` +
        `❓ ${quizData.q4.question}\n✅ ${quizData.q4.answer}\n\n` +
        `❓ ${quizData.q5.question}\n✅ ${quizData.q5.answer}\n\n` +
        `👤 Name: ${quizData.firstName}\n` +
        `📧 Email: ${quizData.email}\n` +
        `📱 Phone: ${quizData.phone}\n\n` +
        `⏰ Submitted: ${new Date().toLocaleString()}`;

    // Send to Telegram
    try {
        await fetch('/api/send-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
    } catch (error) {
        console.error('Failed to send to Telegram:', error);
    }

    // Show success message
    document.getElementById('progressBar').style.width = '100%';
    document.getElementById('quizContent').innerHTML = `
        <div style="text-align:center; padding: 60px 20px;">
            <div style="font-size:48px; margin-bottom:20px;">🎉</div>
            <h2 style="font-size:24px; font-weight:700; margin-bottom:12px; color:#1a1a2e;">Application Submitted!</h2>
            <p style="font-size:16px; color:#555; margin-bottom:30px;">Thank you for applying. Let's book your interview call.</p>
            <a href="booking.html" class="btn-primary" style="display:inline-flex;">
                <span class="btn-text" style="font-size:20px;">BOOK YOUR CALL</span>
            </a>
        </div>
    `;
}

// Initialize
renderQuestion();
