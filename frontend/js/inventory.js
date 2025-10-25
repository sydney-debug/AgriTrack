// Inventory Management Module

let currentInventory = [];
let selectedFarmForInventory = null;

async function loadInventoryPage(farmId = null) {
    setActiveMenuItem('loadInventoryPage');
    updatePageTitle('Inventory Management');
    
    selectedFarmForInventory = farmId;
    const mainContent = document.getElementById('mainContent');
    
    showLoading();
    const [inventoryResult, farmsResult] = await Promise.all([
        API.inventory.getAll(farmId),
        API.farms.getAll()
    ]);
    hideLoading();

    if (!inventoryResult.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading inventory: ${inventoryResult.error}</div>`;
        return;
    }

    currentInventory = inventoryResult.data.inventory;
    const farms = farmsResult.success ? farmsResult.data.farms : [];

    // Check for low stock items
    const lowStockItems = currentInventory.filter(item => 
        item.reorder_level && item.quantity <= item.reorder_level
    );

    mainContent.innerHTML = `
        ${lowStockItems.length > 0 ? `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> 
                <strong>Warning:</strong> ${lowStockItems.length} item(s) are low in stock and need reordering.
            </div>
        ` : ''}

        <div class="d-flex justify-content-between mb-3">
            <button class="btn btn-success" onclick="showAddInventoryModal()">
                <i class="fas fa-plus"></i> Add Inventory Item
            </button>
            ${farmId ? `<button class="btn btn-secondary" onclick="loadInventoryPage()"><i class="fas fa-list"></i> View All Items</button>` : ''}
        </div>

        ${currentInventory.length > 0 ? `
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
                                    <th>Supplier</th>
                                    <th>Cost</th>
                                    <th>Reorder Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currentInventory.map(item => {
                                    const isLowStock = item.reorder_level && item.quantity <= item.reorder_level;
                                    return `
                                    <tr class="${isLowStock ? 'table-warning' : ''}">
                                        <td>
                                            ${isLowStock ? '<i class="fas fa-exclamation-triangle text-warning"></i> ' : ''}
                                            ${item.item_name}
                                        </td>
                                        <td><span class="badge bg-secondary">${item.item_type}</span></td>
                                        <td>${item.quantity}</td>
                                        <td>${item.unit || '-'}</td>
                                        <td>${item.supplier || '-'}</td>
                                        <td>${item.cost ? formatCurrency(item.cost) : '-'}</td>
                                        <td>${item.reorder_level || '-'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-info" onclick="logConsumption('${item.id}', '${item.item_name}')">
                                                <i class="fas fa-minus"></i> Use
                                            </button>
                                            <button class="btn btn-sm btn-warning" onclick="editInventory('${item.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteInventory('${item.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `}).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        ` : `
            <div class="empty-state">
                <i class="fas fa-boxes"></i>
                <h3>No Inventory Items</h3>
                <p>Start tracking your feed, supplements, and medications</p>
                <button class="btn btn-success" onclick="showAddInventoryModal()">
                    <i class="fas fa-plus"></i> Add Item
                </button>
            </div>
        `}

        <!-- Inventory Modal -->
        <div class="modal fade" id="inventoryModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="inventoryModalTitle">Add Inventory Item</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="inventoryForm">
                            <input type="hidden" id="inventoryId">
                            <div class="mb-3">
                                <label class="form-label">Farm *</label>
                                <select class="form-select" id="inventoryFarmId" required>
                                    <option value="">Select Farm</option>
                                    ${farms.map(farm => `<option value="${farm.id}">${farm.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label class="form-label">Item Name *</label>
                                    <input type="text" class="form-control" id="inventoryItemName" required placeholder="e.g., Dairy Meal">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Type *</label>
                                    <select class="form-select" id="inventoryItemType" required>
                                        <option value="feed">Feed</option>
                                        <option value="supplement">Supplement</option>
                                        <option value="medication">Medication</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Quantity *</label>
                                    <input type="number" step="0.01" class="form-control" id="inventoryQuantity" required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Unit</label>
                                    <input type="text" class="form-control" id="inventoryUnit" placeholder="kg, bags, liters">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Reorder Level</label>
                                    <input type="number" step="0.01" class="form-control" id="inventoryReorderLevel" placeholder="Alert threshold">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Supplier</label>
                                    <input type="text" class="form-control" id="inventorySupplier">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Cost</label>
                                    <input type="number" step="0.01" class="form-control" id="inventoryCost">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Purchase Date</label>
                                <input type="date" class="form-control" id="inventoryPurchaseDate">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="inventoryNotes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveInventory()">Save Item</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Consumption Modal -->
        <div class="modal fade" id="consumptionModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Log Consumption</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="consumptionForm">
                            <input type="hidden" id="consumptionItemId">
                            <p>Item: <strong id="consumptionItemName"></strong></p>
                            <div class="mb-3">
                                <label class="form-label">Quantity Used *</label>
                                <input type="number" step="0.01" class="form-control" id="consumptionQuantity" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Date *</label>
                                <input type="date" class="form-control" id="consumptionDate" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="consumptionNotes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveConsumption()">Log Consumption</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showAddInventoryModal() {
    document.getElementById('inventoryModalTitle').textContent = 'Add Inventory Item';
    document.getElementById('inventoryForm').reset();
    document.getElementById('inventoryId').value = '';
    
    if (selectedFarmForInventory) {
        document.getElementById('inventoryFarmId').value = selectedFarmForInventory;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('inventoryModal'));
    modal.show();
}

async function editInventory(itemId) {
    const item = currentInventory.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('inventoryModalTitle').textContent = 'Edit Inventory Item';
    document.getElementById('inventoryId').value = item.id;
    document.getElementById('inventoryFarmId').value = item.farm_id;
    document.getElementById('inventoryItemName').value = item.item_name;
    document.getElementById('inventoryItemType').value = item.item_type;
    document.getElementById('inventoryQuantity').value = item.quantity;
    document.getElementById('inventoryUnit').value = item.unit || '';
    document.getElementById('inventoryReorderLevel').value = item.reorder_level || '';
    document.getElementById('inventorySupplier').value = item.supplier || '';
    document.getElementById('inventoryCost').value = item.cost || '';
    document.getElementById('inventoryPurchaseDate').value = item.purchase_date || '';
    document.getElementById('inventoryNotes').value = item.notes || '';

    const modal = new bootstrap.Modal(document.getElementById('inventoryModal'));
    modal.show();
}

async function saveInventory() {
    const itemId = document.getElementById('inventoryId').value;
    const farm_id = document.getElementById('inventoryFarmId').value;
    const item_name = document.getElementById('inventoryItemName').value.trim();
    const quantity = parseFloat(document.getElementById('inventoryQuantity').value);

    if (!farm_id || !item_name || isNaN(quantity)) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    const itemData = {
        farm_id,
        item_name,
        item_type: document.getElementById('inventoryItemType').value,
        quantity,
        unit: document.getElementById('inventoryUnit').value.trim(),
        reorder_level: document.getElementById('inventoryReorderLevel').value || null,
        supplier: document.getElementById('inventorySupplier').value.trim(),
        cost: document.getElementById('inventoryCost').value || null,
        purchase_date: document.getElementById('inventoryPurchaseDate').value || null,
        notes: document.getElementById('inventoryNotes').value.trim()
    };

    showLoading();
    const result = itemId 
        ? await API.inventory.update(itemId, itemData)
        : await API.inventory.create(itemData);
    hideLoading();

    if (result.success) {
        showToast(`Inventory item ${itemId ? 'updated' : 'added'} successfully!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('inventoryModal')).hide();
        loadInventoryPage(selectedFarmForInventory);
    } else {
        showToast(result.error, 'error');
    }
}

async function deleteInventory(itemId) {
    if (!confirmDelete('Delete this inventory item?')) {
        return;
    }

    showLoading();
    const result = await API.inventory.delete(itemId);
    hideLoading();

    if (result.success) {
        showToast('Inventory item deleted successfully', 'success');
        loadInventoryPage(selectedFarmForInventory);
    } else {
        showToast(result.error, 'error');
    }
}

function logConsumption(itemId, itemName) {
    document.getElementById('consumptionItemId').value = itemId;
    document.getElementById('consumptionItemName').textContent = itemName;
    document.getElementById('consumptionForm').reset();
    document.getElementById('consumptionDate').valueAsDate = new Date();
    
    const modal = new bootstrap.Modal(document.getElementById('consumptionModal'));
    modal.show();
}

async function saveConsumption() {
    const itemId = document.getElementById('consumptionItemId').value;
    const quantity = parseFloat(document.getElementById('consumptionQuantity').value);
    const date = document.getElementById('consumptionDate').value;

    if (isNaN(quantity) || quantity <= 0 || !date) {
        showToast('Please enter valid consumption details', 'error');
        return;
    }

    const consumptionData = {
        date,
        quantity,
        notes: document.getElementById('consumptionNotes').value.trim()
    };

    showLoading();
    const result = await API.inventory.logConsumption(itemId, consumptionData);
    hideLoading();

    if (result.success) {
        showToast('Consumption logged successfully!', 'success');
        if (result.data.warning) {
            showToast(result.data.warning, 'warning');
        }
        bootstrap.Modal.getInstance(document.getElementById('consumptionModal')).hide();
        loadInventoryPage(selectedFarmForInventory);
    } else {
        showToast(result.error, 'error');
    }
}

function loadVetContactsPage() {
    // Placeholder for vet contacts page
    updatePageTitle('Vet Contacts');
    document.getElementById('mainContent').innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Vet contacts management coming soon!
        </div>
    `;
}

function loadNotebookPage() {
    // Placeholder for notebook page
    updatePageTitle('Notebook');
    document.getElementById('mainContent').innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Notebook feature coming soon!
        </div>
    `;
}

function loadAssociationsPage() {
    // Placeholder for farm-vet associations page
    updatePageTitle('Farm Invitations');
    document.getElementById('mainContent').innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Farm invitations management coming soon!
        </div>
    `;
}
