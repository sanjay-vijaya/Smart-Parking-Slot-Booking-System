from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Slot(db.Model):
    __tablename__ = 'slots'
    
    id = db.Column(db.Integer, primary_key=True)
    slot_number = db.Column(db.Integer, unique=True, nullable=False)
    status = db.Column(db.String(20), default='available', nullable=False)  # available, booked
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with bookings
    bookings = db.relationship('Booking', backref='slot', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'slot_number': self.slot_number,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    slot_id = db.Column(db.Integer, db.ForeignKey('slots.id'), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    vehicle_number = db.Column(db.String(20), nullable=True)
    aadhaar_number = db.Column(db.String(12), nullable=False)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.String(10), nullable=False)  # Format: HH:MM
    end_time = db.Column(db.String(10), nullable=False)  # Format: HH:MM
    image_path = db.Column(db.String(255), nullable=True)  # Path to uploaded slot image
    status = db.Column(db.String(20), default='active', nullable=False)  # active, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'slot_id': self.slot_id,
            'slot_number': self.slot.slot_number if self.slot else None,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'vehicle_number': self.vehicle_number,
            'aadhaar_number': self.aadhaar_number,
            'booking_date': self.booking_date.isoformat() if self.booking_date else None,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'image_path': self.image_path,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

def init_db(app, num_slots=50):
    """Initialize database with slots numbered 1 to num_slots"""
    with app.app_context():
        db.create_all()
        
        # Check how many slots already exist
        existing_slots = Slot.query.count()
        if existing_slots == 0:
            # Create slots numbered from 1 to num_slots
            for i in range(1, num_slots + 1):
                slot = Slot(slot_number=i, status='available')
                db.session.add(slot)
            db.session.commit()
            print(f"Created {num_slots} parking slots")
        elif existing_slots < num_slots:
            # Add missing slots up to num_slots
            for i in range(existing_slots + 1, num_slots + 1):
                slot = Slot(slot_number=i, status='available')
                db.session.add(slot)
            db.session.commit()
            print(f"Added {num_slots - existing_slots} missing parking slots (now {num_slots} total)")
        else:
            print(f"{existing_slots} slots already exist; no changes made")

        # Ensure bookings table has vehicle_number column (add if missing)
        try:
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            if 'bookings' in inspector.get_table_names():
                cols = [c['name'] for c in inspector.get_columns('bookings')]
                if 'vehicle_number' not in cols:
                    # SQLite supports ALTER TABLE ADD COLUMN
                    try:
                        db.session.execute('ALTER TABLE bookings ADD COLUMN vehicle_number VARCHAR(20)')
                        db.session.commit()
                        print('Added vehicle_number column to bookings')
                    except Exception as e:
                        db.session.rollback()
                        print(f'Warning: Could not add vehicle_number column: {e}')
        except Exception as e:
            print(f'Warning checking bookings schema: {e}')

