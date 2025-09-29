"""
Base service class with common CRUD operations.
"""

from typing import Type, TypeVar, Generic, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import and_, or_, desc, asc
from uuid import UUID
import logging

from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType")


class BaseService(Generic[ModelType]):
    """Base service class with common CRUD operations."""
    
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    def create(self, db: Session, obj_in: Dict[str, Any]) -> ModelType:
        """
        Create a new record.
        
        Args:
            db: Database session
            obj_in: Dictionary with data to create
            
        Returns:
            Created model instance
            
        Raises:
            DatabaseError: If creation fails
        """
        try:
            db_obj = self.model(**obj_in)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            logger.info(f"Created {self.model.__name__} with ID: {getattr(db_obj, 'id', 'unknown')}")
            return db_obj
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error creating {self.model.__name__}: {str(e)}")
            raise DatabaseError(f"Failed to create {self.model.__name__}", context={"error": str(e)})
    
    def get(self, db: Session, id: UUID) -> Optional[ModelType]:
        """
        Get a record by ID.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            Model instance or None if not found
        """
        try:
            return db.query(self.model).filter(getattr(self.model, 'id') == id).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting {self.model.__name__} with ID {id}: {str(e)}")
            raise DatabaseError(f"Failed to get {self.model.__name__}", context={"id": str(id), "error": str(e)})
    
    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        order_direction: str = "asc"
    ) -> List[ModelType]:
        """
        Get multiple records with pagination and filtering.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Dictionary of filters to apply
            order_by: Field to order by
            order_direction: Order direction (asc/desc)
            
        Returns:
            List of model instances
        """
        try:
            query = db.query(self.model)
            
            # Apply filters
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field) and value is not None:
                        if isinstance(value, list):
                            query = query.filter(getattr(self.model, field).in_(value))
                        else:
                            query = query.filter(getattr(self.model, field) == value)
            
            # Apply ordering
            if order_by and hasattr(self.model, order_by):
                if order_direction.lower() == "desc":
                    query = query.order_by(desc(getattr(self.model, order_by)))
                else:
                    query = query.order_by(asc(getattr(self.model, order_by)))
            
            return query.offset(skip).limit(limit).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting multiple {self.model.__name__}: {str(e)}")
            raise DatabaseError(f"Failed to get {self.model.__name__} list", context={"error": str(e)})
    
    def count(self, db: Session, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count records with optional filtering.
        
        Args:
            db: Database session
            filters: Dictionary of filters to apply
            
        Returns:
            Number of records
        """
        try:
            query = db.query(self.model)
            
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field) and value is not None:
                        if isinstance(value, list):
                            query = query.filter(getattr(self.model, field).in_(value))
                        else:
                            query = query.filter(getattr(self.model, field) == value)
            
            return query.count()
        except SQLAlchemyError as e:
            logger.error(f"Error counting {self.model.__name__}: {str(e)}")
            raise DatabaseError(f"Failed to count {self.model.__name__}", context={"error": str(e)})
    
    def update(self, db: Session, id: UUID, obj_in: Dict[str, Any]) -> Optional[ModelType]:
        """
        Update a record.
        
        Args:
            db: Database session
            id: Record ID
            obj_in: Dictionary with data to update
            
        Returns:
            Updated model instance or None if not found
            
        Raises:
            DatabaseError: If update fails
            NotFoundError: If record not found
        """
        try:
            db_obj = self.get(db, id)
            if not db_obj:
                raise NotFoundError(f"{self.model.__name__} not found", context={"id": str(id)})
            
            for field, value in obj_in.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            db.commit()
            db.refresh(db_obj)
            logger.info(f"Updated {self.model.__name__} with ID: {id}")
            return db_obj
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error updating {self.model.__name__} with ID {id}: {str(e)}")
            raise DatabaseError(f"Failed to update {self.model.__name__}", context={"id": str(id), "error": str(e)})
    
    def delete(self, db: Session, id: UUID) -> bool:
        """
        Delete a record.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            True if deleted, False if not found
            
        Raises:
            DatabaseError: If deletion fails
        """
        try:
            db_obj = self.get(db, id)
            if not db_obj:
                return False
            
            db.delete(db_obj)
            db.commit()
            logger.info(f"Deleted {self.model.__name__} with ID: {id}")
            return True
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error deleting {self.model.__name__} with ID {id}: {str(e)}")
            raise DatabaseError(f"Failed to delete {self.model.__name__}", context={"id": str(id), "error": str(e)})
    
    def exists(self, db: Session, id: UUID) -> bool:
        """
        Check if a record exists.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            True if exists, False otherwise
        """
        try:
            return db.query(self.model).filter(getattr(self.model, 'id') == id).first() is not None
        except SQLAlchemyError as e:
            logger.error(f"Error checking existence of {self.model.__name__} with ID {id}: {str(e)}")
            raise DatabaseError(f"Failed to check existence of {self.model.__name__}", context={"id": str(id), "error": str(e)})
