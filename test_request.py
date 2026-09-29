import requests

url = "http://localhost:8001/api/generate-story"
data = {
    "nome": "Hero",
    "estilo": "anime",
    "universo": "fantasy",
    "genero": "action",
    "descricao": "Teste de erro",
    # Frontend may send image_urls_json missing if empty?
}

try:
    response = requests.post(url, data=data)
    print("Status:", response.status_code)
    print("Body:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
