import requests
import json

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
    print("Status:", response.status_code)
    print("Body:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
