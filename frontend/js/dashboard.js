// Dashboard Module - Now shows User Profile

async function loadDashboardHome() {
    setActiveMenuItem('loadDashboardHome');
    updatePageTitle('My Profile');

    const user = Auth.getCurrentUser();
    const mainContent = document.getElementById('mainContent');

    showLoading();

    try {
        if (user.role === 'farmer') {
            await loadFarmerProfile(mainContent, user);
        } else if (user.role === 'vet') {
            await loadVetProfile(mainContent, user);
        } else if (user.role === 'agrovets') {
            await loadAgrovetsProfile(mainContent, user);
        }
    } catch (error) {
        mainContent.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Error loading profile: ${error.message}
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// Farmer Profile
async function loadFarmerProfile(container, user) {
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
                <h3>${user.full_name}</h3>
                <p class="text-muted">${user.email}</p>
                <span class="badge bg-success fs-6">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                ${user.phone ? `<p class="text-muted mt-2"><i class="fas fa-phone"></i> ${user.phone}</p>` : ''}
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
    `;
}

// Veterinarian Profile
async function loadVetProfile(container, user) {
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
                <h3>${user.full_name}</h3>
                <p class="text-muted">${user.email}</p>
                <span class="badge bg-primary fs-6">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                ${user.phone ? `<p class="text-muted mt-2"><i class="fas fa-phone"></i> ${user.phone}</p>` : ''}
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
                                            <br><small class="text-muted">${farm.location}</small>
                                        </div>
                                        <button class="btn btn-sm btn-outline-primary" onclick="viewFarm('${farm.id}')">
                                            View Details
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

// Agrovets Profile
async function loadAgrovetsProfile(container, user) {
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
                <h3>${user.full_name}</h3>
                <p class="text-muted">${user.email}</p>
                <span class="badge bg-success fs-6">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                ${user.phone ? `<p class="text-muted mt-2"><i class="fas fa-phone"></i> ${user.phone}</p>` : ''}
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
    `;
}
