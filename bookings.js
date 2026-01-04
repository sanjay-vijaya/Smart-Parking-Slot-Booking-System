// JavaScript for bookings.html (My Bookings Page)

let allBookings = [];
let filteredBookings = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadBookings();
    setupFilters();
});

// Load all bookings from API
async function loadBookings(filters = {}) {
    try {
        const loadingEl = document.getElementById('loading');
        const bookingsListEl = document.getElementById('bookings-list');
        const noBookingsEl = document.getElementById('no-bookings');
        const activeFiltersEl = document.getElementById('active-filters');
        
        loadingEl.style.display = 'block';
        bookingsListEl.innerHTML = '';
        noBookingsEl.style.display = 'none';
        if (activeFiltersEl) activeFiltersEl.innerHTML = '';
        
        const response = await api.getBookings(filters);
        
        if (response.success) {
            // Use server results but apply client-side narrowing as a fallback
            let bookings = response.bookings || [];

            // If user provided an email, filter client-side by case-insensitive contains
            if (filters.email) {
                const q = filters.email.toLowerCase();
                bookings = bookings.filter(b => (b.customer_email || '').toLowerCase().includes(q));
            }

            // If user provided a phone number, normalize digits and match by includes
            if (filters.phone) {
                const normalize = s => (s || '').toString().replace(/\D/g, '');
                const q = normalize(filters.phone);
                bookings = bookings.filter(b => normalize(b.customer_phone).includes(q));
            }

            allBookings = bookings;
            filteredBookings = allBookings;
            displayBookings(filteredBookings);

            // Render active filter tags
            renderActiveFilters(filters);

            // If filters were used and exactly 1 result is found, show details modal
            if ((filters.email || filters.phone) && filteredBookings.length === 1) {
                openBookingDetailModal(filteredBookings[0]);
            }
        } else {
            showMessage('Failed to load bookings: ' + response.error, 'error');
            loadingEl.style.display = 'none';
        }
    } catch (error) {
        showMessage('Error connecting to server. Please make sure the backend is running.', 'error');
        const loadingEl = document.getElementById('loading');
        loadingEl.style.display = 'none';
    }
}

// Display bookings in list
function displayBookings(bookings) {
    const loadingEl = document.getElementById('loading');
    const bookingsListEl = document.getElementById('bookings-list');
    const noBookingsEl = document.getElementById('no-bookings');
    
    loadingEl.style.display = 'none';
    
    if (bookings.length === 0) {
        bookingsListEl.innerHTML = '';
        noBookingsEl.style.display = 'block';
        return;
    }
    
    noBookingsEl.style.display = 'none';
    bookingsListEl.innerHTML = '';
    
    bookings.forEach(booking => {
        const bookingCard = document.createElement('div');
        bookingCard.className = `booking-card ${booking.status}`;
        
        const statusClass = booking.status === 'active' ? 'active' : 'cancelled';
        
        bookingCard.innerHTML = `
            <div class="booking-header">
                <div class="booking-slot">Slot #${booking.slot_number}</div>
                <span class="booking-status ${statusClass}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <div class="booking-detail">
                    <label>Customer Name</label>
                    <span>${escapeHtml(booking.customer_name)}</span>
                </div>
                <div class="booking-detail">
                    <label>Email</label>
                    <span>${escapeHtml(booking.customer_email)}</span>
                </div>
                <div class="booking-detail">
                    <label>Phone Number</label>
                    <span>${escapeHtml(booking.customer_phone || 'N/A')}</span>
                </div>
                <div class="booking-detail">
                    <label>Aadhaar Number</label>
                    <span>${escapeHtml(booking.aadhaar_number || 'N/A')}</span>
                </div>
                <div class="booking-detail">
                    <label>Booking Date</label>
                    <span>${formatDate(booking.booking_date)}</span>
                </div>
                <div class="booking-detail">
                    <label>Time</label>
                    <span>${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}</span>
                </div>
                <div class="booking-detail">
                    <label>Booked On</label>
                    <span>${formatDate(booking.created_at)}</span>
                </div>
                ${booking.image_path ? `
                <div class="booking-detail">
                    <label>Slot Image</label>
                    <span style="color: #3498db; cursor: pointer; font-weight: 600;" onclick="window.open('/${escapeHtml(booking.image_path)}', '_blank')">View Image</span>
                </div>
                ` : ''}
            </div>
            ${booking.status === 'active' ? `
                <div class="booking-actions">
                    <button class="btn btn-danger" onclick="cancelBooking(${booking.id})">Cancel Booking</button>
                </div>
            ` : ''}
        `;
        
        bookingsListEl.appendChild(bookingCard);
    });
}

