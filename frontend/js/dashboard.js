// Dashboard Module - Role-specific business dashboards

async function loadDashboardHome() {
    setActiveMenuItem('loadDashboardHome');
    updatePageTitle('Business Dashboard');

    const user = await Auth.getCurrentUser();
    if (!user) {
        showLanding();
        return;
    }

    const mainContent = document.getElementById('mainContent');
    showLoading();

    try {
        // Get user profile with role
        const profile = await Auth.getUserProfile(user.id);
        if (!profile) {
            showToast('Error loading user profile', 'error');
            return;
        }

        if (profile.role === 'farmer') {
            await loadFarmerDashboard(mainContent, profile);
        } else if (profile.role === 'vet') {
            await loadVetDashboard(mainContent, profile);
        } else if (profile.role === 'agrovets') {
            await loadAgrovetsDashboard(mainContent, profile);
        }
    } catch (error) {
        mainContent.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Error loading dashboard: ${error.message}
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// Farmer Dashboard
async function loadFarmerDashboard(container, profile) {
    const user = Auth.getCurrentUser();

    // Fetch farmer's data using new API
    const farmsResult = await API.farms.getAll();
    const livestockResult = await API.livestock.getAll();
    const cropsResult = await API.crops.getAll();
    const salesResult = await API.sales.getAll();

    const farms = farmsResult.success ? farmsResult.data.farms : [];
    const livestock = livestockResult.success ? livestockResult.data.livestock : [];
    const crops = cropsResult.success ? cropsResult.data.crops : [];
    const sales = salesResult.success ? salesResult.data.sales : [];

    // Calculate summary stats
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    const activeCrops = crops.filter(c => c.status === 'active').length;
    const healthyAnimals = livestock.filter(a => a.health_status === 'healthy').length;

    container.innerHTML = `
        <!-- Welcome Header -->
        <div class="card mb-4">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i class="fas fa-tractor fa-4x text-success"></i>
                </div>
                <h3>Welcome back, ${profile.full_name}!</h3>
                <p class="text-muted">Here's your farm overview for today</p>
            </div>
        </div>

        <!-- Farm Summary Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-map-marked-alt fa-2x text-primary mb-2"></i>
                        <h4>${farms.length}</h4>
                        <p class="text-muted mb-0">Total Farms</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-cow fa-2x text-success mb-2"></i>
                        <h4>${livestock.length}</h4>
                        <p class="text-muted mb-0">Livestock</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-seedling fa-2x text-warning mb-2"></i>
                        <h4>${activeCrops}</h4>
                        <p class="text-muted mb-0">Active Crops</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-dollar-sign fa-2x text-info mb-2"></i>
                        <h4>${formatCurrency(totalRevenue)}</h4>
                        <p class="text-muted mb-0">Total Sales</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-history"></i> Recent Sales
                    </div>
                    <div class="card-body">
                        ${sales.length > 0 ? `
                            <div class="list-group list-group-flush">
                                ${sales.slice(0, 3).map(sale => `
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>${sale.product_name}</strong>
                                            <br><small class="text-muted">${formatDate(sale.sale_date)}</small>
                                        </div>
                                        <span class="badge bg-success">${formatCurrency(sale.total_amount)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-muted">No recent sales</p>'}
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-heartbeat"></i> Livestock Health Overview
                    </div>
                    <div class="card-body">
                        ${livestock.length > 0 ? `
                            <div class="row text-center">
                                <div class="col-4">
                                    <h5 class="text-success">${healthyAnimals}</h5>
                                    <p class="text-muted small">Healthy</p>
                                </div>
                                <div class="col-4">
                                    <h5 class="text-warning">${livestock.filter(a => a.health_status === 'under_treatment').length}</h5>
                                    <p class="text-muted small">Under Treatment</p>
                                </div>
                                <div class="col-4">
                                    <h5 class="text-danger">${livestock.filter(a => a.health_status === 'sick').length}</h5>
                                    <p class="text-muted small">Sick</p>
                                </div>
                            </div>
                        ` : '<p class="text-muted">No livestock data</p>'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Today's Reminders -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-bell"></i> Today's Tasks & Reminders
                            <span class="badge bg-info ms-2">${getTodayReminders(user.id).length}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="showAddReminderModal('${profile.role}')">
                            <i class="fas fa-plus"></i> Add Task
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderRemindersList(user.id)}
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-tasks"></i> Quick Actions
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3 mb-3">
                                <button class="btn btn-outline-success w-100" onclick="loadFarmsPage()">
                                    <i class="fas fa-plus"></i><br>Manage Farms
                                </button>
                            </div>
                            <div class="col-md-3 mb-3">
                                <button class="btn btn-outline-success w-100" onclick="loadLivestockPage()">
                                    <i class="fas fa-plus"></i><br>Add Livestock
                                </button>
                            </div>
                            <div class="col-md-3 mb-3">
                                <button class="btn btn-outline-success w-100" onclick="loadSalesPage()">
                                    <i class="fas fa-plus"></i><br>Record Sale
                                </button>
                            </div>
                            <div class="col-md-3 mb-3">
                                <button class="btn btn-outline-success w-100" onclick="loadMarketplacePage()">
                                    <i class="fas fa-store"></i><br>Browse Marketplace
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Vet Dashboard
async function loadVetDashboard(container, profile) {
    const farmsResult = await API.farms.getAll();
    const healthRecordsResult = await API.healthRecords.getAll();
    const associationsResult = await API.associations.getAll();

    const farms = farmsResult.success ? farmsResult.data.farms : [];
    const healthRecords = healthRecordsResult.success ? healthRecordsResult.data.health_records : [];
    const associations = associationsResult.success ? associationsResult.data.associations : [];

    const pendingInvitations = associations.filter(a => a.invitation_status === 'pending').length;
    const acceptedAssociations = associations.filter(a => a.invitation_status === 'accepted').length;

    container.innerHTML = `
        <!-- Welcome Header -->
        <div class="card mb-4">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i class="fas fa-user-md fa-4x text-primary"></i>
                </div>
                <h3>Welcome back, Dr. ${profile.full_name}!</h3>
                <p class="text-muted">Here's your veterinary practice overview</p>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-map-marked-alt fa-2x text-primary mb-2"></i>
                        <h4>${acceptedAssociations}</h4>
                        <p class="text-muted mb-0">Associated Farms</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-heartbeat fa-2x text-success mb-2"></i>
                        <h4>${healthRecords.length}</h4>
                        <p class="text-muted mb-0">Health Records</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-envelope fa-2x text-warning mb-2"></i>
                        <h4>${pendingInvitations}</h4>
                        <p class="text-muted mb-0">Pending Invitations</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Farm Associations -->
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-map-marked-alt"></i> My Farm Associations
                    </div>
                    <div class="card-body">
                        ${farms.length > 0 ? `
                            <div class="list-group list-group-flush">
                                ${farms.map(farm => `
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>${farm.name}</strong>
                                            <br><small class="text-muted">${farm.location_text || 'No location'}</small>
                                        </div>
                                        <button class="btn btn-sm btn-outline-primary" onclick="loadHealthRecordsPage()">
                                            View Records
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-muted">No associated farms yet. <a href="#" onclick="loadAssociationsPage(); return false;">Browse available farms</a></p>'}
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-heartbeat"></i> Recent Health Records
                    </div>
                    <div class="card-body">
                        ${healthRecords.length > 0 ? `
                            <div class="list-group list-group-flush">
                                ${healthRecords.slice(0, 3).map(record => `
                                    <div class="list-group-item">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <strong>${record.record_type}</strong>
                                                <br><small class="text-muted">${record.livestock?.name || 'Animal'} - ${formatDate(record.record_date)}</small>
                                            </div>
                                            <span class="badge bg-${record.severity === 'high' ? 'danger' : record.severity === 'medium' ? 'warning' : 'success'}">${record.severity || 'normal'}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-muted">No health records yet.</p>'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Today's Reminders -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-bell"></i> Today's Tasks & Reminders
                            <span class="badge bg-info ms-2">${getTodayReminders(profile.id).length}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="showAddReminderModal('${profile.role}')">
                            <i class="fas fa-plus"></i> Add Task
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderRemindersList(profile.id)}
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-tasks"></i> Quick Actions
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-outline-primary w-100" onclick="loadHealthRecordsPage()">
                                    <i class="fas fa-heartbeat"></i><br>Health Records
                                </button>
                            </div>
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-outline-primary w-100" onclick="loadLivestockPage()">
                                    <i class="fas fa-cow"></i><br>Livestock
                                </button>
                            </div>
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-outline-info w-100" onclick="loadAssociationsPage()">
                                    <i class="fas fa-handshake"></i><br>Farm Associations
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Agrovets Dashboard
async function loadAgrovetsDashboard(container, profile) {
    const listingsResult = await API.marketplace.getMyListings();
    const inquiriesResult = await API.marketplace.getInquiries();
    const analyticsResult = await API.marketplace.getAnalytics();

    const listings = listingsResult.success ? listingsResult.data.listings : [];
    const inquiries = inquiriesResult.success ? inquiriesResult.data.inquiries : [];
    const analytics = analyticsResult.success ? analyticsResult.data.analytics : {};

    const activeListings = listings.filter(l => l.status === 'active').length;
    const openInquiries = inquiries.filter(i => i.status === 'open').length;

    container.innerHTML = `
        <!-- Welcome Header -->
        <div class="card mb-4">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i class="fas fa-store fa-4x text-success"></i>
                </div>
                <h3>Welcome back, ${profile.full_name}!</h3>
                <p class="text-muted">Here's your business overview</p>
            </div>
        </div>

        <!-- Business Stats -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-box fa-2x text-primary mb-2"></i>
                        <h4>${analytics.total_listings || 0}</h4>
                        <p class="text-muted mb-0">Total Products</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                        <h4>${activeListings}</h4>
                        <p class="text-muted mb-0">Active Listings</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-envelope fa-2x text-warning mb-2"></i>
                        <h4>${openInquiries}</h4>
                        <p class="text-muted mb-0">Open Inquiries</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-eye fa-2x text-info mb-2"></i>
                        <h4>${analytics.total_views || 0}</h4>
                        <p class="text-muted mb-0">Profile Views</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-chart-bar"></i> Product Categories
                    </div>
                    <div class="card-body">
                        ${analytics.by_category && Object.keys(analytics.by_category).length > 0 ? `
                            ${Object.entries(analytics.by_category).map(([category, data]) => `
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="text-capitalize">${category}</span>
                                        <span>${data.count} products (${data.views} views)</span>
                                    </div>
                                    <div class="progress" style="height: 8px;">
                                        <div class="progress-bar bg-success" style="width: ${analytics.total_listings > 0 ? (data.count / analytics.total_listings * 100) : 0}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        ` : '<p class="text-muted">No products listed yet. <a href="#" onclick="showAddProductModal(); return false;">Add your first product</a></p>'}
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-comments"></i> Recent Customer Inquiries
                    </div>
                    <div class="card-body">
                        ${inquiries.length > 0 ? `
                            <div class="list-group list-group-flush">
                                ${inquiries.slice(0, 3).map(inquiry => `
                                    <div class="list-group-item">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <strong>${inquiry.marketplace_listings?.product_name || 'Product'}</strong>
                                                <br><small class="text-muted">From: ${inquiry.users?.full_name || 'Customer'}</small>
                                                <br><small class="text-muted">${formatDate(inquiry.created_at)}</small>
                                            </div>
                                            <span class="badge bg-${inquiry.status === 'open' ? 'warning' : inquiry.status === 'responded' ? 'info' : 'success'}">${inquiry.status}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-muted">No inquiries yet.</p>'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Today's Reminders -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-bell"></i> Today's Tasks & Reminders
                            <span class="badge bg-info ms-2">${getTodayReminders(profile.id).length}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="showAddReminderModal('${profile.role}')">
                            <i class="fas fa-plus"></i> Add Task
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderRemindersList(profile.id)}
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-tasks"></i> Quick Actions
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-outline-success w-100" onclick="showAddProductModal()">
                                    <i class="fas fa-plus"></i><br>Add New Product
                                </button>
                            </div>
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-outline-primary w-100" onclick="loadMyListingsPage()">
                                    <i class="fas fa-list"></i><br>Manage Listings
                                </button>
                            </div>
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-outline-info w-100" onclick="loadInquiriesPage()">
                                    <i class="fas fa-envelope"></i><br>View Inquiries
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get all reminders for a user
function getAllReminders(userId) {
    const reminders = JSON.parse(localStorage.getItem('agritrack_reminders') || '{}');
    return reminders[userId] || [];
}

// Render all reminders list (for tasks page)
function renderAllRemindersList(userId, filter = 'all') {
    let reminders = getAllReminders(userId);

    if (filter === 'today') {
        reminders = getTodayReminders(userId);
    }

    if (reminders.length === 0) {
        return '<p class="text-muted">No tasks found.</p>';
    }

    // Sort by completion status and time
    reminders.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1; // Completed tasks at bottom
        }
        return a.time.localeCompare(b.time); // Then by time
    });

    return `
        <div class="list-group list-group-flush">
            ${reminders.map(reminder => `
                <div class="list-group-item d-flex justify-content-between align-items-start ${reminder.completed ? 'opacity-50' : ''}">
                    <div class="d-flex align-items-start">
                        <div class="form-check me-3 mt-1">
                            <input class="form-check-input" type="checkbox"
                                   ${reminder.completed ? 'checked' : ''}
                                   onchange="toggleReminder('${userId}', ${reminder.id})">
                        </div>
                        <div>
                            <h6 class="mb-1 ${reminder.completed ? 'text-decoration-line-through' : ''}">${reminder.title}</h6>
                            ${reminder.description ? `<p class="text-muted small mb-1">${reminder.description}</p>` : ''}
                            <div class="d-flex align-items-center gap-2">
                                <small class="text-muted">
                                    <i class="fas fa-calendar"></i> ${new Date(reminder.date).toLocaleDateString()}
                                    <i class="fas fa-clock ms-2"></i> ${reminder.time}
                                </small>
                                <span class="badge bg-${getPriorityColor(reminder.priority)}">${reminder.priority}</span>
                                ${reminder.completed ? '<span class="badge bg-success">Completed</span>' : '<span class="badge bg-warning">Pending</span>'}
                            </div>
                        </div>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-secondary" onclick="editReminder('${userId}', ${reminder.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteReminder('${userId}', ${reminder.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Reminder Management Functions

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Get today's reminders for a user
function getTodayReminders(userId) {
    const reminders = JSON.parse(localStorage.getItem('agritrack_reminders') || '{}');
    const today = getTodayDate();
    const userReminders = reminders[userId] || [];
    return userReminders.filter(reminder => reminder.date === today);
}

// Save reminder to localStorage
function saveReminder(userId, reminder) {
    const reminders = JSON.parse(localStorage.getItem('agritrack_reminders') || '{}');
    if (!reminders[userId]) {
        reminders[userId] = [];
    }

    reminders[userId].push({
        id: Date.now() + Math.random(),
        ...reminder,
        completed: false,
        createdAt: new Date().toISOString()
    });

    localStorage.setItem('agritrack_reminders', JSON.stringify(reminders));
}

// Delete reminder
function deleteReminder(userId, reminderId) {
    const reminders = JSON.parse(localStorage.getItem('agritrack_reminders') || '{}');
    if (reminders[userId]) {
        reminders[userId] = reminders[userId].filter(r => r.id !== reminderId);
        localStorage.setItem('agritrack_reminders', JSON.stringify(reminders));
        showToast('Task deleted', 'success');
        loadDashboardHome();
    }
}

// Toggle reminder completion
function toggleReminder(userId, reminderId) {
    const reminders = JSON.parse(localStorage.getItem('agritrack_reminders') || '{}');
    if (reminders[userId]) {
        const reminder = reminders[userId].find(r => r.id === reminderId);
        if (reminder) {
            reminder.completed = !reminder.completed;
            localStorage.setItem('agritrack_reminders', JSON.stringify(reminders));
            loadDashboardHome();
        }
    }
}

// Render reminders list
function renderRemindersList(userId) {
    const reminders = getTodayReminders(userId);

    if (reminders.length === 0) {
        return '<p class="text-muted">No tasks for today. <a href="#" onclick="showAddReminderModal()">Add your first task!</a></p>';
    }

    return `
        <div class="list-group list-group-flush">
            ${reminders.map(reminder => `
                <div class="list-group-item d-flex justify-content-between align-items-start ${reminder.completed ? 'opacity-50' : ''}">
                    <div class="d-flex align-items-start">
                        <div class="form-check me-3 mt-1">
                            <input class="form-check-input" type="checkbox"
                                   ${reminder.completed ? 'checked' : ''}
                                   onchange="toggleReminder('${userId}', ${reminder.id})">
                        </div>
                        <div>
                            <h6 class="mb-1 ${reminder.completed ? 'text-decoration-line-through' : ''}">${reminder.title}</h6>
                            ${reminder.description ? `<p class="text-muted small mb-1">${reminder.description}</p>` : ''}
                            <div class="d-flex align-items-center gap-2">
                                <small class="text-muted">
                                    <i class="fas fa-clock"></i> ${reminder.time}
                                </small>
                                <span class="badge bg-${getPriorityColor(reminder.priority)}">${reminder.priority}</span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-secondary" onclick="editReminder('${userId}', ${reminder.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteReminder('${userId}', ${reminder.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Get priority color for badge
function getPriorityColor(priority) {
    switch (priority.toLowerCase()) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'secondary';
    }
}

// Show add reminder modal
function showAddReminderModal(role = 'farmer') {
    const modal = createReminderModal(role);
    document.body.insertAdjacentHTML('beforeend', modal);
    const modalEl = document.getElementById('reminderModal');
    const modalInstance = new bootstrap.Modal(modalEl);
    modalInstance.show();

    modalEl.addEventListener('hidden.bs.modal', () => {
        modalEl.remove();
    });

    document.getElementById('reminderForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveNewReminder();
        modalInstance.hide();
    });
}

// Create reminder modal HTML
function createReminderModal(role) {
    const roleTasks = getRoleTaskSuggestions(role);

    return `
        <div class="modal fade" id="reminderModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-plus-circle text-success me-2"></i>
                            Add New Task
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="reminderForm">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="taskTitle" class="form-label">Task Title</label>
                                <input type="text" class="form-control" id="taskTitle" required>
                                <div class="form-text">Brief description of the task</div>
                            </div>

                            <div class="mb-3">
                                <label for="taskDescription" class="form-label">Description (Optional)</label>
                                <textarea class="form-control" id="taskDescription" rows="2"></textarea>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="taskTime" class="form-label">Time</label>
                                    <input type="time" class="form-control" id="taskTime" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="taskPriority" class="form-label">Priority</label>
                                    <select class="form-select" id="taskPriority">
                                        <option value="low">Low</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            ${roleTasks ? `
                                <div class="mb-3">
                                    <label class="form-label">Suggested Tasks</label>
                                    <div class="d-flex flex-wrap gap-1">
                                        ${roleTasks.map(task => `
                                            <button type="button" class="btn btn-sm btn-outline-secondary"
                                                    onclick="document.getElementById('taskTitle').value='${task.title}'; ${task.description ? `document.getElementById('taskDescription').value='${task.description}';` : ''}">
                                                ${task.title}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save me-1"></i> Save Task
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Get role-specific task suggestions
function getRoleTaskSuggestions(role) {
    const suggestions = {
        farmer: [
            { title: 'Check livestock health', description: 'Monitor animals for any signs of illness' },
            { title: 'Water crops', description: 'Ensure all crops are properly irrigated' },
            { title: 'Record daily sales', description: 'Update sales records for the day' },
            { title: 'Clean farm equipment', description: 'Maintenance of tools and machinery' },
            { title: 'Check weather forecast', description: 'Plan activities based on weather conditions' }
        ],
        vet: [
            { title: 'Farm visit appointment', description: 'Scheduled visit to check animal health' },
            { title: 'Review health records', description: 'Update and review patient files' },
            { title: 'Prepare medications', description: 'Organize medications for the day' },
            { title: 'Follow up calls', description: 'Call farmers about treatment progress' },
            { title: 'Equipment sterilization', description: 'Clean and sterilize medical equipment' }
        ],
        agrovets: [
            { title: 'Restock inventory', description: 'Check and reorder low stock items' },
            { title: 'Customer orders', description: 'Process and prepare customer orders' },
            { title: 'Update product listings', description: 'Add new products to marketplace' },
            { title: 'Customer inquiries', description: 'Respond to customer questions' },
            { title: 'Delivery coordination', description: 'Arrange product deliveries' }
        ]
    };

    return suggestions[role] || null;
}

// Save new reminder
function saveNewReminder() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const time = document.getElementById('taskTime').value;
    const priority = document.getElementById('taskPriority').value;
    const date = getTodayDate();

    if (!title || !time) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    saveReminder(user.id, {
        title,
        description,
        time,
        priority,
        date
    });

    showToast('Task added successfully!', 'success');
    loadDashboardHome();
}

// Profile Page Function
async function loadProfilePage() {
    setActiveMenuItem('loadProfilePage');
    updatePageTitle('My Profile');

    const user = await Auth.getCurrentUser();
    if (!user) {
        showLanding();
        return;
    }

    const profileContent = document.getElementById('profileContent');
    showLoading();

    try {
        // Get user profile with role
        const profile = await Auth.getUserProfile(user.id);
        if (!profile) {
            showToast('Error loading user profile', 'error');
            return;
        }

        if (profile.role === 'farmer') {
            await loadFarmerProfilePage(profileContent, profile);
        } else if (profile.role === 'vet') {
            await loadVetProfilePage(profileContent, profile);
        } else if (profile.role === 'agrovets') {
            await loadAgrovetsProfilePage(profileContent, profile);
        }
    } catch (error) {
        profileContent.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Error loading profile: ${error.message}
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// Tasks Page Function
function loadTasksPage() {
    setActiveMenuItem('loadTasksPage');
    updatePageTitle('My Tasks');

    const user = Auth.getCurrentUser();
    const mainContent = document.getElementById('mainContent');

    showLoading();

    try {
        const allReminders = getAllReminders(user.id);
        const todayReminders = getTodayReminders(user.id);

        mainContent.innerHTML = `
            <!-- Tasks Header -->
            <div class="card mb-4">
                <div class="card-body text-center">
                    <div class="mb-3">
                        <i class="fas fa-tasks fa-4x text-primary"></i>
                    </div>
                    <h3>Task Management</h3>
                    <p class="text-muted">Organize your daily activities and track progress</p>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card dashboard-card text-center h-100">
                        <div class="card-body">
                            <i class="fas fa-calendar-day fa-2x text-info mb-2"></i>
                            <h4>${todayReminders.length}</h4>
                            <p class="text-muted mb-0">Today's Tasks</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card dashboard-card text-center h-100">
                        <div class="card-body">
                            <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                            <h4>${todayReminders.filter(r => r.completed).length}</h4>
                            <p class="text-muted mb-0">Completed Today</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card dashboard-card text-center h-100">
                        <div class="card-body">
                            <i class="fas fa-clock fa-2x text-warning mb-2"></i>
                            <h4>${todayReminders.filter(r => !r.completed).length}</h4>
                            <p class="text-muted mb-0">Pending Today</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card dashboard-card text-center h-100">
                        <div class="card-body">
                            <i class="fas fa-list fa-2x text-secondary mb-2"></i>
                            <h4>${allReminders.length}</h4>
                            <p class="text-muted mb-0">Total Tasks</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Today's Tasks -->
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas fa-calendar-day"></i> Today's Tasks
                        <span class="badge bg-info ms-2">${todayReminders.length}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" onclick="showAddReminderModal('${user.role}')">
                        <i class="fas fa-plus"></i> Add Task
                    </button>
                </div>
                <div class="card-body">
                    ${todayReminders.length > 0 ? renderAllRemindersList(user.id, 'today') : '<p class="text-muted">No tasks for today. <a href="#" onclick="showAddReminderModal()">Add your first task!</a></p>'}
                </div>
            </div>

            <!-- All Tasks -->
            <div class="card">
                <div class="card-header">
                    <i class="fas fa-list"></i> All Tasks
                    <span class="badge bg-secondary ms-2">${allReminders.length}</span>
                </div>
                <div class="card-body">
                    ${allReminders.length > 0 ? renderAllRemindersList(user.id, 'all') : '<p class="text-muted">No tasks yet. Start by adding some daily tasks!</p>'}
                </div>
            </div>
        `;
    } catch (error) {
        mainContent.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Error loading tasks: ${error.message}
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// Render all reminders list (for tasks page)
function renderAllRemindersList(userId, filter = 'all') {
    let reminders = getAllReminders(userId);

    if (filter === 'today') {
        reminders = getTodayReminders(userId);
    }

    if (reminders.length === 0) {
        return '<p class="text-muted">No tasks found.</p>';
    }

    // Sort by completion status and time
    reminders.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1; // Completed tasks at bottom
        }
        return a.time.localeCompare(b.time); // Then by time
    });

    return `
        <div class="list-group list-group-flush">
            ${reminders.map(reminder => `
                <div class="list-group-item d-flex justify-content-between align-items-start ${reminder.completed ? 'opacity-50' : ''}">
                    <div class="d-flex align-items-start">
                        <div class="form-check me-3 mt-1">
                            <input class="form-check-input" type="checkbox"
                                   ${reminder.completed ? 'checked' : ''}
                                   onchange="toggleReminder('${userId}', ${reminder.id})">
                        </div>
                        <div>
                            <h6 class="mb-1 ${reminder.completed ? 'text-decoration-line-through' : ''}">${reminder.title}</h6>
                            ${reminder.description ? `<p class="text-muted small mb-1">${reminder.description}</p>` : ''}
                            <div class="d-flex align-items-center gap-2">
                                <small class="text-muted">
                                    <i class="fas fa-calendar"></i> ${new Date(reminder.date).toLocaleDateString()}
                                    <i class="fas fa-clock ms-2"></i> ${reminder.time}
                                </small>
                                <span class="badge bg-${getPriorityColor(reminder.priority)}">${reminder.priority}</span>
                                ${reminder.completed ? '<span class="badge bg-success">Completed</span>' : '<span class="badge bg-warning">Pending</span>'}
                            </div>
                        </div>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-secondary" onclick="editReminder('${userId}', ${reminder.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteReminder('${userId}', ${reminder.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Edit reminder function
function editReminder(userId, reminderId) {
    const reminders = JSON.parse(localStorage.getItem('agritrack_reminders') || '{}');
    const reminder = reminders[userId]?.find(r => r.id === reminderId);

    if (reminder) {
        // Show modal with existing data
        showAddReminderModal();

        // Wait for modal to be ready, then pre-fill
        setTimeout(() => {
            document.getElementById('taskTitle').value = reminder.title;
            document.getElementById('taskDescription').value = reminder.description || '';
            document.getElementById('taskTime').value = reminder.time;
            document.getElementById('taskPriority').value = reminder.priority;

            // Override the submit handler for editing
            const form = document.getElementById('reminderForm');
            form.onsubmit = (e) => {
                e.preventDefault();
                updateReminder(userId, reminderId);
                bootstrap.Modal.getInstance(document.getElementById('reminderModal')).hide();
            };
        }, 100);
    }
}

// Update reminder
function updateReminder(userId, reminderId) {
    const reminders = JSON.parse(localStorage.getItem('agritrack_reminders') || '{}');
    const reminderIndex = reminders[userId]?.findIndex(r => r.id === reminderId);

    if (reminderIndex !== -1) {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const time = document.getElementById('taskTime').value;
        const priority = document.getElementById('taskPriority').value;

        reminders[userId][reminderIndex] = {
            ...reminders[userId][reminderIndex],
            title,
            description,
            time,
            priority,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('agritrack_reminders', JSON.stringify(reminders));
        showToast('Task updated successfully!', 'success');
        loadDashboardHome();
    }
}

// ============================================
// PROFILE PAGE FUNCTIONS
// ============================================

// Farmer Profile Page
async function loadFarmerProfilePage(container, profile) {
    const user = Auth.getCurrentUser();

    // Fetch farmer's data
    const [farmsResult, livestockResult, cropsResult, salesResult] = await Promise.all([
        API.farms.getAll(),
        API.livestock.getAll(),
        API.crops.getAll(),
        API.sales.getAll()
    ]);

    const farms = farmsResult.success ? farmsResult.data.farms : [];
    const livestock = livestockResult.success ? livestockResult.data.livestock : [];
    const crops = cropsResult.success ? cropsResult.data.crops : [];
    const sales = salesResult.success ? salesResult.data.sales : [];

    // Calculate summary stats
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    const activeCrops = crops.filter(c => c.status === 'active').length;
    const healthyAnimals = livestock.filter(a => a.health_status === 'healthy').length;

    container.innerHTML = `
        <!-- Profile Header -->
        <div class="card mb-4">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i class="fas fa-user-circle fa-5x text-success"></i>
                </div>
                <h3>${profile.full_name}</h3>
                <p class="text-muted">${user.email}</p>
                <span class="badge bg-success fs-6">${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</span>
                ${profile.phone ? `<p class="text-muted mt-2"><i class="fas fa-phone"></i> ${profile.phone}</p>` : ''}
            </div>
        </div>

        <!-- Farm Summary Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-map-marked-alt fa-2x text-primary mb-2"></i>
                        <h4>${farms.length}</h4>
                        <p class="text-muted mb-0">Total Farms</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-cow fa-2x text-success mb-2"></i>
                        <h4>${livestock.length}</h4>
                        <p class="text-muted mb-0">Livestock</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-seedling fa-2x text-warning mb-2"></i>
                        <h4>${activeCrops}</h4>
                        <p class="text-muted mb-0">Active Crops</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-dollar-sign fa-2x text-info mb-2"></i>
                        <h4>${formatCurrency(totalRevenue)}</h4>
                        <p class="text-muted mb-0">Total Sales</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-history"></i> Recent Sales
                    </div>
                    <div class="card-body">
                        ${sales.length > 0 ? `
                            <div class="list-group list-group-flush">
                                ${sales.slice(0, 3).map(sale => `
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>${sale.product_name}</strong>
                                            <br><small class="text-muted">${formatDate(sale.sale_date)}</small>
                                        </div>
                                        <span class="badge bg-success">${formatCurrency(sale.total_amount)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-muted">No recent sales</p>'}
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-heartbeat"></i> Livestock Health Overview
                    </div>
                    <div class="card-body">
                        ${livestock.length > 0 ? `
                            <div class="row text-center">
                                <div class="col-4">
                                    <h5 class="text-success">${healthyAnimals}</h5>
                                    <p class="text-muted small">Healthy</p>
                                </div>
                                <div class="col-4">
                                    <h5 class="text-warning">${livestock.filter(a => a.health_status === 'under_treatment').length}</h5>
                                    <p class="text-muted small">Under Treatment</p>
                                </div>
                                <div class="col-4">
                                    <h5 class="text-danger">${livestock.filter(a => a.health_status === 'sick').length}</h5>
                                    <p class="text-muted small">Sick</p>
                                </div>
                            </div>
                        ` : '<p class="text-muted">No livestock data</p>'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Today's Reminders -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-bell"></i> Today's Tasks & Reminders
                            <span class="badge bg-info ms-2">${getTodayReminders(user.id).length}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="showAddReminderModal('${profile.role}')">
                            <i class="fas fa-plus"></i> Add Task
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderRemindersList(user.id)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Vet Profile Page
async function loadVetProfilePage(container, profile) {
    const [farmsResult, healthRecordsResult, associationsResult] = await Promise.all([
        API.farms.getAll(),
        API.healthRecords.getAll(),
        API.associations.getAll()
    ]);

    const farms = farmsResult.success ? farmsResult.data.farms : [];
    const healthRecords = healthRecordsResult.success ? healthRecordsResult.data.health_records : [];
    const associations = associationsResult.success ? associationsResult.data.associations : [];

    const pendingInvitations = associations.filter(a => a.invitation_status === 'pending').length;
    const acceptedAssociations = associations.filter(a => a.invitation_status === 'accepted').length;

    container.innerHTML = `
        <!-- Profile Header -->
        <div class="card mb-4">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i class="fas fa-user-md fa-5x text-primary"></i>
                </div>
                <h3>${profile.full_name}</h3>
                <p class="text-muted">${Auth.getCurrentUser().email}</p>
                <span class="badge bg-primary fs-6">${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</span>
                ${profile.phone ? `<p class="text-muted mt-2"><i class="fas fa-phone"></i> ${profile.phone}</p>` : ''}
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-map-marked-alt fa-2x text-primary mb-2"></i>
                        <h4>${acceptedAssociations}</h4>
                        <p class="text-muted mb-0">Associated Farms</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-heartbeat fa-2x text-success mb-2"></i>
                        <h4>${healthRecords.length}</h4>
                        <p class="text-muted mb-0">Health Records</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-envelope fa-2x text-warning mb-2"></i>
                        <h4>${pendingInvitations}</h4>
                        <p class="text-muted mb-0">Pending Invitations</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Farm Associations -->
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-map-marked-alt"></i> My Farm Associations
                    </div>
                    <div class="card-body">
                        ${farms.length > 0 ? `
                            <div class="list-group list-group-flush">
                                ${farms.map(farm => `
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>${farm.name}</strong>
                                            <br><small class="text-muted">${farm.location_text || 'No location'}</small>
                                        </div>
                                        <button class="btn btn-sm btn-outline-primary" onclick="loadHealthRecordsPage()">
                                            View Records
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-muted">No associated farms yet. <a href="#" onclick="loadAssociationsPage(); return false;">Browse available farms</a></p>'}
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-heartbeat"></i> Recent Health Records
                    </div>
                    <div class="card-body">
                        ${healthRecords.length > 0 ? `
                            <div class="list-group list-group-flush">
                                ${healthRecords.slice(0, 3).map(record => `
                                    <div class="list-group-item">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <strong>${record.record_type}</strong>
                                                <br><small class="text-muted">${record.livestock?.name || 'Animal'} - ${formatDate(record.record_date)}</small>
                                            </div>
                                            <span class="badge bg-${record.severity === 'high' ? 'danger' : record.severity === 'medium' ? 'warning' : 'success'}">${record.severity || 'normal'}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-muted">No health records yet.</p>'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Today's Reminders -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-bell"></i> Today's Tasks & Reminders
                            <span class="badge bg-info ms-2">${getTodayReminders(profile.id).length}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="showAddReminderModal('${profile.role}')">
                            <i class="fas fa-plus"></i> Add Task
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderRemindersList(profile.id)}
                    </div>
                </div>
            </div>
        </div>

        ${pendingInvitations > 0 ? `
            <div class="row mt-4">
                <div class="col-12">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        You have ${pendingInvitations} pending farm invitation(s).
                        <a href="#" onclick="loadAssociationsPage(); return false;" class="alert-link">View and respond to invitations</a>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
}

// Agrovets Profile Page
async function loadAgrovetsProfilePage(container, profile) {
    const [listingsResult, inquiriesResult, analyticsResult] = await Promise.all([
        API.marketplace.getMyListings(),
        API.marketplace.getInquiries(),
        API.marketplace.getAnalytics()
    ]);

    const listings = listingsResult.success ? listingsResult.data.listings : [];
    const inquiries = inquiriesResult.success ? inquiriesResult.data.inquiries : [];
    const analytics = analyticsResult.success ? analyticsResult.data.analytics : {};

    const activeListings = listings.filter(l => l.status === 'active').length;
    const openInquiries = inquiries.filter(i => i.status === 'open').length;

    container.innerHTML = `
        <!-- Profile Header -->
        <div class="card mb-4">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i class="fas fa-store fa-5x text-success"></i>
                </div>
                <h3>${profile.full_name}</h3>
                <p class="text-muted">${Auth.getCurrentUser().email}</p>
                <span class="badge bg-success fs-6">${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</span>
                ${profile.phone ? `<p class="text-muted mt-2"><i class="fas fa-phone"></i> ${profile.phone}</p>` : ''}
            </div>
        </div>

        <!-- Business Stats -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-box fa-2x text-primary mb-2"></i>
                        <h4>${analytics.total_listings || 0}</h4>
                        <p class="text-muted mb-0">Total Products</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                        <h4>${activeListings}</h4>
                        <p class="text-muted mb-0">Active Listings</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-envelope fa-2x text-warning mb-2"></i>
                        <h4>${openInquiries}</h4>
                        <p class="text-muted mb-0">Open Inquiries</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card text-center h-100">
                    <div class="card-body">
                        <i class="fas fa-eye fa-2x text-info mb-2"></i>
                        <h4>${analytics.total_views || 0}</h4>
                        <p class="text-muted mb-0">Profile Views</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-chart-bar"></i> Product Categories
                    </div>
                    <div class="card-body">
                        ${analytics.by_category && Object.keys(analytics.by_category).length > 0 ? `
                            ${Object.entries(analytics.by_category).map(([category, data]) => `
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="text-capitalize">${category}</span>
                                        <span>${data.count} products (${data.views} views)</span>
                                    </div>
                                    <div class="progress" style="height: 8px;">
                                        <div class="progress-bar bg-success" style="width: ${analytics.total_listings > 0 ? (data.count / analytics.total_listings * 100) : 0}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        ` : '<p class="text-muted">No products listed yet. <a href="#" onclick="showAddProductModal(); return false;">Add your first product</a></p>'}
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-comments"></i> Recent Customer Inquiries
                    </div>
                    <div class="card-body">
                        ${inquiries.length > 0 ? `
                            <div class="list-group list-group-flush">
                                ${inquiries.slice(0, 3).map(inquiry => `
                                    <div class="list-group-item">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <strong>${inquiry.marketplace_listings?.product_name || 'Product'}</strong>
                                                <br><small class="text-muted">From: ${inquiry.users?.full_name || 'Customer'}</small>
                                                <br><small class="text-muted">${formatDate(inquiry.created_at)}</small>
                                            </div>
                                            <span class="badge bg-${inquiry.status === 'open' ? 'warning' : inquiry.status === 'responded' ? 'info' : 'success'}">${inquiry.status}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-muted">No inquiries yet.</p>'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Today's Reminders -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-bell"></i> Today's Tasks & Reminders
                            <span class="badge bg-info ms-2">${getTodayReminders(profile.id).length}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="showAddReminderModal('${profile.role}')">
                            <i class="fas fa-plus"></i> Add Task
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderRemindersList(profile.id)}
                    </div>
                </div>
            </div>
        </div>
    `;
}
