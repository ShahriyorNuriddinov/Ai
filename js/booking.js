// Booking Calendar Logic
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;

const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Available time slots
const timeSlots = [
    '9:00 am', '9:15 am', '9:30 am', '9:45 am',
    '10:00 am', '10:15 am', '10:30 am', '10:45 am',
    '11:00 am', '11:15 am', '11:30 am',
    '2:00 pm', '2:15 pm', '2:30 pm', '2:45 pm',
    '3:00 pm', '3:15 pm', '3:30 pm',
    '9:00 pm', '9:15 pm', '9:30 pm',
    '10:00 pm', '10:15 pm', '10:30 pm', '10:45 pm',
    '11:00 pm', '11:15 pm'
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

    // Randomize available slots slightly for realism
    const availableSlots = timeSlots.filter(() => Math.random() > 0.3);

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
    const phone = document.getElementById('bookingPhone').value.trim();

    if (!name || !email || !phone) {
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
    const message = `🔔 New Booking!\n\n` +
        `👤 Name: ${data.name}\n` +
        `📧 Email: ${data.email}\n` +
        `📱 Phone: ${data.phone}\n` +
        `📅 Date: ${data.date}\n` +
        `⏰ Time: ${data.time}\n` +
        `🌍 Timezone: ${data.timezone}`;

    // Send via backend API (keeps bot token secure)
    await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
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
