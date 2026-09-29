import urllib.request
import urllib.error

url = "http://localhost:5175/api/generate-story"
try:
    req = urllib.request.Request(url, method="POST")
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", str(e))
