"""
Base controller class with common HTTP operations.
"""

from typing import Type, TypeVar, Generic, Optional, List, Dict, Any
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.base import BaseService
from schemas.base import PaginationSchema, PaginatedResponseSchema
from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")
ResponseSchemaType = TypeVar("ResponseSchemaType")


class BaseController(Generic[ModelType, CreateSchemaType, UpdateSchemaType, ResponseSchemaType]):
    """Base controller class with common HTTP operations."""
    
    def __init__(self, service: BaseService[ModelType], response_schema: Type[ResponseSchemaType]):
        self.service = service
        self.response_schema = response_schema
    
    def create(
        self, 
        obj_in: CreateSchemaType, 
        db: Session = Depends(get_db)
    ) -> ResponseSchemaType:
        """
        Create a new record.
        
        Args:
            obj_in: Creation data
            db: Database session
            
        Returns:
            Created record response
        """
        try:
            obj_data = obj_in.model_dump()
            db_obj = self.service.create(db, obj_data)
            return self.response_schema.model_validate(db_obj)
        except (DatabaseError, ValidationError) as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Unexpected error in create: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get(
        self, 
        id: UUID, 
        db: Session = Depends(get_db)
    ) -> ResponseSchemaType:
        """
        Get a record by ID.
        
        Args:
            id: Record ID
            db: Database session
            
        Returns:
            Record response
        """
        try:
            db_obj = self.service.get(db, id)
            if not db_obj:
                raise HTTPException(status_code=404, detail="Record not found")
            return self.response_schema.model_validate(db_obj)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in get: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_multi(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        order_direction: str = Query("asc", regex="^(asc|desc)$", description="Order direction"),
        db: Session = Depends(get_db)
    ) -> List[ResponseSchemaType]:
        """
        Get multiple records with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Dictionary of filters to apply
            order_by: Field to order by
            order_direction: Order direction
            db: Database session
            
        Returns:
            List of record responses
        """
        try:
            db_objs = self.service.get_multi(
                db, 
                skip=skip, 
                limit=limit, 
                filters=filters,
                order_by=order_by,
                order_direction=order_direction
            )
            return [self.response_schema.model_validate(db_obj) for db_obj in db_objs]
        except Exception as e:
            logger.error(f"Unexpected error in get_multi: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_paginated(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        limit: int = Query(10, ge=1, le=100, description="Number of records per page"),
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        order_direction: str = Query("asc", regex="^(asc|desc)$", description="Order direction"),
        db: Session = Depends(get_db)
    ) -> PaginatedResponseSchema:
        """
        Get paginated records.
        
        Args:
            page: Page number
            limit: Number of records per page
            filters: Dictionary of filters to apply
            order_by: Field to order by
            order_direction: Order direction
            db: Database session
            
        Returns:
            Paginated response
        """
        try:
            skip = (page - 1) * limit
            db_objs = self.service.get_multi(
                db, 
                skip=skip, 
                limit=limit, 
                filters=filters,
                order_by=order_by,
                order_direction=order_direction
            )
            total = self.service.count(db, filters)
            pages = (total + limit - 1) // limit
            
            pagination = PaginationSchema(
                page=page,
                limit=limit,
                total=total,
                pages=pages
            )
            
            items = [self.response_schema.model_validate(db_obj) for db_obj in db_objs]
            
            return PaginatedResponseSchema(
                items=items,
                pagination=pagination
            )
        except Exception as e:
            logger.error(f"Unexpected error in get_paginated: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update(
        self, 
        id: UUID, 
        obj_in: UpdateSchemaType, 
        db: Session = Depends(get_db)
    ) -> ResponseSchemaType:
        """
        Update a record.
        
        Args:
            id: Record ID
            obj_in: Update data
            db: Database session
            
        Returns:
            Updated record response
        """
        try:
            obj_data = obj_in.model_dump(exclude_unset=True)
            db_obj = self.service.update(db, id, obj_data)
            if not db_obj:
                raise HTTPException(status_code=404, detail="Record not found")
            return self.response_schema.model_validate(db_obj)
        except HTTPException:
            raise
        except (DatabaseError, ValidationError) as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Unexpected error in update: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def delete(
        self, 
        id: UUID, 
        db: Session = Depends(get_db)
    ) -> Dict[str, str]:
        """
        Delete a record.
        
        Args:
            id: Record ID
            db: Database session
            
        Returns:
            Success message
        """
        try:
            success = self.service.delete(db, id)
            if not success:
                raise HTTPException(status_code=404, detail="Record not found")
            return {"message": "Record deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in delete: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
