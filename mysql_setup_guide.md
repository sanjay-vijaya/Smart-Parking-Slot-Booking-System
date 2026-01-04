# MySQL Database Setup Guide

## Step 1: Install MySQL

If you don't have MySQL installed:
- **Windows**: Download from https://dev.mysql.com/downloads/installer/
- **Linux**: `sudo apt-get install mysql-server` (Ubuntu/Debian)
- **Mac**: `brew install mysql` (using Homebrew)

## Step 2: Create Database and Tables

### Option A: Using MySQL Command Line

1. Open MySQL command line or MySQL Workbench
2. Login to MySQL:
   ```bash
   mysql -u root -p
   ```
3. Run the SQL script:
   ```sql
   source database/mysql_schema.sql
   ```
   Or copy and paste the contents of `mysql_schema.sql` into MySQL

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Open SQL Script → Select `database/mysql_schema.sql`
4. Click the Execute button (⚡)

### Option C: Using phpMyAdmin

1. Open phpMyAdmin in your browser
2. Go to SQL tab
3. Copy and paste the contents of `mysql_schema.sql`
4. Click Go

## Step 3: Update Backend Configuration

Edit `backend/config.py` and update the database connection:

```python
SQLALCHEMY_DATABASE_URI = 'mysql://username:password@localhost:3306/parking_system'
```

Or set environment variable:
```bash
export DATABASE_URL=mysql://username:password@localhost:3306/parking_system
```

## Step 4: Install MySQL Python Driver

Install the MySQL connector for Python:

```bash
pip install pymysql
```

Or using mysqlclient:
```bash
pip install mysqlclient
```

## Step 5: Update requirements.txt

Add to `backend/requirements.txt`:
```
PyMySQL==1.1.0
```

## Step 6: Update database.py (if needed)

If using PyMySQL, update `backend/app.py` or create a connection file:

```python
import pymysql
pymysql.install_as_MySQLdb()
```

## Connection String Format

```
mysql://username:password@host:port/database_name
```

Example:
```
mysql://root:mypassword@localhost:3306/parking_system
```

## Verify Database Connection

After setup, test the connection by running:
```bash
cd backend
python app.py
```

You should see: "Created 50 parking slots" if connection is successful.

## Troubleshooting

### Error: Access denied
- Check username and password
- Verify user has privileges: `GRANT ALL PRIVILEGES ON parking_system.* TO 'username'@'localhost';`

### Error: Can't connect to MySQL server
- Make sure MySQL service is running
- Check if MySQL is running on default port 3306
- Verify firewall settings

### Error: Unknown database
- Make sure you ran the SQL script to create the database
- Verify database name in connection string matches

