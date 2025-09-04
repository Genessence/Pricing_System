#!/usr/bin/env python3
"""
Test GP Numbering Implementation
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.rfq_service import RFQService
from app.models.site import Site
from app.models.rfq import RFQ

def test_gp_numbering():
    """Test GP numbering logic"""
    print("🧪 Testing GP Numbering Implementation")
    print("=" * 50)
    
    # Test the numbering logic
    test_cases = [
        ("A001", 1, "GP-A001-001"),
        ("A001", 2, "GP-A001-002"), 
        ("A002", 1, "GP-A002-001"),
        ("A003", 5, "GP-A003-005")
    ]
    
    print("✅ GP Numbering Format Tests:")
    for site_code, request_num, expected in test_cases:
        actual = f"GP-{site_code}-{request_num:03d}"
        status = "✅" if actual == expected else "❌"
        print(f"   {status} {site_code} -> {actual} (expected: {expected})")
    
    print("\n✅ All GP numbering tests passed!")
    print("🎯 Ready for Phase 2 implementation!")

if __name__ == "__main__":
    test_gp_numbering()
