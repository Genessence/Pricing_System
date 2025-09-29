"""
Test data factories for generating test objects.
"""

import factory
from factory import fuzzy
from datetime import datetime, timezone
from uuid import uuid4

from models.users import Users
from models.sites import Sites
from models.vendors import Vendors
from models.general_purchase_rfq import GeneralPurchaseRFQ
from models.indent_items import IndentItems
from models.service_items import ServiceItems
from models.transport_items import TransportItems
from models.attachments import Attachments
from models.rfq_vendors import RFQVendors
from models.enums import COMMODITY_TYPES, RFQ_STATUS, USER_ROLES, SUPPLIER_STATUS, ATTACHMENT_TYPE


class SitesFactory(factory.Factory):
    """Factory for creating test Sites."""
    
    class Meta:
        model = Sites
    
    id = factory.LazyFunction(lambda: uuid4())
    code = factory.Sequence(lambda n: f"SITE{n:03d}")
    name = factory.Faker('company')
    address = factory.Faker('street_address')
    city = factory.Faker('city')
    state = factory.Faker('state')
    country = factory.Faker('country')
    postal_code = factory.Faker('postcode')
    contact_person = factory.Faker('name')
    contact_email = factory.Faker('email')
    contact_phone = factory.Faker('phone_number')
    is_active = True
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    updated_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class UsersFactory(factory.Factory):
    """Factory for creating test Users."""
    
    class Meta:
        model = Users
    
    id = factory.LazyFunction(lambda: uuid4())
    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Faker('email')
    password_hash = factory.LazyFunction(lambda: "hashedpassword")
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    role = factory.Iterator([role.value for role in USER_ROLES])
    site_id = factory.LazyFunction(lambda: uuid4())
    is_active = True
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    updated_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class VendorsFactory(factory.Factory):
    """Factory for creating test Vendors."""
    
    class Meta:
        model = Vendors
    
    id = factory.LazyFunction(lambda: uuid4())
    code = factory.Sequence(lambda n: f"VENDOR{n:03d}")
    name = factory.Faker('company')
    contact_person = factory.Faker('name')
    contact_email = factory.Faker('email')
    contact_phone = factory.Faker('phone_number')
    address = factory.Faker('street_address')
    city = factory.Faker('city')
    state = factory.Faker('state')
    country = factory.Faker('country')
    postal_code = factory.Faker('postcode')
    providing_commodity_type = factory.Iterator([ct.value for ct in COMMODITY_TYPES])
    status = factory.Iterator([status.value for status in SUPPLIER_STATUS])
    rating = fuzzy.FuzzyInteger(1, 5)
    is_active = True
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    updated_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class GeneralPurchaseRFQFactory(factory.Factory):
    """Factory for creating test GeneralPurchaseRFQ."""
    
    class Meta:
        model = GeneralPurchaseRFQ
    
    id = factory.LazyFunction(lambda: uuid4())
    rfq_number = factory.Sequence(lambda n: f"RFQ-2024-{n:03d}")
    title = factory.Faker('sentence', nb_words=4)
    description = factory.Faker('text', max_nb_chars=200)
    commodity_type = factory.Iterator([ct.value for ct in COMMODITY_TYPES])
    status = factory.Iterator([status.value for status in RFQ_STATUS])
    site_code = factory.Sequence(lambda n: f"SITE{n:03d}")
    created_by = factory.LazyFunction(lambda: uuid4())
    total_value = fuzzy.FuzzyFloat(100.0, 10000.0)
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    updated_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class IndentItemsFactory(factory.Factory):
    """Factory for creating test IndentItems."""
    
    class Meta:
        model = IndentItems
    
    id = factory.LazyFunction(lambda: uuid4())
    item_code = factory.Sequence(lambda n: f"ITEM{n:03d}")
    description = factory.Faker('sentence', nb_words=3)
    unit = factory.Iterator(['PCS', 'KG', 'L', 'M', 'SET'])
    quantity = fuzzy.FuzzyInteger(1, 100)
    unit_price = fuzzy.FuzzyFloat(10.0, 1000.0)
    total_price = factory.LazyAttribute(lambda obj: obj.quantity * obj.unit_price)
    is_active = True
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    updated_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class ServiceItemsFactory(factory.Factory):
    """Factory for creating test ServiceItems."""
    
    class Meta:
        model = ServiceItems
    
    id = factory.LazyFunction(lambda: uuid4())
    rfq_id = factory.LazyFunction(lambda: uuid4())
    description = factory.Faker('sentence', nb_words=3)
    unit = factory.Iterator(['HOURS', 'DAYS', 'WEEKS', 'MONTHS'])
    quantity = fuzzy.FuzzyInteger(1, 50)
    unit_price = fuzzy.FuzzyFloat(50.0, 500.0)
    total_price = factory.LazyAttribute(lambda obj: obj.quantity * obj.unit_price)
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    updated_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class TransportItemsFactory(factory.Factory):
    """Factory for creating test TransportItems."""
    
    class Meta:
        model = TransportItems
    
    id = factory.LazyFunction(lambda: uuid4())
    rfq_id = factory.LazyFunction(lambda: uuid4())
    description = factory.Faker('sentence', nb_words=3)
    from_location = factory.Faker('city')
    to_location = factory.Faker('city')
    distance = fuzzy.FuzzyInteger(10, 1000)
    unit_price = fuzzy.FuzzyFloat(1.0, 10.0)
    total_price = factory.LazyAttribute(lambda obj: obj.distance * obj.unit_price)
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    updated_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class AttachmentsFactory(factory.Factory):
    """Factory for creating test Attachments."""
    
    class Meta:
        model = Attachments
    
    id = factory.LazyFunction(lambda: uuid4())
    rfq_id = factory.LazyFunction(lambda: uuid4())
    filename = factory.Faker('file_name', extension='pdf')
    file_path = factory.LazyAttribute(lambda obj: f"/uploads/{obj.filename}")
    file_size = fuzzy.FuzzyInteger(1024, 10485760)  # 1KB to 10MB
    content_type = factory.Iterator(['application/pdf', 'image/jpeg', 'image/png', 'text/plain'])
    attachment_type = factory.Iterator([at.value for at in ATTACHMENT_TYPE])
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    updated_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class RFQVendorsFactory(factory.Factory):
    """Factory for creating test RFQVendors."""
    
    class Meta:
        model = RFQVendors
    
    id = factory.LazyFunction(lambda: uuid4())
    rfq_id = factory.LazyFunction(lambda: uuid4())
    vendors_ids = factory.LazyFunction(lambda: [uuid4(), uuid4()])
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    updated_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


