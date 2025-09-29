#!/usr/bin/env python3
"""
Codebase validation script.
Checks imports, dependencies, and overall structure integrity.
"""

import os
import sys
import ast
import importlib
from pathlib import Path
from typing import List, Dict, Any, Set
import logging

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class CodebaseValidator:
    """Validates the entire codebase structure and imports."""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.imports: Set[str] = set()
        self.modules: Set[str] = set()
    
    def validate_structure(self) -> bool:
        """Validate the overall project structure."""
        logger.info("Validating project structure...")
        
        required_dirs = [
            "config", "models", "schemas", "controllers", 
            "services", "routes", "middleware", "utils", "tests"
        ]
        
        for dir_name in required_dirs:
            dir_path = self.project_root / dir_name
            if not dir_path.exists():
                self.errors.append(f"Missing required directory: {dir_name}")
            elif not (dir_path / "__init__.py").exists():
                self.warnings.append(f"Missing __init__.py in {dir_name}")
        
        required_files = [
            "app.py", "requirements.txt", ".env.example", "README.md"
        ]
        
        for file_name in required_files:
            file_path = self.project_root / file_name
            if not file_path.exists():
                self.errors.append(f"Missing required file: {file_name}")
        
        return len(self.errors) == 0
    
    def validate_imports(self) -> bool:
        """Validate all Python imports in the codebase."""
        logger.info("Validating imports...")
        
        python_files = list(self.project_root.rglob("*.py"))
        
        for file_path in python_files:
            if "test" in str(file_path) or "venv" in str(file_path):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                tree = ast.parse(content)
                self._extract_imports(tree, file_path)
                
            except SyntaxError as e:
                self.errors.append(f"Syntax error in {file_path}: {e}")
            except Exception as e:
                self.warnings.append(f"Could not parse {file_path}: {e}")
        
        return len(self.errors) == 0
    
    def _extract_imports(self, tree: ast.AST, file_path: Path) -> None:
        """Extract imports from AST tree."""
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    self.imports.add(alias.name)
                    self._check_import(alias.name, file_path)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    self.imports.add(node.module)
                    self._check_import(node.module, file_path)
    
    def _check_import(self, import_name: str, file_path: Path) -> None:
        """Check if an import is valid."""
        # Skip standard library imports
        if import_name in sys.builtin_module_names:
            return
        
        # Skip third-party imports that are in requirements.txt
        if self._is_third_party_import(import_name):
            return
        
        # Check if it's a local import
        if self._is_local_import(import_name, file_path):
            return
        
        # Check if it's a relative import
        if import_name.startswith('.'):
            return
        
        # If we get here, it might be an invalid import
        if not self._can_import_module(import_name):
            self.warnings.append(f"Potentially invalid import '{import_name}' in {file_path}")
    
    def _is_third_party_import(self, import_name: str) -> bool:
        """Check if import is a third-party package."""
        third_party_packages = [
            'fastapi', 'uvicorn', 'sqlalchemy', 'pydantic', 'pydantic_settings',
            'jose', 'passlib', 'python_multipart', 'python_dotenv', 'httpx',
            'pytest', 'factory_boy', 'freezegun', 'black', 'flake8', 'isort',
            'mypy', 'structlog', 'aiofiles', 'python_dateutil', 'fastapi_mail',
            'redis', 'hiredis', 'celery', 'sphinx', 'sphinx_rtd_theme'
        ]
        
        return any(import_name.startswith(pkg) for pkg in third_party_packages)
    
    def _is_local_import(self, import_name: str, file_path: Path) -> bool:
        """Check if import is a local module."""
        # Check if it's a local module in the project
        local_modules = [
            'config', 'models', 'schemas', 'controllers', 
            'services', 'routes', 'middleware', 'utils'
        ]
        
        if import_name in local_modules:
            return True
        
        # Check if it's a submodule of a local module
        for module in local_modules:
            if import_name.startswith(f"{module}."):
                return True
        
        return False
    
    def _can_import_module(self, module_name: str) -> bool:
        """Check if a module can be imported."""
        try:
            importlib.import_module(module_name)
            return True
        except ImportError:
            return False
    
    def validate_models(self) -> bool:
        """Validate SQLAlchemy models."""
        logger.info("Validating models...")
        
        try:
            import models
            logger.info("All models imported successfully")
            return True
        except ImportError as e:
            self.errors.append(f"Failed to import models: {e}")
            return False
    
    def validate_schemas(self) -> bool:
        """Validate Pydantic schemas."""
        logger.info("Validating schemas...")
        
        try:
            import schemas
            logger.info("All schemas imported successfully")
            return True
        except ImportError as e:
            self.errors.append(f"Failed to import schemas: {e}")
            return False
    
    def validate_services(self) -> bool:
        """Validate service layer."""
        logger.info("Validating services...")
        
        try:
            import services
            logger.info("All services imported successfully")
            return True
        except ImportError as e:
            self.errors.append(f"Failed to import services: {e}")
            return False
    
    def validate_controllers(self) -> bool:
        """Validate controller layer."""
        logger.info("Validating controllers...")
        
        try:
            import controllers
            logger.info("All controllers imported successfully")
            return True
        except ImportError as e:
            self.errors.append(f"Failed to import controllers: {e}")
            return False
    
    def validate_routes(self) -> bool:
        """Validate route layer."""
        logger.info("Validating routes...")
        
        try:
            import routes
            logger.info("All routes imported successfully")
            return True
        except ImportError as e:
            self.errors.append(f"Failed to import routes: {e}")
            return False
    
    def validate_middleware(self) -> bool:
        """Validate middleware layer."""
        logger.info("Validating middleware...")
        
        try:
            import middleware
            logger.info("All middleware imported successfully")
            return True
        except ImportError as e:
            self.errors.append(f"Failed to import middleware: {e}")
            return False
    
    def validate_utils(self) -> bool:
        """Validate utility functions."""
        logger.info("Validating utils...")
        
        try:
            import utils
            logger.info("All utils imported successfully")
            return True
        except ImportError as e:
            self.errors.append(f"Failed to import utils: {e}")
            return False
    
    def validate_app(self) -> bool:
        """Validate main application."""
        logger.info("Validating main application...")
        
        try:
            import app
            logger.info("Main application imported successfully")
            return True
        except ImportError as e:
            self.errors.append(f"Failed to import main application: {e}")
            return False
    
    def validate_dependencies(self) -> bool:
        """Validate that all dependencies are available."""
        logger.info("Validating dependencies...")
        
        required_packages = [
            'fastapi', 'uvicorn', 'sqlalchemy', 'pydantic', 'pydantic_settings',
            'jose', 'passlib', 'python_multipart', 'python_dotenv', 'httpx'
        ]
        
        missing_packages = []
        
        for package in required_packages:
            try:
                importlib.import_module(package)
            except ImportError:
                missing_packages.append(package)
        
        if missing_packages:
            self.errors.append(f"Missing required packages: {', '.join(missing_packages)}")
            return False
        
        logger.info("All dependencies are available")
        return True
    
    def validate_tests(self) -> bool:
        """Validate test structure."""
        logger.info("Validating tests...")
        
        test_dir = self.project_root / "tests"
        if not test_dir.exists():
            self.errors.append("Tests directory not found")
            return False
        
        required_test_files = [
            "conftest.py", "test_models.py", "test_services.py", 
            "test_controllers.py", "test_api_integration.py",
            "test_middleware.py", "test_utils.py"
        ]
        
        for test_file in required_test_files:
            test_path = test_dir / test_file
            if not test_path.exists():
                self.warnings.append(f"Missing test file: {test_file}")
        
        return True
    
    def run_validation(self) -> bool:
        """Run all validation checks."""
        logger.info("Starting codebase validation...")
        
        validations = [
            self.validate_structure,
            self.validate_imports,
            self.validate_dependencies,
            self.validate_models,
            self.validate_schemas,
            self.validate_services,
            self.validate_controllers,
            self.validate_routes,
            self.validate_middleware,
            self.validate_utils,
            self.validate_app,
            self.validate_tests
        ]
        
        all_passed = True
        
        for validation in validations:
            try:
                if not validation():
                    all_passed = False
            except Exception as e:
                self.errors.append(f"Validation error: {e}")
                all_passed = False
        
        return all_passed
    
    def print_results(self) -> None:
        """Print validation results."""
        print("\n" + "="*60)
        print("CODEBASE VALIDATION RESULTS")
        print("="*60)
        
        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            for error in self.errors:
                print(f"  • {error}")
        
        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  • {warning}")
        
        if not self.errors and not self.warnings:
            print("\n✅ All validations passed!")
        elif not self.errors:
            print(f"\n✅ All critical validations passed! ({len(self.warnings)} warnings)")
        else:
            print(f"\n❌ Validation failed with {len(self.errors)} errors and {len(self.warnings)} warnings")
        
        print("\n" + "="*60)


def main():
    """Main validation function."""
    validator = CodebaseValidator(project_root)
    
    success = validator.run_validation()
    validator.print_results()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
