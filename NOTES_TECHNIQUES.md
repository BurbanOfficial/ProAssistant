# 🔧 Notes Techniques - ProAssistant

## Architecture générale

### Deux applications distinctes, une base de données commune

```
┌─────────────────────┐
│   Navigateur Web    │
├─────────────────────┤
│                     │
│  ┌─────────────┐    │
│  │   CMS       │    │
│  │ (index.html)│    │
│  └────────┬────┘    │
│           │         │
│      LocalStorage   │
│           │         │
│  ┌────────▼────┐    │
│  │   App       │    │
│  │  Terrain    │    │
│  │(proassist..│    │
│  └─────────────┘    │
│                     │
└─────────────────────┘
```

### Partage de données

**LocalStorage Key**: `proassistant_data`

```json
{
  "clients": [...],
  "interventions": [...],
  "invoices": [...],
  "userProfile": {...},
  "notifications": [...]
}
```

---

## Cycle de vie d'une intervention

### 1. **Enregistrement sur terrain**
- App Terrain ouverte sur téléphone
- Sélection client → Entrée heures → Submit
- Intervention créée et ajoutée à LocalStorage

### 2. **Synchronisation CMS**
- CMS détecte le changement (polling toutes les 5 secondes)
- Liste des interventions mise à jour
- Apparaît dans l'historique

### 3. **Facturation**
- CMS génère factures mensuelles
- SMS envoyé (simulation en dev)
- Statut "pending" créé

### 4. **Paiement**
- Statut changé à "paid" ou "late"
- Historique complètement tracé

---

## Structure des données

### Client
```javascript
{
  id: "1707216525000_h7x8k2j9",
  name: "Marie Dupont",
  phone: "+33 6 12 34 56 78",
  email: "marie@example.com",
  address: "123 Rue de Paris, 75001",
  rate: 18.50,           // €/h
  serviceType: "menage", // ou courses, gardiennage, etc
  notes: "Préfère les mardis",
  createdAt: "2026-02-06T10:00:00Z"
}
```

### Intervention
```javascript
{
  id: "1707216525000_a1b2c3d4",
  clientId: "1707216525000_h7x8k2j9",
  date: "2026-02-06",
  start: "09:30",
  end: "12:00",
  type: "menage",
  notes: "Appartement 3 pièces",
  createdAt: "2026-02-06T09:30:00Z"
}
```

### Invoice
```javascript
{
  id: "1707216525000_inv123",
  clientId: "1707216525000_h7x8k2j9",
  month: "2026-02",
  hours: 40.5,
  amount: 749.25,        // hours * rate
  status: "pending",     // pending, paid, late
  dueDate: "2026-03-10",
  createdAt: "2026-02-06T10:00:00Z"
}
```

---

## Fonctionnalités avancées

### Calcul automatique des heures

```javascript
function calculateHours(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  
  const diffMin = endTotalMin - startTotalMin;
  return diffMin / 60; // en heures
}
```

### Statut de paiement automatique

- **pending**: Créé entre 1-10 du mois
- **late**: Automatiquement après date d'échéance
- **paid**: Marqué manuellement

### SMS (Simulation)

En mode développement, les SMS sont simulés dans une modale. 

Pour produire, intégrez un prestataire:
- **Twilio**
- **Sendinblue**
- **AWS SNS**
- **Firebase**

```javascript
// À adapter dans app.js - fonction sendInvoiceSMS()
async function sendRealSMS(phoneNumber, message) {
  // Appeler API SMS
  const response = await fetch('/api/sms', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, message })
  });
  return response.json();
}
```

---

## Performance et optimisations

### App Terrain
- **Léger**: ~15KB total (HTML+CSS+JS)
- **Responsif**: Mobile-first design
- **Rapide**: Pas de requêtes externes
- **Hors ligne**: Fonctionne sans internet

### CMS
- **Complet**: ~100KB total
- **Rapide**: Pas de backend requis
- **Scalable**: Fonctionne jusqu'à ~10000 interventions
- **Optimisé**: Polling intelligent (5s)

### LocalStorage
- **Limite**: ~5-10MB par domaine
- **Persistance**: Tant que cache non vidé
- **Portable**: Exporte en JSON pour backup

---

## Intégrations possibles

### 1. **Backend API**
```javascript
// Ajouter synchronisation cloud
async function syncToCloud(data) {
  await fetch('https://api.proassistant.com/sync', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
```

### 2. **Paiements en ligne**
- Stripe
- PayPal
- Créer lien paiement en SMS

### 3. **SMS réels**
- Intégration Twilio/Sendinblue
- Messages automatiques
- Reminders

### 4. **Cloud Storage**
- Firebase Firestore
- Supabase
- MongoDB Atlas
- AWS DynamoDB

### 5. **Analytics**
- Plausible Analytics
- Fathom Analytics
- Vercel Analytics

### 6. **PWA (Progressive Web App)**
- Installer sur écran d'accueil
- Notification push
- Mise en cache avancée
- Fonctionne hors ligne

---

## Sécurité

### ✅ Actuellement sécurisé
- Données 100% locales
- Pas de transmission réseau
- Pas de cookies de tracking
- HTTPS si sur serveur

### ⚠️ À considérer en production
- Authentification utilisateur
- Chiffrement LocalStorage (si sensible)
- Rate limiting API
- CORS configuration
- Validation serveur

---

## Debugging

### Voir les données en console
```javascript
// Dans la console du navigateur
localStorage.getItem('proassistant_data') // Raw data
JSON.parse(localStorage.getItem('proassistant_data')) // Formatted
```

### Vider les données
```javascript
localStorage.removeItem('proassistant_data')
```

### Logger les actions
```javascript
// Dans app.js, ajouter:
console.log('Intervention créée:', intervention);
console.log('Clients disponibles:', this.clients);
```

---

## Maintenance

### Backup régulier
1. Cliquez "Exporter les données" dans Paramètres
2. Conservez le JSON en sécurité
3. Testez l'import mensuellement

### Mise à jour
- Les fichiers sont statiques
- Pas de dépendances externes
- Mettez à jour manuellement en cas de corrections

### Migration de données
1. Export depuis l'ancienne version
2. Mise à jour des fichiers
3. Import dans la nouvelle version

---

## Déploiement

### En local (développement)
```bash
# Python
python -m http.server 8000

# Node
npx http-server

# Accédez à http://localhost:8000/accueil.html
```

### Sur un serveur web
1. Transférez tous les fichiers
2. Ouvrez accueil.html
3. C'est prêt! Aucun setup serveur

### Hébergement gratuit
- **GitHub Pages** (statique)
- **Netlify** (déploiement rapide)
- **Vercel** (optimisé)
- **Firebase Hosting**

---

## Roadmap future

- [ ] Authentification multi-utilisateurs
- [ ] Synchronisation cloud Firebase
- [ ] Paiements Stripe intégrés
- [ ] SMS réels Twilio
- [ ] App native (React Native/Flutter)
- [ ] Rapports PDF
- [ ] Graphiques avancés
- [ ] Géolocalisation interventions
- [ ] Scanner code barre clients
- [ ] Intégration comptabilité

---

## Support et troubleshooting

### Problème: Données perdues
→ Vérifier localStorage: `localStorage.getItem('proassistant_data')`

### Problème: App Terrain ne voit pas les clients
→ Rafraîchir → Attendre 5s → Vérifier CMS

### Problème: Très lent
→ Réduire interventions (export anciennes) → Vider cache

### Problème: Crash navigateur
→ Taille données trop importante → Archiver → Exporter

---

**ProAssistant v1.0** - Architecture transparente et maintenable