# Factory for creating test data dictionaries
class TestDataFactory:
    """Factory for creating test data dictionaries."""
    
    @staticmethod
    def create_site_data():
        """Create test site data dictionary."""
        site = SitesFactory.build()
        return {
            "code": site.code,
            "name": site.name,
            "address": site.address,
            "city": site.city,
            "state": site.state,
            "country": site.country,
            "postal_code": site.postal_code,
            "contact_person": site.contact_person,
            "contact_email": site.contact_email,
            "contact_phone": site.contact_phone
        }
    
    @staticmethod
    def create_user_data():
        """Create test user data dictionary."""
        user = UsersFactory.build()
        return {
            "username": user.username,
            "email": user.email,
            "password": "testpassword",
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role
        }
    
    @staticmethod
    def create_vendor_data():
        """Create test vendor data dictionary."""
        vendor = VendorsFactory.build()
        return {
            "code": vendor.code,
            "name": vendor.name,
            "contact_person": vendor.contact_person,
            "contact_email": vendor.contact_email,
            "contact_phone": vendor.contact_phone,
            "address": vendor.address,
            "city": vendor.city,
            "state": vendor.state,
            "country": vendor.country,
            "postal_code": vendor.postal_code,
            "providing_commodity_type": vendor.providing_commodity_type,
            "status": vendor.status,
            "rating": vendor.rating
        }
    
    @staticmethod
    def create_rfq_data():
        """Create test RFQ data dictionary."""
        rfq = GeneralPurchaseRFQFactory.build()
        return {
            "title": rfq.title,
            "description": rfq.description,
            "commodity_type": rfq.commodity_type,
            "site_code": rfq.site_code,
            "total_value": rfq.total_value
        }
    
    @staticmethod
    def create_indent_item_data():
        """Create test indent item data dictionary."""
        item = IndentItemsFactory.build()
        return {
            "item_code": item.item_code,
            "description": item.description,
            "unit": item.unit,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "total_price": item.total_price
        }
    
    @staticmethod
    def create_service_item_data():
        """Create test service item data dictionary."""
        item = ServiceItemsFactory.build()
        return {
            "description": item.description,
            "unit": item.unit,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "total_price": item.total_price
        }
    
    @staticmethod
    def create_transport_item_data():
        """Create test transport item data dictionary."""
        item = TransportItemsFactory.build()
        return {
            "description": item.description,
            "from_location": item.from_location,
            "to_location": item.to_location,
            "distance": item.distance,
            "unit_price": item.unit_price,
            "total_price": item.total_price
        }
    
    @staticmethod
    def create_attachment_data():
        """Create test attachment data dictionary."""
        attachment = AttachmentsFactory.build()
        return {
            "filename": attachment.filename,
            "file_path": attachment.file_path,
            "file_size": attachment.file_size,
            "content_type": attachment.content_type,
            "attachment_type": attachment.attachment_type
        }
