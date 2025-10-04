"""
Database seeding service for initializing default data.
Handles creation of default users, roles, and other essential data.
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import logging
import hashlib
from datetime import datetime

logger = logging.getLogger(__name__)


class SeedService:
    """Service for seeding the database with default data."""
    
    def __init__(self, db: Session):
        """Initialize seed service with database session."""
        self.db = db
    
    def hash_password(self, password: str) -> str:
        """Hash a password using centralized bcrypt_sha256 function."""
        from utils.password import hash_password
        return hash_password(password)
    
    def check_user_exists(self, username: str) -> bool:
        """Check if a user already exists."""
        try:
            from models.users import User
            user = self.db.query(User).filter(User.username == username).first()
            return user is not None
        except Exception as e:
            logger.error(f"Error checking user existence: {e}")
            return False
    
    def create_default_users(self) -> Dict[str, Any]:
        """Create default users if they don't exist."""
        status = {
            "users_created": 0,
            "users_skipped": 0,
            "errors": []
        }
        
        try:
            from models.users import User
            
            default_users = [
                {
                    "username": "admin",
                    "email": "admin@pricingsystem.com",
                    "password": "admin123",
                    "role": "admin",
                    "is_active": True,
                    "first_name": "System",
                    "last_name": "Administrator"
                },
                {
                    "username": "user",
                    "email": "user@pricingsystem.com", 
                    "password": "user123",
                    "role": "user",
                    "is_active": True,
                    "first_name": "Default",
                    "last_name": "User"
                },
                {
                    "username": "manager",
                    "email": "manager@pricingsystem.com",
                    "password": "manager123", 
                    "role": "manager",
                    "is_active": True,
                    "first_name": "Default",
                    "last_name": "Manager"
                }
            ]
            
            for user_data in default_users:
                try:
                    if self.check_user_exists(user_data["username"]):
                        logger.info(f"User '{user_data['username']}' already exists, skipping")
                        status["users_skipped"] += 1
                        continue
                    
                    # Create new user
                    user = User(
                        username=user_data["username"],
                        email=user_data["email"],
                        password_hash=self.hash_password(user_data["password"]),
                        role=user_data["role"],
                        is_active=user_data["is_active"],
                        first_name=user_data["first_name"],
                        last_name=user_data["last_name"],
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    
                    self.db.add(user)
                    self.db.commit()
                    
                    logger.info(f"Created default user: {user_data['username']}")
                    status["users_created"] += 1
                    
                except Exception as e:
                    error_msg = f"Error creating user {user_data['username']}: {e}"
                    logger.error(error_msg)
                    status["errors"].append(error_msg)
                    self.db.rollback()
                    
        except Exception as e:
            error_msg = f"Error in create_default_users: {e}"
            logger.error(error_msg)
            status["errors"].append(error_msg)
        
        return status
    
    def create_default_sites(self) -> Dict[str, Any]:
        """Create default sites if they don't exist."""
        status = {
            "sites_created": 0,
            "sites_skipped": 0,
            "errors": []
        }
        
        try:
            from models.sites import Site
            
            default_sites = [
                {
                    "name": "Main Site",
                    "code": "MAIN",
                    "address": "123 Main Street, City, Country",
                    "is_active": True
                },
                {
                    "name": "Warehouse A",
                    "code": "WH-A",
                    "address": "456 Warehouse Road, City, Country", 
                    "is_active": True
                }
            ]
            
            for site_data in default_sites:
                try:
                    # Check if site exists
                    existing_site = self.db.query(Site).filter(
                        Site.code == site_data["code"]
                    ).first()
                    
                    if existing_site:
                        logger.info(f"Site '{site_data['code']}' already exists, skipping")
                        status["sites_skipped"] += 1
                        continue
                    
                    # Create new site
                    site = Site(
                        name=site_data["name"],
                        code=site_data["code"],
                        address=site_data["address"],
                        is_active=site_data["is_active"],
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    
                    self.db.add(site)
                    self.db.commit()
                    
                    logger.info(f"Created default site: {site_data['code']}")
                    status["sites_created"] += 1
                    
                except Exception as e:
                    error_msg = f"Error creating site {site_data['code']}: {e}"
                    logger.error(error_msg)
                    status["errors"].append(error_msg)
                    self.db.rollback()
                    
        except Exception as e:
            error_msg = f"Error in create_default_sites: {e}"
            logger.error(error_msg)
            status["errors"].append(error_msg)
        
        return status
    
    def create_default_vendors(self) -> Dict[str, Any]:
        """Create default vendors if they don't exist."""
        status = {
            "vendors_created": 0,
            "vendors_skipped": 0,
            "errors": []
        }
        
        try:
            from models.vendors import Vendor
            
            default_vendors = [
                {
                    "name": "ABC Suppliers Ltd",
                    "contact_person": "John Smith",
                    "email": "contact@abcsuppliers.com",
                    "phone": "+1-555-0101",
                    "address": "789 Supplier Avenue, City, Country",
                    "is_active": True
                },
                {
                    "name": "XYZ Trading Co",
                    "contact_person": "Jane Doe", 
                    "email": "info@xyztrading.com",
                    "phone": "+1-555-0102",
                    "address": "321 Trading Street, City, Country",
                    "is_active": True
                }
            ]
            
            for vendor_data in default_vendors:
                try:
                    # Check if vendor exists
                    existing_vendor = self.db.query(Vendor).filter(
                        Vendor.name == vendor_data["name"]
                    ).first()
                    
                    if existing_vendor:
                        logger.info(f"Vendor '{vendor_data['name']}' already exists, skipping")
                        status["vendors_skipped"] += 1
                        continue
                    
                    # Create new vendor
                    vendor = Vendor(
                        name=vendor_data["name"],
                        contact_person=vendor_data["contact_person"],
                        email=vendor_data["email"],
                        phone=vendor_data["phone"],
                        address=vendor_data["address"],
                        is_active=vendor_data["is_active"],
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    
                    self.db.add(vendor)
                    self.db.commit()
                    
                    logger.info(f"Created default vendor: {vendor_data['name']}")
                    status["vendors_created"] += 1
                    
                except Exception as e:
                    error_msg = f"Error creating vendor {vendor_data['name']}: {e}"
                    logger.error(error_msg)
                    status["errors"].append(error_msg)
                    self.db.rollback()
                    
        except Exception as e:
            error_msg = f"Error in create_default_vendors: {e}"
            logger.error(error_msg)
            status["errors"].append(error_msg)
        
        return status
    
    def seed_database(self) -> Dict[str, Any]:
        """Seed the database with all default data."""
        logger.info("Starting database seeding...")
        
        overall_status = {
            "seeding_complete": False,
            "users": {},
            "sites": {},
            "vendors": {},
            "total_created": 0,
            "total_skipped": 0,
            "total_errors": 0
        }
        
        try:
            # Create default users
            users_status = self.create_default_users()
            overall_status["users"] = users_status
            
            # Create default sites
            sites_status = self.create_default_sites()
            overall_status["sites"] = sites_status
            
            # Create default vendors
            vendors_status = self.create_default_vendors()
            overall_status["vendors"] = vendors_status
            
            # Calculate totals
            overall_status["total_created"] = (
                users_status["users_created"] + 
                sites_status["sites_created"] + 
                vendors_status["vendors_created"]
            )
            overall_status["total_skipped"] = (
                users_status["users_skipped"] + 
                sites_status["sites_skipped"] + 
                vendors_status["vendors_skipped"]
            )
            overall_status["total_errors"] = (
                len(users_status["errors"]) + 
                len(sites_status["errors"]) + 
                len(vendors_status["errors"])
            )
            
            overall_status["seeding_complete"] = True
            logger.info("Database seeding completed successfully")
            
        except Exception as e:
            error_msg = f"Error during database seeding: {e}"
            logger.error(error_msg)
            overall_status["seeding_error"] = error_msg
        
        return overall_status


def seed_database(db: Session) -> Dict[str, Any]:
    """Convenience function to seed the database."""
    seed_service = SeedService(db)
    return seed_service.seed_database()
