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

    const [activeJob, setActiveJob] = useState(null);
    const [completedNotification, setCompletedNotification] = useState(null);

    // Sincronização defensiva com o perfil do usuário no Firestore (campo: active_story_job)
    const safeSyncJob = useCallback(async (jobData) => {
        if (!currentUser) return;
        try {
            await setDoc(doc(db, "users", currentUser.uid), {
                active_story_job: jobData
            }, { merge: true });
        } catch (err) {
            console.warn("safeSyncJob aviso:", err);
        }
    }, [currentUser]);

    const clearSyncedJob = useCallback(async () => {
        if (!currentUser) return;
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                active_story_job: null
            });
        } catch (err) {
            console.warn("clearSyncedJob aviso:", err);
        }
    }, [currentUser]);

    // Restaura job ativo persistido localmente ao inicializar
    useEffect(() => {
        try {
            const savedJobStr = localStorage.getItem('imaginaria_active_job');
            if (savedJobStr) {
                const parsed = JSON.parse(savedJobStr);
                if (parsed) {
                    if (parsed.status === 'writing' || parsed.status === 'illustrating' || parsed.status === 'saving') {
                        parsed.status = 'failed';
                        parsed.error = 'A página foi recarregada durante o processo de geração.';
                        parsed.message = 'Geração interrompida. Você pode tentar novamente!';
                    }
                    setActiveJob(parsed);
                }
            }
        } catch (e) {
            console.warn("Aviso ao recuperar active_job do localStorage:", e);
        }
    }, []);

    // Escuta em tempo real o perfil do usuário para notificações de conclusão de jobs remotos
    useEffect(() => {
        if (!currentUser) return;
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
            if (!snapshot.exists()) return;
            const data = snapshot.data();
            if (data?.active_story_job) {
                const remoteJob = data.active_story_job;
                if (remoteJob.status === 'completed' && remoteJob.storyId) {
                    setCompletedNotification({
                        title: remoteJob.title || "Livro Mágico",
                        storyId: remoteJob.storyId,
                        coverUrl: remoteJob.coverImageUrl
                    });
                }
            }
        }, (err) => {
            console.warn("Aviso no listener de perfil do usuário:", err);
        });

        return () => unsubscribe();
    }, [currentUser]);

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
        // Validação: Pelo menos um personagem deve ser selecionado
        if (!storyData || !storyData.characters || storyData.characters.length === 0) {
            console.error("startGeneration chamado sem heróis:", storyData);
            setGenerationState(prev => ({
                ...prev,
                isLoading: false,
                error: "Selecione pelo menos um herói para a jornada!"
            }));
            return;
        }

        // Limite de 3 histórias por dia
        const adminEmails = ["luca.barboza@gmail.com", "ricardo8610@gmail.com"];
        const isUnlimited = currentUser && adminEmails.includes((currentUser.email || "").toLowerCase().trim());

        if (!isUnlimited) {
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
                    console.warn("Aviso ao verificar cota no Firestore:", quotaErr);
                }
            }

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

        // Criar identificador único do Job de background
        const jobId = crypto.randomUUID();
        const characterNames = storyData.characters.map(c => c.customNickname || c.nickname).join(", ");

        const initialJobData = {
            id: jobId,
            userId: currentUser?.uid || null,
            status: "writing",
            step: 1,
            stepProgress: 15,
            message: "Invocando o autor mágico (GPT-6.1 Sol)...",
            title: null,
            universe: storyData.universe,
            style: storyData.style || 'universe_default',
            createdAt: new Date().toISOString()
        };

        setActiveJob(initialJobData);
        localStorage.setItem('imaginaria_active_job', JSON.stringify(initialJobData));
        safeSyncJob(initialJobData);

        const initialLogs = ["Iniciando motor criativo...", "Invocando o autor mágico (GPT-6.1 Sol)..."];
        setGenerationState({
            isLoading: true,
            result: null,
            error: null,
            logs: initialLogs,
            step: 1,
            stepProgress: 15,
        });

        try {
            const formData = new FormData();
            formData.append('nome', characterNames);
            formData.append('estilo', storyData.style || 'universe_default');
            formData.append('universo', storyData.universe);
            formData.append('genero', storyData.genre);
            if (storyData.description) {
                formData.append('descricao', storyData.description);
            }
            formData.append('job_id', jobId);
            if (currentUser) {
                formData.append('user_id', currentUser.uid);
            }

            // Detalhes dos heróis para consistência de prompt (Humano vs Pet)
            const charactersDetails = storyData.characters.map(c => ({
                original_name: c.nickname,
                nickname_in_story: c.customNickname,
                role: c.customRole,
                personality: c.customPersonality,
                character_type: c.characterType || 'person',
                species_breed: c.speciesBreed || null
            }));
            formData.append('character_details_json', JSON.stringify(charactersDetails));

            // Fotos de referência dos heróis
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
            if (allPhotos.length > 0) {
                formData.append('image_urls_json', JSON.stringify(allPhotos));
            }

            // 1. Gera o texto literário com GPT-6.1 Sol
            const storyRes = await fetch('/api/generate-story', {
                method: 'POST',
                body: formData
            });
            if (!storyRes.ok) {
                const errText = await storyRes.text();
                throw new Error(`Falha ao gerar história: ${errText}`);
            }
            const storyDataRes = await storyRes.json();
            const generatedStory = storyDataRes.data?.story || storyDataRes.data;
            if (!generatedStory || !generatedStory.pages) {
                throw new Error("Resposta inválida da história gerada pelo modelo.");
            }
            const storyTitle = generatedStory.title || "Aventura Mágica";

            // 2. Atualiza estado para ilustrações
            const illustratingJob = {
                ...initialJobData,
                status: "illustrating",
                step: 2,
                stepProgress: 30,
                title: storyTitle,
                message: `História escrita! Pintando ilustrações para '${storyTitle}'...`,
                updatedAt: new Date().toISOString()
            };
            setActiveJob(illustratingJob);
            localStorage.setItem('imaginaria_active_job', JSON.stringify(illustratingJob));
            safeSyncJob(illustratingJob);

            setGenerationState(prev => ({
                ...prev,
                step: 2,
                stepProgress: 30,
                logs: [...(prev.logs || []), `História escrita: ${storyTitle}`, "Pintando as 5 ilustrações simultâneas com IA..."]
            }));

            // 3. Gera as 5 ilustrações simultaneamente em paralelo (1 capa + 4 páginas)
            const imageJobs = [
                { prompt: generatedStory.cover_prompt, isCover: true, index: -1, name: "Capa" },
                ...generatedStory.pages.map((p, i) => ({ prompt: p.illustration_prompt, isCover: false, index: i, name: `Página ${i + 1}` }))
            ];

            let completedImgs = 0;
            const imgResults = await Promise.all(imageJobs.map(async (job) => {
                const imgForm = new FormData();
                imgForm.append('prompt', job.prompt);
                imgForm.append('person_name', characterNames);
                imgForm.append('universe_context', storyData.universe);
                imgForm.append('style', storyData.style || 'universe_default');
                imgForm.append('is_cover', job.isCover ? 'true' : 'false');
                imgForm.append('clothing_bible', generatedStory.clothing_bible || '');
                imgForm.append('character_appearance_bible', generatedStory.character_appearance_bible || '');
                if (allPhotos.length > 0) imgForm.append('reference_image_urls_json', JSON.stringify(allPhotos));
                if (charactersDetails.length > 0) imgForm.append('character_details_json', JSON.stringify(charactersDetails));

                const imgRes = await fetch('/api/generate-image', { method: 'POST', body: imgForm });
                if (!imgRes.ok) {
                    const errImg = await imgRes.text();
                    throw new Error(`Falha ao gerar ilustração (${job.name}): ${errImg}`);
                }
                const imgData = await imgRes.json();

                completedImgs++;
                const newProgress = 30 + Math.round((completedImgs / 5.0) * 55);
                const progressMsg = `Pintada ilustração ${completedImgs} de 5 (${job.name})...`;

                setActiveJob(prev => prev ? ({
                    ...prev,
                    stepProgress: newProgress,
                    message: progressMsg
                }) : null);

                setGenerationState(prev => ({
                    ...prev,
                    stepProgress: newProgress,
                    logs: [...(prev.logs || []), progressMsg]
                }));

                safeSyncJob({ stepProgress: newProgress, message: progressMsg });

                return { index: job.index, url: imgData.image_url };
            }));

            // 4. Salva a história no Firebase Storage e Firestore
            const savingJob = {
                ...illustratingJob,
                status: "saving",
                step: 3,
                stepProgress: 90,
                message: "Encadernando o livro e salvando na Biblioteca...",
                updatedAt: new Date().toISOString()
            };
            setActiveJob(savingJob);
            localStorage.setItem('imaginaria_active_job', JSON.stringify(savingJob));
            safeSyncJob(savingJob);

            setGenerationState(prev => ({
                ...prev,
                step: 3,
                stepProgress: 90,
                logs: [...(prev.logs || []), "Encadernando o livro e salvando na Biblioteca..."]
            }));

            const coverObj = imgResults.find(r => r.index === -1);
            const pageImgs = imgResults.filter(r => r.index !== -1).sort((a, b) => a.index - b.index);
            const fallbackUrl = coverObj?.url || pageImgs[0]?.url;

            const storyToSave = {
                title: storyTitle,
                cover_image: coverObj?.url || fallbackUrl,
                cover_prompt: generatedStory.cover_prompt,
                pages: generatedStory.pages,
                chapters: generatedStory.pages.map((p, i) => ({
                    text: p.text,
                    image_url: pageImgs[i]?.url || fallbackUrl,
                    prompt: p.illustration_prompt
                })),
                universe: storyData.universe,
                style: storyData.style || 'universe_default',
                character_names: characterNames,
                clothing_bible: generatedStory.clothing_bible || '',
                character_appearance_bible: generatedStory.character_appearance_bible || '',
                character_details: charactersDetails
            };

            const saveRes = await saveStory(storyToSave);
            const finalStory = {
                ...storyToSave,
                id: saveRes?.storyId || crypto.randomUUID(),
                storyId: saveRes?.storyId
            };

            // Registro de cota diária local
            try {
                const todayKey = `daily_stories_${new Date().toISOString().slice(0, 10)}`;
                const currentCount = parseInt(localStorage.getItem(todayKey) || "0", 10);
                localStorage.setItem(todayKey, (currentCount + 1).toString());
            } catch (countErr) {
                console.warn("Aviso ao registrar contador diário:", countErr);
            }

            // Conclusão bem-sucedida
            localStorage.removeItem('imaginaria_active_job');
            setActiveJob(null);
            clearSyncedJob();

            setGenerationState({
                isLoading: false,
                step: 3,
                stepProgress: 100,
                result: finalStory,
                error: null,
                logs: ["Livro mágico concluído com sucesso!"]
            });

            setCompletedNotification({
                title: storyTitle,
                storyId: finalStory.id,
                coverUrl: finalStory.cover_image
            });

        } catch (error) {
            console.error("Erro na criação da história:", error);
            const failedJob = {
                id: jobId,
                status: 'failed',
                stepProgress: 0,
                error: error.message,
                message: `Ops! ${error.message || "Não foi possível gerar a história"}`
            };
            setActiveJob(failedJob);
            localStorage.setItem('imaginaria_active_job', JSON.stringify(failedJob));
            clearSyncedJob();
            setGenerationState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message,
                logs: [...(prev.logs || []), `Erro: ${error.message}`]
            }));
        }
    }, [currentUser, safeSyncJob, clearSyncedJob, saveStory]);

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

    const dismissActiveJob = useCallback(() => {
        setActiveJob(null);
        localStorage.removeItem('imaginaria_active_job');
        localStorage.removeItem('imaginaria_active_job_id');
        clearSyncedJob();
    }, [clearSyncedJob]);

    const resetGeneration = useCallback(() => {
        setGenerationState({
            isLoading: false,
            result: null,
            error: null,
            logs: [],
            step: 0,
            stepProgress: 0,
        });
        dismissActiveJob();
    }, [dismissActiveJob]);

    const clearCompletedNotification = useCallback(() => {
        setCompletedNotification(null);
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
        saveStory,
        activeJob,
        completedNotification,
        clearCompletedNotification,
        dismissActiveJob
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
