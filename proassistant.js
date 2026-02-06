/**
 * ProAssistant - Application terrain
 * Enregistrement rapide des interventions sur site
 */

class TerrainApp {
    constructor() {
        this.clients = [];
        this.currentClient = null;
        this.currentIntervention = null;
        this.cmsWindow = null;

        this.init();
    }

    /**
     * Initialisation
     */
    init() {
        this.loadClientsFromCMS();
        this.setupEventListeners();
        this.renderClientsList();
        this.updateDateTime();

        // Mettre à jour l'heure toutes les secondes
        setInterval(() => this.updateDateTime(), 1000);

        // Charger les clients toutes les 5 secondes (synchronisation avec CMS)
        setInterval(() => this.loadClientsFromCMS(), 5000);
    }

    /**
     * Configuration des écouteurs
     */
    setupEventListeners() {
        const searchInput = document.getElementById('client-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderClientsList());
        }

        // Mise à jour du montant estimé
        const hoursInput = document.getElementById('hours-input');
        if (hoursInput) {
            hoursInput.addEventListener('change', () => this.updateEstimatedAmount());
        }
    }

    /**
     * Charger les clients depuis le CMS (LocalStorage partagé)
     */
    loadClientsFromCMS() {
        try {
            const stored = localStorage.getItem('proassistant_data');
            if (stored) {
                const data = JSON.parse(stored);
                this.clients = data.clients || [];
            }
        } catch (error) {
            console.error('Erreur lors du chargement des clients:', error);
        }
    }

