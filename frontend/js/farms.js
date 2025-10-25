// Farms Management Module

let currentFarms = [];
let mapInstance = null;

async function loadFarmsPage() {
    setActiveMenuItem('loadFarmsPage');
    updatePageTitle('My Farms');
    
    const mainContent = document.getElementById('mainContent');
    
    showLoading();
    const result = await API.farms.getAll();
    hideLoading();

    if (!result.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading farms: ${result.error}</div>`;
        return;
    }

    currentFarms = result.data.farms;

    mainContent.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-success" onclick="showAddFarmModal()">
                <i class="fas fa-plus"></i> Add New Farm
            </button>
        </div>

        ${currentFarms.length > 0 ? `
            <div class="row">
                ${currentFarms.map(farm => `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <i class="fas fa-map-marker-alt text-success"></i> ${farm.name}
                                </h5>
                                <p class="card-text">
                                    <strong>Location:</strong> ${farm.location_text || 'Not specified'}<br>
                                    <strong>Created:</strong> ${formatDate(farm.created_at)}
                                </p>
                                ${farm.description ? `<p class="card-text"><small class="text-muted">${farm.description}</small></p>` : ''}
                            </div>
                            <div class="card-footer bg-transparent">
                                <button class="btn btn-sm btn-primary" onclick="viewFarmDetails('${farm.id}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="editFarm('${farm.id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteFarm('${farm.id}', '${farm.name}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : `
            <div class="empty-state">
                <i class="fas fa-map-marked-alt"></i>
                <h3>No Farms Yet</h3>
                <p>Start by adding your first farm</p>
                <button class="btn btn-success" onclick="showAddFarmModal()">
                    <i class="fas fa-plus"></i> Add Farm
                </button>
            </div>
        `}

        <!-- Add/Edit Farm Modal -->
        <div class="modal fade" id="farmModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="farmModalTitle">Add New Farm</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="farmForm">
                            <input type="hidden" id="farmId">
                            <div class="mb-3">
                                <label class="form-label">Farm Name *</label>
                                <input type="text" class="form-control" id="farmName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Location (Address)</label>
                                <input type="text" class="form-control" id="farmLocation">
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Latitude (Optional)</label>
                                    <input type="number" step="any" class="form-control" id="farmLat">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Longitude (Optional)</label>
                                    <input type="number" step="any" class="form-control" id="farmLng">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="farmDescription" rows="3"></textarea>
                            </div>
                            <div id="farmMapPreview" style="height: 250px; display: none;"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveFarm()">Save Farm</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showAddFarmModal() {
    document.getElementById('farmModalTitle').textContent = 'Add New Farm';
    document.getElementById('farmForm').reset();
    document.getElementById('farmId').value = '';
    document.getElementById('farmMapPreview').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('farmModal'));
    modal.show();
}

async function editFarm(farmId) {
    const farm = currentFarms.find(f => f.id === farmId);
    if (!farm) return;

    document.getElementById('farmModalTitle').textContent = 'Edit Farm';
    document.getElementById('farmId').value = farm.id;
    document.getElementById('farmName').value = farm.name;
    document.getElementById('farmLocation').value = farm.location_text || '';
    document.getElementById('farmDescription').value = farm.description || '';
    
    if (farm.location_coords) {
        document.getElementById('farmLat').value = farm.location_coords.lat || '';
        document.getElementById('farmLng').value = farm.location_coords.lng || '';
        
        // Show map preview
        const mapDiv = document.getElementById('farmMapPreview');
        mapDiv.style.display = 'block';
        setTimeout(() => initFarmMap(farm.location_coords), 300);
    }

    const modal = new bootstrap.Modal(document.getElementById('farmModal'));
    modal.show();
}

async function saveFarm() {
    const farmId = document.getElementById('farmId').value;
    const name = document.getElementById('farmName').value.trim();
    const location_text = document.getElementById('farmLocation').value.trim();
    const description = document.getElementById('farmDescription').value.trim();
    const lat = document.getElementById('farmLat').value;
    const lng = document.getElementById('farmLng').value;

    if (!name) {
        showToast('Please enter farm name', 'error');
        return;
    }

    const farmData = {
        name,
        location_text,
        description,
        location_coords: (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
    };

    showLoading();
    const result = farmId 
        ? await API.farms.update(farmId, farmData)
        : await API.farms.create(farmData);
    hideLoading();

    if (result.success) {
        showToast(`Farm ${farmId ? 'updated' : 'created'} successfully!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('farmModal')).hide();
        loadFarmsPage();
    } else {
        showToast(result.error, 'error');
    }
}

async function deleteFarm(farmId, farmName) {
    if (!confirmDelete(`Delete farm "${farmName}"? This will also delete all associated data.`)) {
        return;
    }

    showLoading();
    const result = await API.farms.delete(farmId);
    hideLoading();

    if (result.success) {
        showToast('Farm deleted successfully', 'success');
        loadFarmsPage();
    } else {
        showToast(result.error, 'error');
    }
}

async function viewFarmDetails(farmId) {
    const farm = currentFarms.find(f => f.id === farmId);
    if (!farm) return;

    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="loadFarmsPage()">
            <i class="fas fa-arrow-left"></i> Back to Farms
        </button>

        <div class="card mb-4">
            <div class="card-header">
                <h4><i class="fas fa-map-marker-alt"></i> ${farm.name}</h4>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Location:</strong> ${farm.location_text || 'Not specified'}</p>
                        <p><strong>Description:</strong> ${farm.description || 'No description'}</p>
                        <p><strong>Created:</strong> ${formatDate(farm.created_at)}</p>
                    </div>
                    <div class="col-md-6">
                        ${farm.location_coords ? `
                            <div id="farmDetailMap" style="height: 300px; border-radius: 10px;"></div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <button class="btn btn-outline-success w-100 mb-3" onclick="loadCropsPage('${farmId}')">
                    <i class="fas fa-seedling"></i><br>View Crops
                </button>
            </div>
            <div class="col-md-4">
                <button class="btn btn-outline-success w-100 mb-3" onclick="loadLivestockPage('${farmId}')">
                    <i class="fas fa-cow"></i><br>View Livestock
                </button>
            </div>
            <div class="col-md-4">
                <button class="btn btn-outline-success w-100 mb-3" onclick="loadSalesPage('${farmId}')">
                    <i class="fas fa-dollar-sign"></i><br>View Sales
                </button>
            </div>
        </div>
    `;

    if (farm.location_coords) {
        setTimeout(() => initFarmMap(farm.location_coords, 'farmDetailMap'), 300);
    }
}

function initFarmMap(coords, containerId = 'farmMapPreview') {
    const container = document.getElementById(containerId);
    if (!container || !coords) return;

    if (mapInstance) {
        mapInstance.remove();
    }

    mapInstance = L.map(containerId).setView([coords.lat, coords.lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    L.marker([coords.lat, coords.lng]).addTo(mapInstance);
}

function viewFarm(farmId) {
    viewFarmDetails(farmId);
}
