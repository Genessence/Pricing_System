# Schemas package
from .base import (
    BaseSchema, 
    BaseResponseSchema, 
    BaseCreateSchema, 
    BaseUpdateSchema,
    PaginationSchema,
    PaginatedResponseSchema
)

# Core schemas
from .sites import SitesCreate, SitesUpdate, SitesResponse, SitesListResponse
from .users import (
    UsersCreate, 
    UsersUpdate, 
    UsersResponse, 
    UsersListResponse,
    UsersLogin,
    UsersPasswordChange
)
from .vendors import VendorsCreate, VendorsUpdate, VendorsResponse, VendorsListResponse
from .general_purchase_rfq import (
    GeneralPurchaseRFQCreate,
    GeneralPurchaseRFQUpdate,
    GeneralPurchaseRFQResponse,
    GeneralPurchaseRFQListResponse,
    GeneralPurchaseRFQWithRelations,
    GeneralPurchaseRFQStatusUpdate
)

# Item schemas
from .indent_items import IndentItemsCreate, IndentItemsUpdate, IndentItemsResponse, IndentItemsListResponse
from .service_items import ServiceItemsCreate, ServiceItemsUpdate, ServiceItemsResponse, ServiceItemsListResponse
from .transport_items import TransportItemsCreate, TransportItemsUpdate, TransportItemsResponse, TransportItemsListResponse

# Quotation schemas
from .service_items_quotation import (
    ServiceItemsQuotationCreate,
    ServiceItemsQuotationUpdate,
    ServiceItemsQuotationResponse,
    ServiceItemsQuotationListResponse,
    ServiceItemsQuotationWithRelations
)
from .transport_items_quotation import (
    TransportItemsQuotationCreate,
    TransportItemsQuotationUpdate,
    TransportItemsQuotationResponse,
    TransportItemsQuotationListResponse,
    TransportItemsQuotationWithRelations
)
from .indent_items_quotation import (
    IndentItemsQuotationCreate,
    IndentItemsQuotationUpdate,
    IndentItemsQuotationResponse,
    IndentItemsQuotationListResponse,
    IndentItemsQuotationWithRelations
)

# Supporting schemas
from .attachments import (
    AttachmentsCreate,
    AttachmentsUpdate,
    AttachmentsResponse,
    AttachmentsListResponse,
    AttachmentsWithRelations,
    AttachmentsUpload
)
from .rfq_vendors import (
    RFQVendorsCreate,
    RFQVendorsUpdate,
    RFQVendorsResponse,
    RFQVendorsListResponse,
    RFQVendorsWithRelations,
    RFQVendorsAddVendor,
    RFQVendorsRemoveVendor
)

__all__ = [
    # Base schemas
    "BaseSchema",
    "BaseResponseSchema", 
    "BaseCreateSchema",
    "BaseUpdateSchema",
    "PaginationSchema",
    "PaginatedResponseSchema",
    
    # Core schemas
    "SitesCreate", "SitesUpdate", "SitesResponse", "SitesListResponse",
    "UsersCreate", "UsersUpdate", "UsersResponse", "UsersListResponse", "UsersLogin", "UsersPasswordChange",
    "VendorsCreate", "VendorsUpdate", "VendorsResponse", "VendorsListResponse",
    "GeneralPurchaseRFQCreate", "GeneralPurchaseRFQUpdate", "GeneralPurchaseRFQResponse", 
    "GeneralPurchaseRFQListResponse", "GeneralPurchaseRFQWithRelations", "GeneralPurchaseRFQStatusUpdate",
    
    # Item schemas
    "IndentItemsCreate", "IndentItemsUpdate", "IndentItemsResponse", "IndentItemsListResponse",
    "ServiceItemsCreate", "ServiceItemsUpdate", "ServiceItemsResponse", "ServiceItemsListResponse",
    "TransportItemsCreate", "TransportItemsUpdate", "TransportItemsResponse", "TransportItemsListResponse",
    
    # Quotation schemas
    "ServiceItemsQuotationCreate", "ServiceItemsQuotationUpdate", "ServiceItemsQuotationResponse",
    "ServiceItemsQuotationListResponse", "ServiceItemsQuotationWithRelations",
    "TransportItemsQuotationCreate", "TransportItemsQuotationUpdate", "TransportItemsQuotationResponse",
    "TransportItemsQuotationListResponse", "TransportItemsQuotationWithRelations",
    "IndentItemsQuotationCreate", "IndentItemsQuotationUpdate", "IndentItemsQuotationResponse",
    "IndentItemsQuotationListResponse", "IndentItemsQuotationWithRelations",
    
    # Supporting schemas
    "AttachmentsCreate", "AttachmentsUpdate", "AttachmentsResponse", "AttachmentsListResponse",
    "AttachmentsWithRelations", "AttachmentsUpload",
    "RFQVendorsCreate", "RFQVendorsUpdate", "RFQVendorsResponse", "RFQVendorsListResponse",
    "RFQVendorsWithRelations", "RFQVendorsAddVendor", "RFQVendorsRemoveVendor"
]
