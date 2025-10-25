// Dashboard Module

async function loadDashboardHome() {
    setActiveMenuItem('loadDashboardHome');
    updatePageTitle('Dashboard');
    
    const user = Auth.getCurrentUser();
    const mainContent = document.getElementById('mainContent');
    
    showLoading();

    try {
        if (user.role === 'farmer') {
            await loadFarmerDashboard(mainContent);
        } else if (user.role === 'vet') {
            await loadVetDashboard(mainContent);
        } else if (user.role === 'agrovets') {
            await loadAgrovetsDashboard(mainContent);
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

async function loadFarmerDashboard(container) {
    // Fetch dashboard data
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

    // Calculate stats
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    const activeCrops = crops.filter(c => c.status === 'active').length;
    const healthyAnimals = livestock.filter(a => a.health_status === 'healthy').length;

    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card bg-primary">
                    <h3>${farms.length}</h3>
                    <p><i class="fas fa-map-marked-alt"></i> Total Farms</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-success">
                    <h3>${livestock.length}</h3>
                    <p><i class="fas fa-cow"></i> Total Livestock</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-warning">
                    <h3>${activeCrops}</h3>
                    <p><i class="fas fa-seedling"></i> Active Crops</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-info">
                    <h3>${formatCurrency(totalRevenue)}</h3>
                    <p><i class="fas fa-dollar-sign"></i> Total Sales</p>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-chart-line"></i> Recent Sales
                    </div>
                    <div class="card-body">
                        ${sales.length > 0 ? `
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${sales.slice(0, 5).map(sale => `
                                            <tr>
                                                <td>${sale.product_name}</td>
                                                <td>${formatDate(sale.sale_date)}</td>
                                                <td>${formatCurrency(sale.total_amount)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : '<p class="text-muted">No sales recorded yet.</p>'}
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-heartbeat"></i> Livestock Health Overview
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span>Healthy</span>
                                <span class="text-success">${healthyAnimals}</span>
                            </div>
                            <div class="progress">
                                <div class="progress-bar bg-success" style="width: ${livestock.length > 0 ? (healthyAnimals / livestock.length * 100) : 0}%"></div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span>Under Treatment</span>
                                <span class="text-warning">${livestock.filter(a => a.health_status === 'under_treatment').length}</span>
                            </div>
                            <div class="progress">
                                <div class="progress-bar bg-warning" style="width: ${livestock.length > 0 ? (livestock.filter(a => a.health_status === 'under_treatment').length / livestock.length * 100) : 0}%"></div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span>Sick</span>
                                <span class="text-danger">${livestock.filter(a => a.health_status === 'sick').length}</span>
                            </div>
                            <div class="progress">
                                <div class="progress-bar bg-danger" style="width: ${livestock.length > 0 ? (livestock.filter(a => a.health_status === 'sick').length / livestock.length * 100) : 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
                                    <i class="fas fa-plus"></i><br>Add Farm
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

async function loadVetDashboard(container) {
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
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="stat-card bg-primary">
                    <h3>${acceptedAssociations}</h3>
                    <p><i class="fas fa-map-marked-alt"></i> Associated Farms</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card bg-success">
                    <h3>${healthRecords.length}</h3>
                    <p><i class="fas fa-heartbeat"></i> Health Records</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card bg-warning">
                    <h3>${pendingInvitations}</h3>
                    <p><i class="fas fa-envelope"></i> Pending Invitations</p>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-map-marked-alt"></i> My Farms
                    </div>
                    <div class="card-body">
                        ${farms.length > 0 ? `
                            <ul class="list-group list-group-flush">
                                ${farms.map(farm => `
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        ${farm.name}
                                        <button class="btn btn-sm btn-outline-primary" onclick="viewFarm('${farm.id}')">
                                            View
                                        </button>
                                    </li>
                                `).join('')}
                            </ul>
                        ` : '<p class="text-muted">No associated farms yet.</p>'}
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
                            <ul class="list-group list-group-flush">
                                ${healthRecords.slice(0, 5).map(record => `
                                    <li class="list-group-item">
                                        <strong>${record.record_type}</strong> - ${formatDate(record.record_date)}
                                        <br><small class="text-muted">${record.livestock?.name || 'Animal'}</small>
                                    </li>
                                `).join('')}
                            </ul>
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
                        <a href="#" onclick="loadAssociationsPage(); return false;">View invitations</a>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
}

async function loadAgrovetsDashboard(container) {
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
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card bg-primary">
                    <h3>${analytics.total_listings || 0}</h3>
                    <p><i class="fas fa-box"></i> Total Listings</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-success">
                    <h3>${activeListings}</h3>
                    <p><i class="fas fa-check-circle"></i> Active Listings</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-warning">
                    <h3>${openInquiries}</h3>
                    <p><i class="fas fa-envelope"></i> Open Inquiries</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-info">
                    <h3>${analytics.total_views || 0}</h3>
                    <p><i class="fas fa-eye"></i> Total Views</p>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-chart-bar"></i> Listings by Category
                    </div>
                    <div class="card-body">
                        ${analytics.by_category && Object.keys(analytics.by_category).length > 0 ? `
                            ${Object.entries(analytics.by_category).map(([category, data]) => `
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="text-capitalize">${category}</span>
                                        <span>${data.count} (${data.views} views)</span>
                                    </div>
                                    <div class="progress">
                                        <div class="progress-bar bg-success" style="width: ${(data.count / analytics.total_listings * 100)}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        ` : '<p class="text-muted">No listings yet.</p>'}
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-comments"></i> Recent Inquiries
                    </div>
                    <div class="card-body">
                        ${inquiries.length > 0 ? `
                            <ul class="list-group list-group-flush">
                                ${inquiries.slice(0, 5).map(inquiry => `
                                    <li class="list-group-item">
                                        <strong>${inquiry.marketplace_listings?.product_name || 'Product'}</strong>
                                        <br><small class="text-muted">From: ${inquiry.users?.full_name || 'Customer'}</small>
                                        <br><span class="badge bg-${inquiry.status === 'open' ? 'warning' : 'success'}">${inquiry.status}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        ` : '<p class="text-muted">No inquiries yet.</p>'}
                    </div>
                </div>
            </div>
        </div>

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
