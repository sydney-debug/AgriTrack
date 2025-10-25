// Marketplace Module

let currentListings = [];

async function loadMarketplacePage() {
    setActiveMenuItem('loadMarketplacePage');
    updatePageTitle('Marketplace');
    
    const mainContent = document.getElementById('mainContent');
    const user = Auth.getCurrentUser();
    
    showLoading();
    const result = await API.marketplace.getListings({ status: 'active' });
    hideLoading();

    if (!result.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading marketplace: ${result.error}</div>`;
        return;
    }

    currentListings = result.data.listings;

    mainContent.innerHTML = `
        <div class="row mb-3">
            <div class="col-md-6">
                <input type="text" class="form-control" id="marketplaceSearch" placeholder="Search products...">
            </div>
            <div class="col-md-6">
                <select class="form-select" id="marketplaceCategory" onchange="filterMarketplace()">
                    <option value="">All Categories</option>
                    <option value="feed">Feed</option>
                    <option value="supplement">Supplement</option>
                    <option value="equipment">Equipment</option>
                    <option value="medication">Medication</option>
                </select>
            </div>
        </div>

        <div id="marketplaceResults">
            ${currentListings.length > 0 ? `
                <div class="row">
                    ${currentListings.map(listing => `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card product-card h-100">
                                ${listing.image_url ? `
                                    <img src="${listing.image_url}" class="card-img-top" alt="${listing.product_name}">
                                ` : `
                                    <div class="card-img-top bg-secondary d-flex align-items-center justify-content-center" style="height: 200px;">
                                        <i class="fas fa-box fa-3x text-white"></i>
                                    </div>
                                `}
                                ${(listing.discount_percentage > 0 || listing.discount_fixed > 0) ? `
                                    <div class="discount-badge">
                                        ${listing.discount_percentage > 0 ? `${listing.discount_percentage}% OFF` : `$${listing.discount_fixed} OFF`}
                                    </div>
                                ` : ''}
                                <div class="card-body">
                                    <h5 class="card-title">${listing.product_name}</h5>
                                    <p class="card-text">
                                        <span class="badge bg-secondary">${listing.category || 'Other'}</span><br>
                                        ${listing.description ? `<small>${listing.description.substring(0, 100)}...</small><br>` : ''}
                                        <strong class="text-success fs-4">${formatCurrency(listing.final_price)}</strong>
                                        ${listing.final_price < listing.price ? `<small class="text-muted"><s>${formatCurrency(listing.price)}</s></small>` : ''}
                                        <br>
                                        <small class="text-muted">
                                            ${listing.stock_quantity ? `Stock: ${listing.stock_quantity} ${listing.unit || ''}` : 'Contact for availability'}
                                        </small>
                                    </p>
                                </div>
                                <div class="card-footer bg-transparent">
                                    <button class="btn btn-sm btn-primary" onclick="viewListingDetails('${listing.id}')">
                                        <i class="fas fa-eye"></i> View Details
                                    </button>
                                    ${user.role === 'farmer' ? `
                                        <button class="btn btn-sm btn-success" onclick="contactSeller('${listing.id}')">
                                            <i class="fas fa-envelope"></i> Contact
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <i class="fas fa-store"></i>
                    <h3>No Products Available</h3>
                    <p>Check back later for new products</p>
                </div>
            `}
        </div>

        <!-- Contact Seller Modal -->
        <div class="modal fade" id="contactModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Contact Seller</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="contactForm">
                            <input type="hidden" id="contactListingId">
                            <p>Product: <strong id="contactProductName"></strong></p>
                            <div class="mb-3">
                                <label class="form-label">Your Message *</label>
                                <textarea class="form-control" id="contactMessage" rows="4" required placeholder="I'm interested in..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="sendInquiry()">Send Inquiry</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add search functionality
    document.getElementById('marketplaceSearch').addEventListener('input', debounce(filterMarketplace, 300));
}

function filterMarketplace() {
    const searchTerm = document.getElementById('marketplaceSearch').value.toLowerCase();
    const category = document.getElementById('marketplaceCategory').value;

    let filtered = currentListings;

    if (searchTerm) {
        filtered = filtered.filter(listing => 
            listing.product_name.toLowerCase().includes(searchTerm) ||
            (listing.description && listing.description.toLowerCase().includes(searchTerm))
        );
    }

    if (category) {
        filtered = filtered.filter(listing => listing.category === category);
    }

    // Re-render results
    const resultsDiv = document.getElementById('marketplaceResults');
    if (filtered.length > 0) {
        resultsDiv.innerHTML = `
            <div class="row">
                ${filtered.map(listing => `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card product-card h-100">
                            ${listing.image_url ? `
                                <img src="${listing.image_url}" class="card-img-top" alt="${listing.product_name}">
                            ` : `
                                <div class="card-img-top bg-secondary d-flex align-items-center justify-content-center" style="height: 200px;">
                                    <i class="fas fa-box fa-3x text-white"></i>
                                </div>
                            `}
                            <div class="card-body">
                                <h5 class="card-title">${listing.product_name}</h5>
                                <p class="card-text">
                                    <strong class="text-success fs-4">${formatCurrency(listing.final_price)}</strong>
                                </p>
                            </div>
                            <div class="card-footer bg-transparent">
                                <button class="btn btn-sm btn-primary" onclick="viewListingDetails('${listing.id}')">View Details</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        resultsDiv.innerHTML = '<div class="alert alert-info">No products found matching your criteria.</div>';
    }
}

async function viewListingDetails(listingId) {
    showLoading();
    const result = await API.marketplace.getListingById(listingId);
    hideLoading();

    if (!result.success) {
        showToast('Error loading product details', 'error');
        return;
    }

    const listing = result.data.listing;
    const user = Auth.getCurrentUser();

    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="loadMarketplacePage()">
            <i class="fas fa-arrow-left"></i> Back to Marketplace
        </button>

        <div class="card">
            <div class="row g-0">
                <div class="col-md-6">
                    ${listing.image_url ? `
                        <img src="${listing.image_url}" class="img-fluid rounded-start" alt="${listing.product_name}">
                    ` : `
                        <div class="bg-secondary d-flex align-items-center justify-content-center" style="height: 100%; min-height: 400px;">
                            <i class="fas fa-box fa-5x text-white"></i>
                        </div>
                    `}
                </div>
                <div class="col-md-6">
                    <div class="card-body">
                        <h2 class="card-title">${listing.product_name}</h2>
                        <p class="card-text">
                            <span class="badge bg-secondary">${listing.category || 'Other'}</span>
                        </p>
                        <p class="card-text">${listing.description || 'No description available.'}</p>
                        
                        <div class="mb-3">
                            <h3 class="text-success">
                                ${formatCurrency(listing.final_price)}
                                ${listing.final_price < listing.price ? `<small class="text-muted"><s>${formatCurrency(listing.price)}</s></small>` : ''}
                            </h3>
                            ${listing.stock_quantity ? `
                                <p class="text-muted">Available: ${listing.stock_quantity} ${listing.unit || ''}</p>
                            ` : ''}
                        </div>

                        <div class="mb-3">
                            <strong>Seller:</strong> ${listing.users?.full_name || 'N/A'}<br>
                            ${user.role === 'farmer' ? `
                                <strong>Contact:</strong> ${listing.users?.email || 'N/A'}
                                ${listing.users?.phone ? `<br><strong>Phone:</strong> ${listing.users.phone}` : ''}
                            ` : ''}
                        </div>

                        ${user.role === 'farmer' ? `
                            <button class="btn btn-success btn-lg" onclick="contactSeller('${listing.id}', '${listing.product_name}')">
                                <i class="fas fa-envelope"></i> Contact Seller
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function contactSeller(listingId, productName = '') {
    const listing = currentListings.find(l => l.id === listingId);
    if (listing) {
        productName = listing.product_name;
    }

    document.getElementById('contactListingId').value = listingId;
    document.getElementById('contactProductName').textContent = productName;
    document.getElementById('contactForm').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('contactModal'));
    modal.show();
}

async function sendInquiry() {
    const listing_id = document.getElementById('contactListingId').value;
    const message = document.getElementById('contactMessage').value.trim();

    if (!message) {
        showToast('Please enter a message', 'error');
        return;
    }

    showLoading();
    const result = await API.marketplace.createInquiry({ listing_id, message });
    hideLoading();

    if (result.success) {
        showToast('Inquiry sent successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('contactModal')).hide();
    } else {
        showToast(result.error, 'error');
    }
}

// Agrovets Functions
async function loadMyListingsPage() {
    setActiveMenuItem('loadMyListingsPage');
    updatePageTitle('My Listings');
    
    const mainContent = document.getElementById('mainContent');
    
    showLoading();
    const result = await API.marketplace.getMyListings();
    hideLoading();

    if (!result.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading listings: ${result.error}</div>`;
        return;
    }

    const myListings = result.data.listings;

    mainContent.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-success" onclick="showAddProductModal()">
                <i class="fas fa-plus"></i> Add New Product
            </button>
        </div>

        ${myListings.length > 0 ? `
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Views</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${myListings.map(listing => `
                                    <tr>
                                        <td>${listing.product_name}</td>
                                        <td>${listing.category || '-'}</td>
                                        <td>${formatCurrency(listing.price)}</td>
                                        <td>${listing.stock_quantity || '-'}</td>
                                        <td>${listing.views_count || 0}</td>
                                        <td><span class="badge bg-${listing.status === 'active' ? 'success' : 'secondary'}">${listing.status}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-warning" onclick="editListing('${listing.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteListing('${listing.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        ` : `
            <div class="empty-state">
                <i class="fas fa-store"></i>
                <h3>No Listings Yet</h3>
                <p>Start selling your products</p>
                <button class="btn btn-success" onclick="showAddProductModal()">
                    <i class="fas fa-plus"></i> Add Product
                </button>
            </div>
        `}

        <!-- Product Modal -->
        <div class="modal fade" id="productModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="productModalTitle">Add Product</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm">
                            <input type="hidden" id="productId">
                            <div class="mb-3">
                                <label class="form-label">Product Name *</label>
                                <input type="text" class="form-control" id="productName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="productDescription" rows="3"></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Category</label>
                                    <select class="form-select" id="productCategory">
                                        <option value="feed">Feed</option>
                                        <option value="supplement">Supplement</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="medication">Medication</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Price *</label>
                                    <input type="number" step="0.01" class="form-control" id="productPrice" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Stock Quantity</label>
                                    <input type="number" step="0.01" class="form-control" id="productStock">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Unit</label>
                                    <input type="text" class="form-control" id="productUnit" placeholder="kg, bags, etc">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Status</label>
                                    <select class="form-select" id="productStatus">
                                        <option value="active">Active</option>
                                        <option value="sold_out">Sold Out</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Discount (%)</label>
                                    <input type="number" step="0.01" max="100" class="form-control" id="productDiscountPercent">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Discount (Fixed Amount)</label>
                                    <input type="number" step="0.01" class="form-control" id="productDiscountFixed">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Image URL</label>
                                <input type="text" class="form-control" id="productImageUrl" placeholder="https://...">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveProduct()">Save Product</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

async function editListing(listingId) {
    showLoading();
    const result = await API.marketplace.getListingById(listingId);
    hideLoading();

    if (!result.success) {
        showToast('Error loading product', 'error');
        return;
    }

    const listing = result.data.listing;

    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = listing.id;
    document.getElementById('productName').value = listing.product_name;
    document.getElementById('productDescription').value = listing.description || '';
    document.getElementById('productCategory').value = listing.category || 'feed';
    document.getElementById('productPrice').value = listing.price;
    document.getElementById('productStock').value = listing.stock_quantity || '';
    document.getElementById('productUnit').value = listing.unit || '';
    document.getElementById('productStatus').value = listing.status;
    document.getElementById('productDiscountPercent').value = listing.discount_percentage || '';
    document.getElementById('productDiscountFixed').value = listing.discount_fixed || '';
    document.getElementById('productImageUrl').value = listing.image_url || '';

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

async function saveProduct() {
    const productId = document.getElementById('productId').value;
    const product_name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);

    if (!product_name || isNaN(price)) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    const productData = {
        product_name,
        description: document.getElementById('productDescription').value.trim(),
        category: document.getElementById('productCategory').value,
        price,
        stock_quantity: document.getElementById('productStock').value || null,
        unit: document.getElementById('productUnit').value.trim(),
        status: document.getElementById('productStatus').value,
        discount_percentage: document.getElementById('productDiscountPercent').value || 0,
        discount_fixed: document.getElementById('productDiscountFixed').value || 0,
        image_url: document.getElementById('productImageUrl').value.trim()
    };

    showLoading();
    const result = productId 
        ? await API.marketplace.updateListing(productId, productData)
        : await API.marketplace.createListing(productData);
    hideLoading();

    if (result.success) {
        showToast(`Product ${productId ? 'updated' : 'added'} successfully!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        loadMyListingsPage();
    } else {
        showToast(result.error, 'error');
    }
}

async function deleteListing(listingId) {
    if (!confirmDelete('Delete this product listing?')) {
        return;
    }

    showLoading();
    const result = await API.marketplace.deleteListing(listingId);
    hideLoading();

    if (result.success) {
        showToast('Product deleted successfully', 'success');
        loadMyListingsPage();
    } else {
        showToast(result.error, 'error');
    }
}

async function loadInquiriesPage() {
    setActiveMenuItem('loadInquiriesPage');
    updatePageTitle('Customer Inquiries');
    
    const mainContent = document.getElementById('mainContent');
    
    showLoading();
    const result = await API.marketplace.getInquiries();
    hideLoading();

    if (!result.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading inquiries: ${result.error}</div>`;
        return;
    }

    const inquiries = result.data.inquiries;

    mainContent.innerHTML = `
        ${inquiries.length > 0 ? `
            <div class="card">
                <div class="card-body">
                    ${inquiries.map(inquiry => `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5>${inquiry.marketplace_listings?.product_name || 'Product'}</h5>
                                <p><strong>From:</strong> ${inquiry.users?.full_name || 'Customer'}<br>
                                <strong>Email:</strong> ${inquiry.users?.email || 'N/A'}<br>
                                <strong>Phone:</strong> ${inquiry.users?.phone || 'N/A'}</p>
                                <p><strong>Message:</strong><br>${inquiry.message}</p>
                                <p><small class="text-muted">Received: ${formatDate(inquiry.created_at)}</small></p>
                                <span class="badge bg-${inquiry.status === 'open' ? 'warning' : 'success'}">${inquiry.status}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No Inquiries Yet</h3>
                <p>Customer inquiries will appear here</p>
            </div>
        `}
    `;
}

async function loadAnalyticsPage() {
    setActiveMenuItem('loadAnalyticsPage');
    updatePageTitle('Analytics');
    
    const mainContent = document.getElementById('mainContent');
    
    showLoading();
    const result = await API.marketplace.getAnalytics();
    hideLoading();

    if (!result.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading analytics: ${result.error}</div>`;
        return;
    }

    const analytics = result.data.analytics;

    mainContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card bg-primary">
                    <h3>${analytics.total_listings || 0}</h3>
                    <p><i class="fas fa-box"></i> Total Listings</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-success">
                    <h3>${analytics.active_listings || 0}</h3>
                    <p><i class="fas fa-check-circle"></i> Active Listings</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-info">
                    <h3>${analytics.total_views || 0}</h3>
                    <p><i class="fas fa-eye"></i> Total Views</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-warning">
                    <h3>${analytics.total_inquiries || 0}</h3>
                    <p><i class="fas fa-envelope"></i> Total Inquiries</p>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <i class="fas fa-chart-bar"></i> Performance by Category
            </div>
            <div class="card-body">
                ${analytics.by_category && Object.keys(analytics.by_category).length > 0 ? `
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Products</th>
                                    <th>Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(analytics.by_category).map(([category, data]) => `
                                    <tr>
                                        <td class="text-capitalize">${category}</td>
                                        <td>${data.count}</td>
                                        <td>${data.views}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="text-muted">No data available</p>'}
            </div>
        </div>
    `;
}
