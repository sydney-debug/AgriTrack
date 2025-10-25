// Sales Management Module

let currentSales = [];
let selectedFarmForSales = null;

async function loadSalesPage(farmId = null) {
    setActiveMenuItem('loadSalesPage');
    updatePageTitle('Sales Tracking');
    
    selectedFarmForSales = farmId;
    const mainContent = document.getElementById('mainContent');
    
    showLoading();
    const [salesResult, farmsResult] = await Promise.all([
        API.sales.getAll(farmId),
        API.farms.getAll()
    ]);
    hideLoading();

    if (!salesResult.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading sales: ${salesResult.error}</div>`;
        return;
    }

    currentSales = salesResult.data.sales;
    const farms = farmsResult.success ? farmsResult.data.farms : [];

    // Calculate summary
    const totalRevenue = currentSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    const pendingPayments = currentSales.filter(s => s.payment_status === 'pending').length;

    mainContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="stat-card bg-success">
                    <h3>${formatCurrency(totalRevenue)}</h3>
                    <p><i class="fas fa-dollar-sign"></i> Total Revenue</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card bg-info">
                    <h3>${currentSales.length}</h3>
                    <p><i class="fas fa-receipt"></i> Total Sales</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card bg-warning">
                    <h3>${pendingPayments}</h3>
                    <p><i class="fas fa-exclamation-triangle"></i> Pending Payments</p>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between mb-3">
            <button class="btn btn-success" onclick="showAddSaleModal()">
                <i class="fas fa-plus"></i> Record Sale
            </button>
            <div>
                ${farmId ? `<button class="btn btn-secondary me-2" onclick="loadSalesPage()"><i class="fas fa-list"></i> View All Sales</button>` : ''}
                <button class="btn btn-outline-primary" onclick="exportSalesToCSV()">
                    <i class="fas fa-download"></i> Export CSV
                </button>
            </div>
        </div>

        ${currentSales.length > 0 ? `
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Price/Unit</th>
                                    <th>Total</th>
                                    <th>Buyer</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currentSales.map(sale => `
                                    <tr>
                                        <td>${formatDate(sale.sale_date)}</td>
                                        <td>${sale.product_name}</td>
                                        <td>${sale.product_type || '-'}</td>
                                        <td>${sale.quantity} ${sale.unit || ''}</td>
                                        <td>${formatCurrency(sale.price_per_unit)}</td>
                                        <td><strong>${formatCurrency(sale.total_amount)}</strong></td>
                                        <td>${sale.buyer_name || '-'}</td>
                                        <td><span class="badge bg-${sale.payment_status === 'paid' ? 'success' : sale.payment_status === 'partial' ? 'warning' : 'danger'}">${sale.payment_status}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-warning" onclick="editSale('${sale.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteSale('${sale.id}')">
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
                <i class="fas fa-receipt"></i>
                <h3>No Sales Recorded</h3>
                <p>Start tracking your sales</p>
                <button class="btn btn-success" onclick="showAddSaleModal()">
                    <i class="fas fa-plus"></i> Record Sale
                </button>
            </div>
        `}

        <!-- Sale Modal -->
        <div class="modal fade" id="saleModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="saleModalTitle">Record Sale</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="saleForm">
                            <input type="hidden" id="saleId">
                            <div class="mb-3">
                                <label class="form-label">Farm *</label>
                                <select class="form-select" id="saleFarmId" required>
                                    <option value="">Select Farm</option>
                                    ${farms.map(farm => `<option value="${farm.id}">${farm.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label class="form-label">Product Name *</label>
                                    <input type="text" class="form-control" id="saleProductName" required placeholder="e.g., Maize">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Product Type</label>
                                    <input type="text" class="form-control" id="saleProductType" placeholder="e.g., Crop">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Quantity *</label>
                                    <input type="number" step="0.01" class="form-control" id="saleQuantity" required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Unit</label>
                                    <input type="text" class="form-control" id="saleUnit" placeholder="kg, liters, etc">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Price per Unit *</label>
                                    <input type="number" step="0.01" class="form-control" id="salePricePerUnit" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Total Amount *</label>
                                    <input type="number" step="0.01" class="form-control" id="saleTotalAmount" required readonly>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Sale Date *</label>
                                    <input type="date" class="form-control" id="saleSaleDate" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Buyer Name</label>
                                    <input type="text" class="form-control" id="saleBuyerName">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Buyer Contact</label>
                                    <input type="text" class="form-control" id="saleBuyerContact">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Payment Status</label>
                                <select class="form-select" id="salePaymentStatus">
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="partial">Partial</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="saleNotes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveSale()">Save Sale</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add auto-calculation for total
    document.getElementById('saleQuantity')?.addEventListener('input', calculateSaleTotal);
    document.getElementById('salePricePerUnit')?.addEventListener('input', calculateSaleTotal);
}

function calculateSaleTotal() {
    const quantity = parseFloat(document.getElementById('saleQuantity').value) || 0;
    const pricePerUnit = parseFloat(document.getElementById('salePricePerUnit').value) || 0;
    document.getElementById('saleTotalAmount').value = (quantity * pricePerUnit).toFixed(2);
}

function showAddSaleModal() {
    document.getElementById('saleModalTitle').textContent = 'Record Sale';
    document.getElementById('saleForm').reset();
    document.getElementById('saleId').value = '';
    document.getElementById('saleSaleDate').valueAsDate = new Date();
    
    if (selectedFarmForSales) {
        document.getElementById('saleFarmId').value = selectedFarmForSales;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('saleModal'));
    modal.show();
}

async function editSale(saleId) {
    const sale = currentSales.find(s => s.id === saleId);
    if (!sale) return;

    document.getElementById('saleModalTitle').textContent = 'Edit Sale';
    document.getElementById('saleId').value = sale.id;
    document.getElementById('saleFarmId').value = sale.farm_id;
    document.getElementById('saleProductName').value = sale.product_name;
    document.getElementById('saleProductType').value = sale.product_type || '';
    document.getElementById('saleQuantity').value = sale.quantity;
    document.getElementById('saleUnit').value = sale.unit || '';
    document.getElementById('salePricePerUnit').value = sale.price_per_unit;
    document.getElementById('saleTotalAmount').value = sale.total_amount;
    document.getElementById('saleSaleDate').value = sale.sale_date;
    document.getElementById('saleBuyerName').value = sale.buyer_name || '';
    document.getElementById('saleBuyerContact').value = sale.buyer_contact || '';
    document.getElementById('salePaymentStatus').value = sale.payment_status;
    document.getElementById('saleNotes').value = sale.notes || '';

    const modal = new bootstrap.Modal(document.getElementById('saleModal'));
    modal.show();
}

async function saveSale() {
    const saleId = document.getElementById('saleId').value;
    const farm_id = document.getElementById('saleFarmId').value;
    const product_name = document.getElementById('saleProductName').value.trim();
    const quantity = parseFloat(document.getElementById('saleQuantity').value);
    const price_per_unit = parseFloat(document.getElementById('salePricePerUnit').value);
    const total_amount = parseFloat(document.getElementById('saleTotalAmount').value);

    if (!farm_id || !product_name || !quantity || !price_per_unit) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    const saleData = {
        farm_id,
        product_name,
        product_type: document.getElementById('saleProductType').value.trim(),
        quantity,
        unit: document.getElementById('saleUnit').value.trim(),
        price_per_unit,
        total_amount,
        sale_date: document.getElementById('saleSaleDate').value,
        buyer_name: document.getElementById('saleBuyerName').value.trim(),
        buyer_contact: document.getElementById('saleBuyerContact').value.trim(),
        payment_status: document.getElementById('salePaymentStatus').value,
        notes: document.getElementById('saleNotes').value.trim()
    };

    showLoading();
    const result = saleId 
        ? await API.sales.update(saleId, saleData)
        : await API.sales.create(saleData);
    hideLoading();

    if (result.success) {
        showToast(`Sale ${saleId ? 'updated' : 'recorded'} successfully!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('saleModal')).hide();
        loadSalesPage(selectedFarmForSales);
    } else {
        showToast(result.error, 'error');
    }
}

async function deleteSale(saleId) {
    if (!confirmDelete('Delete this sale record?')) {
        return;
    }

    showLoading();
    const result = await API.sales.delete(saleId);
    hideLoading();

    if (result.success) {
        showToast('Sale deleted successfully', 'success');
        loadSalesPage(selectedFarmForSales);
    } else {
        showToast(result.error, 'error');
    }
}

function exportSalesToCSV() {
    const exportData = currentSales.map(sale => ({
        Date: sale.sale_date,
        Product: sale.product_name,
        Type: sale.product_type || '',
        Quantity: sale.quantity,
        Unit: sale.unit || '',
        'Price per Unit': sale.price_per_unit,
        'Total Amount': sale.total_amount,
        Buyer: sale.buyer_name || '',
        'Payment Status': sale.payment_status
    }));
    
    exportToCSV(exportData, `sales_${new Date().toISOString().split('T')[0]}`);
}
