from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from database import db, Slot, Booking, init_db
from config import Config
import os
from werkzeug.utils import secure_filename

# For MySQL support (uncomment if using MySQL)
# import pymysql
# pymysql.install_as_MySQLdb()

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes
CORS(app)

# Create uploads directory if it doesn't exist
try:
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
except Exception as e:
    print(f"Warning: Could not create uploads directory: {e}")

# Initialize database
db.init_app(app)

# Initialize database with 50 slots on first run
try:
    init_db(app, num_slots=50)
except Exception as e:
    print(f"Warning: Database initialization error: {e}")
    print("The database will be created when the first request is made.")

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# API Routes

@app.route('/api/slots', methods=['GET'])
def get_slots():
    """Get all parking slots with their availability status"""
    try:
        slots = Slot.query.order_by(Slot.slot_number).all()
        return jsonify({
            'success': True,
            'slots': [slot.to_dict() for slot in slots]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    """Get all bookings with optional filters"""
    try:
        status = request.args.get('status', None)
        email = request.args.get('email', None)
        
        query = Booking.query
        
        if status:
            query = query.filter_by(status=status)
        if email:
            query = query.filter_by(customer_email=email)
        
        bookings = query.order_by(Booking.created_at.desc()).all()
        return jsonify({
            'success': True,
            'bookings': [booking.to_dict() for booking in bookings]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/bookings/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get a specific booking by ID"""
    try:
        booking = Booking.query.get_or_404(booking_id)
        return jsonify({
            'success': True,
            'booking': booking.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    """Create a new booking"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['slot_id', 'customer_name', 'customer_email', 'customer_phone', 'aadhaar_number', 'booking_date', 'start_time', 'end_time']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate Aadhaar number (12 digits)
        aadhaar = data['aadhaar_number'].replace(' ', '').replace('-', '')
        if not aadhaar.isdigit() or len(aadhaar) != 12:
            return jsonify({
                'success': False,
                'error': 'Aadhaar number must be exactly 12 digits'
            }), 400
        
        # Check if slot exists and is available
        slot = Slot.query.get(data['slot_id'])
        if not slot:
            return jsonify({
                'success': False,
                'error': 'Slot not found'
            }), 404
        
        if slot.status == 'booked':
            return jsonify({
                'success': False,
                'error': 'Slot is already booked'
            }), 400
        
        # Parse booking date
        try:
            booking_date = datetime.strptime(data['booking_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }), 400
        
        # Create booking
        booking = Booking(
            slot_id=data['slot_id'],
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            customer_phone=data['customer_phone'],
            aadhaar_number=aadhaar,
            booking_date=booking_date,
            start_time=data['start_time'],
            end_time=data['end_time'],
            image_path=data.get('image_path', None),
            status='active'
        )
        
        # Update slot status
        slot.status = 'booked'
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Booking created successfully',
            'booking': booking.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/bookings/<int:booking_id>/cancel', methods=['PUT'])
def cancel_booking(booking_id):
    """Cancel a booking"""
    try:
        booking = Booking.query.get_or_404(booking_id)
        
        if booking.status == 'cancelled':
            return jsonify({
                'success': False,
                'error': 'Booking is already cancelled'
            }), 400
        
        # Update booking status
        booking.status = 'cancelled'
        
        # Update slot status to available
        slot = Slot.query.get(booking.slot_id)
        if slot:
            slot.status = 'available'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Booking cancelled successfully',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/bookings/auto-allocate', methods=['POST'])
def auto_allocate_slot():
    """Automatically allocate a slot based on uploaded image"""
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No image file selected'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP'
            }), 400
        
        # Get form data
        data = request.form
        
        # Validate required fields
        required_fields = ['customer_name', 'customer_email', 'customer_phone', 'aadhaar_number', 'booking_date', 'start_time', 'end_time']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate Aadhaar number (12 digits)
        aadhaar = data['aadhaar_number'].replace(' ', '').replace('-', '')
        if not aadhaar.isdigit() or len(aadhaar) != 12:
            return jsonify({
                'success': False,
                'error': 'Aadhaar number must be exactly 12 digits'
            }), 400
        
        # Find first available slot
        available_slot = Slot.query.filter_by(status='available').order_by(Slot.slot_number).first()
        
        if not available_slot:
            return jsonify({
                'success': False,
                'error': 'No available slots at the moment'
            }), 400
        
        # Save uploaded image
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Store relative path for database
        image_path = f"uploads/{unique_filename}"
        
        # Parse booking date
        try:
            booking_date = datetime.strptime(data['booking_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }), 400
        
        # Create booking with auto-allocated slot
        booking = Booking(
            slot_id=available_slot.id,
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            customer_phone=data['customer_phone'],
            aadhaar_number=aadhaar,
            booking_date=booking_date,
            start_time=data['start_time'],
            end_time=data['end_time'],
            image_path=image_path,
            status='active'
        )
        
        # Update slot status
        available_slot.status = 'booked'
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Slot #{available_slot.slot_number} allocated automatically based on your image',
            'booking': booking.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'API is running'
    }), 200

if __name__ == '__main__':
    print("=" * 50)
    print("Starting Smart Parking Slot Booking System Backend")
    print("=" * 50)
    print(f"Server running on: http://localhost:5000")
    print(f"API Health Check: http://localhost:5000/api/health")
    print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print("=" * 50)
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    try:
        port = int(os.environ.get("PORT", 5000))
        app.run(host="0.0.0.0", port=port)
    except Exception as e:
        print(f"Error starting server: {e}")
        print("Please check:")
        print("1. Python dependencies are installed (pip install -r requirements.txt)")
        print("2. Database connection is correct")
        print("3. Port 5000 is not already in use")


