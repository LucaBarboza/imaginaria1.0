import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, storage, firestore
from PIL import Image
import io

# Load environment variables
load_dotenv(override=True)

print("Inicializando o Firebase Admin...")
cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
if not cred_path or not os.path.exists(cred_path):
    print("ERRO: FIREBASE_SERVICE_ACCOUNT_KEY não encontrado ou inválido no .env")
    exit(1)

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred, {
    'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET")
})

db = firestore.client()
bucket = storage.bucket()

def compress_blob(blob):
    print(f"  Avaliando imagem: {blob.name}")
    # Só mexe se for jpg, jpeg ou png. Ignora webp que já deve estar bom ou outras coisas
    if not (blob.name.lower().endswith('.jpg') or blob.name.lower().endswith('.jpeg') or blob.name.lower().endswith('.png')):
        print("  Ignorado (já é webp ou formato não suportado).")
        return False
        
    try:
        # Baixa a imagem
        img_bytes = blob.download_as_bytes()
        img = Image.open(io.BytesIO(img_bytes))
        
        # Redimensiona se necessário (Máx 1024x1024)
        MAX_SIZE = 1024
        if img.width > MAX_SIZE or img.height > MAX_SIZE:
            img.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)
            
        # Converte para WebP (lidando com transparência do PNG)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'RGBA':
                background.paste(img, mask=img.split()[-1])
            else:
                 background.paste(img)
            img = background
        else:
            img = img.convert('RGB')
            
        output = io.BytesIO()
        img.save(output, format="WEBP", quality=85)
        optimized_bytes = output.getvalue()
        
        # Envia de volta, mas com nova extensão
        novo_nome = blob.name.rsplit('.', 1)[0] + '.webp'
        novo_blob = bucket.blob(novo_nome)
        
        # Configura as permissões públicas (opcional, dependendo de como você lê)
        novo_blob.upload_from_string(optimized_bytes, content_type='image/webp')
        novo_blob.make_public()
        
        print(f"  [SUCESSO] Convertido e comprimido para: {novo_nome}")
        
        # Deleta a original pesada
        blob.delete()
        print(f"  [DELETADO] Imagem original removida: {blob.name}")
        
        return novo_blob.public_url

    except Exception as e:
        print(f"  [ERRO] Falha ao comprimir {blob.name}: {e}")
        return False

def atualizar_referencias_firestore():
    print("Iniciando varredura no Firestore para atualizar URLs dos personagens...")
    users_ref = db.collection(u'users')
    docs_users = users_ref.stream()
    
    total_modificados = 0
    total_imagens_processadas = 0
    
    for user_doc in docs_users:
        user_id = user_doc.id
        chars_ref = users_ref.document(user_id).collection(u'characters')
        
        for char_doc in chars_ref.stream():
            char_data = char_doc.to_dict()
            fotos = char_data.get('photos', [])
            modificou = False
            novas_fotos = []
            
            for index, foto_url in enumerate(fotos):
                if foto_url and "firebasestorage" in foto_url and (".jpg" in foto_url.lower() or ".png" in foto_url.lower()):
                    # Extrair o path do bucket da URL
                    # URL Típica: https://firebasestorage.googleapis.com/v0/b/BUCKET_NAME/o/PATH_ENCODED?alt=media
                    try:
                        path_start = foto_url.find('/o/') + 3
                        path_end = foto_url.find('?')
                        encoded_path = foto_url[path_start:path_end]
                        import urllib.parse
                        decoded_path = urllib.parse.unquote(encoded_path)
                        
                        blob = bucket.blob(decoded_path)
                        if blob.exists():
                            total_imagens_processadas += 1
                            nova_url = compress_blob(blob)
                            if nova_url:
                                novas_fotos.append(nova_url)
                                modificou = True
                            else:
                                novas_fotos.append(foto_url) # Mantém original se falhou
                        else:
                            print(f"  Blob não existe mais: {decoded_path}")
                            novas_fotos.append(foto_url)
                            
                    except Exception as e:
                        print(f"Erro analisando URL {foto_url}: {e}")
                        novas_fotos.append(foto_url)
                else:
                    # Já é Webp, Data URl ou vazio
                    novas_fotos.append(foto_url)
            
            if modificou:
                # Atualizar o documento
                updates = {'photos': novas_fotos}
                if 'avatar' in char_data and char_data['avatar'] and ("firebasestorage" in char_data['avatar'] and (".jpg" in char_data['avatar'].lower() or ".png" in char_data['avatar'].lower())):
                    # Se mexeu nas fotos, assume que a primeira é o avatar (ou procura a correspondente, vamos simplificar)
                     if len(novas_fotos) > 0:
                         updates['avatar'] = novas_fotos[0]
                
                char_doc.reference.update(updates)
                total_modificados += 1
                print(f"Documento do personagem {char_doc.id} atualizado com novas URLs.")

    print(f"\n--- RESUMO ---")
    print(f"Imagens processadas/comprimidas: {total_imagens_processadas}")
    print(f"Personagens atualizados no Firestore: {total_modificados}")
    print("Processo finalizado!")

if __name__ == "__main__":
    atualizar_referencias_firestore()
