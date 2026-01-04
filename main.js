// Main JavaScript for index.html (Booking Page)

let slots = [];
let autoRefreshInterval = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadSlots();
    setupModal();
    setupBookingForm();
    setupAutoRefresh();
    setupRefreshButton();
    setupAutoBookButton();
    setupThemeControls();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('booking-date').setAttribute('min', today);
});

// Load all slots from API
async function loadSlots() {
    try {
        const container = document.getElementById('slots-container');
        container.innerHTML = '<div class="loading">Loading slots...</div>';
        
        const response = await api.getSlots();
        
        if (response.success) {
            slots = response.slots;
            displaySlots(slots);
        } else {
            showMessage('Failed to load slots: ' + response.error, 'error');
            container.innerHTML = '<p>Error loading slots. Please refresh the page.</p>';
        }
    } catch (error) {
        showMessage('Error connecting to server. Please make sure the backend is running.', 'error');
        const container = document.getElementById('slots-container');
        container.innerHTML = '<p>Error connecting to server. Please make sure the backend is running.</p>';
    }
}

// Display slots in grid
function displaySlots(slots) {
    const container = document.getElementById('slots-container');
    container.innerHTML = '';
    
    slots.forEach(slot => {
        const slotElement = document.createElement('div');
        slotElement.className = `slot ${slot.status}`;
        slotElement.dataset.slotId = slot.id;
        slotElement.dataset.slotNumber = slot.slot_number;
        
        slotElement.innerHTML = `
            <div class="slot-number">${slot.slot_number}</div>
            <div class="slot-status">${slot.status}</div>
        `;
        
        // Add click event for available slots
        if (slot.status === 'available') {
            slotElement.addEventListener('click', () => {
                const modal = document.getElementById('booking-modal');
                // If modal is open, just set the slot without resetting the form
                if (modal && modal.style.display === 'block') {
                    const slotIdInput = document.getElementById('slot-id');
                    const slotNumberSpan = document.getElementById('selected-slot-number');
                    const submitBtn = document.getElementById('submit-booking-btn');
                    const formStatus = document.getElementById('form-status');

                    // Remove previous selection highlight
                    document.querySelectorAll('.slot.selected').forEach(el => el.classList.remove('selected'));

                    // Set selected slot
                    slotIdInput.value = slot.id;
                    slotNumberSpan.textContent = `#${slot.slot_number}`;
                    if (submitBtn) submitBtn.disabled = false;

                    // Clear any form status message
                    if (formStatus) formStatus.style.display = 'none';

                    // Highlight the clicked slot
                    slotElement.classList.add('selected');
                } else {
                    // Modal is not open — open it with selected slot (this will reset form)
                    openBookingModal(slot);
                }
            });
        }
        
        container.appendChild(slotElement);
    });
}

// Setup modal functionality
function setupModal() {
    const modal = document.getElementById('booking-modal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-booking');
    
    // Close modal when clicking X
    if (closeBtn) {
        closeBtn.addEventListener('click', closeBookingModal);
    }
    
    // Close modal when clicking Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeBookingModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeBookingModal();
        }
    });
}

// Open booking modal
function openBookingModal(slot) {
    const modal = document.getElementById('booking-modal');
    const slotIdInput = document.getElementById('slot-id');
    const slotNumberSpan = document.getElementById('selected-slot-number');
    const submitBtn = document.getElementById('submit-booking-btn');
    const formStatus = document.getElementById('form-status');

    // Reset form first (so hidden inputs and values are clean)
    document.getElementById('booking-form').reset();

    if (slot) {
        slotIdInput.value = slot.id;
        slotNumberSpan.textContent = `#${slot.slot_number}`;
        if (submitBtn) submitBtn.disabled = false;
        if (formStatus) formStatus.style.display = 'none';
    } else {
        slotIdInput.value = '';
        slotNumberSpan.textContent = '';
        // No manual slot selection: allow submission — no informational message shown
        if (submitBtn) submitBtn.disabled = false;
        if (formStatus) {
            formStatus.style.display = 'none';
        }
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('booking-date').setAttribute('min', today);

    modal.style.display = 'block';
}

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    modal.style.display = 'none';
    document.getElementById('booking-form').reset();
}

