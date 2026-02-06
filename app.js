/**
 * ProAssistant - Application de gestion pour professionnels de l'aide à la personne
 * 100% Gratuit - HTML, CSS, JavaScript pur
 * Stockage local avec LocalStorage
 */

class ProAssistantApp {
    constructor() {
        this.clients = [];
        this.interventions = [];
        this.invoices = [];
        this.userProfile = {};
        this.currentClientId = null;
        this.currentPage = 'dashboard';
        this.currentMonth = new Date();
        this.notifications = [];

        this.init();
    }

    /**
     * Initialisation de l'application
     */
    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderDashboard();
        this.updateNotifications();
    }

    /**
     * Configuration des écouteurs d'événements
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
            });
        });

        // Search
        document.getElementById('search').addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
            this.renderCalendar();
        });

        // Client filters
        const clientSearch = document.getElementById('client-search');
        const clientFilter = document.getElementById('client-filter');
        if (clientSearch) clientSearch.addEventListener('input', () => this.renderClients());
        if (clientFilter) clientFilter.addEventListener('change', () => this.renderClients());

        // Invoice filters
        const invoiceFilter = document.getElementById('invoice-filter');
        const invoiceMonth = document.getElementById('invoice-month');
        if (invoiceFilter) invoiceFilter.addEventListener('change', () => this.renderInvoices());
        if (invoiceMonth) invoiceMonth.addEventListener('change', () => this.renderInvoices());

        // History filters
        const historyFrom = document.getElementById('history-from');
        const historyTo = document.getElementById('history-to');
        if (historyFrom) historyFrom.addEventListener('change', () => this.filterHistory());
        if (historyTo) historyTo.addEventListener('change', () => this.filterHistory());
    }

    /**
     * Navigation entre les pages
     */
    navigateTo(page) {
        this.currentPage = page;

        // Mise à jour des liens actifs
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });

        // Masquer toutes les pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // Afficher la page sélectionnée
        const pageEl = document.getElementById(page);
        if (pageEl) {
            pageEl.classList.add('active');
        }

        // Rendu spécifique à chaque page
        switch (page) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'calendar':
                this.renderCalendar();
                break;
            case 'clients':
                this.renderClients();
                break;
            case 'invoices':
                this.renderInvoices();
                break;
            case 'history':
                this.renderHistory();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    /**
     * Rendu du tableau de bord
     */
    renderDashboard() {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        // Calculer les heures du mois
        const monthlyHours = this.interventions
            .filter(i => {
                const date = new Date(i.date);
                return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
            })
            .reduce((sum, i) => sum + this.calculateHours(i.start, i.end), 0);

        // Calculer le montant dû
        const amountDue = this.interventions
            .filter(i => {
                const date = new Date(i.date);
                return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
            })
            .reduce((sum, i) => {
                const client = this.getClient(i.clientId);
                if (client) {
                    sum += this.calculateHours(i.start, i.end) * client.rate;
                }
                return sum;
            }, 0);

        // Clients actifs
        const activeClients = this.clients.length;

        // Clients en retard
        const delayedPayments = this.invoices.filter(inv => inv.status === 'late').length;

        // Mise à jour des stats
        document.getElementById('monthly-hours').textContent = monthlyHours.toFixed(1) + 'h';
        document.getElementById('amount-due').textContent = amountDue.toFixed(2) + '€';
        document.getElementById('active-clients').textContent = activeClients;
        document.getElementById('delayed-payments').textContent = delayedPayments;

        // Prochaines interventions (7 prochains jours)
        this.renderInterventionsPreview();

        // Clients en retard
        this.renderDelayedClients();

        // Peupler la liste des clients pour la modal d'intervention
        this.populateClientSelect();
    }

    /**
     * Rendu de l'aperçu des interventions
     */
    renderInterventionsPreview() {
        const container = document.getElementById('interventions-preview');
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const upcoming = this.interventions
            .filter(i => {
                const date = new Date(i.date);
                return date >= now && date <= nextWeek;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="empty-state">Aucune intervention programmée</p>';
            return;
        }

        container.innerHTML = upcoming.map(i => {
            const client = this.getClient(i.clientId);
            const date = new Date(i.date);
            const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' });

            return `
                <div class="intervention-item" onclick="app.openInterventionDetails('${i.id}')">
                    <div class="intervention-info">
                        <div class="intervention-client">${client?.name || 'Client supprimé'}</div>
                        <div class="intervention-time">${dateStr} - ${i.start} à ${i.end}</div>
                    </div>
                    <div class="intervention-actions">
                        <button onclick="event.stopPropagation(); app.openModal('edit-intervention'); app.loadInterventionForEdit('${i.id}')">Modifier</button>
                        <button onclick="event.stopPropagation(); app.deleteIntervention('${i.id}')">Supprimer</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Rendu des clients en retard
     */
    renderDelayedClients() {
        const container = document.getElementById('delayed-clients');
        const delayed = this.invoices.filter(inv => inv.status === 'late');

        if (delayed.length === 0) {
            container.innerHTML = '<p class="empty-state">Aucun client en retard</p>';
            return;
        }

        container.innerHTML = delayed.map(inv => {
            const client = this.getClient(inv.clientId);
            const daysLate = Math.floor((new Date() - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));

            return `
                <div class="delayed-item">
                    <div class="delayed-info">
                        <div class="delayed-name">${client?.name || 'Client supprimé'}</div>
                        <div class="delayed-details">${daysLate} jours de retard</div>
                    </div>
                    <div class="delayed-amount">${inv.amount.toFixed(2)}€</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Rendu du calendrier
     */
    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        // Mise à jour du titre
        const monthName = new Date(year, month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        document.getElementById('current-month').textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        // Créer la grille du calendrier
        const container = document.getElementById('calendar-view');
        const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        let html = dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

        // Premiers jours du mois
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Jours du mois précédent
        for (let i = firstDay === 0 ? 6 : firstDay - 1; i > 0; i--) {
            const day = daysInPrevMonth - i + 1;
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        // Jours du mois actuel
        const todayDate = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === todayDate.toDateString();
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Interventions pour ce jour
            const dayInterventions = this.interventions.filter(i => i.date === dateStr);

            let dayHtml = `<div class="calendar-day ${isToday ? 'today' : ''}" onclick="app.selectDate('${dateStr}')">
                <div class="calendar-day-number">${day}</div>`;

            if (dayInterventions.length > 0) {
                dayHtml += `<div class="calendar-day-interventions">`;
                dayInterventions.slice(0, 2).forEach(() => {
                    dayHtml += `<div class="calendar-day-intervention"></div>`;
                });
                if (dayInterventions.length > 2) {
                    dayHtml += `<div style="font-size: 8px; color: var(--primary); margin-top: 1px;">+${dayInterventions.length - 2}</div>`;
                }
                dayHtml += `</div>`;
            }

            dayHtml += `</div>`;
            html += dayHtml;
        }

        // Jours du mois suivant
        const totalCells = html.split('</div>').length - 1;
        const remainingCells = 49 - totalCells; // 7x7 grid
        for (let i = 1; i <= remainingCells; i++) {
            html += `<div class="calendar-day other-month">${i}</div>`;
        }

        container.innerHTML = html;

        // Afficher les interventions du jour sélectionné
        const todayForDisplay = new Date();
        const todayStr = `${todayForDisplay.getFullYear()}-${String(todayForDisplay.getMonth() + 1).padStart(2, '0')}-${String(todayForDisplay.getDate()).padStart(2, '0')}`;
        this.showDailyInterventions(todayStr);

        this.populateClientSelect();
    }

    /**
     * Sélectionner une date et afficher ses interventions
     */
    selectDate(dateStr) {
        this.showDailyInterventions(dateStr);
    }

    /**
     * Afficher les interventions du jour
     */
    showDailyInterventions(dateStr) {
        const container = document.getElementById('daily-interventions');
        const dayInterventions = this.interventions.filter(i => i.date === dateStr);

        if (dayInterventions.length === 0) {
            container.innerHTML = '<p class="empty-state">Aucune intervention aujourd\'hui</p>';
            return;
        }

        container.innerHTML = dayInterventions
            .sort((a, b) => a.start.localeCompare(b.start))
            .map(i => {
                const client = this.getClient(i.clientId);
                const hours = this.calculateHours(i.start, i.end);
                const rate = client?.rate || 0;
                const amount = hours * rate;

                return `
                    <div class="intervention-item" onclick="app.openModal('edit-intervention'); app.loadInterventionForEdit('${i.id}')">
                        <div class="intervention-info">
                            <div class="intervention-client">${client?.name || 'Client supprimé'}</div>
                            <div class="intervention-time">${i.start} - ${i.end} (${hours.toFixed(1)}h) • ${amount.toFixed(2)}€</div>
                        </div>
                        <div class="intervention-actions">
                            <button onclick="event.stopPropagation(); app.deleteIntervention('${i.id}')">Supprimer</button>
                        </div>
                    </div>
                `;
            }).join('');
    }

    /**
     * Rendu des clients
     */
    renderClients() {
        const container = document.getElementById('clients-grid');
        const searchTerm = document.getElementById('client-search')?.value.toLowerCase() || '';
        const filterStatus = document.getElementById('client-filter')?.value || '';

        let filtered = this.clients;

        // Filtrer par recherche
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm) ||
                c.phone.includes(searchTerm) ||
                (c.email && c.email.toLowerCase().includes(searchTerm))
            );
        }

        // Filtrer par statut
        if (filterStatus === 'active') {
            filtered = filtered.filter(c => {
                const hasInterventions = this.interventions.some(i => i.clientId === c.id);
                return hasInterventions;
            });
        } else if (filterStatus === 'inactive') {
            filtered = filtered.filter(c => {
                const hasInterventions = this.interventions.some(i => i.clientId === c.id);
                return !hasInterventions;
            });
        }

        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">Aucun client trouvé</p>';
            return;
        }

        container.innerHTML = filtered.map(client => {
            const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const stats = this.getClientStats(client.id);

            return `
                <div class="client-card">
                    <div class="client-card-header">
                        <div>
                            <div class="client-avatar">${initials}</div>
                            <div class="client-name">${client.name}</div>
                            <div class="client-service">${client.serviceType}</div>
                        </div>
                    </div>
                    <div class="client-rate">${client.rate.toFixed(2)}€/h</div>
                    <div class="client-contact">${client.phone}</div>
                    <div class="client-contact" style="font-size: 11px; margin-top: 8px;">
                        ${stats.hours.toFixed(1)}h effectuées • ${stats.amount.toFixed(2)}€
                    </div>
                    <div class="client-card-footer">
                        <button class="btn-view" onclick="app.openClientDetails('${client.id}')">Détails</button>
                        <button class="btn-edit" onclick="app.openClientForEdit('${client.id}')">Modifier</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Rendu des factures
     */
    renderInvoices() {
        const tbody = document.getElementById('invoices-tbody');
        const filterStatus = document.getElementById('invoice-filter')?.value || '';
        const filterMonth = document.getElementById('invoice-month')?.value || '';

        let filtered = this.invoices;

        if (filterStatus) {
            filtered = filtered.filter(inv => inv.status === filterStatus);
        }

        if (filterMonth) {
            filtered = filtered.filter(inv => {
                const invDate = new Date(inv.dueDate);
                const [year, month] = filterMonth.split('-');
                return invDate.getFullYear() === parseInt(year) && invDate.getMonth() === parseInt(month) - 1;
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Aucune facture</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(inv => {
            const client = this.getClient(inv.clientId);
            const dueDate = new Date(inv.dueDate);
            const dueDateStr = dueDate.toLocaleDateString('fr-FR');

            let statusClass = 'pending';
            let statusText = 'En attente';
            if (inv.status === 'paid') {
                statusClass = 'paid';
                statusText = 'Payé';
            } else if (inv.status === 'late') {
                statusClass = 'late';
                statusText = 'En retard';
            }

            return `
                <tr>
                    <td>${client?.name || 'Client supprimé'}</td>
                    <td>${inv.hours.toFixed(1)}h</td>
                    <td>${inv.amount.toFixed(2)}€</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${dueDateStr}</td>
                    <td>
                        <div class="table-actions">
                            <button onclick="app.generateAttestation('${inv.id}')">Attestation</button>
                            <button onclick="app.markAsPaid('${inv.id}')">Payer</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Rendu de l'historique
     */
    renderHistory() {
        const tbody = document.getElementById('history-tbody');

        // Remplir le sélecteur des clients
        const clientSelect = document.getElementById('history-client');
        clientSelect.innerHTML = '<option value="">Tous les clients</option>';
        this.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });

        this.filterHistory();
    }

    /**
     * Filtrer l'historique
     */
    filterHistory() {
        const tbody = document.getElementById('history-tbody');
        const fromDate = document.getElementById('history-from')?.value || '';
        const toDate = document.getElementById('history-to')?.value || '';
        const clientId = document.getElementById('history-client')?.value || '';

        let filtered = this.interventions;

        if (fromDate) {
            filtered = filtered.filter(i => i.date >= fromDate);
        }

        if (toDate) {
            filtered = filtered.filter(i => i.date <= toDate);
        }

        if (clientId) {
            filtered = filtered.filter(i => i.clientId === clientId);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Aucune intervention</td></tr>';
            return;
        }

        tbody.innerHTML = filtered
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(i => {
                const client = this.getClient(i.clientId);
                const date = new Date(i.date).toLocaleDateString('fr-FR');
                const hours = this.calculateHours(i.start, i.end);
                const rate = client?.rate || 0;
                const amount = hours * rate;

                return `
                    <tr>
                        <td>${date}</td>
                        <td>${client?.name || 'Client supprimé'}</td>
                        <td>${i.type}</td>
                        <td>${hours.toFixed(1)}h</td>
                        <td>${rate.toFixed(2)}€</td>
                        <td>${amount.toFixed(2)}€</td>
                    </tr>
                `;
            }).join('');
    }

    /**
     * Rendu des paramètres
     */
    renderSettings() {
        document.getElementById('profile-name').value = this.userProfile.name || '';
        document.getElementById('profile-email').value = this.userProfile.email || '';
        document.getElementById('profile-phone').value = this.userProfile.phone || '';
    }

    /**
     * Gestion des clients
     */
    addClient(event) {
        event.preventDefault();

        const client = {
            id: this.generateId(),
            name: document.getElementById('client-name').value,
            phone: document.getElementById('client-phone').value,
            email: document.getElementById('client-email').value,
            address: document.getElementById('client-address').value,
            rate: parseFloat(document.getElementById('client-rate').value),
            serviceType: document.getElementById('client-service-type').value,
            notes: document.getElementById('client-notes').value,
            createdAt: new Date().toISOString()
        };

        this.clients.push(client);
        this.saveData();
        this.closeModal();
        this.renderClients();
        this.showNotification('Client ajouté avec succès', 'success');
        this.populateClientSelect();
    }

    /**
     * Ouvrir les détails du client
     */
    openClientDetails(clientId) {
        this.currentClientId = clientId;
        const client = this.getClient(clientId);

        if (!client) {
            this.showNotification('Client non trouvé', 'error');
            return;
        }

        document.getElementById('detail-client-name').textContent = client.name;
        document.getElementById('detail-phone').textContent = client.phone;
        document.getElementById('detail-email').textContent = client.email || '—';
        document.getElementById('detail-address').textContent = client.address || '—';
        document.getElementById('detail-rate').textContent = client.rate.toFixed(2) + '€/h';
        document.getElementById('detail-service-type').textContent = client.serviceType;
        document.getElementById('detail-notes').textContent = client.notes || '—';

        const stats = this.getClientStats(clientId);
        document.getElementById('detail-total-hours').textContent = stats.hours.toFixed(1) + 'h';
        document.getElementById('detail-total-amount').textContent = stats.amount.toFixed(2) + '€';

        const clientInterventions = this.interventions.filter(i => i.clientId === clientId);
        if (clientInterventions.length > 0) {
            const lastIntervention = clientInterventions.reduce((latest, current) =>
                new Date(current.date) > new Date(latest.date) ? current : latest
            );
            const date = new Date(lastIntervention.date).toLocaleDateString('fr-FR');
            document.getElementById('detail-last-intervention').textContent = date;
        } else {
            document.getElementById('detail-last-intervention').textContent = '—';
        }

        this.openModal('client-details');
    }

    /**
     * Ouvrir le formulaire pour éditer un client
     */
    openClientForEdit(clientId) {
        const client = this.getClient(clientId);
        if (!client) return;

        document.getElementById('edit-client-id').value = clientId;
        document.getElementById('edit-client-name').value = client.name;
        document.getElementById('edit-client-phone').value = client.phone;
        document.getElementById('edit-client-email').value = client.email || '';
        document.getElementById('edit-client-address').value = client.address || '';
        document.getElementById('edit-client-rate').value = client.rate;
        document.getElementById('edit-client-service-type').value = client.serviceType;
        document.getElementById('edit-client-notes').value = client.notes || '';

        this.closeModal();
        this.openModal('edit-client');
    }

    /**
     * Sauvegarder les modifications du client
     */
    saveClientEdits(event) {
        event.preventDefault();

        const clientId = document.getElementById('edit-client-id').value;
        const client = this.getClient(clientId);

        if (client) {
            client.name = document.getElementById('edit-client-name').value;
            client.phone = document.getElementById('edit-client-phone').value;
            client.email = document.getElementById('edit-client-email').value;
            client.address = document.getElementById('edit-client-address').value;
            client.rate = parseFloat(document.getElementById('edit-client-rate').value);
            client.serviceType = document.getElementById('edit-client-service-type').value;
            client.notes = document.getElementById('edit-client-notes').value;

            this.saveData();
            this.closeModal();
            this.renderClients();
            this.showNotification('Client modifié avec succès', 'success');
        }
    }

    /**
     * Supprimer un client
     */
    deleteClient(clientId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client? Les interventions associées seront conservées.')) {
            return;
        }

        this.clients = this.clients.filter(c => c.id !== clientId);
        this.saveData();
        this.closeModal();
        this.renderClients();
        this.showNotification('Client supprimé', 'success');
    }

    /**
     * Gestion des interventions
     */
    addIntervention(event) {
        event.preventDefault();

        const intervention = {
            id: this.generateId(),
            clientId: document.getElementById('intervention-client').value,
            date: document.getElementById('intervention-date').value,
            start: document.getElementById('intervention-start').value,
            end: document.getElementById('intervention-end').value,
            type: document.getElementById('intervention-type').value,
            notes: document.getElementById('intervention-notes').value,
            createdAt: new Date().toISOString()
        };

        // Validation
        if (intervention.start >= intervention.end) {
            this.showNotification('L\'heure de fin doit être après l\'heure de début', 'error');
            return;
        }

        this.interventions.push(intervention);
        this.saveData();
        this.closeModal();

        // Réinitialiser le formulaire
        document.querySelector('#add-intervention .modal-form').reset();

        this.showNotification('Intervention ajoutée', 'success');
        this.renderDashboard();
        this.renderCalendar();
    }

    /**
     * Charger une intervention pour l'édition
     */
    loadInterventionForEdit(interventionId) {
        const intervention = this.interventions.find(i => i.id === interventionId);
        if (!intervention) return;

        const client = this.getClient(intervention.clientId);

        document.getElementById('edit-intervention-id').value = interventionId;
        document.getElementById('edit-intervention-client').value = client?.name || '';
        document.getElementById('edit-intervention-date').value = intervention.date;
        document.getElementById('edit-intervention-start').value = intervention.start;
        document.getElementById('edit-intervention-end').value = intervention.end;
        document.getElementById('edit-intervention-type').value = intervention.type;
        document.getElementById('edit-intervention-notes').value = intervention.notes || '';
    }

    /**
     * Mettre à jour une intervention
     */
    updateIntervention(event) {
        event.preventDefault();

        const interventionId = document.getElementById('edit-intervention-id').value;
        const intervention = this.interventions.find(i => i.id === interventionId);

        if (intervention) {
            const newStart = document.getElementById('edit-intervention-start').value;
            const newEnd = document.getElementById('edit-intervention-end').value;

            if (newStart >= newEnd) {
                this.showNotification('L\'heure de fin doit être après l\'heure de début', 'error');
                return;
            }

            intervention.date = document.getElementById('edit-intervention-date').value;
            intervention.start = newStart;
            intervention.end = newEnd;
            intervention.type = document.getElementById('edit-intervention-type').value;
            intervention.notes = document.getElementById('edit-intervention-notes').value;

            this.saveData();
            this.closeModal();
            this.showNotification('Intervention modifiée', 'success');
            this.renderDashboard();
            this.renderCalendar();
        }
    }

    /**
     * Supprimer une intervention
     */
    deleteIntervention(interventionId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette intervention?')) {
            return;
        }

        this.interventions = this.interventions.filter(i => i.id !== interventionId);
        this.saveData();
        this.showNotification('Intervention supprimée', 'success');
        this.renderDashboard();
        this.renderCalendar();
    }

    /**
     * Ouvrir les détails de l'intervention (alias pour modal)
     */
    openInterventionDetails(interventionId) {
        this.loadInterventionForEdit(interventionId);
        this.openModal('edit-intervention');
    }

    /**
     * Envoyer les factures et SMS
     */
    sendReminders() {
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const month = document.createElement('input');
        month.type = 'month';
        month.value = monthStr;

        // Pré-remplir la modal
        document.getElementById('invoice-send-month').value = monthStr;

        // Générer les factures du mois
        this.generateMonthlyInvoices(monthStr);

        this.openModal('send-invoices');
    }

    /**
     * Générer les factures mensuelles
     */
    generateMonthlyInvoices(monthStr) {
        const [year, month] = monthStr.split('-');
        const targetMonth = parseInt(month) - 1;
        const targetYear = parseInt(year);

        // Grouper les interventions par client pour ce mois
        const clientInterventions = {};

        this.interventions.forEach(intervention => {
            const intDate = new Date(intervention.date);
            if (intDate.getMonth() === targetMonth && intDate.getFullYear() === targetYear) {
                if (!clientInterventions[intervention.clientId]) {
                    clientInterventions[intervention.clientId] = [];
                }
                clientInterventions[intervention.clientId].push(intervention);
            }
        });

        // Afficher la liste des clients à facturer
        const clientsList = document.getElementById('invoice-clients-list');
        clientsList.innerHTML = '';

        Object.entries(clientInterventions).forEach(([clientId, interventions]) => {
            const client = this.getClient(clientId);
            if (!client) return;

            const totalHours = interventions.reduce((sum, i) => sum + this.calculateHours(i.start, i.end), 0);
            const totalAmount = totalHours * client.rate;

            const label = document.createElement('label');
            label.className = 'checkbox-item';
            label.innerHTML = `
                <input type="checkbox" name="invoice-client" value="${clientId}" checked>
                <div style="flex: 1;">
                    <strong>${client.name}</strong>
                    <div style="font-size: 12px; color: var(--gray);">${totalHours.toFixed(1)}h × ${client.rate.toFixed(2)}€ = ${totalAmount.toFixed(2)}€</div>
                </div>
            `;
            clientsList.appendChild(label);
        });
    }

    /**
     * Traiter l'envoi des factures
     */
    processSendInvoices(event) {
        event.preventDefault();

        const monthStr = document.getElementById('invoice-send-month').value;
        const [year, month] = monthStr.split('-');
        const targetMonth = parseInt(month) - 1;
        const targetYear = parseInt(year);

        const selectedClientIds = Array.from(document.querySelectorAll('input[name="invoice-client"]:checked'))
            .map(input => input.value);

        if (selectedClientIds.length === 0) {
            this.showNotification('Veuillez sélectionner au moins un client', 'error');
            return;
        }

        // Créer les factures
        selectedClientIds.forEach(clientId => {
            const client = this.getClient(clientId);
            if (!client) return;

            // Obtenir les interventions du mois
            const monthInterventions = this.interventions.filter(i => {
                const intDate = new Date(i.date);
                return intDate.getMonth() === targetMonth && intDate.getFullYear() === targetYear && i.clientId === clientId;
            });

            if (monthInterventions.length === 0) return;

            const totalHours = monthInterventions.reduce((sum, i) => sum + this.calculateHours(i.start, i.end), 0);
            const totalAmount = totalHours * client.rate;

            // Créer la facture
            const invoice = {
                id: this.generateId(),
                clientId,
                month: monthStr,
                hours: totalHours,
                amount: totalAmount,
                status: 'pending',
                dueDate: new Date(targetYear, targetMonth + 1, 10).toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            };

            // Éviter les doublons
            const existingInvoice = this.invoices.find(inv =>
                inv.clientId === clientId && inv.month === monthStr
            );

            if (!existingInvoice) {
                this.invoices.push(invoice);
            }

            // Envoyer le SMS
            this.sendInvoiceSMS(client, totalHours, totalAmount, invoice.id);
        });

        this.saveData();
        this.closeModal();
        this.showNotification('Factures créées et SMS envoyés', 'success');
        this.renderDashboard();
    }

    /**
     * Envoyer une facture par SMS
     */
    sendInvoiceSMS(client, hours, amount, invoiceId) {
        const message = `Bonjour ${client.name},\n\nFacture du mois :\n- Heures : ${hours.toFixed(1)}h\n- Montant : ${amount.toFixed(2)}€\n\nMerci pour votre confiance.\nProAssistant`;

        // Simuler l'envoi du SMS
        this.simulateSMS(client.phone, message);

        // Ajouter une notification
        this.notifications.push({
            id: this.generateId(),
            type: 'sms_sent',
            clientId: client.id,
            clientName: client.name,
            message,
            timestamp: new Date().toISOString()
        });

        this.updateNotifications();
    }

    /**
     * Simuler l'envoi d'un SMS
     */
    simulateSMS(phone, message) {
        console.log(`📱 SMS envoyé à ${phone}: ${message}`);

        // Afficher la modal de simulation
        document.getElementById('sms-to').textContent = phone;
        document.getElementById('sms-content').textContent = message;
        document.getElementById('sms-time').textContent = new Date().toLocaleTimeString('fr-FR');
        this.openModal('sms-simulation');
    }

    /**
     * Générer une attestation
     */
    generateAttestation(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        const client = this.getClient(invoice.clientId);
        if (!client) return;

        const [year, month] = invoice.month.split('-');
        const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        const attestation = `
ATTESTATION DE SERVICES RENDUS

Client: ${client.name}
Adresse: ${client.address || '—'}

Période: ${monthName}

Services rendus:
- Type de prestation: ${client.serviceType}
- Heures effectuées: ${invoice.hours.toFixed(1)}h
- Tarif horaire: ${client.rate.toFixed(2)}€
- Montant total: ${invoice.amount.toFixed(2)}€

Établie le: ${new Date().toLocaleDateString('fr-FR')}

Cette attestation certifie que les services mentionnés ci-dessus ont été effectués.

Professionnel de l'aide à la personne
`;

        // Créer un blob et télécharger
        const blob = new Blob([attestation], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attestation_${client.name}_${invoice.month}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showNotification('Attestation téléchargée', 'success');
    }

    /**
     * Marquer une facture comme payée
     */
    markAsPaid(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            invoice.status = 'paid';
            invoice.paidAt = new Date().toISOString();
            this.saveData();
            this.renderInvoices();
            this.showNotification('Facture marquée comme payée', 'success');
        }
    }

    /**
     * Gestion des utilitaires
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
     * Obtenir les statistiques d'un client
     */
    getClientStats(clientId) {
        const clientInterventions = this.interventions.filter(i => i.clientId === clientId);
        const client = this.getClient(clientId);

        const hours = clientInterventions.reduce((sum, i) => sum + this.calculateHours(i.start, i.end), 0);
        const amount = hours * (client?.rate || 0);

        return { hours, amount };
    }

    /**
     * Obtenir un client par ID
     */
    getClient(clientId) {
        return this.clients.find(c => c.id === clientId);
    }

    /**
     * Remplir le sélecteur de clients dans la modal
     */
    populateClientSelect() {
        const select = document.getElementById('intervention-client');
        if (!select) return;

        select.innerHTML = '<option value="">Sélectionner un client</option>';
        this.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            select.appendChild(option);
        });
    }

    /**
     * Gestion des modales
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');

        if (modal) {
            modal.classList.add('active');
            overlay.classList.add('active');
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        document.getElementById('modal-overlay').classList.remove('active');
    }

    /**
     * Gestion des notifications
     */
    updateNotifications() {
        const badge = document.getElementById('notif-badge');
        badge.textContent = this.notifications.length;
    }

    showNotification(message, type = 'info') {
        // Créer une notification temporaire
        const notifEl = document.createElement('div');
        notifEl.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#6366f1'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 2000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        notifEl.textContent = message;
        document.body.appendChild(notifEl);

        setTimeout(() => {
            notifEl.remove();
        }, 3000);
    }

    /**
     * Recherche globale
     */
    handleGlobalSearch(term) {
        if (!term.trim()) {
            this.renderDashboard();
            return;
        }

        // Rechercher dans les clients
        const matchingClients = this.clients.filter(c =>
            c.name.toLowerCase().includes(term.toLowerCase()) ||
            c.phone.includes(term)
        );

        console.log('Résultats de recherche:', matchingClients);
        this.showNotification(`${matchingClients.length} résultat(s) trouvé(s)`, 'info');
    }

    /**
     * Profil utilisateur
     */
    saveProfile() {
        this.userProfile.name = document.getElementById('profile-name').value;
        this.userProfile.email = document.getElementById('profile-email').value;
        this.userProfile.phone = document.getElementById('profile-phone').value;

        // Mettre à jour le nom d'utilisateur dans la barre supérieure
        const userName = document.getElementById('user-name');
        if (this.userProfile.name) {
            userName.textContent = this.userProfile.name;
        }

        this.saveData();
        this.showNotification('Profil mis à jour', 'success');
    }

    /**
     * Export/Import des données
     */
    exportData() {
        const data = {
            clients: this.clients,
            interventions: this.interventions,
            invoices: this.invoices,
            userProfile: this.userProfile,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proassistant_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showNotification('Données exportées', 'success');
    }

    importData() {
        const input = document.getElementById('import-file');
        input.click();

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.clients = data.clients || [];
                    this.interventions = data.interventions || [];
                    this.invoices = data.invoices || [];
                    this.userProfile = data.userProfile || {};

                    this.saveData();
                    this.showNotification('Données importées avec succès', 'success');
                    this.renderDashboard();
                } catch (error) {
                    this.showNotification('Erreur lors de l\'import', 'error');
                }
            };
            reader.readAsText(file);
        });
    }

    clearAllData() {
        this.clients = [];
        this.interventions = [];
        this.invoices = [];
        this.notifications = [];
        this.userProfile = {};

        this.saveData();
        this.showNotification('Toutes les données ont été supprimées', 'success');
        this.renderDashboard();
    }

    /**
     * Persistance des données
     */
    saveData() {
        const data = {
            clients: this.clients,
            interventions: this.interventions,
            invoices: this.invoices,
            userProfile: this.userProfile,
            notifications: this.notifications
        };
        localStorage.setItem('proassistant_data', JSON.stringify(data));
    }

    loadData() {
        const stored = localStorage.getItem('proassistant_data');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.clients = data.clients || [];
                this.interventions = data.interventions || [];
                this.invoices = data.invoices || [];
                this.userProfile = data.userProfile || {};
                this.notifications = data.notifications || [];
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            }
        }

        // Vérifier les paiements en retard
        this.updateLatePayments();
    }

    /**
     * Mettre à jour les statuts des paiements en retard
     */
    updateLatePayments() {
        const now = new Date();
        this.invoices.forEach(invoice => {
            if (invoice.status === 'pending') {
                const dueDate = new Date(invoice.dueDate);
                if (now > dueDate) {
                    invoice.status = 'late';
                }
            }
        });
        this.saveData();
    }

    /**
     * Générer un ID unique
     */
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Initialiser l'application
const app = new ProAssistantApp();

// Animation CSS pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
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
