"""
Database initialization script.
Creates tables and initial data.
"""
from sqlalchemy import create_engine
from app.core.config import settings
from app.models.base import Base
from app.core.security import get_password_hash

def create_tables():
    """Create all database tables."""
    # Import all models to ensure they're registered
    from app.models.user import User
    from app.models.erp_item import ERPItem
    from app.models.rfq import RFQ
    from app.models.rfq_item import RFQItem
    
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def create_initial_data():
    """Create initial users and sample data."""
    from sqlalchemy.orm import sessionmaker
    from app.models.user import User, UserRole
    from app.models.erp_item import ERPItem
    
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create admin user
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@quoteflow.com",
                full_name="System Administrator",
                role=UserRole.ADMIN,
                hashed_password=get_password_hash("admin123"),
                is_active=True
            )
            db.add(admin_user)
            print("✅ Admin user created: admin/admin123")
        
        # Create regular user
        regular_user = db.query(User).filter(User.username == "user").first()
        if not regular_user:
            regular_user = User(
                username="user",
                email="user@quoteflow.com",
                full_name="Regular User",
                role=UserRole.USER,
                hashed_password=get_password_hash("user123"),
                is_active=True
            )
            db.add(regular_user)
            print("✅ Regular user created: user/user123")
        
        # Create sample ERP items
        sample_items = [
            {
                "item_code": "ITEM001",
                "description": "Steel Rod 12mm",
                "specifications": "Mild steel rod, 12mm diameter, 6m length",
                "unit_of_measure": "Nos",
                "category": "Construction",
                "subcategory": "Steel"
            },
            {
                "item_code": "ITEM002", 
                "description": "Cement Bag 50kg",
                "specifications": "Portland cement, 50kg bag",
                "unit_of_measure": "Bags",
                "category": "Construction",
                "subcategory": "Cement"
            },
            {
                "item_code": "ITEM003",
                "description": "Office Chair",
                "specifications": "Ergonomic office chair with lumbar support",
                "unit_of_measure": "Nos",
                "category": "Furniture",
                "subcategory": "Office"
            }
        ]
        
        for item_data in sample_items:
            existing_item = db.query(ERPItem).filter(ERPItem.item_code == item_data["item_code"]).first()
            if not existing_item:
                erp_item = ERPItem(**item_data)
                db.add(erp_item)
        
        db.commit()
        print("✅ Sample ERP items created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating initial data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Initializing QuoteFlow Pro Database...")
    create_tables()
    create_initial_data()
    print("🎉 Database initialization completed!")
