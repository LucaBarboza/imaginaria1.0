import requests

url = "http://localhost:8000/api/generate-story"
data = {
    # Omitting 'nome' which is a required form field! This should trigger 422
    "estilo": "anime",
    "universo": "fantasy",
    "genero": "action",
}

try:
    response = requests.post(url, data=data)
    with open("out_error.txt", "w") as f:
        f.write(f"Status: {response.status_code}\n")
        f.write(f"Body: {response.text}\n")
except Exception as e:
    pass
