# 🚀 Guide de démarrage rapide - ProAssistant

## 📌 Accès aux deux applications

### 1️⃣ **CMS - Gestion complète**
📁 Fichier: `index.html`

C'est votre **centre de gestion** :
- 👥 Créer et gérer vos clients
- 📅 Visualiser l'intégralité du planning
- 💰 Générer factures et attestations
- 📊 Voir les statistiques complètes
- 📤 Exporter vos données

**Utilisation** : À votre bureau ou chez vous

---

### 2️⃣ **App Terrain - Enregistrement rapide**
📱 Fichier: `proassistant.html`

C'est votre **assistant de terrain** :
- ⚡ Enregistrement ultra-rapide (2 clics)
- 📍 Directement sur le lieu de l'intervention
- 📱 Optimisé pour mobile/tablette
- 🔄 Synchronisation automatique avec le CMS

**Utilisation** : Sur votre smartphone en intervention

---

## 🔄 Flux de travail recommandé

### **Au démarrage du mois**
1. Ouvrir le **CMS** (`index.html`)
2. Créer tous vos **clients** avec leurs infos

### **Pendant vos interventions**
1. Ouvrir l'**App Terrain** (`proassistant.html`) sur votre téléphone
2. Sélectionner le client
3. Entrer le nombre d'heures
4. ✅ Valider - c'est enregistré !

### **À la fin du mois**
1. Retourner au **CMS** (`index.html`)
2. Vérifier l'**Historique** (tout est là)
3. Générer les **factures**
4. Envoyer les **SMS** aux clients

---

## 📱 Utilisation de l'App Terrain

### Écran 1️⃣ : Sélection du client
```
┌─────────────────────┐
│  ProAssistant      │
│ Sélectionner client │
├─────────────────────┤
│ 🔍 [Recherche...]  │
│                    │
│ 👤 Client 1        │
│ 👤 Client 2        │
│ 👤 Client 3        │
└─────────────────────┘
```

💡 **Conseil** : Tapez pour rechercher rapidement

---

### Écran 2️⃣ : Entrée des heures
```
┌─────────────────────┐
│ ← Client 1         │
├─────────────────────┤
│ 📅 Lun 6 fév       │
│ 🕐 14:30           │
│                    │
│ Heures:    [- 1 +] │
│ Type: Ménage       │
│ Notes: [...]       │
│                    │
│ Montant: 15.00€   │
│ [Annuler] [✓]     │
└─────────────────────┘
```

**Les heures de début/fin** se calculent automatiquement basées sur l'heure actuelle.

---

### Écran 3️⃣ : Confirmation
```
┌─────────────────────┐
│ ✅ Enregistré!     │
├─────────────────────┤
│ Client: Client 1    │
│ Date: Lun 6 fév    │
│ Heures: 1.0h       │
│ Montant: 15.00€   │
│                    │
│ [+ Nouvelle]      │
│ [Revenir]         │
│ [Voir CMS]        │
└─────────────────────┘
```

---

## 💡 Astuces d'utilisation

### **Augmenter/Diminuer les heures rapidement**
- Cliquez sur les boutons **+ et -**
- Ou tapez directement le nombre

### **Corriger une entrée**
1. Allez dans le **CMS** (`index.html`)
2. Allez à **Planning**
3. Cliquez sur l'intervention
4. Modifiez et validez

### **Changer de client**
- Cliquez sur la **flèche retour** en haut
- Sélectionnez un nouveau client

### **Accéder au CMS depuis l'app Terrain**
- Cliquez sur le bouton **"Voir le CMS"**
- Ou ouvrez directement `index.html` dans un nouvel onglet

---

## 🔒 Données et Sécurité

### ✅ Où sont mes données ?
- **Stockées localement** sur votre appareil
- **Pas de serveur** - vos données vous appartiennent
- **Pas de tracking** - totalement privé

### 💾 Sauvegarder mes données
1. Allez au **CMS** → **Paramètres**
2. Cliquez **"Exporter les données"**
3. Un fichier JSON est téléchargé
4. Conservez-le en sécurité

### 📥 Restaurer mes données
1. Allez au **CMS** → **Paramètres**
2. Cliquez **"Importer les données"**
3. Sélectionnez le fichier JSON
4. C'est prêt!

---

## 🆘 Problèmes courants

### ❌ Je n'ai pas de clients dans l'app Terrain
**Solution** : 
- Créez des clients dans le **CMS** (`index.html`) d'abord
- Ou importez un fichier de données

### ❌ Les données de l'app Terrain n'apparaissent pas dans le CMS
**Solution** :
- Attendez 5 secondes (synchronisation automatique)
- Rafraîchissez la page du CMS
- Vérifiez que vous utilisez le **même navigateur**

### ❌ Tout a disparu après fermeture du navigateur
**Solution** :
- Les données sont en **LocalStorage** du navigateur
- Si vous avez effacé les données du navigateur, c'est perdu
- **Toujours exporter** vos données régulièrement

### ❌ L'app Terrain est lente sur mobile
**Solution** :
- Fermez les autres onglets
- Effacez le cache du navigateur
- Utilisez une connexion WiFi (si possible)

---

## 📞 Déploiement

### Sur un serveur local (recommandé)
```bash
# Avec Python
python -m http.server 8000

# Avec Node.js
npx http-server

# Accédez à : http://localhost:8000
```

### Partager avec une équipe
- Mettez tous les fichiers sur un **serveur web**
- Chacun accède au CMS avec son navigateur
- ⚠️ Attention : les données seront partagées en local

---

## 🎯 Utilisation optimale

### **Version bureau/CMS**
- 💻 Ordinateur
- 🖥️ Tablette en paysage
- Accès : `http://localhost:8000/index.html`

### **Version mobile/Terrain**
- 📱 Smartphone
- 📱 Tablette en portrait
- Accès : `http://localhost:8000/proassistant.html`

### **Les deux simultanément**
- 📱 App Terrain sur téléphone
- 💻 CMS sur ordinateur
- Synchronisation automatique en temps réel

---

## 📈 Prochaines étapes

1. ✅ Créer vos clients dans le CMS
2. ✅ Faire une intervention de test avec l'app Terrain
3. ✅ Voir l'intervention dans l'historique du CMS
4. ✅ Générer une facture test
5. ✅ Exporter vos données pour sauvegarde

---

**ProAssistant v1.0** - Bienvenue! 🎉

Pour plus d'infos : consultez `README.md`
