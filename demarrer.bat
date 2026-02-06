@echo off
REM ProAssistant - Demarrage rapide sur Windows

echo.
echo 🚀 Demarrage de ProAssistant...
echo.

REM Verifier Python
where python3 >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ Python3 trouve
    echo.
    echo 🌐 Serveur demarre sur: http://localhost:8000
    echo 📖 Accueil: http://localhost:8000/accueil.html
    echo 📱 CMS: http://localhost:8000/index.html
    echo 📱 App Terrain: http://localhost:8000/proassistant.html
    echo.
    echo Appuyez sur Ctrl+C pour arreter le serveur
    echo.
    python3 -m http.server 8000
    goto end
)

where python >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ Python trouve
    echo.
    echo 🌐 Serveur demarre sur: http://localhost:8000
    echo 📖 Accueil: http://localhost:8000/accueil.html
    echo 📱 CMS: http://localhost:8000/index.html
    echo 📱 App Terrain: http://localhost:8000/proassistant.html
    echo.
    echo Appuyez sur Ctrl+C pour arreter le serveur
    echo.
    python -m http.server 8000
    goto end
)

REM Verifier Node.js
where node >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ Node.js trouve
    echo.
    
    REM Verifier http-server
    where http-server >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo 📦 Installation de http-server...
        call npm install -g http-server
    )
    
    echo.
    echo 🌐 Serveur demarre sur: http://localhost:8080
    echo 📖 Accueil: http://localhost:8080/accueil.html
    echo 📱 CMS: http://localhost:8080/index.html
    echo 📱 App Terrain: http://localhost:8080/proassistant.html
    echo.
    echo Appuyez sur Ctrl+C pour arreter le serveur
    echo.
    call http-server
    goto end
)

echo ❌ Python ou Node.js non trouve!
echo.
echo Installation requise:
echo - Python: https://www.python.org/downloads/
echo - ou Node.js: https://nodejs.org/
echo.
pause

:end
