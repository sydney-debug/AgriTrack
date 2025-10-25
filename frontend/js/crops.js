// Crops Management Module

let currentCrops = [];
let selectedFarmForCrops = null;

async function loadCropsPage(farmId = null) {
    setActiveMenuItem('loadCropsPage');
    updatePageTitle('Crops Management');
    
    selectedFarmForCrops = farmId;
    const mainContent = document.getElementById('mainContent');
    
    showLoading();
    const [cropsResult, farmsResult] = await Promise.all([
        API.crops.getAll(farmId),
        API.farms.getAll()
    ]);
    hideLoading();

    if (!cropsResult.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading crops: ${cropsResult.error}</div>`;
        return;
    }

    currentCrops = cropsResult.data.crops;
    const farms = farmsResult.success ? farmsResult.data.farms : [];

    mainContent.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <button class="btn btn-success" onclick="showAddCropModal()">
                <i class="fas fa-plus"></i> Add New Crop
            </button>
            ${farmId ? `<button class="btn btn-secondary" onclick="loadCropsPage()"><i class="fas fa-list"></i> View All Crops</button>` : ''}
        </div>

        ${currentCrops.length > 0 ? `
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Crop Type</th>
                                    <th>Variety</th>
                                    <th>Farm</th>
                                    <th>Planting Date</th>
                                    <th>Harvest Date</th>
                                    <th>Status</th>
                                    <th>Yield</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currentCrops.map(crop => `
                                    <tr>
                                        <td><i class="fas fa-seedling text-success"></i> ${crop.crop_type}</td>
                                        <td>${crop.variety || '-'}</td>
                                        <td>${crop.farms?.name || '-'}</td>
                                        <td>${formatDate(crop.planting_date)}</td>
                                        <td>${formatDate(crop.harvest_date)}</td>
                                        <td><span class="badge bg-${crop.status === 'active' ? 'success' : crop.status === 'harvested' ? 'info' : 'danger'}">${crop.status}</span></td>
                                        <td>${crop.actual_yield || crop.expected_yield || '-'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-warning" onclick="editCrop('${crop.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteCrop('${crop.id}', '${crop.crop_type}')">
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
                <i class="fas fa-seedling"></i>
                <h3>No Crops Yet</h3>
                <p>Start tracking your crops</p>
                <button class="btn btn-success" onclick="showAddCropModal()">
                    <i class="fas fa-plus"></i> Add Crop
                </button>
            </div>
        `}

        <!-- Crop Modal -->
        <div class="modal fade" id="cropModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="cropModalTitle">Add New Crop</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="cropForm">
                            <input type="hidden" id="cropId">
                            <div class="mb-3">
                                <label class="form-label">Farm *</label>
                                <select class="form-select" id="cropFarmId" required>
                                    <option value="">Select Farm</option>
                                    ${farms.map(farm => `<option value="${farm.id}">${farm.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Crop Type *</label>
                                    <input type="text" class="form-control" id="cropType" required placeholder="e.g., Maize, Wheat">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Variety</label>
                                    <input type="text" class="form-control" id="cropVariety" placeholder="e.g., Hybrid 614">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Planting Date</label>
                                    <input type="date" class="form-control" id="cropPlantingDate">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Expected Harvest Date</label>
                                    <input type="date" class="form-control" id="cropHarvestDate">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Expected Yield</label>
                                    <input type="number" step="0.01" class="form-control" id="cropExpectedYield" placeholder="e.g., 1000">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Actual Yield</label>
                                    <input type="number" step="0.01" class="form-control" id="cropActualYield" placeholder="e.g., 950">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Status</label>
                                    <select class="form-select" id="cropStatus">
                                        <option value="active">Active</option>
                                        <option value="harvested">Harvested</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Field Location</label>
                                <input type="text" class="form-control" id="cropFieldLocation" placeholder="e.g., North Field">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="cropNotes" rows="3" placeholder="Add any additional notes"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveCrop()">Save Crop</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showAddCropModal() {
    document.getElementById('cropModalTitle').textContent = 'Add New Crop';
    document.getElementById('cropForm').reset();
    document.getElementById('cropId').value = '';
    
    if (selectedFarmForCrops) {
        document.getElementById('cropFarmId').value = selectedFarmForCrops;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('cropModal'));
    modal.show();
}

async function editCrop(cropId) {
    const crop = currentCrops.find(c => c.id === cropId);
    if (!crop) return;

    document.getElementById('cropModalTitle').textContent = 'Edit Crop';
    document.getElementById('cropId').value = crop.id;
    document.getElementById('cropFarmId').value = crop.farm_id;
    document.getElementById('cropType').value = crop.crop_type;
    document.getElementById('cropVariety').value = crop.variety || '';
    document.getElementById('cropPlantingDate').value = crop.planting_date || '';
    document.getElementById('cropHarvestDate').value = crop.harvest_date || '';
    document.getElementById('cropExpectedYield').value = crop.expected_yield || '';
    document.getElementById('cropActualYield').value = crop.actual_yield || '';
    document.getElementById('cropStatus').value = crop.status;
    document.getElementById('cropFieldLocation').value = crop.field_location || '';
    document.getElementById('cropNotes').value = crop.notes || '';

    const modal = new bootstrap.Modal(document.getElementById('cropModal'));
    modal.show();
}

async function saveCrop() {
    const cropId = document.getElementById('cropId').value;
    const farm_id = document.getElementById('cropFarmId').value;
    const crop_type = document.getElementById('cropType').value.trim();

    if (!farm_id || !crop_type) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    const cropData = {
        farm_id,
        crop_type,
        variety: document.getElementById('cropVariety').value.trim(),
        planting_date: document.getElementById('cropPlantingDate').value || null,
        harvest_date: document.getElementById('cropHarvestDate').value || null,
        expected_yield: document.getElementById('cropExpectedYield').value || null,
        actual_yield: document.getElementById('cropActualYield').value || null,
        status: document.getElementById('cropStatus').value,
        field_location: document.getElementById('cropFieldLocation').value.trim(),
        notes: document.getElementById('cropNotes').value.trim()
    };

    showLoading();
    const result = cropId 
        ? await API.crops.update(cropId, cropData)
        : await API.crops.create(cropData);
    hideLoading();

    if (result.success) {
        showToast(`Crop ${cropId ? 'updated' : 'created'} successfully!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('cropModal')).hide();
        loadCropsPage(selectedFarmForCrops);
    } else {
        showToast(result.error, 'error');
    }
}

async function deleteCrop(cropId, cropType) {
    if (!confirmDelete(`Delete crop "${cropType}"?`)) {
        return;
    }

    showLoading();
    const result = await API.crops.delete(cropId);
    hideLoading();

    if (result.success) {
        showToast('Crop deleted successfully', 'success');
        loadCropsPage(selectedFarmForCrops);
    } else {
        showToast(result.error, 'error');
    }
}