// Setup booking form submission
function setupBookingForm() {
    const form = document.getElementById('booking-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const customerName = document.getElementById('customer-name').value.trim();
        const customerEmail = document.getElementById('customer-email').value.trim();
        const customerPhone = document.getElementById('customer-phone').value.trim();
        const vehicleNumber = document.getElementById("vehicle-number").value.trim();
        const aadhaarNumber = document.getElementById('aadhaar-number').value.trim().replace(/\s+/g, '').replace(/-/g, '');
        const bookingDate = document.getElementById('booking-date').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const slotIdValue = document.getElementById('slot-id').value;
        const slotId = slotIdValue ? parseInt(slotIdValue, 10) : null;
        

        // Validate time
        if (startTime >= endTime) {
            showMessage('End time must be after start time', 'error');
            return;
        }
        
        // Proceed without a selected slot; backend will allocate a slot if slotId is null

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Validate phone number
        if (!customerPhone || customerPhone.length < 10) {
            showMessage('Please enter a valid phone number', 'error');
            return;
        }
        
        // Validate Aadhaar number (12 digits)
        if (!/^\d{12}$/.test(aadhaarNumber)) {
            showMessage('Aadhaar number must be exactly 12 digits', 'error');
            return;
        }
        
        // Submit booking
        try {
            const submitBtn = document.getElementById('submit-booking-btn') || form.querySelector('button[type="submit"]');
            const formStatus = document.getElementById('form-status');
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Processing...';
            submitBtn.style.opacity = '0.7';
            
            if (formStatus) {
                formStatus.style.display = 'block';
                formStatus.style.background = '#fff3cd';
                formStatus.style.color = '#856404';
                formStatus.textContent = 'Submitting your booking...';
            }
            
            let response;
            
            // Regular booking with selected slot
            const formData = {
                slot_id: slotId,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                vehicle_number: vehicleNumber,
                aadhaar_number: aadhaarNumber,
                booking_date: bookingDate,
                start_time: startTime,
                end_time: endTime
            };
            
            response = await api.createBooking(formData);
            
            if (response.success) {
                // Show success
                if (formStatus) {
                    formStatus.style.background = '#d4edda';
                    formStatus.style.color = '#155724';
                    formStatus.textContent = '✅ ' + (response.message || 'Booking confirmed successfully!');
                }
                showMessage(response.message || 'Booking confirmed successfully!', 'success');
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    closeBookingModal();
                    // Reload slots to update availability
                    loadSlots();
                }, 2000);
            } else {
                // Show error
                if (formStatus) {
                    formStatus.style.background = '#f8d7da';
                    formStatus.style.color = '#721c24';
                    formStatus.textContent = '❌ ' + response.error;
                }
                showMessage('Booking failed: ' + response.error, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Booking';
                submitBtn.style.opacity = '1';
            }
        } catch (error) {
            const formStatus = document.getElementById('form-status');
            if (formStatus) {
                formStatus.style.background = '#f8d7da';
                formStatus.style.color = '#721c24';
                formStatus.textContent = '❌ Error: ' + error.message;
            }
            showMessage('Error creating booking. Please try again.', 'error');
            const submitBtn = document.getElementById('submit-booking-btn') || form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Booking';
            submitBtn.style.opacity = '1';
        }
    });
}

// Setup auto-refresh for real-time slot updates
function setupAutoRefresh() {
    // Auto-refresh every 30 seconds
    autoRefreshInterval = setInterval(() => {
        loadSlots();
    }, 30000); // 30 seconds
}

// Setup manual refresh button
function setupRefreshButton() {
    // Check if refresh button exists (it will be added to HTML)
    const refreshBtn = document.getElementById('refresh-slots');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadSlots();
            showMessage('Slots refreshed', 'success');
        });
    }
}

// Setup auto-book button
function setupAutoBookButton() {
    const autoBookBtn = document.getElementById('auto-book-btn');
    if (autoBookBtn) {
        autoBookBtn.addEventListener('click', () => {
            openBookingModal(null); // Open modal without slot selection
            const slotNumberSpan = document.getElementById('selected-slot-number');
            if (slotNumberSpan) slotNumberSpan.textContent = '';
        });
    }
}

// Slot picker removed: manual slot selection is not available in automatic allocation mode
// The application will allocate a slot automatically on booking when none is selected.



// Theme controls: simplified to Light/Dark only
function setupThemeControls() {
    const select = document.getElementById('theme-select');
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (select) select.value = savedTheme;

    applyTheme(savedTheme);

    select && select.addEventListener('change', (e) => {
        const value = e.target.value;
        applyTheme(value);
        localStorage.setItem('theme', value);
    });
}

function applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    if (theme === 'dark') {
        document.body.classList.add('theme-dark');
    } else {
        document.body.classList.add('theme-light');
    }
} 

// Clean up interval when page is unloaded
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});
