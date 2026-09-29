import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, writeBatch, collection, increment } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userCredits, setUserCredits] = useState(0); // Novo state de moedas
    const [loading, setLoading] = useState(true);

    const loginWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const logout = () => {
        return signOut(auth);
    };

    // Funcionalidade de Moedas e Transações com Batch
    const consumeCredit = async (amount = 1, reason = "Geração de história") => {
        if (!currentUser) throw new Error("Usuário não logado");

        const userRef = doc(db, "users", currentUser.uid);
        const transactionRef = doc(collection(db, "users", currentUser.uid, "transactions"));

        const batch = writeBatch(db);

        // Decrementa do usuário
        batch.update(userRef, { credits: increment(-amount) });

        // Adiciona registro da transação
        batch.set(transactionRef, {
            type: "consume",
            amount: -amount,
            reason: reason,
            createdAt: new Date().toISOString()
        });

        await batch.commit();
        return true;
    };

    const addCredits = async (amount, reason = "Compra na Loja") => {
        if (!currentUser) throw new Error("Usuário não logado");

        const userRef = doc(db, "users", currentUser.uid);
        const transactionRef = doc(collection(db, "users", currentUser.uid, "transactions"));

        const batch = writeBatch(db);

        // Incrementa ao usuário
        batch.update(userRef, { credits: increment(amount) });

        // Adiciona registro da transação
        batch.set(transactionRef, {
            type: "add",
            amount: amount,
            reason: reason,
            createdAt: new Date().toISOString()
        });

        await batch.commit();
        return true;
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Checa/Cria documento do usuário
                const userRef = doc(db, "users", user.uid);
                try {
                    const userSnap = await getDoc(userRef);
                    if (!userSnap.exists()) {
                        // Novo usuário, dar 3 créditos de boas-vindas
                        const batch = writeBatch(db);
                        batch.set(userRef, {
                            email: user.email,
                            name: user.displayName,
                            credits: 3,
                            createdAt: new Date().toISOString()
                        });

                        const transactionRef = doc(collection(db, "users", user.uid, "transactions"));
                        batch.set(transactionRef, {
                            type: "add",
                            amount: 3,
                            reason: "Bônus de Boas-Vindas",
                            createdAt: new Date().toISOString()
                        });

                        await batch.commit();
                    }
                } catch (e) {
                    console.error("Erro na checagem inicial do usuário", e);
                }

                // Listen de alterações nos créditos
                const unsubscribeCredits = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserCredits(data.credits || 0);
                    }
                });

                setLoading(false);

                // Retorna função para limpar o watcher dos créditos também quando auth mudar
                return () => unsubscribeCredits();
            } else {
                setUserCredits(0);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const value = {
        currentUser,
        loginWithGoogle,
        logout,
        userCredits,
        consumeCredit,
        addCredits
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
