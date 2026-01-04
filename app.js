// API Configuration
const API_BASE_URL = "http://localhost:5000/api";



// API Helper Functions
const api = {
    // Get all slots
    async getSlots() {
        try {
            const response = await fetch(`${API_BASE_URL}/slots`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching slots:', error);
            throw error;
        }
    },

    // Get all bookings
    async getBookings(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.email) params.append('email', filters.email);
            if (filters.phone) params.append('phone', filters.phone);
            
            const url = `${API_BASE_URL}/bookings${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },


    // Get a specific booking
    async getBooking(bookingId) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    },

    // Create a new booking
    async createBooking(bookingData) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    // Cancel a booking
    async cancelBooking(bookingId) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    },


};

// Utility function to show messages
function showMessage(message, type = 'success') {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Utility function to format time
function formatTime(timeString) {
    // timeString is in HH:MM format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

