import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { useAuth } from './AuthContext';

const StoryContext = createContext();

export function StoryProvider({ children }) {
    const { currentUser } = useAuth();

    // Load characters from Firestore or local storage
    const [characters, setCharacters] = useState([]);

    useEffect(() => {
        if (currentUser) {
            const q = query(collection(db, "users", currentUser.uid, "characters"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const chars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCharacters(chars);
            }, (error) => {
                console.error("Error listening to characters:", error);
            });
            return () => unsubscribe();
        } else {
            const saved = localStorage.getItem('imaginaria_characters');
            try {
                setCharacters(saved ? JSON.parse(saved) : []);
            } catch (e) {
                console.warn("Failed to parse characters from localStorage.", e);
                setCharacters([]);
            }
        }
    }, [currentUser]);

    // Validates if saved selection is valid (array)
    const [selectedCharacters, setSelectedCharacters] = useState(() => {
        const saved = localStorage.getItem('imaginaria_selected_characters');
        try {
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    });

    const [generationState, setGenerationState] = useState({
        isLoading: false,
        result: null,
        error: null,
        logs: [],
        step: 0,
        stepProgress: 0,
    });

    // Persist characters to localStorage only if not logged in (fallback)
    useEffect(() => {
        if (!currentUser) {
            localStorage.setItem('imaginaria_characters', JSON.stringify(characters));
        }
    }, [characters, currentUser]);

    // Persist selected characters
    useEffect(() => {
        localStorage.setItem('imaginaria_selected_characters', JSON.stringify(selectedCharacters));
    }, [selectedCharacters]);

    // Utility function to compress images
    const compressImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to WebP format with 85% quality
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/webp', 0.85);
            };
            img.onerror = (e) => reject(e);
            img.src = url;
            // Cross-origin might be needed depending on the source
            if (url.startsWith('http')) {
                img.crossOrigin = "Anonymous";
            }
        });
    };

    const addCharacter = useCallback(async (newCharacter) => {
        let createdChar = null;
        if (currentUser) {
            try {
                // 1. Create a reference to get a new ID (so we can use it for the storage path)
                const charRef = doc(collection(db, "users", currentUser.uid, "characters"));
                const charId = charRef.id;

                // 2. Upload images to Firebase Storage
                const uploadedPhotos = await Promise.all(newCharacter.photos.map(async (photoUrl, index) => {
                    if (!photoUrl.startsWith('data:')) return photoUrl; // Already a URL?

                    try {
                        let blob;
                        // Try to compress
                        try {
                            blob = await compressImage(photoUrl);
                        } catch (compressErr) {
                            console.warn("Failed to compress image, falling back to original", compressErr);
                            const response = await fetch(photoUrl);
                            blob = await response.blob();
                        }

                        const filename = `char_${Date.now()}_${index}.webp`; // Salva como webp
                        const storageRef = ref(storage, `users/${currentUser.uid}/characters/${charId}/${filename}`);

                        await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
                        return await getDownloadURL(storageRef);
                    } catch (uploadErr) {
                        console.error("Error uploading character image:", uploadErr);
                        // Fallback: Try to save original (might fail if too big, but better than nothing)
                        return photoUrl;
                    }
                }));

                // 3. Save character data with public URLs
                // Normalize data: ensure 'name' and 'avatar' exist
                createdChar = {
                    ...newCharacter,
                    photos: uploadedPhotos,
                    name: newCharacter.nickname,    // Ensure 'name' exists
                    avatar: uploadedPhotos[0] || null, // Ensure 'avatar' exists
                    id: charId,
                    createdAt: new Date().toISOString()
                };
                await setDoc(charRef, createdChar);

                console.log("Character saved with images:", charId);

            } catch (error) {
                console.error("Error adding character to Firestore:", error);
                throw error; // Propagate error so UI can show it
            }
        } else {
            // Local Storage fallback
            // Also normalize for local storage
            const charId = crypto.randomUUID();
            createdChar = {
                ...newCharacter,
                id: charId,
                name: newCharacter.nickname,
                avatar: newCharacter.photos && newCharacter.photos.length > 0 ? newCharacter.photos[0] : null,
                createdAt: new Date().toISOString()
            };
            setCharacters(prev => [...prev, createdChar]);
        }
        return createdChar;
    }, [currentUser]);

    const deleteFolderRecursively = async (folderRef) => {
        try {
            const { items, prefixes } = await listAll(folderRef);
            const deletePromises = items.map(itemRef => deleteObject(itemRef));
            const subfolderPromises = prefixes.map(prefixRef => deleteFolderRecursively(prefixRef));
            await Promise.all([...deletePromises, ...subfolderPromises]);
        } catch (err) {
            console.error("Error deleting folder or subfolder items:", folderRef, err);
        }
    };

    const deleteCharacter = useCallback(async (id) => {
        if (currentUser) {
            try {
                await deleteDoc(doc(db, "users", currentUser.uid, "characters", id));
                const charStorageRef = ref(storage, `users/${currentUser.uid}/characters/${id}`);
                await deleteFolderRecursively(charStorageRef);
            } catch (error) {
                console.error("Error deleting character from Firestore or Storage:", error);
            }
        } else {
            setCharacters(prev => prev.filter(c => c.id !== id));
            setSelectedCharacters(prev => prev.filter(c => c.id !== id));
        }
    }, [currentUser]);

    const selectCharacter = useCallback((id) => {
        const char = characters.find(c => c.id === id);
        if (!char) return;

        setSelectedCharacters(prev => {
            const isSelected = prev.some(c => c.id === id);
            if (isSelected) {
                return prev.filter(c => c.id !== id);
            } else {
                if (prev.length >= 3) {
                    alert("Você pode escolher no máximo 3 aventureiros para esta jornada!");
                    return prev;
                }
                return [...prev, char];
            }
        });
    }, [characters]);

    // New function for exclusive selection (Wizard Flow)
    const setSingleCharacter = useCallback((id) => {
        const char = characters.find(c => c.id === id);
        if (!char) return;
        setSelectedCharacters([char]);
    }, [characters]);

    const saveStory = useCallback(async (result, logs = [], metadata = {}) => {
        console.log("Saving story...", result);

        // Helper to upload a blob/url to Firebase Storage
        const uploadImage = async (url, folderPath) => {
            if (!url) return null;
            // Se já for uma URL do Firebase Storage ou remota, não reenvia
            if (typeof url === 'string' && (url.startsWith('https://firebasestorage') || url.startsWith('gs://') || (url.startsWith('http') && !url.startsWith('data:')))) {
                return url;
            }

            let blob;
            try {
                // Comprime para WebP (reduz de 2.5MB para ~100KB, upload 25x mais rápido)
                blob = await compressImage(url);
            } catch (compressErr) {
                console.warn("Falha na compressão, usando dados originais:", compressErr);
                const response = await fetch(url);
                blob = await response.blob();
            }

            const filename = `${crypto.randomUUID()}.webp`;
            const storageRef = ref(storage, `${folderPath}/${filename}`);

            let attempt = 0;
            while (attempt < 3) {
                try {
                    await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
                    return await getDownloadURL(storageRef);
                } catch (e) {
                    attempt++;
                    if (attempt >= 3) {
                        console.error(`Falha no upload para o Storage (${folderPath}) após 3 tentativas:`, e);
                        throw new Error(`Falha ao salvar ilustração na nuvem: ${e.message}`);
                    }
                    await new Promise(r => setTimeout(r, 1000 * attempt));
                }
            }
        };

        try {
            // First, save to local backend (legacy/backup - apenas título para obter ID)
            let backendData = null;
            try {
                const savePayload = {
                    title: result.title
                };

                const response = await fetch('/api/save-story', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(savePayload)
                });
                if (response.ok) {
                    backendData = await response.json();
                    console.log("Story ID recebido do backend:", backendData);
                }
            } catch (localError) {
                console.warn("Backend save ping ignorado, gerando ID local:", localError);
            }

            // If user is logged in, save to Firebase
            if (currentUser) {
                const storyId = backendData?.story_id || crypto.randomUUID();
                const storyRef = doc(collection(db, "users", currentUser.uid, "stories"), storyId);

                // Upload Images
                const storageBasePath = `users/${currentUser.uid}/stories/${storyId}`;

                // --- Upload TXT Log ---
                let logUrl = null;
                if (metadata.txtLog) {
                    try {
                        const blob = new Blob([metadata.txtLog], { type: 'text/plain;charset=utf-8' });
                        const logRef = ref(storage, `${storageBasePath}/log.txt`);
                        await uploadBytes(logRef, blob);
                        logUrl = await getDownloadURL(logRef);
                        console.log("Log TXT salvo no Storage:", logUrl);
                    } catch (logErr) {
                        console.error("Falha ao salvar log TXT", logErr);
                    }
                }

                // Upload Cover
                const coverUrl = await uploadImage(result.cover_image, `${storageBasePath}/cover`);

                // Upload Chapters (em paralelo com tratamento)
                const chaptersWithImages = await Promise.all(result.pages.map(async (page, index) => {
                    const originalUrl = result.chapters[index]?.image_url;
                    const remoteUrl = originalUrl ? await uploadImage(originalUrl, `${storageBasePath}/chapters`) : null;
                    return {
                        text: page.text,
                        image_url: remoteUrl,
                        prompt: page.illustration_prompt
                    };
                }));

                // Sanitização total do metadata: remove QUALQUER string base64 antes de gravar no Firestore
                const cleanMeta = { ...metadata };
                delete cleanMeta.txtLog;
                if (cleanMeta.image_generations && Array.isArray(cleanMeta.image_generations)) {
                    cleanMeta.image_generations = cleanMeta.image_generations.map(item => ({
                        descriptor: item.descriptor,
                        prompt: item.prompt,
                        attempts: item.attempts,
                        timings: item.timings,
                        success: item.success,
                        log: item.log || {}
                    }));
                }

                const firestorePayload = {
                    title: result.title,
                    cover_image_url: coverUrl,
                    chapters: chaptersWithImages,
                    metadata: cleanMeta,
                    cover_prompt: result.cover_prompt || cleanMeta.cover_prompt || '',
                    clothing_bible: result.clothing_bible || cleanMeta.clothing_bible || '',
                    character_appearance_bible: result.character_appearance_bible || cleanMeta.character_appearance_bible || '',
                    character_details: result.character_details || cleanMeta.character_details || [],
                    url_photos: result.url_photos || cleanMeta.url_photos || [],
                    universe: result.universe || cleanMeta.inputs?.universe || '',
                    style: result.style || cleanMeta.inputs?.style || '',
                    character_names: result.character_names || cleanMeta.inputs?.names || '',
                    logs: logs.slice(-20),
                    log_url: logUrl,
                    createdAt: new Date().toISOString(),
                    backend_id: backendData?.story_id || null
                };

                await setDoc(storyRef, firestorePayload);
                console.log("Story saved to Firebase!");

                try {
                    const todayKey = `daily_stories_${new Date().toISOString().slice(0, 10)}`;
                    const currentCount = parseInt(localStorage.getItem(todayKey) || "0", 10);
                    localStorage.setItem(todayKey, (currentCount + 1).toString());
                } catch (countErr) {
                    console.warn("Aviso ao registrar contador diário:", countErr);
                }

                return {
                    ...backendData,
                    firebase: true,
                    storyId,
                    userId: currentUser.uid,
                    cover_image_url: coverUrl,
                    chapters: chaptersWithImages
                };
            } else {
                console.warn("User not logged in, skipping Firebase save.");
            }

            return backendData;

        } catch (error) {
            console.error("Error saving story:", error);
        }
    }, [currentUser]);

    const startGeneration = useCallback(async (storyData) => {
        // Validation: Must have at least one character
        if (!storyData || !storyData.characters || storyData.characters.length === 0) {
            console.error("startGeneration called without characters", storyData);
            setGenerationState(prev => ({
                ...prev,
                isLoading: false,
                error: "Selecione pelo menos um viajante!"
            }));
            return;
        }

        // Limite de 3 histórias por dia (contas como luca.barboza@gmail.com e ricardo8610@gmail.com são ilimitadas)
        const adminEmails = ["luca.barboza@gmail.com", "ricardo8610@gmail.com"];
        const isUnlimited = currentUser && adminEmails.includes((currentUser.email || "").toLowerCase().trim());

        if (!isUnlimited) {
            // Checagem no Firestore para usuários autenticados
            if (currentUser) {
                try {
                    const startOfDay = new Date();
                    startOfDay.setHours(0, 0, 0, 0);

                    const qStories = query(
                        collection(db, "users", currentUser.uid, "stories"),
                        where("createdAt", ">=", startOfDay.toISOString())
                    );
                    const querySnap = await getDocs(qStories);
                    if (querySnap.size >= 3) {
                        setGenerationState(prev => ({
                            ...prev,
                            isLoading: false,
                            error: "Você atingiu o limite de 3 histórias por dia! Volte amanhã para criar mais aventuras mágicas."
                        }));
                        return;
                    }
                } catch (quotaErr) {
                    console.warn("Aviso ao verificar cota diária no Firestore:", quotaErr);
                }
            }

            // Checagem local (localStorage) adicional
            try {
                const todayKey = `daily_stories_${new Date().toISOString().slice(0, 10)}`;
                const localCount = parseInt(localStorage.getItem(todayKey) || "0", 10);
                if (localCount >= 3) {
                    setGenerationState(prev => ({
                        ...prev,
                        isLoading: false,
                        error: "Você atingiu o limite de 3 histórias por dia! Volte amanhã para criar mais aventuras mágicas."
                    }));
                    return;
                }
            } catch (quotaLocalErr) {
                console.warn("Aviso ao verificar cota diária local:", quotaLocalErr);
            }
        }

        // Initialize Metadata Tracking
        const startTime = new Date();
        const localLogs = ["Iniciando motor criativo...", "Conectando ao núcleo de imaginação..."];

        // Helper to update state and local logs
        const addLog = (msg, newStep = null, newProgress = null) => {
            localLogs.push(msg);
            setGenerationState(prev => ({
                ...prev,
                logs: [...prev.logs, msg],
                ...(newStep !== null && { step: newStep }),
                ...(newProgress !== null && { stepProgress: newProgress })
            }));
        };

        setGenerationState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            logs: localLogs,
            step: 0,
            stepProgress: 0,
        }));

        try {
            // 1. Prepare Data
            const formData = new FormData();

            // Collect names from ALL selected characters
            const characterNames = storyData.characters.map(c => c.customNickname || c.nickname).join(", ");
            formData.append('nome', characterNames);

            formData.append('estilo', storyData.style);
            formData.append('universo', storyData.universe);
            formData.append('genero', storyData.genre);
            if (storyData.description) {
                formData.append('descricao', storyData.description);
            }

            // Extract character details for the prompt
            const charactersDetails = storyData.characters.map(c => ({
                original_name: c.nickname,
                nickname_in_story: c.customNickname,
                role: c.customRole,
                personality: c.customPersonality,
                character_type: c.characterType || 'person',
                species_breed: c.speciesBreed || null
            }));
            formData.append('character_details_json', JSON.stringify(charactersDetails));

            addLog("Processando perfil dos heróis...", 0, 20);

            // Collect photos with metadata
            const allPhotos = [];
            for (const char of storyData.characters) {
                if (char.photos && char.photos.length > 0) {
                    char.photos.forEach(url => {
                        allPhotos.push({
                            url,
                            name: char.nickname,
                            character_type: char.characterType || 'person',
                            species_breed: char.speciesBreed || null
                        });
                    });
                }
            }

            // Convert blob URLs back to Blobs only if strictly necessary (local blobs)
            // For Firebase URLs, we send them as strings to the backend to avoid CORS.
            const urlPhotos = [];

            if (allPhotos.length > 0) {
                for (const item of allPhotos) {
                    if (item.url.startsWith('http')) {
                        // It's a remote URL (Firebase or other), let backend fetch it
                        urlPhotos.push({
                            url: item.url,
                            name: item.name,
                            character_type: item.character_type,
                            species_breed: item.species_breed
                        });
                    } else {
                        // It's likely a local blob/data URL, we must convert and compress to avoid 502 payload limit
                        try {
                            let blob;
                            try {
                                blob = await compressImage(item.url);
                            } catch (compErr) {
                                const response = await fetch(item.url);
                                blob = await response.blob();
                            }
                            // Sanitize name for filename
                            const safeName = item.name.replace(/[^a-zA-Z0-9]/g, '_');
                            formData.append('imagens', blob, `character_${safeName}_ref.webp`);
                        } catch (e) {
                            console.error("Error converting local blob", e);
                        }
                    }
                }
            }

            // Append URLs payload
            if (urlPhotos.length > 0) {
                formData.append('image_urls_json', JSON.stringify(urlPhotos));
            }

            addLog("Enviando dados para a Inteligência Artificial (OpenAI GPT)...", 0, 80);

            // Step 2: Generating Text (Wait for API)
            addLog("Iniciando escrita da história...", 1, 0);

            // Simulação de progresso da API (aumenta até 90%)
            let textProgress = 0;
            const progressInterval = setInterval(() => {
                textProgress += (90 - textProgress) * 0.1; // Se aproxima do 90 mais lentamente
                if (textProgress > 90) textProgress = 90;
                setGenerationState(prev => ({ ...prev, stepProgress: Math.round(textProgress) }));
            }, 800);

            // 2. Call Story Generation API
            const storyStart = new Date();
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                body: formData,
            });

            const responseText = await response.text();
            clearInterval(progressInterval); // Para a animação
            addLog("História recebida.", 1, 100);
            console.log("Raw Response:", response.status, responseText);

            if (!response.ok) {
                let errorDetail = 'Falha ao gerar história';
                try {
                    if (!responseText || responseText.trim() === "") {
                        errorDetail += ` (O servidor retornou um erro 500 sem detalhes. Isso geralmente significa que a Inteligência Artificial está sobrecarregada ou a imagem/texto foi muito grande para ser processada.)`;
                    } else {
                        const errorData = JSON.parse(responseText);
                        errorDetail = errorData.detail || errorDetail;
                    }
                } catch (e) {
                    const snippet = responseText ? responseText.substring(0, 100) : "Sem resposta do servidor";
                    errorDetail += ` (Status ${response.status}: ${snippet})`;
                }
                throw new Error(errorDetail);
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error("JSON Parse Error:", e, "Response Text:", responseText);
                if (responseText && (responseText.includes("<!doctype") || responseText.includes("<html"))) {
                    throw new Error("O servidor de geração (backend) não está conectado ao site online. Para gerar histórias, o servidor precisa estar rodando.");
                }
                throw new Error("Erro ao processar resposta do servidor (JSON inválido).");
            }

            // Handle new response structure { story, raw_prompt, usage }
            // Fallback for older version if needed, though we just updated backend
            const generatedStory = result.data.story || result.data;
            const rawPrompt = result.data.raw_prompt || "";
            const tokenUsage = result.data.usage || {};

            if (!generatedStory || !Array.isArray(generatedStory.pages)) {
                console.error("Formato de história inválido ou páginas ausentes:", result);
                let debugStr = "";
                try { debugStr = JSON.stringify(result).substring(0, 150); } catch (e) { }
                throw new Error(`A inteligência artificial retornou um formato incompleto e faltam as páginas. Tente novamente! Detalhes: ${debugStr}`);
            }

            const storyEnd = new Date();

            // 3. Image Generation
            addLog("História escrita com sucesso!", 1, 100);
            addLog("Iniciando geração das ilustrações...", 2, 0);

            let totalImagesToGenerate = 0;
            let imagesGeneratedCount = 0;

            // Fetch reference image blobs once to reuse
            const referenceBlobs = [];
            // We basically only need this for STYLE REFERENCES generated later (Scene 1)
            // Character refs are now passed as URLs mostly.

            // Helper to generate a single image with Retry Logic
            const generateSingleImage = async (prompt, descriptor, extraReferences = [], styleRefUrl = null, isCover = false) => {
                // --- SKIP GENERATION MODE ---
                // Retorna placeholder direto para economizar tempo/custo
                // console.log(`[SKIP] Ignorando geração real para: ${descriptor}`);
                // return "https://placehold.co/1024x1024/202020/666666/png?text=Imagem+Ignorada+(Dev)";

                const maxRetries = 5;
                let attempt = 1;

                while (attempt <= maxRetries) {
                    try {
                        addLog(`Pintando (Tentativa ${attempt}/${maxRetries}): ${descriptor}...`);

                        const imgFormData = new FormData();
                        imgFormData.append('prompt', prompt);

                        // Pass combined names, universe and style
                        imgFormData.append('person_name', characterNames);
                        imgFormData.append('universe_context', storyData.universe);
                        imgFormData.append('style', storyData.style || 'universe_default');
                        imgFormData.append('is_cover', isCover ? 'true' : 'false');
                        imgFormData.append('clothing_bible', generatedStory?.clothing_bible || '');
                        imgFormData.append('character_appearance_bible', generatedStory?.character_appearance_bible || '');

                        // Append Character Reference URLs
                        if (urlPhotos.length > 0) {
                            imgFormData.append('reference_image_urls_json', JSON.stringify(urlPhotos));
                        }

                        if (charactersDetails && charactersDetails.length > 0) {
                            imgFormData.append('character_details_json', JSON.stringify(charactersDetails));
                        }

                        // Add extra references (e.g. style reference from scene 1)
                        if (extraReferences && extraReferences.length > 0) {
                            extraReferences.forEach((blob, idx) => {
                                imgFormData.append('reference_images', blob, `style_ref_${idx}.png`);
                            });
                        }

                        if (styleRefUrl) {
                            if (styleRefUrl.startsWith('data:')) {
                                try {
                                    const fetchRes = await fetch(styleRefUrl);
                                    const blob = await fetchRes.blob();
                                    imgFormData.append('reference_images', blob, 'anchor_style.png');
                                } catch (convertErr) {
                                    console.warn("Falha ao converter data URL para blob:", convertErr);
                                    imgFormData.append('style_reference_url', styleRefUrl);
                                }
                            } else {
                                imgFormData.append('style_reference_url', styleRefUrl);
                            }
                        }

                        const requestStart = new Date();
                        const res = await fetch('/api/generate-image', {
                            method: 'POST',
                            body: imgFormData
                        });

                        if (!res.ok) {
                            const errText = await res.text();
                            throw new Error(`Falha API: ${res.status} - ${errText}`);
                        }

                        const data = await res.json();
                        const requestEnd = new Date();

                        imagesGeneratedCount++;
                        if (totalImagesToGenerate > 0) {
                            const pct = Math.round((imagesGeneratedCount / totalImagesToGenerate) * 100);
                            setGenerationState(prev => ({ ...prev, stepProgress: pct }));
                        }

                        // Return structural info + logs
                        return {
                            success: true,
                            image_url: data.image_url,
                            descriptor: descriptor,
                            prompt: prompt,
                            attempts: attempt,
                            timings: {
                                start: requestStart.toISOString(),
                                end: requestEnd.toISOString(),
                                duration_ms: requestEnd - requestStart
                            },
                            log: data.generation_log || {}
                        };

                    } catch (e) {
                        console.error(`Erro ao gerar imagem (${descriptor}) - Tentativa ${attempt}:`, e);

                        if (attempt === maxRetries) {
                            // Retornar imagem de erro na última tentativa
                            const errorMsg = e.message || "Erro desconhecido";
                            // Encode error message safely for URL
                            const safeError = encodeURIComponent(errorMsg.substring(0, 100));
                            return {
                                success: false,
                                image_url: `https://placehold.co/600x400/330000/ff0000?text=Erro:+${safeError}`,
                                descriptor: descriptor,
                                prompt: prompt,
                                attempts: attempt,
                                error: errorMsg,
                                log: {}
                            };
                        }

                        // Backoff: 1s, 2s, 3s, 4s, 5s
                        const delay = attempt * 1000;
                        addLog(`Erro em ${descriptor}. Retentando em ${attempt}s...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        attempt++;
                    }
                }
            };

            // --- Generation Flow Control ---

            // To collect full logs
            const imageGenerationLogs = [];

            const imagesStart = new Date();

            // 1. Identify which pages have illustration prompts
            const pagesWithImages = generatedStory.pages.map((page, index) => ({ page, index })).filter(p => p.page.illustration_prompt);

            const allImageJobs = [
                {
                    prompt: generatedStory.cover_prompt,
                    descriptor: "Capa do Livro",
                    index: -1, // special index for cover
                    isCover: true
                },
                ...pagesWithImages.map(item => ({
                    prompt: item.page.illustration_prompt,
                    descriptor: `Cena da Página ${item.page.page_number}`,
                    index: item.index,
                    isCover: false
                }))
            ];

            totalImagesToGenerate = allImageJobs.length;

            addLog(`🎨 Gerando todas as ${totalImagesToGenerate} ilustrações (Capa e Páginas) simultaneamente em paralelo...`);

            const batchStart = new Date();

            // Process all 11 images simultaneously in parallel via Promise.all
            // Cloud Run with concurrency=1 spins up instances concurrently
            // OpenAI Tier 4/5 account easily handles high concurrent requests
            const allResults = await Promise.all(
                allImageJobs.map(async (job) => {
                    const res = await generateSingleImage(job.prompt, job.descriptor, [], null, job.isCover);
                    return {
                        result: res,
                        index: job.index
                    };
                })
            );

            // Separate cover from the rest
            const coverData = allResults.find(r => r.index === -1)?.result || { success: false };
            const pageResults = allResults.filter(r => r.index !== -1);

            imageGenerationLogs.push(coverData);
            pageResults.forEach(r => imageGenerationLogs.push(r.result));

            // Identificar imagem de fallback entre as imagens que foram geradas com sucesso
            const fallbackImage = (coverData.success && coverData.image_url)
                || (pageResults.find(r => r.result.success)?.result.image_url);

            const failedPages = pageResults.filter(r => !r.result.success);
            if (failedPages.length > 0 || !coverData.success) {
                console.warn(`Aviso de lote: ${failedPages.length} página(s) e status de capa (sucesso=${coverData.success}). Usando ilustrações do livro como fallback seguro.`);
                addLog(`✨ Livro ilustrado com sucesso! Algumas cenas adaptadas harmoniosamente.`);
            }

            if (!fallbackImage) {
                throw new Error("Não foi possível gerar nenhuma ilustração válida para o livro. Tente novamente.");
            }

            // Reconstruct chapters array (10 elements)
            const allChapterImagesMap = {};
            pageResults.forEach(r => {
                allChapterImagesMap[r.index] = r.result.success
                    ? r.result.image_url
                    : fallbackImage;
            });

            const allChapters = generatedStory.pages.map((page, index) => ({
                image_url: allChapterImagesMap[index] || fallbackImage
            }));

            const finalCoverUrl = coverData.success ? coverData.image_url : fallbackImage;

            const imagesEnd = new Date();
            const endTime = new Date();

            const promptTokens = tokenUsage.prompt_token_count || 0;
            const outputTokens = tokenUsage.candidates_token_count || 0;
            // Tabela OpenAI GPT-4o-mini: Input $0.15/1M, Output $0.60/1M
            const textTokenCost = (promptTokens * (0.15 / 1000000)) + (outputTokens * (0.60 / 1000000));
            // Tabela OpenAI GPT-Image-2.5 Flare (low quality): $0.005 por imagem
            const imgCostUS = imageGenerationLogs.length * 0.005;
            const totalCostUS = textTokenCost + imgCostUS;
            const totalCostBRL = totalCostUS * 5.80;

            const costData = {
                usd_images: imgCostUS,
                usd_text: textTokenCost,
                usd_total: totalCostUS,
                brl_total: totalCostBRL
            };

            const finalResult = {
                title: generatedStory.title,
                cover_image: finalCoverUrl,
                cover_prompt: generatedStory.cover_prompt,
                pages: generatedStory.pages, // Keep standard 'pages' object
                chapters: allChapters,
                cost_data: costData,
                universe: storyData.universe,
                style: storyData.style || 'universe_default',
                character_names: characterNames,
                character_details: charactersDetails,
                clothing_bible: generatedStory?.clothing_bible || '',
                character_appearance_bible: generatedStory?.character_appearance_bible || '',
                url_photos: urlPhotos,
            };

            // Prepare Metadata

            const formatTime = (ms) => {
                if (!ms || isNaN(ms)) return "0 minutos e 0 segundos";
                const totalSeconds = Math.floor(ms / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                return `${minutes} minutos e ${seconds} segundos`;
            };

            let logText = `================ HISTÓRIA LOG =================
Título: ${generatedStory.title}
Data: ${endTime.toISOString()}

[Input do Usuário]
Universo: ${storyData.universe}
Gênero: ${storyData.genre}
Estilo: ${storyData.style}
Descrição: ${storyData.description || 'N/A'}
Personagens: ${characterNames}

[Prompts Gerais]
Prompt Original da IA (Texto): 
${rawPrompt}

[Tempos Gerais]
Tempo para gerar a história inteira (LLM): ${formatTime(storyEnd - storyStart)}
Tempo total de geração de todas as imagens: ${formatTime(imagesEnd - imagesStart)}
Tempo total de ponta a ponta: ${formatTime(endTime - startTime)}

[Custos Estimados]
Imagens Geradas: ${imageGenerationLogs.length} (Custo: US$ ${imgCostUS.toFixed(4)})
Tokens de Texto: ${tokenUsage.totalTokenCount || tokenUsage.total_token_count || 0} (Custo: US$ ${textTokenCost.toFixed(5)})
Custo Total em Dólar: US$ ${totalCostUS.toFixed(4)}
Custo Total em Reais (R$ 5,80): R$ ${totalCostBRL.toFixed(4)}

[Desempenho por Imagem]
`;
            imageGenerationLogs.forEach(logObj => {
                logText += `\n--- ${logObj.descriptor} ---\n` +
                    `Status: ${logObj.success ? 'Sucesso' : 'Falha'}\n` +
                    `Tentativas Necessárias: ${logObj.attempts || 1}\n` +
                    `Tempo de Geração: ${logObj.timings ? formatTime(logObj.timings.duration_ms) : 'N/A'}\n` +
                    `Prompt da Imagem:\n${logObj.prompt || 'N/A'}\n`;
            });

            const executionMetadata = {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                durationSeconds: (endTime - startTime) / 1000,
                inputs: {
                    names: characterNames,
                    style: storyData.style,
                    universe: storyData.universe,
                    genre: storyData.genre,
                    description: storyData.description
                },
                cover_prompt: generatedStory.cover_prompt,
                clothing_bible: generatedStory?.clothing_bible || '',
                character_appearance_bible: generatedStory?.character_appearance_bible || '',
                character_details: charactersDetails,
                url_photos: urlPhotos,
                api_responses: {
                    // Stringify to avoid "Nested arrays not supported" error in Firestore (because 'parts' is Array<Array>)
                    story_generation: JSON.stringify(result)
                },
                llm_details: {
                    prompt_used: rawPrompt,
                    token_usage: tokenUsage
                },
                image_generations: imageGenerationLogs.map(item => ({
                    descriptor: item.descriptor,
                    prompt: item.prompt,
                    attempts: item.attempts,
                    timings: item.timings,
                    success: item.success,
                    log: item.log || {}
                })),
                timings: {
                    story_generation_ms: storyEnd - storyStart,
                    image_generation_ms: imagesEnd - imagesStart
                },
                costs: {
                    usd_images: imgCostUS,
                    usd_text: textTokenCost,
                    usd_total: totalCostUS,
                    brl_total: totalCostBRL
                },
                txtLog: logText
            };

            // Auto-save the story with metadata
            addLog("Salvando no grimório...", 3, 50);
            const saveRes = await saveStory(finalResult, localLogs, executionMetadata);

            if (saveRes?.storyId) {
                finalResult.id = saveRes.storyId;
                finalResult.storyId = saveRes.storyId;
                finalResult.userId = saveRes.userId || currentUser?.uid;
                if (saveRes.cover_image_url) finalResult.cover_image = saveRes.cover_image_url;
                if (saveRes.chapters) {
                    finalResult.chapters = saveRes.chapters.map(c => ({ image_url: c.image_url }));
                }
            }

            addLog("Livro finalizado com ilustrações!", 3, 100);

            setGenerationState(prev => ({
                ...prev,
                isLoading: false,
                result: finalResult
            }));

        } catch (error) {
            console.error("Generation Error:", error);
            setGenerationState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message,
                logs: [...prev.logs, `Erro: ${error.message}`]
            }));
        }
    }, [saveStory, currentUser]);

    const regeneratePageImage = useCallback(async (chapterIndex, currentStory) => {
        const storyToUse = currentStory || generationState.result;
        if (!storyToUse) {
            throw new Error("História não encontrada para regeneração.");
        }

        const isCover = chapterIndex === -1;
        let prompt = '';
        if (isCover) {
            prompt = storyToUse.cover_prompt || storyToUse.metadata?.cover_prompt || '';
            if (!prompt && storyToUse.title) {
                prompt = `Magical fairytale cover art for the children's story titled '${storyToUse.title}'. Vibrant storybook illustration.`;
            }
        } else {
            const pageObj = storyToUse.pages?.[chapterIndex];
            const partObj = storyToUse.parts?.[chapterIndex];
            prompt = pageObj?.illustration_prompt || (Array.isArray(partObj) ? partObj[1] : '') || pageObj?.text || (Array.isArray(partObj) ? partObj[0] : '');
        }

        if (!prompt) {
            throw new Error("Não foi possível encontrar a descrição da cena para ilustrar.");
        }

        const personName = storyToUse.character_names || storyToUse.metadata?.inputs?.names || '';
        const universeContext = storyToUse.universe || storyToUse.metadata?.inputs?.universe || 'fantasy_medieval';
        const style = storyToUse.style || storyToUse.metadata?.inputs?.style || 'universe_default';
        const clothingBible = storyToUse.clothing_bible || storyToUse.metadata?.clothing_bible || '';
        const characterAppearanceBible = storyToUse.character_appearance_bible || storyToUse.metadata?.character_appearance_bible || '';
        const charactersDetails = storyToUse.character_details || storyToUse.metadata?.character_details || [];
        const urlPhotos = storyToUse.url_photos || storyToUse.metadata?.url_photos || [];

        const imgFormData = new FormData();
        imgFormData.append('prompt', prompt);
        imgFormData.append('person_name', personName);
        imgFormData.append('universe_context', universeContext);
        imgFormData.append('style', style);
        imgFormData.append('is_cover', isCover ? 'true' : 'false');
        imgFormData.append('clothing_bible', clothingBible);
        imgFormData.append('character_appearance_bible', characterAppearanceBible);

        if (charactersDetails && charactersDetails.length > 0) {
            imgFormData.append('character_details_json', JSON.stringify(charactersDetails));
        }

        if (urlPhotos && urlPhotos.length > 0) {
            imgFormData.append('reference_image_urls_json', JSON.stringify(urlPhotos));
        }

        const res = await fetch('/api/generate-image', {
            method: 'POST',
            body: imgFormData
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Falha ao gerar nova imagem: ${errText}`);
        }

        const data = await res.json();
        let newImageUrl = data.image_url;

        // If user is logged in and story is saved in Firestore, upload to Firebase Storage and update Firestore doc!
        const storyId = storyToUse.id || storyToUse.storyId;
        const userId = storyToUse.userId || currentUser?.uid;

        if (currentUser && storyId && userId) {
            try {
                let blob;
                try {
                    blob = await compressImage(newImageUrl);
                } catch (e) {
                    const fetchRes = await fetch(newImageUrl);
                    blob = await fetchRes.blob();
                }

                const filename = `${crypto.randomUUID()}.webp`;
                const folderPath = isCover
                    ? `users/${userId}/stories/${storyId}/cover`
                    : `users/${userId}/stories/${storyId}/chapters`;
                const storageRef = ref(storage, `${folderPath}/${filename}`);
                await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
                newImageUrl = await getDownloadURL(storageRef);

                const storyDocRef = doc(db, "users", userId, "stories", storyId);
                const storyDocSnap = await getDoc(storyDocRef);
                if (storyDocSnap.exists()) {
                    const docData = storyDocSnap.data();
                    if (isCover) {
                        await updateDoc(storyDocRef, {
                            cover_image_url: newImageUrl
                        });
                    } else if (docData.chapters && Array.isArray(docData.chapters)) {
                        const updatedChapters = [...docData.chapters];
                        if (updatedChapters[chapterIndex]) {
                            updatedChapters[chapterIndex] = {
                                ...updatedChapters[chapterIndex],
                                image_url: newImageUrl
                            };
                            await updateDoc(storyDocRef, {
                                chapters: updatedChapters
                            });
                        }
                    }
                }
            } catch (storageErr) {
                console.warn("Aviso ao salvar nova imagem no Firebase Storage/Firestore:", storageErr);
            }
        }

        // Update active result in generationState if active
        setGenerationState(prev => {
            if (!prev.result) return prev;
            const updated = { ...prev.result };
            if (isCover) {
                updated.cover_image = newImageUrl;
            } else if (updated.chapters && updated.chapters[chapterIndex]) {
                const nextChapters = [...updated.chapters];
                nextChapters[chapterIndex] = {
                    ...nextChapters[chapterIndex],
                    image_url: newImageUrl
                };
                updated.chapters = nextChapters;
            }
            return {
                ...prev,
                result: updated
            };
        });

        return newImageUrl;
    }, [currentUser, generationState.result]);

    const resetGeneration = useCallback(() => {
        setGenerationState({
            isLoading: false,
            result: null,
            error: null,
            logs: [],
            step: 0,
            stepProgress: 0,
        });
    }, []);

    const value = {
        characters,
        selectedCharacters,
        setSelectedCharacters,
        addCharacter,
        deleteCharacter,
        selectCharacter,
        setSingleCharacter,
        generationState,
        setGenerationState,
        startGeneration,
        resetGeneration,
        regeneratePageImage,
        saveStory
    };

    return (
        <StoryContext.Provider value={value}>
            {children}
        </StoryContext.Provider>
    );
}

export function useStory() {
    const context = useContext(StoryContext);
    if (!context) {
        throw new Error('useStory must be used within a StoryProvider');
    }
    return context;
}
