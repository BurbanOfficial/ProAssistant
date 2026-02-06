# 📱 ProAssistant - Gestion Professionnelle pour Aides à la Personne

**ProAssistant** est une application web gratuite et 100% responsif conçue pour simplifier la gestion quotidienne des professionnels de l'aide à la personne et de la conciergerie.

## ✨ Fonctionnalités principales

### 📅 **Planning intuitif**
- Calendrier mensuel interactif avec visualisation des interventions
- Ajout, modification et suppression d'interventions
- Vue détaillée des interventions par jour
- Synchronisation automatique des données

### 👥 **Gestion des clients**
- Fiche client complète (coordonnées, tarif horaire, type de prestation, notes internes)
- Recherche et filtrage des clients
- Historique des interventions par client
- Statistiques personnalisées

### 📊 **Tableau de bord**
- Vue d'ensemble des heures effectuées ce mois
- Montant total dû
- Nombre de clients actifs
- Clients en retard de paiement
- Actions rapides

### 💰 **Facturation automatique**
- Calcul automatique des heures travaillées
- Génération mensuelle des factures
- Envoi automatisé de SMS avec rappels de paiement
- Suivi des statuts de paiement (Payé / En attente / En retard)
- Générations d'attestations mensuelles

### 📬 **SMS et notifications**
- Envoi de SMS personnalisés aux clients
- Messages incluant : nom, heures effectuées, montant dû, lien de paiement (simulation en développement)
- Gestion des notifications et reminders

### 📈 **Historique et reporting**
- Historique complet des interventions
- Filtrage par client, période, type de prestation
- Exports de données en JSON
- Attestations de services rendus

### ⚙️ **Paramètres et sécurité**
- Profil utilisateur personnalisable
- Export/Import des données
- Sauvegarde locale automatique (LocalStorage)
- Suppression sécurisée des données

## 🚀 Démarrage rapide

### Installation

1. **Télécharger les fichiers**
   - `index.html` - Structure de l'application
   - `styles.css` - Styles et design responsive
   - `app.js` - Logique et fonctionnalités

2. **Ouvrir dans un navigateur**
   - Double-cliquez sur `index.html`
   - Ou utilisez un serveur local (recommandé)

### Utilisation recommandée

**Avec un serveur local** (python):
```bash
python -m http.server 8000
# Puis accédez à http://localhost:8000
```

**Ou avec Node.js (http-server)**:
```bash
npm install -g http-server
http-server
```

## 📋 Guide d'utilisation

### Ajouter un client
1. Cliquez sur "Ajouter client" ou via le tableau de bord
2. Remplissez les informations (nom, téléphone, tarif horaire, etc.)
3. Validez pour créer la fiche

### Programmer une intervention
1. Allez au Planning ou utilisez "Ajouter intervention"
2. Sélectionnez le client
3. Choisissez la date et les heures
4. Validez - les heures sont calculées automatiquement

### Générer les factures mensuelles
1. Allez à Facturation
2. Cliquez sur "Envoyer factures"
3. Sélectionnez le mois et les clients
4. Validez - un SMS de rappel est envoyé à chaque client

### Générer une attestation
1. Allez à Facturation
2. Cliquez sur "Attestation" pour une facture
3. Téléchargez le fichier

### Exporter les données
1. Allez à Paramètres
2. Cliquez sur "Exporter les données"
3. Un fichier JSON est téléchargé

## 🎨 Interface responsive

✅ **Desktop** - Interface complète avec sidebar navigation
✅ **Tablette** - Layout optimisé pour écran moyen
✅ **Mobile** - Navigation mobile-first, touch-friendly

## 💾 Stockage des données

ProAssistant utilise **LocalStorage** du navigateur :
- Les données sont stockées localement sur votre appareil
- **Pas de serveur** - 100% privé et sécurisé
- Export possible en JSON pour sauvegarde

