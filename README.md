# Database Setup

## MySQL Database Schema

This folder contains the MySQL database schema and setup instructions.

## Files

- `mysql_schema.sql` - Complete MySQL database schema with tables and initial data
- `mysql_setup_guide.md` - Detailed setup instructions
- `DATABASE_SETUP.md` - Quick setup guide

## Quick Setup

1. **Create Database:**
   ```sql
   mysql -u root -p < database/mysql_schema.sql
   ```

2. **Update Config:**
   Edit `backend/config.py`:
   ```python
   SQLALCHEMY_DATABASE_URI = 'mysql://username:password@localhost:3306/parking_system'
   ```

3. **Install Driver:**
   ```bash
   pip install PyMySQL
   ```

4. **Run Backend:**
   ```bash
   cd backend
   python app.py
   ```

## Database Structure

### Tables

1. **slots** - Parking slot information
   - id (Primary Key)
   - slot_number (Unique, 1-50)
   - status (available/booked)
   - created_at

2. **bookings** - Booking records
   - id (Primary Key)
   - slot_id (Foreign Key)
   - customer_name
   - customer_email
   - customer_phone
   - aadhaar_number (12 digits)
   - booking_date
   - start_time
   - end_time
   - image_path
   - status (active/cancelled)
   - created_at

## How Data Flows

1. User fills form in `index.html`
2. JavaScript validates and submits to backend API
3. Backend (`app.py`) processes and saves to MySQL
4. Data stored in `bookings` table
5. Slot status updated in `slots` table

