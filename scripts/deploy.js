import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Procura pela chave de serviço permanente (Service Account)
const possibleKeyPaths = [
    path.join(rootDir, 'firebase-service-account.json'),
    path.join(rootDir, 'firebase-key.json'),
    path.join(rootDir, 'service-account.json'),
    path.join(process.env.USERPROFILE || process.env.HOME || '', '.config', 'firebase', 'firebase-service-account.json'),
    path.join(process.env.USERPROFILE || process.env.HOME || '', '.config', 'firebase', 'imaginaria-key.json')
];

const foundKey = possibleKeyPaths.find(p => fs.existsSync(p));

const env = { ...process.env };
if (foundKey) {
    console.log(`🔑 Credencial permanente detectada: ${path.basename(foundKey)}`);
    env.GOOGLE_APPLICATION_CREDENTIALS = foundKey;
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log(`🔑 Credencial via env GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
} else {
    console.log('ℹ️ Nenhuma chave de serviço encontrada. Tentando usar sessão existente...');
}

console.log('🚀 Iniciando build e deploy do Maginária no Firebase Hosting...');

try {
    // 1. Build da aplicação
    console.log('📦 Executando build...');
    execSync('npm run build', {
        stdio: 'inherit',
        cwd: rootDir
    });

    // 2. Deploy no Firebase Hosting com credenciais permanentes
    console.log('☁️ Enviando para o Firebase Hosting...');
    execSync('npx firebase-tools deploy --only hosting', {
        stdio: 'inherit',
        cwd: rootDir,
        env
    });

    console.log('\n✨ Deploy concluído com sucesso!');
    console.log('🌐 Acesse: https://maginaria.web.app\n');
} catch (error) {
    console.error('\n❌ Falha no deploy:', error.message);
    process.exit(1);
}
