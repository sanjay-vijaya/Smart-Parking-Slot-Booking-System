
# Database Setup Instructions

## Quick Start - MySQL Database

### Step 1: Create MySQL Database

1. Open MySQL Command Line or MySQL Workbench
2. Run the SQL script:
   ```sql
   source database/mysql_schema.sql
   ```
   Or copy the contents of `database/mysql_schema.sql` and execute it

### Step 2: Update Backend Configuration

Edit `backend/config.py` and change:

```python
# From:
SQLALCHEMY_DATABASE_URI = 'sqlite:///../database/parking.db'

# To:
SQLALCHEMY_DATABASE_URI = 'mysql://root:yourpassword@localhost:3306/parking_system'
```

Replace:
- `root` with your MySQL username
- `yourpassword` with your MySQL password
- `parking_system` with your database name (if different)

### Step 3: Install MySQL Driver

```bash
cd backend
pip install PyMySQL
```

### Step 4: Update app.py (Add at the top)

Add this import at the beginning of `backend/app.py`:

```python
import pymysql
pymysql.install_as_MySQLdb()
```

### Step 5: Run the Backend

```bash
python app.py
```

## Database Tables Created

### 1. `slots` Table
- Stores parking slot information
- Fields: id, slot_number, status, created_at
- Initial data: 50 slots (numbered 1-50)

### 2. `bookings` Table
- Stores booking information
- Fields: id, slot_id, customer_name, customer_email, customer_phone, aadhaar_number, booking_date, start_time, end_time, image_path, status, created_at
- Foreign key: slot_id references slots(id)

## How Data is Stored

When a user submits the booking form:

1. **Frontend (index.html)**:
   - Form collects: name, email, phone, aadhaar, date, times, image (optional)
   - JavaScript validates all fields
   - Submits to backend API

2. **Backend (app.py)**:
   - Receives form data
   - Validates Aadhaar (12 digits)
   - Checks slot availability
   - Saves image (if provided)
   - Creates booking record in database
   - Updates slot status to 'booked'

3. **Database**:
   - New row inserted into `bookings` table
   - `slots` table updated (status changed to 'booked')

## Viewing Data

### Using MySQL Command Line:
```sql
USE parking_system;
SELECT * FROM slots;
SELECT * FROM bookings;
```

### Using MySQL Workbench:
- Connect to database
- Browse data in `slots` and `bookings` tables

## Troubleshooting

**Error: Access denied**
- Check MySQL username and password
- Verify user has privileges on the database

**Error: Table doesn't exist**
- Run the `mysql_schema.sql` script again

**Error: Can't connect**
- Make sure MySQL service is running
- Check if port 3306 is correct

