from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.policy_document import PolicyDocument
from app.schemas.policy_document import (
    PolicyDocumentCreate,
    PolicyDocumentResponse
)


router = APIRouter(
    prefix="/policy-documents",
    tags=["Policy Documents"]
)


@router.get(
    "/",
    response_model=list[PolicyDocumentResponse]
)
def get_policy_documents(
    db: Session = Depends(get_db)
):
    return db.query(PolicyDocument).all()


@router.get(
    "/{document_id}",
    response_model=PolicyDocumentResponse
)
def get_policy_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = db.query(PolicyDocument).filter(
        PolicyDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Policy document not found"
        )

    return document


@router.post(
    "/",
    response_model=PolicyDocumentResponse,
    status_code=201
)
def create_policy_document(
    document_data: PolicyDocumentCreate,
    db: Session = Depends(get_db)
):
    document = PolicyDocument(
        title=document_data.title,
        category=document_data.category,
        version=document_data.version,
        file_path=document_data.file_path,
        target_audience=document_data.target_audience,
        effective_date=document_data.effective_date,
        index_status=document_data.index_status,
        uploaded_by_id=document_data.uploaded_by_id,
        is_active=document_data.is_active
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.put(
    "/{document_id}",
    response_model=PolicyDocumentResponse
)
def update_policy_document(
    document_id: int,
    document_data: PolicyDocumentCreate,
    db: Session = Depends(get_db)
):
    document = db.query(PolicyDocument).filter(
        PolicyDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Policy document not found"
        )

    for field, value in document_data.model_dump().items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)

    return document


@router.delete("/{document_id}")
def delete_policy_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = db.query(PolicyDocument).filter(
        PolicyDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Policy document not found"
        )

    db.delete(document)
    db.commit()

    return {
        "message": "Policy document deleted successfully"
    }