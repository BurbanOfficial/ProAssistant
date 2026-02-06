#!/bin/bash

# 🚀 ProAssistant - Démarrage rapide

# ============================================
# MÉTHODE 1: Serveur local simple (Recommandé)
# ============================================

echo "🚀 Démarrage de ProAssistant..."
echo ""

# Vérifier Python
if command -v python3 &> /dev/null; then
    echo "✅ Python trouvé"
    echo ""
    echo "🌐 Serveur démarré sur: http://localhost:8000"
    echo "📖 Accueil: http://localhost:8000/accueil.html"
    echo "📱 CMS: http://localhost:8000/index.html"
    echo "📱 App Terrain: http://localhost:8000/proassistant.html"
    echo ""
    echo "Appuyez sur Ctrl+C pour arrêter le serveur"
    echo ""
    python3 -m http.server 8000
    
elif command -v python &> /dev/null; then
    echo "✅ Python trouvé"
    echo ""
    echo "🌐 Serveur démarré sur: http://localhost:8000"
    echo "📖 Accueil: http://localhost:8000/accueil.html"
    echo "📱 CMS: http://localhost:8000/index.html"
    echo "📱 App Terrain: http://localhost:8000/proassistant.html"
    echo ""
    echo "Appuyez sur Ctrl+C pour arrêter le serveur"
    echo ""
    python -m http.server 8000

elif command -v node &> /dev/null; then
    echo "✅ Node.js trouvé"
    echo ""
    # Installer http-server si nécessaire
    if ! command -v http-server &> /dev/null; then
        echo "📦 Installation de http-server..."
        npm install -g http-server
    fi
    echo ""
    echo "🌐 Serveur démarré sur: http://localhost:8080"
    echo "📖 Accueil: http://localhost:8080/accueil.html"
    echo "📱 CMS: http://localhost:8080/index.html"
    echo "📱 App Terrain: http://localhost:8080/proassistant.html"
    echo ""
    echo "Appuyez sur Ctrl+C pour arrêter le serveur"
    echo ""
    http-server

else
    echo "❌ Python ou Node.js non trouvé!"
    echo ""
    echo "Installation requise:"
    echo "- Python: brew install python3"
    echo "- ou Node.js: brew install node"
    exit 1
fi