**Important** : Les données sont sauvegardées dans votre navigateur. Effacez les données du navigateur = perte des données. Exportez régulièrement!

## 🔒 Sécurité et confidentialité

✅ Aucun serveur - vos données restent sur votre appareil
✅ Pas de connexion internet requise
✅ Pas de tracking ou analytics
✅ Gratuit, sans frais, sans publicité
✅ Code source transparent (HTML/CSS/JavaScript)

## 📱 SMS et notifications (Mode simulation)

En mode développement, les SMS sont simulés dans une modale. En production, intégrez votre prestataire SMS (Twilio, Sendinblue, etc.).

## 🛠️ Développement

### Architecture

```
ProAssistant/
├── index.html       # Structure HTML
├── styles.css       # Styles et responsive
├── app.js          # Application (classe ProAssistantApp)
└── README.md       # Documentation
```

### Principaux objets

**Client**
```javascript
{
  id: "unique_id",
  name: "Nom du client",
  phone: "+33 6 XX XX XX XX",
  email: "client@example.com",
  address: "Adresse",
  rate: 15.50, // €/h
  serviceType: "menage|courses|gardiennage|accompagnement",
  notes: "Notes internes",
  createdAt: "2026-02-06T..."
}
```

**Intervention**
```javascript
{
  id: "unique_id",
  clientId: "client_id",
  date: "2026-02-06",
  start: "09:00",
  end: "12:30",
  type: "menage",
  notes: "Notes",
  createdAt: "2026-02-06T..."
}
```

**Invoice**
```javascript
{
  id: "unique_id",
  clientId: "client_id",
  month: "2026-02",
  hours: 40.5,
  amount: 607.50,
  status: "pending|paid|late",
  dueDate: "2026-03-10",
  createdAt: "2026-02-06T..."
}
```

## 📈 Prochaines améliorations possibles

- [ ] Intégration Twilio/Sendinblue pour SMS réels
- [ ] Synchronisation cloud (Firebase/Supabase)
- [ ] Import/export Excel
- [ ] Graphiques et analytics avancés
- [ ] Application native (PWA)
- [ ] Mode multi-utilisateurs
- [ ] Paiements en ligne intégrés

## 📞 Support

Pour toute question ou suggestion, consultez le code source (HTML/CSS/JS) - tout est transparent et modifiable!

## 📄 Licence

Gratuit, libre d'utilisation.

## 📱 ProAssistant Terrain - Application Mobile

**ProAssistant Terrain** est une application mobile dédiée à l'enregistrement rapide des interventions directement sur le terrain.

### 🎯 Utilisation

Ouvrez `proassistant.html` sur votre smartphone ou tablette.

### ⚡ Flux d'utilisation

1. **Sélectionner un client** - Tapez ou recherchez le client
2. **Entrer les heures** - Indiquez le nombre d'heures effectuées
3. **Valider** - L'intervention est enregistrée automatiquement dans le CMS

### 🔄 Synchronisation

L'app Terrain utilise le **même LocalStorage** que le CMS:
- Les interventions enregistrées sur le terrain apparaissent automatiquement dans le CMS
- Les clients du CMS sont disponibles dans l'app Terrain
- **Pas de serveur requis** - synchronisation locale

### 📋 Fonctionnalités

✅ Sélection rapide du client
✅ Entrée intuitive des heures (+-boutons)
✅ Date et heure automatiques
✅ Calcul du montant estimé
✅ Lien vers le CMS complet
✅ 100% Responsive mobile
✅ Hors ligne

---

**ProAssistant v1.0** - Simplifiez votre gestion administrative

### 📂 Structure complète

```
ProAssistant/
├── index.html           # CMS complet
├── styles.css          # Styles CMS
├── app.js             # Logique CMS
├── proassistant.html  # App terrain
├── proassistant.css   # Styles app terrain
├── proassistant.js    # Logique app terrain
└── README.md          # Documentation
```
