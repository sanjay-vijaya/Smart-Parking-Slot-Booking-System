# Smart Parking Slot Booking System

A full-stack parking slot booking system with a modern web interface, RESTful API backend, and SQL database.

## Features

- **Linear Slot Numbering**: Slots are numbered from 1 to N in a sequential manner
- **Real-time Slot Availability**: View all parking slots with their current status (available/booked)
- **Booking Management**: Book slots with customer details, date, and time
- **Booking History**: View and filter bookings by email
- **Booking Cancellation**: Cancel active bookings
- **Auto-refresh**: Slots automatically refresh every 30 seconds
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Backend**: Python with Flask
- **Database**: SQLite (can be migrated to MySQL/PostgreSQL)

## Project Structure

```
project/
├── backend/
│   ├── app.py              # Flask application with API endpoints
│   ├── database.py         # Database models and initialization
│   ├── config.py           # Configuration settings
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # Main booking page
│   ├── bookings.html       # Bookings management page
│   ├── css/
│   │   └── style.css       # Styling
│   └── js/
│       ├── api.js          # API helper functions
│       ├── main.js         # Main booking page logic
│       └── bookings.js     # Bookings page logic
├── database/
│   └── parking.db          # SQLite database (created automatically)
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- A web browser

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask application:
   ```bash
   python app.py
   ```

   The backend will start on `http://localhost:5000`

   Note: The database will be automatically created with 50 parking slots (numbered 1-50) on first run.

### Frontend Setup

1. Open the `frontend/index.html` file in a web browser, or

2. Use a local web server (recommended):
   ```bash
   # Using Python's built-in server
   cd frontend
   python -m http.server 8000
   ```
   
   Then open `http://localhost:8000` in your browser

   Or use any other local web server like Live Server in VS Code.

## API Endpoints

- `GET /api/slots` - Get all parking slots
- `GET /api/bookings` - Get all bookings (optional filters: `?status=active&email=user@example.com`)
- `GET /api/bookings/<id>` - Get a specific booking
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/<id>/cancel` - Cancel a booking
- `GET /api/health` - Health check endpoint

## Usage

1. **View Available Slots**: Open the main page to see all parking slots with their availability status
2. **Book a Slot**: Click on an available (green) slot to open the booking form
3. **Fill Booking Details**: Enter your name, email, booking date, start time, and end time
4. **Confirm Booking**: Submit the form to confirm your booking
5. **View Bookings**: Navigate to "My Bookings" to see all your bookings
6. **Filter Bookings**: Use the email filter to find bookings by email address
7. **Cancel Booking**: Click "Cancel Booking" on any active booking to cancel it

## Database Schema

### Slots Table
- `id` (Primary Key)
- `slot_number` (Unique, Integer, 1-N)
- `status` (String: 'available' or 'booked')
- `created_at` (DateTime)

### Bookings Table
- `id` (Primary Key)
- `slot_id` (Foreign Key to slots)
- `customer_name` (String)
- `customer_email` (String)
- `booking_date` (Date)
- `start_time` (String, HH:MM format)
- `end_time` (String, HH:MM format)
- `status` (String: 'active' or 'cancelled')
- `created_at` (DateTime)

## Configuration

To change the number of parking slots, modify the `num_slots` parameter in `backend/app.py`:

```python
init_db(app, num_slots=50)  # Change 50 to your desired number
```

To use a different database (MySQL/PostgreSQL), update `backend/config.py`:

```python
SQLALCHEMY_DATABASE_URI = 'mysql://user:password@localhost/parking_db'
# or
SQLALCHEMY_DATABASE_URI = 'postgresql://user:password@localhost/parking_db'
```

## Troubleshooting

- **Backend not connecting**: Make sure Flask is running on port 5000
- **CORS errors**: The backend has CORS enabled, but ensure the frontend is accessing the correct API URL
- **Database errors**: Delete `database/parking.db` and restart the backend to recreate the database
- **Slots not showing**: Check browser console for JavaScript errors and ensure the backend is running

## License

This project is open source and available for educational purposes.