// Setup filter functionality
function setupFilters() {
    const filterBtn = document.getElementById('filter-btn');
    const clearFilterBtn = document.getElementById('clear-filter');
    const emailInput = document.getElementById('filter-email');
    const phoneInput = document.getElementById('filter-phone');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const phone = phoneInput ? phoneInput.value.trim() : '';
            if (email || phone) {
                const filters = {};
                if (email) filters.email = email;
                if (phone) filters.phone = phone;
                loadBookings(filters);
            } else {
                showMessage('Please enter an email address or phone number to filter', 'error');
            }
        });
    }
    
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            emailInput.value = '';
            if (phoneInput) phoneInput.value = '';
            loadBookings();
        });
    }
    
    // Allow Enter key to trigger filter
    [emailInput, phoneInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    filterBtn.click();
                }
            });
        }
    });
}

// Render active filter tags and provide removal handlers
function renderActiveFilters(filters = {}) {
    const el = document.getElementById('active-filters');
    if (!el) return;
    el.innerHTML = '';

    const makeTag = (label, key) => {
        const span = document.createElement('span');
        span.className = 'filter-tag';
        span.innerHTML = `${label} <span class="remove" aria-label="Remove filter" title="Remove">×</span>`;
        span.querySelector('.remove').addEventListener('click', () => {
            const newFilters = { ...filters };
            delete newFilters[key];
            loadBookings(newFilters);
        });
        return span;
    };

    if (filters.email) el.appendChild(makeTag(`Email: ${filters.email}`, 'email'));
    if (filters.phone) el.appendChild(makeTag(`Phone: ${filters.phone}`, 'phone'));
}

// Show a modal with booking details when exactly one booking is found
function openBookingDetailModal(booking) {
    // Remove existing detail modal if present
    const existing = document.getElementById('booking-detail-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'booking-detail-modal';
    modal.className = 'modal';
    modal.style.display = 'block';

    const content = document.createElement('div');
    content.className = 'modal-content';

    content.innerHTML = `
        <span class="close" aria-label="Close">&times;</span>
        <h2>Booking Details</h2>
        <div style="display:grid; gap:10px;">
            <div><strong>Slot:</strong> #${booking.slot_number}</div>
            <div><strong>Name:</strong> ${escapeHtml(booking.customer_name)}</div>
            <div><strong>Email:</strong> ${escapeHtml(booking.customer_email)}</div>
            <div><strong>Phone:</strong> ${escapeHtml(booking.customer_phone || 'N/A')}</div>
            <div><strong>Aadhaar:</strong> ${escapeHtml(booking.aadhaar_number || 'N/A')}</div>
            <div><strong>Date:</strong> ${formatDate(booking.booking_date)}</div>
            <div><strong>Time:</strong> ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}</div>
            <div><strong>Booked On:</strong> ${formatDate(booking.created_at)}</div>
        </div>
        <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-secondary" id="close-detail">Close</button>
            ${booking.status === 'active' ? `<button class="btn btn-danger" id="cancel-from-detail">Cancel Booking</button>` : ''}
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close handlers
    content.querySelector('.close').addEventListener('click', () => modal.remove());
    document.getElementById('close-detail').addEventListener('click', () => modal.remove());
    if (booking.status === 'active') {
        document.getElementById('cancel-from-detail').addEventListener('click', async () => {
            await cancelBooking(booking.id);
            modal.remove();
        });
    }

    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Cancel a booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const response = await api.cancelBooking(bookingId);
        
        if (response.success) {
            showMessage('Booking cancelled successfully', 'success');
            // Reload bookings
            setTimeout(() => {
                loadBookings();
            }, 1000);
        } else {
            showMessage('Failed to cancel booking: ' + response.error, 'error');
        }
    } catch (error) {
        showMessage('Error cancelling booking. Please try again.', 'error');
    }
}

// Utility function to escape HTML (prevent XSS)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