    /**
     * Afficher la liste des clients
     */
    renderClientsList() {
        const container = document.getElementById('clients-list');
        const searchTerm = document.getElementById('client-search')?.value.toLowerCase() || '';

        let filtered = this.clients;

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm) ||
                c.phone.includes(searchTerm)
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">Aucun client disponible</p>';
            return;
        }

        container.innerHTML = filtered.map(client => {
            const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase();

            return `
                <div class="client-item" onclick="app.selectClient('${client.id}')">
                    <div class="client-avatar">${initials}</div>
                    <div class="client-info">
                        <div class="client-name">${client.name}</div>
                        <div class="client-meta">${client.rate.toFixed(2)}€/h • ${client.serviceType}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Sélectionner un client
     */
    selectClient(clientId) {
        this.currentClient = this.clients.find(c => c.id === clientId);

        if (!this.currentClient) {
            this.showNotification('Client non trouvé', 'error');
            return;
        }

        // Afficher l'écran d'entrée des heures
        this.showScreen('hours-entry-screen');

        // Remplir les informations
        document.getElementById('selected-client-name').textContent = this.currentClient.name;
        document.getElementById('service-type').value = this.currentClient.serviceType;

        // Pré-remplir les heures avec 1
        document.getElementById('hours-input').value = '1';

        // Calculer les heures de début et fin automatiques
        this.setDefaultTimes();

        // Mettre à jour le montant estimé
        this.updateEstimatedAmount();
    }

    /**
     * Définir les heures par défaut (maintenant à maintenant + heures)
     */
    setDefaultTimes() {
        const now = new Date();
        const hours = parseFloat(document.getElementById('hours-input').value) || 1;

        // Heure de début : maintenant
        const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Heure de fin : maintenant + heures
        const endDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
        const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

        document.getElementById('start-time').value = startTime;
        document.getElementById('end-time').value = endTime;
    }

    /**
     * Augmenter les heures
     */
    increaseHours() {
        const input = document.getElementById('hours-input');
        let value = parseFloat(input.value) || 1;
        value += 0.5;
        if (value <= 12) {
            input.value = value.toFixed(1);
            this.setDefaultTimes();
            this.updateEstimatedAmount();
        }
    }

    /**
     * Diminuer les heures
     */
    decreaseHours() {
        const input = document.getElementById('hours-input');
        let value = parseFloat(input.value) || 1;
        value -= 0.5;
        if (value >= 0.5) {
            input.value = value.toFixed(1);
            this.setDefaultTimes();
            this.updateEstimatedAmount();
        }
    }

    /**
     * Mettre à jour le montant estimé
     */
    updateEstimatedAmount() {
        const hours = parseFloat(document.getElementById('hours-input').value) || 0;
        const rate = this.currentClient?.rate || 0;
        const amount = hours * rate;

        document.getElementById('estimated-amount').textContent = amount.toFixed(2) + '€';
    }

    /**
     * Mettre à jour la date et l'heure affichées
     */
    updateDateTime() {
        const now = new Date();

        // Format date
        const dateStr = now.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        // Format heure
        const timeStr = now.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        document.getElementById('display-date').textContent = dateStr;
        document.getElementById('display-time').textContent = timeStr;
    }

    /**
     * Enregistrer les heures
     */
    submitHours(event) {
        event.preventDefault();

        if (!this.currentClient) {
            this.showNotification('Erreur: client non sélectionné', 'error');
            return;
        }

        const hours = parseFloat(document.getElementById('hours-input').value);
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const serviceType = document.getElementById('service-type').value;
        const notes = document.getElementById('notes').value;

        // Validation
        if (!startTime || !endTime) {
            this.showNotification('Veuillez remplir les heures de début et fin', 'error');
            return;
        }

        if (startTime >= endTime) {
            this.showNotification('L\'heure de fin doit être après l\'heure de début', 'error');
            return;
        }

        // Créer l'intervention
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const intervention = {
            id: this.generateId(),
            clientId: this.currentClient.id,
            date: dateStr,
            start: startTime,
            end: endTime,
            type: serviceType,
            notes: notes,
            createdAt: new Date().toISOString()
        };

        // Ajouter l'intervention au CMS
        this.addInterventionToCMS(intervention);

        // Préparer les données de confirmation
        this.currentIntervention = intervention;

        // Afficher l'écran de confirmation
        this.showConfirmation(intervention);
    }

    /**
     * Ajouter l'intervention au CMS
     */
    addInterventionToCMS(intervention) {
        if (firebaseService && firebaseService.isAuthenticated) {
            // Ajouter via Firebase
            const interventionData = {
                clientId: intervention.clientId,
                date: intervention.date,
                start: intervention.start,
                end: intervention.end,
                type: intervention.type,
                notes: intervention.notes
            };
            
            firebaseService.addIntervention(interventionData).then(id => {
                if (id) {
                    console.log('✅ Intervention enregistrée dans Firebase');
                }
            });
        } else {
            // Fallback sur localStorage
            try {
                const stored = localStorage.getItem('proassistant_data');
                let data = stored ? JSON.parse(stored) : {};

                if (!data.interventions) {
                    data.interventions = [];
                }

                data.interventions.push(intervention);
                localStorage.setItem('proassistant_data', JSON.stringify(data));

                this.showNotification('Intervention enregistrée dans le CMS', 'success');
            } catch (error) {
                console.error('Erreur lors de l\'ajout de l\'intervention:', error);
                this.showNotification('Erreur lors de l\'enregistrement', 'error');
            }
        }
    }

    /**
     * Afficher l'écran de confirmation
     */
    showConfirmation(intervention) {
        const client = this.currentClient;
        const hours = this.calculateHours(intervention.start, intervention.end);
        const amount = hours * client.rate;
        const date = new Date(intervention.date).toLocaleDateString('fr-FR');

        document.getElementById('confirm-client').textContent = client.name;
        document.getElementById('confirm-date').textContent = date;
        document.getElementById('confirm-hours').textContent = hours.toFixed(1) + 'h';
        document.getElementById('confirm-amount').textContent = amount.toFixed(2) + '€';

        this.showScreen('confirmation-screen');
    }

    /**
     * Calculer les heures entre deux temps
     */
    calculateHours(startTime, endTime) {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const startTotalMin = startHour * 60 + startMin;
        const endTotalMin = endHour * 60 + endMin;

        const diffMin = endTotalMin - startTotalMin;
        return diffMin / 60;
    }

    /**
     * Nouvelle intervention
     */
    newIntervention() {
        // Réinitialiser le formulaire
        document.querySelector('.hours-form').reset();
        document.getElementById('hours-input').value = '1';

        this.currentClient = null;
        this.currentIntervention = null;

        this.showScreen('client-selection-screen');
        document.getElementById('client-search').value = '';
        this.renderClientsList();
    }

    /**
     * Ouvrir le formulaire d'ajout rapide de client
     */
    openAddClientModal() {
        this.showScreen('add-client-screen');
        // Réinitialiser le formulaire
        document.getElementById('new-client-name').value = '';
        document.getElementById('new-client-phone').value = '';
        document.getElementById('new-client-rate').value = '';
        document.getElementById('new-client-service').value = 'menage';
        document.getElementById('new-client-email').value = '';
        document.getElementById('new-client-deadline').value = '';
    }

    /**
     * Soumettre un nouveau client rapidement
     */
    submitNewClient(event) {
        event.preventDefault();

        const name = document.getElementById('new-client-name').value.trim();
        const phone = document.getElementById('new-client-phone').value.trim();
        const rate = parseFloat(document.getElementById('new-client-rate').value);
        const service = document.getElementById('new-client-service').value;
        const email = document.getElementById('new-client-email').value.trim();
        const deadline = parseInt(document.getElementById('new-client-deadline').value) || null;

        if (!name || !phone || !rate) {
            this.showNotification('Veuillez remplir tous les champs requis', 'error');
            return;
        }

        const newClient = {
            name: name,
            phone: phone,
            email: email || '',
            address: '',
            rate: rate,
            serviceType: service,
            deadlineDay: deadline,
            notes: 'Client ajouté via l\'application terrain'
        };

        if (firebaseService && firebaseService.isAuthenticated) {
            // Ajouter via Firebase
            firebaseService.addClient(newClient).then(clientId => {
                if (clientId) {
                    this.showNotification(`Client "${name}" ajouté avec succès !`, 'success');
                    this.goBackToClients();
                    // Attendre le chargement et sélectionner le client
                    setTimeout(() => {
                        const client = this.clients.find(c => c.name === name && c.phone === phone);
                        if (client) {
                            this.selectClient(client.id);
                        }
                    }, 500);
                }
            });
        } else {
            // Fallback sur localStorage
            let data = {
                clients: [],
                interventions: [],
                invoices: [],
                userProfile: {}
            };

            try {
                const stored = localStorage.getItem('proassistant_data');
                if (stored) {
                    data = JSON.parse(stored);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            }

            newClient.id = this.generateId();
            newClient.createdAt = new Date().toISOString();

            if (!data.clients) {
                data.clients = [];
            }
            data.clients.push(newClient);

            try {
                localStorage.setItem('proassistant_data', JSON.stringify(data));
                this.loadClientsFromCMS();
                this.showNotification(`Client "${name}" ajouté avec succès !`, 'success');
                this.goBackToClients();
                setTimeout(() => {
                    this.selectClient(newClient.id);
                }, 500);
            } catch (error) {
                console.error('Erreur lors de la sauvegarde:', error);
                this.showNotification('Erreur lors de l\'ajout du client', 'error');
            }
        }
    }

    /**
     * Revenir aux clients
     */
    goBackToClients() {
        this.showScreen('client-selection-screen');
        document.getElementById('client-search').value = '';
        this.renderClientsList();
    }

    /**
     * Ouvrir le CMS
     */
    openCMSWindow() {
        // Ouvrir le CMS dans une nouvelle fenêtre/onglet
        window.open('index.html', 'CMS', 'width=1200,height=800,resizable=yes');
    }

    /**
     * Afficher un écran
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    }

    /**
     * Afficher une notification
     */
    showNotification(message, type = 'info') {
        const notifEl = document.createElement('div');
        notifEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#6366f1'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 2000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        notifEl.textContent = message;
        document.body.appendChild(notifEl);

        setTimeout(() => {
            notifEl.remove();
        }, 3000);
    }

    /**
     * Générer un ID unique
     */
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Initialiser l'application
const app = new TerrainApp();

// Animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);
