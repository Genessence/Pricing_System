#!/usr/bin/env python3
"""
Phase 1 Implementation Audit - QuoteFlow Pro
Check what's implemented vs what's required according to user stories and backend document
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models import *
from app.services import *
from app.schemas import *
from app.api.v1 import *
import inspect

def audit_phase1_implementation():
    """Audit Phase 1 implementation against requirements"""
    print("🔍 Phase 1 Implementation Audit - QuoteFlow Pro")
    print("=" * 60)
    
    # Phase 1 Requirements from Backend Implementation Plan
    phase1_requirements = {
        "models": {
            "User": ["id", "username", "email", "hashed_password", "full_name", "role", "is_active"],
            "Site": ["id", "site_code", "site_name", "location", "address", "contact_person", "contact_email", "contact_phone", "is_active"],
            "ERPItem": ["id", "item_code", "description", "specifications", "unit_of_measure", "category", "subcategory", "is_active"],
            "RFQ": ["id", "rfq_number", "title", "description", "commodity_type", "status", "total_value", "currency", "user_id", "site_id"],
            "RFQItem": ["id", "rfq_id", "erp_item_id", "item_code", "description", "specifications", "unit_of_measure", "required_quantity", "last_buying_price", "last_vendor"]
        },
        "services": {
            "AuthService": ["authenticate_user", "login_user"],
            "ERPItemService": ["search_items", "get_items", "get_item", "create_item", "update_item", "delete_item"],
            "RFQService": ["create_rfq", "get_rfqs", "get_rfq", "update_rfq", "delete_rfq", "approve_rfq", "generate_rfq_number"],
            "SiteService": ["get_sites", "get_site", "create_site", "update_site", "delete_site"]
        },
        "api_endpoints": {
            "auth": ["/login", "/refresh", "/logout"],
            "users": ["/", "/{user_id}"],
            "erp_items": ["/search", "/", "/{item_id}"],
            "sites": ["/", "/{site_id}"],
            "rfqs": ["/", "/{rfq_id}", "/{rfq_id}/approve"]
        }
    }
    
    # Check Models
    print("\n📋 1. MODEL IMPLEMENTATION CHECK")
    print("-" * 40)
    
    models_status = {}
    for model_name, required_fields in phase1_requirements["models"].items():
        try:
            model_class = globals().get(model_name)
            if model_class:
                # Get actual fields from the model
                actual_fields = [column.name for column in model_class.__table__.columns]
                missing_fields = [field for field in required_fields if field not in actual_fields]
                
                if missing_fields:
                    models_status[model_name] = f"❌ Missing fields: {missing_fields}"
                else:
                    models_status[model_name] = "✅ Complete"
                    
                print(f"{model_name}: {models_status[model_name]}")
                if missing_fields:
                    print(f"   Required: {required_fields}")
                    print(f"   Actual: {actual_fields}")
            else:
                models_status[model_name] = "❌ Model not found"
                print(f"{model_name}: {models_status[model_name]}")
        except Exception as e:
            models_status[model_name] = f"❌ Error: {str(e)}"
            print(f"{model_name}: {models_status[model_name]}")
    
    # Check Services
    print("\n🔧 2. SERVICE IMPLEMENTATION CHECK")
    print("-" * 40)
    
    services_status = {}
    for service_name, required_methods in phase1_requirements["services"].items():
        try:
            service_class = globals().get(service_name)
            if service_class:
                # Get actual methods from the service
                actual_methods = [method for method in dir(service_class) if not method.startswith('_')]
                missing_methods = [method for method in required_methods if method not in actual_methods]
                
                if missing_methods:
                    services_status[service_name] = f"❌ Missing methods: {missing_methods}"
                else:
                    services_status[service_name] = "✅ Complete"
                    
                print(f"{service_name}: {services_status[service_name]}")
                if missing_methods:
                    print(f"   Required: {required_methods}")
                    print(f"   Actual: {actual_methods}")
            else:
                services_status[service_name] = "❌ Service not found"
                print(f"{service_name}: {services_status[service_name]}")
        except Exception as e:
            services_status[service_name] = f"❌ Error: {str(e)}"
            print(f"{service_name}: {services_status[service_name]}")
    
    # Check API Endpoints
    print("\n🌐 3. API ENDPOINT IMPLEMENTATION CHECK")
    print("-" * 40)
    
    api_status = {}
    for module_name, required_endpoints in phase1_requirements["api_endpoints"].items():
        try:
            module = globals().get(module_name)
            if module:
                # Check if router exists and has routes
                if hasattr(module, 'router'):
                    routes = [route.path for route in module.router.routes]
                    missing_endpoints = [endpoint for endpoint in required_endpoints if endpoint not in routes]
                    
                    if missing_endpoints:
                        api_status[module_name] = f"❌ Missing endpoints: {missing_endpoints}"
                    else:
                        api_status[module_name] = "✅ Complete"
                        
                    print(f"{module_name}: {api_status[module_name]}")
                    if missing_endpoints:
                        print(f"   Required: {required_endpoints}")
                        print(f"   Actual: {routes}")
                else:
                    api_status[module_name] = "❌ No router found"
                    print(f"{module_name}: {api_status[module_name]}")
            else:
                api_status[module_name] = "❌ Module not found"
                print(f"{module_name}: {api_status[module_name]}")
        except Exception as e:
            api_status[module_name] = f"❌ Error: {str(e)}"
            print(f"{module_name}: {api_status[module_name]}")
    
    # Summary
    print("\n📊 4. PHASE 1 IMPLEMENTATION SUMMARY")
    print("=" * 60)
    
    total_models = len(phase1_requirements["models"])
    complete_models = sum(1 for status in models_status.values() if "✅" in status)
    
    total_services = len(phase1_requirements["services"])
    complete_services = sum(1 for status in services_status.values() if "✅" in status)
    
    total_api_modules = len(phase1_requirements["api_endpoints"])
    complete_api_modules = sum(1 for status in api_status.values() if "✅" in status)
    
    print(f"Models: {complete_models}/{total_models} complete")
    print(f"Services: {complete_services}/{total_services} complete")
    print(f"API Modules: {complete_api_modules}/{total_api_modules} complete")
    
    # Critical Missing Items
    print("\n🚨 5. CRITICAL MISSING ITEMS")
    print("-" * 40)
    
    critical_missing = []
    
    # Check for Site model (critical for GP numbering)
    if "Site" not in models_status or "❌" in models_status["Site"]:
        critical_missing.append("Site Model - Required for GP-A001-001 numbering")
    
    # Check for RFQ rfq_number field
    if "RFQ" in models_status and "❌" in models_status["RFQ"]:
        if "rfq_number" in str(models_status["RFQ"]):
            critical_missing.append("RFQ.rfq_number field - Required for GP numbering")
    
    # Check for Site service
    if "SiteService" not in services_status or "❌" in services_status["SiteService"]:
        critical_missing.append("SiteService - Required for site management")
    
    # Check for GP numbering in RFQ service
    if "RFQService" in services_status and "❌" in services_status["RFQService"]:
        if "generate_rfq_number" in str(services_status["RFQService"]):
            critical_missing.append("RFQService.generate_rfq_number - Required for GP numbering")
    
    # Check for sites API
    if "sites" not in api_status or "❌" in api_status["sites"]:
        critical_missing.append("Sites API endpoints - Required for site management")
    
    if critical_missing:
        print("❌ CRITICAL ITEMS MISSING:")
        for item in critical_missing:
            print(f"   - {item}")
    else:
        print("✅ No critical items missing")
    
    # Phase 1 Readiness Assessment
    print("\n🎯 6. PHASE 1 READINESS ASSESSMENT")
    print("-" * 40)
    
    readiness_score = (complete_models + complete_services + complete_api_modules) / (total_models + total_services + total_api_modules)
    readiness_percentage = readiness_score * 100
    
    print(f"Overall Completion: {readiness_percentage:.1f}%")
    
    if readiness_percentage >= 90 and not critical_missing:
        print("✅ PHASE 1 READY FOR PHASE 2")
        print("   All critical components implemented")
    elif readiness_percentage >= 70:
        print("⚠️  PHASE 1 PARTIALLY READY")
        print("   Some components missing but core functionality available")
    else:
        print("❌ PHASE 1 NOT READY")
        print("   Significant components missing")
    
    # Recommendations
    print("\n💡 7. RECOMMENDATIONS")
    print("-" * 40)
    
    if critical_missing:
        print("IMMEDIATE ACTIONS REQUIRED:")
        for item in critical_missing:
            print(f"   1. Implement {item}")
    
    if readiness_percentage < 90:
        print("\nADDITIONAL IMPROVEMENTS:")
        print("   1. Complete missing model fields")
        print("   2. Implement missing service methods")
        print("   3. Add missing API endpoints")
        print("   4. Add comprehensive error handling")
        print("   5. Add input validation")
    
    return {
        "readiness_percentage": readiness_percentage,
        "critical_missing": critical_missing,
        "models_status": models_status,
        "services_status": services_status,
        "api_status": api_status
    }

if __name__ == "__main__":
    try:
        audit_result = audit_phase1_implementation()
        
        print("\n" + "=" * 60)
        if audit_result["readiness_percentage"] >= 90 and not audit_result["critical_missing"]:
            print("🚀 READY TO PROCEED TO PHASE 2!")
        else:
            print("⚠️  PHASE 1 NEEDS COMPLETION BEFORE PHASE 2")
        
    except Exception as e:
        print(f"❌ Audit failed: {str(e)}")
        import traceback
        traceback.print_exc()
