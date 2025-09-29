#!/usr/bin/env python3
"""
Deployment script for the Pricing System Backend.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class DeploymentManager:
    """Manages deployment of the Pricing System Backend."""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.deployment_steps = []
        self.errors = []
    
    def add_step(self, name: str, command: str, description: str = None):
        """Add a deployment step."""
        self.deployment_steps.append({
            "name": name,
            "command": command,
            "description": description or f"Running {name}"
        })
    
    def run_command(self, command: str, description: str) -> bool:
        """Run a command and handle errors."""
        logger.info(f"Running: {description}")
        logger.info(f"Command: {command}")
        
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                check=True, 
                capture_output=True, 
                text=True,
                cwd=self.project_root
            )
            
            if result.stdout:
                logger.info(f"Output: {result.stdout}")
            
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Command failed: {e}")
            logger.error(f"STDOUT: {e.stdout}")
            logger.error(f"STDERR: {e.stderr}")
            self.errors.append(f"{description}: {e}")
            return False
    
    def setup_environment(self) -> bool:
        """Setup deployment environment."""
        logger.info("Setting up deployment environment...")
        
        # Create virtual environment if it doesn't exist
        venv_path = self.project_root / "venv"
        if not venv_path.exists():
            logger.info("Creating virtual environment...")
            if not self.run_command("python -m venv venv", "Create virtual environment"):
                return False
        
        # Activate virtual environment and install dependencies
        if os.name == 'nt':  # Windows
            activate_cmd = "venv\\Scripts\\activate"
            pip_cmd = "venv\\Scripts\\pip"
        else:  # Unix/Linux
            activate_cmd = "source venv/bin/activate"
            pip_cmd = "venv/bin/pip"
        
        # Install dependencies
        if not self.run_command(f"{pip_cmd} install --upgrade pip", "Upgrade pip"):
            return False
        
        if not self.run_command(f"{pip_cmd} install -r requirements.txt", "Install dependencies"):
            return False
        
        return True
    
    def run_tests(self) -> bool:
        """Run test suite."""
        logger.info("Running test suite...")
        
        if os.name == 'nt':  # Windows
            python_cmd = "venv\\Scripts\\python"
        else:  # Unix/Linux
            python_cmd = "venv/bin/python"
        
        # Run tests
        if not self.run_command(f"{python_cmd} -m pytest tests/ -v", "Run tests"):
            return False
        
        # Run coverage
        if not self.run_command(f"{python_cmd} -m pytest tests/ --cov=. --cov-report=html", "Run coverage"):
            return False
        
        return True
    
    def validate_codebase(self) -> bool:
        """Validate codebase structure."""
        logger.info("Validating codebase...")
        
        if os.name == 'nt':  # Windows
            python_cmd = "venv\\Scripts\\python"
        else:  # Unix/Linux
            python_cmd = "venv/bin/python"
        
        return self.run_command(f"{python_cmd} scripts/validate_codebase.py", "Validate codebase")
    
    def setup_database(self) -> bool:
        """Setup database."""
        logger.info("Setting up database...")
        
        # Check if .env file exists
        env_file = self.project_root / ".env"
        if not env_file.exists():
            logger.warning(".env file not found. Please create it from .env.example")
            return False
        
        return True
    
    def create_startup_script(self) -> bool:
        """Create startup script."""
        logger.info("Creating startup script...")
        
        if os.name == 'nt':  # Windows
            script_content = """@echo off
echo Starting Pricing System Backend...
call venv\\Scripts\\activate
python app.py
pause
"""
            script_path = self.project_root / "start.bat"
        else:  # Unix/Linux
            script_content = """#!/bin/bash
echo "Starting Pricing System Backend..."
source venv/bin/activate
python app.py
"""
            script_path = self.project_root / "start.sh"
        
        try:
            with open(script_path, 'w') as f:
                f.write(script_content)
            
            if os.name != 'nt':  # Unix/Linux
                os.chmod(script_path, 0o755)
            
            logger.info(f"Startup script created: {script_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create startup script: {e}")
            return False
    
    def create_docker_files(self) -> bool:
        """Create Docker configuration files."""
        logger.info("Creating Docker configuration...")
        
        # Dockerfile
        dockerfile_content = """FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
"""
        
        # docker-compose.yml
        docker_compose_content = """version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/pricing_system
      - SECRET_KEY=your-secret-key-here
      - JWT_SECRET_KEY=your-jwt-secret-key-here
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=pricing_system
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
"""
        
        try:
            # Write Dockerfile
            with open(self.project_root / "Dockerfile", 'w') as f:
                f.write(dockerfile_content)
            
            # Write docker-compose.yml
            with open(self.project_root / "docker-compose.yml", 'w') as f:
                f.write(docker_compose_content)
            
            logger.info("Docker configuration created")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create Docker configuration: {e}")
            return False
    
    def create_production_config(self) -> bool:
        """Create production configuration."""
        logger.info("Creating production configuration...")
        
        # Production settings
        prod_settings_content = """# Production settings
DEBUG=False
LOG_LEVEL=INFO
CORS_ORIGINS=["https://yourdomain.com"]
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60
"""
        
        try:
            with open(self.project_root / "production.env", 'w') as f:
                f.write(prod_settings_content)
            
            logger.info("Production configuration created")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create production configuration: {e}")
            return False
    
    def run_deployment(self) -> bool:
        """Run complete deployment."""
        logger.info("Starting deployment process...")
        
        deployment_steps = [
            ("setup_environment", self.setup_environment),
            ("validate_codebase", self.validate_codebase),
            ("run_tests", self.run_tests),
            ("setup_database", self.setup_database),
            ("create_startup_script", self.create_startup_script),
            ("create_docker_files", self.create_docker_files),
            ("create_production_config", self.create_production_config)
        ]
        
        for step_name, step_func in deployment_steps:
            logger.info(f"Running step: {step_name}")
            if not step_func():
                logger.error(f"Deployment step failed: {step_name}")
                return False
        
        return True
    
    def print_deployment_summary(self):
        """Print deployment summary."""
        print("\n" + "="*60)
        print("DEPLOYMENT SUMMARY")
        print("="*60)
        
        if self.errors:
            print(f"\n❌ DEPLOYMENT ERRORS ({len(self.errors)}):")
            for error in self.errors:
                print(f"  • {error}")
        else:
            print("\n✅ Deployment completed successfully!")
        
        print("\n📁 Generated Files:")
        print("  • start.bat/start.sh - Startup script")
        print("  • Dockerfile - Docker configuration")
        print("  • docker-compose.yml - Docker Compose configuration")
        print("  • production.env - Production environment variables")
        
        print("\n🚀 Next Steps:")
        print("  1. Create .env file from .env.example")
        print("  2. Configure database connection")
        print("  3. Run: python app.py (or use startup script)")
        print("  4. For Docker: docker-compose up")
        
        print("\n" + "="*60)


def main():
    """Main deployment function."""
    project_root = Path(__file__).parent.parent
    
    deployer = DeploymentManager(project_root)
    
    success = deployer.run_deployment()
    deployer.print_deployment_summary()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
