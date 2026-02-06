# Guide d'Utilisation - Nouvelles Fonctionnalités

## 1️⃣ Date d'Échéance Mensuelle pour les SMS

### Où la configurer ?

#### Option A : Ajouter un nouveau client
1. **CMS** → "Clients" → "Ajouter un client"
2. Remplir tous les champs
3. **Nouveau champ** : "Date d'échéance mensuelle" → Entrer le jour du mois (ex: **5**)
4. Cliquer "Ajouter client"

#### Option B : Modifier un client existant
1. **CMS** → "Clients" → Cliquer sur le client → "Détails"
2. Bouton "Modifier"
3. Champ "Date d'échéance mensuelle" → Ajouter/modifier la date
4. Cliquer "Enregistrer modifications"

### Comment ça fonctionne ?

**Exemple** : Client "Jean Dupont" avec échéance le **5** du mois

- 📅 **Chaque mois**, le 5 à une heure définie
- 📱 **SMS automatique** envoyé pour rappeler le paiement
- 💬 Message type : "Rappel : Facture du mois due. Totalement: XXX€"

### Voir l'échéance d'un client

1. **CMS** → "Clients" → Cliquer sur un client
2. Section "Infos" → "Échéance mensuelle"
3. Affiche : "Jour X de chaque mois" ou "—" (pas défini)

### Notes importantes
- ⚠️ La date doit être entre **1 et 31**
- ✅ C'est optionnel (peut rester vide)
- 📌 Utile surtout pour l'automatisation future des SMS

---

## 2️⃣ Ajout Rapide de Client sur l'App Mobile

### Situation typique

Vous êtes **sur le terrain** avec votre téléphone, vous avez un **nouveau client** qui n'est pas dans le système. Avant, vous deviez :
1. Quitter l'app
2. Ouvrir le CMS
3. Ajouter le client
4. Revenir à l'app terrain

**Maintenant** : Tout se fait en quelques secondes !

### Comment ajouter un client rapidement ?

