// Booking Calendar Logic
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;

const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Available time slots (9am to 11pm, 15-minute intervals)
const timeSlots = [
    '9:00 am', '9:15 am', '9:30 am', '9:45 am',
    '10:00 am', '10:15 am', '10:30 am', '10:45 am',
    '11:00 am', '11:15 am', '11:30 am', '11:45 am',
    '12:00 pm', '12:15 pm', '12:30 pm', '12:45 pm',
    '1:00 pm', '1:15 pm', '1:30 pm', '1:45 pm',
    '2:00 pm', '2:15 pm', '2:30 pm', '2:45 pm',
    '3:00 pm', '3:15 pm', '3:30 pm', '3:45 pm',
    '4:00 pm', '4:15 pm', '4:30 pm', '4:45 pm',
    '5:00 pm', '5:15 pm', '5:30 pm', '5:45 pm',
    '6:00 pm', '6:15 pm', '6:30 pm', '6:45 pm',
    '7:00 pm', '7:15 pm', '7:30 pm', '7:45 pm',
    '8:00 pm', '8:15 pm', '8:30 pm', '8:45 pm',
    '9:00 pm', '9:15 pm', '9:30 pm', '9:45 pm',
    '10:00 pm', '10:15 pm', '10:30 pm', '10:45 pm',
    '11:00 pm'
];

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('calendarMonth').textContent = `${months[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '';

    // Day headers
    days.forEach(d => {
        html += `<div class="calendar-day-header">${d}</div>`;
    });

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day disabled"></div>';
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const isPast = date < today;
        const isWeekend = date.getDay() === 0; // Only Sunday disabled
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

        let classes = 'calendar-day';
        if (isPast || isWeekend) classes += ' disabled';
        if (isSelected) classes += ' selected';

        if (isPast || isWeekend) {
            html += `<div class="${classes}">${d}</div>`;
        } else {
            html += `<div class="${classes}" onclick="selectDate(${year}, ${month}, ${d})">${d}</div>`;
        }
    }

    document.getElementById('calendarGrid').innerHTML = html;
}

function changeMonth(dir) {
    currentDate.setMonth(currentDate.getMonth() + dir);
    renderCalendar();
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    renderCalendar();
    renderTimeSlots();

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('selectedDateText').textContent = selectedDate.toLocaleDateString('en-US', options);
}

function renderTimeSlots() {
    if (!selectedDate) {
        document.getElementById('timeSlots').innerHTML = '<p style="color:#666; font-size:14px;">Select a date to see available times</p>';
        return;
    }

    // Seeded random based on date to make 20% slots unavailable consistently per day
    const seed = selectedDate.getFullYear() * 10000 + selectedDate.getMonth() * 100 + selectedDate.getDate();

    function seededRandom(s) {
        const x = Math.sin(s++) * 10000;
        return x - Math.floor(x);
    }

    // Filter out 20% of slots (make them unavailable)
    const totalSlots = timeSlots.length;
    const unavailableCount = Math.floor(totalSlots * 0.2); // 20% unavailable
    const unavailableIndices = new Set();

    let currentSeed = seed;
    while (unavailableIndices.size < unavailableCount) {
        const randomIndex = Math.floor(seededRandom(currentSeed) * totalSlots);
        unavailableIndices.add(randomIndex);
        currentSeed++;
    }

    // Filter available slots (80% available)
    const availableSlots = timeSlots.filter((slot, index) => !unavailableIndices.has(index));

    let html = '';
    availableSlots.forEach(time => {
        const selected = selectedTime === time ? ' selected' : '';
        html += `<div class="time-slot${selected}" onclick="selectTime('${time}', this)">${time}</div>`;
    });

    document.getElementById('timeSlots').innerHTML = html;
}

function selectTime(time, el) {
    selectedTime = time;

    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');

    // Show booking form
    document.getElementById('bookingForm').classList.add('active');
}

async function submitBooking() {
    const name = document.getElementById('bookingName').value.trim();
    const email = document.getElementById('bookingEmail').value.trim();
    const phoneNumber = document.getElementById('bookingPhone').value.trim();
    const countryCode = document.getElementById('countryCodeHidden').value;

    // Combine country code with phone number
    const phone = countryCode + ' ' + phoneNumber;

    if (!name || !email || !phoneNumber) {
        alert('Please fill in all fields');
        return;
    }

    const bookingData = {
        name: name,
        email: email,
        phone: phone,
        date: selectedDate ? selectedDate.toLocaleDateString('en-US') : '',
        time: selectedTime,
        timezone: document.getElementById('timezoneSelect').value
    };

    // Send to Telegram
    try {
        await sendToTelegram(bookingData);
    } catch (e) {
        console.log('TG notification skipped');
    }

    // Redirect to thank you page
    window.location.href = 'thankyou.html';
}

async function sendToTelegram(data) {
    // Get quiz answers from localStorage
    const quizAnswers = localStorage.getItem('quizAnswers');
    let quizSection = '';

    if (quizAnswers) {
        const quiz = JSON.parse(quizAnswers);
        quizSection = `\n\n📋 APPLICATION ANSWERS:\n\n` +
            `❓ ${quiz.q1.question}\n✅ ${quiz.q1.answer}\n\n` +
            `❓ ${quiz.q2.question}\n✅ ${quiz.q2.answer}\n\n` +
            `❓ ${quiz.q3.question}\n✅ ${quiz.q3.answer}\n\n` +
            `❓ ${quiz.q4.question}\n✅ ${quiz.q4.answer}\n\n` +
            `❓ ${quiz.q5.question}\n✅ ${quiz.q5.answer}\n`;
    }

    const message = `🔔 New Booking!\n\n` +
        `👤 Name: ${data.name}\n` +
        `📧 Email: ${data.email}\n` +
        `📱 Phone: ${data.phone}\n` +
        `📅 Date: ${data.date}\n` +
        `⏰ Time: ${data.time}\n` +
        `🌍 Timezone: ${data.timezone}` +
        quizSection;

    // Send via backend API (keeps bot token secure)
    console.log('Sending booking data to Telegram...');
    const response = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    const result = await response.json();
    console.log('Telegram response:', result);
}

// Initialize
renderCalendar();

// Set default date to today + 1
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
if (tomorrow.getDay() !== 0) {
    selectDate(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
}

document.getElementById('timeSlots').innerHTML = '<p style="color:#666; font-size:14px; text-align:center;">Select a date to see available times</p>';
