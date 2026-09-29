import requests

url = "http://localhost:8000/api/generate-story"
data = {
    "nome": "Hero",
    "estilo": "anime",
    "universo": "fantasy",
    "genero": "action",
    "descricao": "Teste de erro"
}

try:
    response = requests.post(url, data=data)
    with open("out_8000.txt", "w") as f:
        f.write(f"Status: {response.status_code}\n")
        f.write(f"Body: {response.text}\n")
except Exception as e:
    import traceback
    traceback.print_exc()