#### Étape 1 : Ouvrir l'écran d'ajout
1. Ouvrir **ProAssistant Mobile** (proassistant.html)
2. Cliquer sur le bouton **"Ajouter un client rapide"** (avant c'était "Gérer les clients")

#### Étape 2 : Remplir le formulaire
```
📝 Nom du client :          [Jean Dupont         ]  *obligatoire
📱 Téléphone :             [06 12 34 56 78      ]  *obligatoire
💶 Tarif horaire (€) :     [25                  ]  *obligatoire
💼 Type de prestation :    [Ménage ▼            ]
📧 Email :                 [jean@example.com    ]  (optionnel)
📅 Échéance mensuelle :    [5                   ]  (optionnel)

[Annuler]  [Ajouter le client]
```

#### Étape 3 : Validation
- Cliquer **"Ajouter le client"**
- ✅ Notification : "Client 'Jean Dupont' ajouté avec succès !"
- 🎯 Client **automatiquement sélectionné**
- ⏱️ Écran passe à "Enregistrement des heures"

### Exemple complet

**Situation** : Intervention urgente chez Mme Martin

1. 📱 Ouvrir ProAssistant Mobile
2. 👤 Chercher "Martin" → Non trouvée
3. ➕ Cliquer "Ajouter un client rapide"
4. ✏️ Remplir :
   - Nom : **Mme Martin**
   - Téléphone : **06 98 76 54 32**
   - Tarif : **20 €/h**
   - Prestation : **Ménage**
5. 💾 Cliquer "Ajouter le client"
6. ✅ Client ajouté → **Sélectionné automatiquement**
7. ⏱️ Écran passe à "Enregistrement des heures"
8. 🕐 Enregistrer les 3 heures travaillées
9. ✔️ Intervention sauvegardée

**Temps total** : ~2 minutes (avant : 10+ minutes)

### Synchronisation Automatique

Après avoir ajouté le client sur mobile :

1. ✅ Client sauvegardé dans **LocalStorage partagé**
2. ⏲️ **CMS recharge automatiquement** (toutes les 5 sec)
3. 👁️ Vous revenez au CMS et le client y est présent !

**Pas besoin de faire quoi que ce soit** - tout est synchronisé.

---

## 3️⃣ Workflow Recommandé

### Avant une journée d'interventions

**Matin au bureau (CMS)** :
1. Ouvrir le CMS (index.html)
2. Ajouter les **nouveaux clients attendus**
3. Définir les **dates d'échéance** pour la facturation
4. Planifier les **interventions** prévues

**Sur le terrain (Mobile)** :
1. Ouvrir l'app terrain (proassistant.html)
2. Sélectionner le client → Enregistrer heures
3. **Nouveau client ?** → Ajouter rapide → Enregistrer heures

### Fin de journée (CMS)

1. Vérifier les **interventions enregistrées**
2. Générer les **factures mensuelles**
3. Envoyer les **SMS de rappel**
4. Exporter les **données** pour comptabilité

---

## 4️⃣ Champs du Client

### Structure complète d'un client

```json
{
  "id": "1707208400000_abc1234def",
  "name": "Jean Dupont",
  "phone": "06 12 34 56 78",
  "email": "jean@example.com",
  "address": "123 Rue de Paris, 75001",
  "rate": 25.50,
  "serviceType": "menage",
  "deadlineDay": 5,              ← NOUVEAU
  "notes": "Excellent client",
  "createdAt": "2025-02-06T10:30:00.000Z"
}
```

### Nouveaux champs

| Champ | Type | Où l'utiliser | Notes |
|-------|------|-------|-------|
| `deadlineDay` | number (1-31) | CMS + Mobile | Jour du mois pour les SMS de rappel |

---

## 5️⃣ Dépannage

### Le client ajouté sur mobile ne s'affiche pas au CMS

❌ **Problème** : Synchronisation lente  
✅ **Solution** : Attendre 5 secondes et rafraîchir le CMS

### Le bouton "Ajouter un client" n'apparaît pas

❌ **Problème** : Version ancienne du HTML  
✅ **Solution** : Vérifier que proassistant.html est à jour

### Les champs obligatoires ne sont pas en rouges

❌ **Problème** : CSS non chargé  
✅ **Solution** : Attendre le chargement complet de la page

### Impossible de modifier la date d'échéance

❌ **Problème** : Champ non visible  
✅ **Solution** : Faire défiler le formulaire vers le bas

---

## 6️⃣ FAQ Rapide

**Q : Je peux ajouter un client sans numéro de téléphone ?**  
A : Non, c'est obligatoire pour la facturation et les SMS.

**Q : La date d'échéance c'est obligatoire ?**  
A : Non, c'est optionnel. Utile que si vous envoyez des SMS de rappel.

**Q : Les clients ajoutés sur mobile ont les mêmes droits que sur CMS ?**  
A : Oui, exactement. Pas de différence.

**Q : Je peux ajouter un client sans email ?**  
A : Oui, l'email est optionnel.

**Q : Combien de temps pour que le client apparaisse au CMS ?**  
A : Maximum 5 secondes (intervalle de synchronisation).

---

## 7️⃣ Points à Retenir ⭐

1. ✅ **Date d'échéance** = jour du mois pour SMS (optionnel)
2. ✅ **Ajout rapide mobile** = créer client sans quitter l'app
3. ✅ **Synchronisation auto** = CMS ↔ Mobile (toutes les 5 sec)
4. ✅ **Aucun serveur** = tout fonctionne localement
5. ✅ **100% gratuit** = aucun coût supplémentaire

---

**Besoin d'aide ?** Consultez les fichiers :
- `MODIFICATIONS_RECENTES.md` - Détails techniques
- `README.md` - Documentation complète
- `LISEZ_MOI.txt` - FAQ générale

Version : ProAssistant v1.1 | Date : 6 février 2026
