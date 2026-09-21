from fastapi import FastAPI

from app.api.departments import router as department_router
from app.api.employees import router as employee_router
from app.api.policy_documents import router as policy_document_router
from app.api.leave_requests import router as leave_request_router
from app.api.reimbursement_claims import router as reimbursement_router
from app.api.posh_incidents import router as posh_router
from app.api.audit_logs import router as audit_router


app = FastAPI(
    title="HR Conversational Agent"
)


app.include_router(department_router)
app.include_router(employee_router)
app.include_router(policy_document_router)
app.include_router(leave_request_router)
app.include_router(reimbursement_router)
app.include_router(posh_router)
app.include_router(audit_router)


@app.get("/")
def root():
    return {
        "message": "HR Conversational Agent API is running"
    }