# Troubleshooting Guide - Backend Not Running

## Issue: Python Not Found

If you see the error "Python was not found", follow these steps:

### Windows:
1. **Install Python:**
   - Download Python from https://www.python.org/downloads/
   - During installation, **CHECK** the box "Add Python to PATH"
   - Complete the installation

2. **Verify Installation:**
   ```cmd
   python --version
   ```
   Should show: `Python 3.x.x`

3. **Run the Backend:**
   - Option 1: Double-click `backend/run.bat`
   - Option 2: Open Command Prompt in the `backend` folder and run:
     ```cmd
     python app.py
     ```

### Linux/Mac:
1. **Install Python 3:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install python3 python3-pip python3-venv
   
   # Mac (using Homebrew)
   brew install python3
   ```

2. **Run the Backend:**
   ```bash
   cd backend
   chmod +x run.sh
   ./run.sh
   ```

## Manual Setup Steps

If the scripts don't work, follow these manual steps:

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Verify it's running:**
   - Open browser and go to: http://localhost:5000/api/health
   - You should see: `{"success": true, "message": "API is running"}`

## Common Issues

### Issue: Port 5000 already in use
**Solution:** Change the port in `backend/app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Change 5000 to 5001
```

### Issue: Module not found errors
**Solution:** Make sure you're in the backend directory and have activated the virtual environment:
```bash
cd backend
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Issue: Database errors
**Solution:** Delete the database file and restart:
```bash
# Delete the database file
rm database/parking.db  # Linux/Mac
del database\parking.db  # Windows

# Restart the backend
python app.py
```

### Issue: Uploads folder permission errors
**Solution:** The uploads folder should be created automatically. If not:
```bash
mkdir uploads  # Linux/Mac
mkdir uploads  # Windows (in Command Prompt)
```

## Testing the Backend

Once running, test these endpoints:

1. **Health Check:**
   ```
   GET http://localhost:5000/api/health
   ```

2. **Get Slots:**
   ```
   GET http://localhost:5000/api/slots
   ```

3. **Get Bookings:**
   ```
   GET http://localhost:5000/api/bookings
   ```

## Need More Help?

- Check that all dependencies are installed: `pip list`
- Verify Python version: `python --version` (should be 3.7+)
- Check Flask is installed: `pip show flask`
- Review error messages in the terminal for specific issues

