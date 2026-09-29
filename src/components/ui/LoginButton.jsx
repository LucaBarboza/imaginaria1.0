import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function LoginButton() {
    const { currentUser, loginWithGoogle, logout } = useAuth();

    if (currentUser) {
        return (
            <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700">
                <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-8 h-8 rounded-full border border-purple-500"
                />
                <div className="flex flex-col text-left">
                    <span className="text-xs text-slate-400">Logado como</span>
                    <span className="text-sm font-bold text-white leading-none">{currentUser.displayName?.split(' ')[0]}</span>
                </div>
                <button
                    onClick={logout}
                    className="ml-2 p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    title="Sair"
                >
                    <LogOut size={16} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={loginWithGoogle}
            className="flex items-center gap-2 bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
        >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span>Entrar com Google</span>
        </button>
    );
}
