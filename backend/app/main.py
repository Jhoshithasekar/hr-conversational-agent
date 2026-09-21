from fastapi import FastAPI

app = FastAPI(title="HR Conversational Agent")


@app.get("/")
def root():
    return {"message": "HR Conversational Agent API is running"}