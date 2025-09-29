# Routes package
from .general_purchase_rfq import router as rfq_router
from .sites import router as sites_router
from .users import router as users_router
from .vendors import router as vendors_router
from .indent_items import router as indent_items_router
from .service_items import router as service_items_router
from .transport_items import router as transport_items_router
from .service_items_quotation import router as service_items_quotation_router
from .transport_items_quotation import router as transport_items_quotation_router
from .indent_items_quotation import router as indent_items_quotation_router
from .attachments import router as attachments_router
from .rfq_vendors import router as rfq_vendors_router

__all__ = [
    "rfq_router",
    "sites_router", 
    "users_router",
    "vendors_router",
    "indent_items_router",
    "service_items_router",
    "transport_items_router",
    "service_items_quotation_router",
    "transport_items_quotation_router",
    "indent_items_quotation_router",
    "attachments_router",
    "rfq_vendors_router"
]
