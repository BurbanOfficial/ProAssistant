/**
 * Module Firebase Service - ProAssistant
 * Gestion de la synchronisation Firestore
 */

class FirebaseService {
    constructor() {
        this.userId = null;
        this.isAuthenticated = false;
        this.unsubscribers = [];
        this.init();
    }

    /**
     * Initialisation du service Firebase
     */
    async init() {
        try {
            // Vérifier l'authentification
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    this.userId = user.uid;
                    this.isAuthenticated = true;
                    console.log('✅ Utilisateur connecté:', user.email);
                    this.setupRealTimeListeners();
                } else {
                    // Authentification anonyme pour les tests
                    await this.anonymousSignIn();
                }
            });
        } catch (error) {
            console.error('Erreur initialisation Firebase:', error);
        }
    }

    /**
     * Connexion anonyme pour tests
     */
    async anonymousSignIn() {
        try {
            const result = await firebase.auth().signInAnonymously();
            this.userId = result.user.uid;
            this.isAuthenticated = true;
            console.log('✅ Connexion anonyme établie');
            this.setupRealTimeListeners();
        } catch (error) {
            console.error('Erreur connexion anonyme:', error);
        }
    }

    /**
     * Configurer les écouteurs temps réel Firestore
     */
    setupRealTimeListeners() {
        if (!this.userId) return;

        // Écouter les clients
        const clientsUnsubscribe = db.collection('users').doc(this.userId)
            .collection('clients')
            .onSnapshot((snapshot) => {
                const clients = [];
                snapshot.forEach((doc) => {
                    clients.push({ id: doc.id, ...doc.data() });
                });
                // Mettre à jour l'app
                if (window.app) {
                    window.app.clients = clients;
                    window.app.renderClients();
                    window.app.populateClientSelect();
                }
            });

        // Écouter les interventions
        const interventionsUnsubscribe = db.collection('users').doc(this.userId)
            .collection('interventions')
            .onSnapshot((snapshot) => {
                const interventions = [];
                snapshot.forEach((doc) => {
                    interventions.push({ id: doc.id, ...doc.data() });
                });
                // Mettre à jour l'app
                if (window.app) {
                    window.app.interventions = interventions;
                    window.app.renderCalendar();
                    window.app.renderDashboard();
                }
            });

        // Écouter les factures
        const invoicesUnsubscribe = db.collection('users').doc(this.userId)
            .collection('invoices')
            .onSnapshot((snapshot) => {
                const invoices = [];
                snapshot.forEach((doc) => {
                    invoices.push({ id: doc.id, ...doc.data() });
                });
                // Mettre à jour l'app
                if (window.app) {
                    window.app.invoices = invoices;
                    window.app.renderInvoices();
                }
            });

        // Sauvegarder les unsubscribers pour nettoyer plus tard
        this.unsubscribers = [clientsUnsubscribe, interventionsUnsubscribe, invoicesUnsubscribe];
    }

    /**
     * Ajouter un client
     */
    async addClient(clientData) {
        if (!this.userId) {
            console.error('Utilisateur non authentifié');
            return null;
        }

        try {
            const docRef = await db.collection('users').doc(this.userId)
                .collection('clients')
                .add({
                    ...clientData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            console.log('✅ Client ajouté:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Erreur ajout client:', error);
            return null;
        }
    }

    /**
     * Mettre à jour un client
     */
    async updateClient(clientId, clientData) {
        if (!this.userId) return false;

        try {
            await db.collection('users').doc(this.userId)
                .collection('clients')
                .doc(clientId)
                .update({
                    ...clientData,
                    updatedAt: new Date()
                });
            console.log('✅ Client mis à jour:', clientId);
            return true;
        } catch (error) {
            console.error('Erreur mise à jour client:', error);
            return false;
        }
    }

    /**
     * Supprimer un client
     */
    async deleteClient(clientId) {
        if (!this.userId) return false;

        try {
            await db.collection('users').doc(this.userId)
                .collection('clients')
                .doc(clientId)
                .delete();
            console.log('✅ Client supprimé:', clientId);
            return true;
        } catch (error) {
            console.error('Erreur suppression client:', error);
            return false;
        }
    }

    /**
     * Ajouter une intervention
     */
    async addIntervention(interventionData) {
        if (!this.userId) return null;

        try {
            const docRef = await db.collection('users').doc(this.userId)
                .collection('interventions')
                .add({
                    ...interventionData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            console.log('✅ Intervention ajoutée:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Erreur ajout intervention:', error);
            return null;
        }
    }

    /**
     * Mettre à jour une intervention
     */
    async updateIntervention(interventionId, interventionData) {
        if (!this.userId) return false;

        try {
            await db.collection('users').doc(this.userId)
                .collection('interventions')
                .doc(interventionId)
                .update({
                    ...interventionData,
                    updatedAt: new Date()
                });
            console.log('✅ Intervention mise à jour:', interventionId);
            return true;
        } catch (error) {
            console.error('Erreur mise à jour intervention:', error);
            return false;
        }
    }

    /**
     * Supprimer une intervention
     */
    async deleteIntervention(interventionId) {
        if (!this.userId) return false;

        try {
            await db.collection('users').doc(this.userId)
                .collection('interventions')
                .doc(interventionId)
                .delete();
            console.log('✅ Intervention supprimée:', interventionId);
            return true;
        } catch (error) {
            console.error('Erreur suppression intervention:', error);
            return false;
        }
    }

    /**
     * Ajouter une facture
     */
    async addInvoice(invoiceData) {
        if (!this.userId) return null;

        try {
            const docRef = await db.collection('users').doc(this.userId)
                .collection('invoices')
                .add({
                    ...invoiceData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            console.log('✅ Facture ajoutée:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Erreur ajout facture:', error);
            return null;
        }
    }

    /**
     * Mettre à jour une facture
     */
    async updateInvoice(invoiceId, invoiceData) {
        if (!this.userId) return false;

        try {
            await db.collection('users').doc(this.userId)
                .collection('invoices')
                .doc(invoiceId)
                .update({
                    ...invoiceData,
                    updatedAt: new Date()
                });
            console.log('✅ Facture mise à jour:', invoiceId);
            return true;
        } catch (error) {
            console.error('Erreur mise à jour facture:', error);
            return false;
        }
    }

    /**
     * Charger les données initiales
     */
    async loadInitialData() {
        if (!this.userId) return null;

        try {
            const clients = [];
            const interventions = [];
            const invoices = [];

            // Charger les clients
            const clientsSnapshot = await db.collection('users').doc(this.userId)
                .collection('clients')
                .get();
            clientsSnapshot.forEach(doc => {
                clients.push({ id: doc.id, ...doc.data() });
            });

            // Charger les interventions
            const interventionsSnapshot = await db.collection('users').doc(this.userId)
                .collection('interventions')
                .get();
            interventionsSnapshot.forEach(doc => {
                interventions.push({ id: doc.id, ...doc.data() });
            });

            // Charger les factures
            const invoicesSnapshot = await db.collection('users').doc(this.userId)
                .collection('invoices')
                .get();
            invoicesSnapshot.forEach(doc => {
                invoices.push({ id: doc.id, ...doc.data() });
            });

            return { clients, interventions, invoices };
        } catch (error) {
            console.error('Erreur chargement données:', error);
            return null;
        }
    }

    /**
     * Exporter les données
     */
    async exportData() {
        const data = await this.loadInitialData();
        if (data) {
            return data;
        }
        return null;
    }

    /**
     * Importer les données (migration)
     */
    async importData(data) {
        if (!this.userId) return false;

        try {
            const batch = db.batch();

            // Importer les clients
            if (data.clients && Array.isArray(data.clients)) {
                for (const client of data.clients) {
                    const docRef = db.collection('users').doc(this.userId)
                        .collection('clients').doc();
                    batch.set(docRef, { ...client, createdAt: new Date() });
                }
            }

            // Importer les interventions
            if (data.interventions && Array.isArray(data.interventions)) {
                for (const intervention of data.interventions) {
                    const docRef = db.collection('users').doc(this.userId)
                        .collection('interventions').doc();
                    batch.set(docRef, { ...intervention, createdAt: new Date() });
                }
            }

            // Importer les factures
            if (data.invoices && Array.isArray(data.invoices)) {
                for (const invoice of data.invoices) {
                    const docRef = db.collection('users').doc(this.userId)
                        .collection('invoices').doc();
                    batch.set(docRef, { ...invoice, createdAt: new Date() });
                }
            }

            await batch.commit();
            console.log('✅ Données importées avec succès');
            return true;
        } catch (error) {
            console.error('Erreur import données:', error);
            return false;
        }
    }

    /**
     * Nettoyer les écouteurs
     */
    cleanup() {
        this.unsubscribers.forEach(unsubscribe => unsubscribe());
        console.log('✅ Écouteurs Firebase nettoyés');
    }
}

// Initialiser le service Firebase
const firebaseService = new FirebaseService();

console.log('✅ Firebase Service initialisé');
