#!/usr/bin/env python3
"""
Test runner script for the Pricing System Backend.
"""

import sys
import subprocess
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running {description}:")
        print(f"Return code: {e.returncode}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return False

def main():
    """Main test runner function."""
    print("🧪 Pricing System Backend - Test Runner")
    print("=" * 50)
    
    # Change to project root directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Test commands
    test_commands = [
        {
            "command": "python -m pytest tests/ -v --tb=short",
            "description": "Unit and Integration Tests"
        },
        {
            "command": "python -m pytest tests/test_models.py -v --tb=short",
            "description": "Model Tests"
        },
        {
            "command": "python -m pytest tests/test_services.py -v --tb=short",
            "description": "Service Tests"
        },
        {
            "command": "python -m pytest tests/test_controllers.py -v --tb=short",
            "description": "Controller Tests"
        },
        {
            "command": "python -m pytest tests/test_api_integration.py -v --tb=short",
            "description": "API Integration Tests"
        },
        {
            "command": "python -m pytest tests/test_middleware.py -v --tb=short",
            "description": "Middleware Tests"
        },
        {
            "command": "python -m pytest tests/test_utils.py -v --tb=short",
            "description": "Utility Tests"
        },
        {
            "command": "python -m pytest tests/ --cov=. --cov-report=html --cov-report=term-missing",
            "description": "Coverage Report"
        }
    ]
    
    # Run tests
    success_count = 0
    total_count = len(test_commands)
    
    for test_cmd in test_commands:
        if run_command(test_cmd["command"], test_cmd["description"]):
            success_count += 1
        else:
            print(f"❌ Failed: {test_cmd['description']}")
    
    # Summary
    print(f"\n{'='*60}")
    print(f"Test Summary: {success_count}/{total_count} test suites passed")
    print(f"{'='*60}")
    
    if success_count == total_count:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
