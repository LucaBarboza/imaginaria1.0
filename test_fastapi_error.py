from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/test", response_model=str)
def test():
    # Return a dict when schema expects str to force ResponseValidationError
    return {"wrong": "type"}

client = TestClient(app)

response = client.get("/test")
print("Status:", response.status_code)
print("Headers:", response.headers.get('content-type'))
print("Body:", response.text)
