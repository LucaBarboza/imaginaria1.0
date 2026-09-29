@echo off
echo ==========================================
echo    Iniciando Teste Imaginaria App
echo ==========================================

echo.
echo [1/3] Iniciando Backend Python...
start "Backend API" cmd /k "python backend/main.py"

echo.
echo [2/3] Iniciando Frontend React (Vite)...
start "Frontend App" cmd /k "npm run dev"

echo.
echo [3/3] Aguardando servidores iniciarem...
timeout /t 5 >nul

echo.
echo Abrindo navegador...
start http://localhost:5173

echo.
echo Tudo pronto! Nao feche as janelas pretas do terminal enquanto usa o app.
echo.
pause
