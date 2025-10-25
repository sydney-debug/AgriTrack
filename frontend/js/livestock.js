// Livestock Management Module

let currentLivestock = [];
let selectedFarmForLivestock = null;

async function loadLivestockPage(farmId = null) {
    setActiveMenuItem('loadLivestockPage');
    updatePageTitle('Livestock Management');
    
    selectedFarmForLivestock = farmId;
    const mainContent = document.getElementById('mainContent');
    
    showLoading();
    const [livestockResult, farmsResult] = await Promise.all([
        API.livestock.getAll(farmId),
        API.farms.getAll()
    ]);
    hideLoading();

    if (!livestockResult.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading livestock: ${livestockResult.error}</div>`;
        return;
    }

    currentLivestock = livestockResult.data.livestock;
    const farms = farmsResult.success ? farmsResult.data.farms : [];

    mainContent.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <button class="btn btn-success" onclick="showAddLivestockModal()">
                <i class="fas fa-plus"></i> Add New Animal
            </button>
            ${farmId ? `<button class="btn btn-secondary" onclick="loadLivestockPage()"><i class="fas fa-list"></i> View All Animals</button>` : ''}
        </div>

        ${currentLivestock.length > 0 ? `
            <div class="row">
                ${currentLivestock.map(animal => `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <i class="fas fa-${getAnimalIcon(animal.animal_type)}"></i> 
                                    ${animal.name || animal.id_tag || 'Unnamed'}
                                </h5>
                                <p class="card-text">
                                    <strong>Type:</strong> ${animal.animal_type}<br>
                                    <strong>ID Tag:</strong> ${animal.id_tag || 'N/A'}<br>
                                    <strong>Breed:</strong> ${animal.breed || 'N/A'}<br>
                                    <strong>Age:</strong> ${calculateAge(animal.date_of_birth)}<br>
                                    <strong>Health:</strong> 
                                    <span class="badge bg-${getHealthStatusColor(animal.health_status)}">${animal.health_status}</span>
                                </p>
                            </div>
                            <div class="card-footer bg-transparent">
                                <button class="btn btn-sm btn-info" onclick="viewAnimalDetails('${animal.id}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="editLivestock('${animal.id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteLivestock('${animal.id}', '${animal.name || animal.id_tag}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : `
            <div class="empty-state">
                <i class="fas fa-cow"></i>
                <h3>No Animals Yet</h3>
                <p>Start tracking your livestock</p>
                <button class="btn btn-success" onclick="showAddLivestockModal()">
                    <i class="fas fa-plus"></i> Add Animal
                </button>
            </div>
        `}

        <!-- Livestock Modal -->
        <div class="modal fade" id="livestockModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="livestockModalTitle">Add New Animal</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="livestockForm">
                            <input type="hidden" id="livestockId">
                            <div class="mb-3">
                                <label class="form-label">Farm *</label>
                                <select class="form-select" id="livestockFarmId" required>
                                    <option value="">Select Farm</option>
                                    ${farms.map(farm => `<option value="${farm.id}">${farm.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Animal Type *</label>
                                    <input type="text" class="form-control" id="livestockType" required placeholder="e.g., Cow, Chicken, Goat">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Name</label>
                                    <input type="text" class="form-control" id="livestockName" placeholder="Optional">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">ID Tag</label>
                                    <input type="text" class="form-control" id="livestockIdTag" placeholder="e.g., COW-001">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Breed</label>
                                    <input type="text" class="form-control" id="livestockBreed">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Date of Birth</label>
                                    <input type="date" class="form-control" id="livestockDob">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Gender</label>
                                    <select class="form-select" id="livestockGender">
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Location on Farm</label>
                                    <input type="text" class="form-control" id="livestockLocation" placeholder="e.g., Barn A">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Health Status</label>
                                    <select class="form-select" id="livestockHealth">
                                        <option value="healthy">Healthy</option>
                                        <option value="sick">Sick</option>
                                        <option value="under_treatment">Under Treatment</option>
                                        <option value="deceased">Deceased</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="livestockNotes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveLivestock()">Save Animal</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showAddLivestockModal() {
    document.getElementById('livestockModalTitle').textContent = 'Add New Animal';
    document.getElementById('livestockForm').reset();
    document.getElementById('livestockId').value = '';
    
    if (selectedFarmForLivestock) {
        document.getElementById('livestockFarmId').value = selectedFarmForLivestock;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('livestockModal'));
    modal.show();
}

async function editLivestock(animalId) {
    const animal = currentLivestock.find(a => a.id === animalId);
    if (!animal) return;

    document.getElementById('livestockModalTitle').textContent = 'Edit Animal';
    document.getElementById('livestockId').value = animal.id;
    document.getElementById('livestockFarmId').value = animal.farm_id;
    document.getElementById('livestockType').value = animal.animal_type;
    document.getElementById('livestockName').value = animal.name || '';
    document.getElementById('livestockIdTag').value = animal.id_tag || '';
    document.getElementById('livestockBreed').value = animal.breed || '';
    document.getElementById('livestockDob').value = animal.date_of_birth || '';
    document.getElementById('livestockGender').value = animal.gender || '';
    document.getElementById('livestockLocation').value = animal.location_on_farm || '';
    document.getElementById('livestockHealth').value = animal.health_status;
    document.getElementById('livestockNotes').value = animal.notes || '';

    const modal = new bootstrap.Modal(document.getElementById('livestockModal'));
    modal.show();
}

async function saveLivestock() {
    const animalId = document.getElementById('livestockId').value;
    const farm_id = document.getElementById('livestockFarmId').value;
    const animal_type = document.getElementById('livestockType').value.trim();

    if (!farm_id || !animal_type) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    const animalData = {
        farm_id,
        animal_type,
        name: document.getElementById('livestockName').value.trim(),
        id_tag: document.getElementById('livestockIdTag').value.trim(),
        breed: document.getElementById('livestockBreed').value.trim(),
        date_of_birth: document.getElementById('livestockDob').value || null,
        gender: document.getElementById('livestockGender').value || null,
        location_on_farm: document.getElementById('livestockLocation').value.trim(),
        health_status: document.getElementById('livestockHealth').value,
        notes: document.getElementById('livestockNotes').value.trim()
    };

    showLoading();
    const result = animalId 
        ? await API.livestock.update(animalId, animalData)
        : await API.livestock.create(animalData);
    hideLoading();

    if (result.success) {
        showToast(`Animal ${animalId ? 'updated' : 'added'} successfully!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('livestockModal')).hide();
        loadLivestockPage(selectedFarmForLivestock);
    } else {
        showToast(result.error, 'error');
    }
}

async function deleteLivestock(animalId, animalName) {
    if (!confirmDelete(`Delete animal "${animalName}"?`)) {
        return;
    }

    showLoading();
    const result = await API.livestock.delete(animalId);
    hideLoading();

    if (result.success) {
        showToast('Animal deleted successfully', 'success');
        loadLivestockPage(selectedFarmForLivestock);
    } else {
        showToast(result.error, 'error');
    }
}

async function viewAnimalDetails(animalId) {
    const animal = currentLivestock.find(a => a.id === animalId);
    if (!animal) return;

    const mainContent = document.getElementById('mainContent');
    
    // Fetch health records for this animal
    showLoading();
    const healthResult = await API.healthRecords.getAll(animalId);
    hideLoading();
    
    const healthRecords = healthResult.success ? healthResult.data.health_records : [];

    mainContent.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="loadLivestockPage()">
            <i class="fas fa-arrow-left"></i> Back to Livestock
        </button>

        <div class="card mb-4">
            <div class="card-header">
                <h4><i class="fas fa-${getAnimalIcon(animal.animal_type)}"></i> ${animal.name || animal.id_tag || 'Unnamed Animal'}</h4>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Type:</strong> ${animal.animal_type}</p>
                        <p><strong>ID Tag:</strong> ${animal.id_tag || 'N/A'}</p>
                        <p><strong>Breed:</strong> ${animal.breed || 'N/A'}</p>
                        <p><strong>Gender:</strong> ${animal.gender || 'N/A'}</p>
                        <p><strong>Date of Birth:</strong> ${formatDate(animal.date_of_birth)}</p>
                        <p><strong>Age:</strong> ${calculateAge(animal.date_of_birth)}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Location:</strong> ${animal.location_on_farm || 'N/A'}</p>
                        <p><strong>Health Status:</strong> 
                            <span class="badge bg-${getHealthStatusColor(animal.health_status)}">${animal.health_status}</span>
                        </p>
                        <p><strong>Notes:</strong><br>${animal.notes || 'No notes'}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span><i class="fas fa-heartbeat"></i> Health Records</span>
                <button class="btn btn-sm btn-success" onclick="addHealthRecordForAnimal('${animal.id}')">
                    <i class="fas fa-plus"></i> Add Record
                </button>
            </div>
            <div class="card-body">
                ${healthRecords.length > 0 ? `
                    <div class="timeline">
                        ${healthRecords.map(record => `
                            <div class="timeline-item">
                                <strong>${record.record_type}</strong> - ${formatDate(record.record_date)}
                                <br><small class="text-muted">
                                    ${record.diagnosis ? `Diagnosis: ${record.diagnosis}<br>` : ''}
                                    ${record.treatment ? `Treatment: ${record.treatment}<br>` : ''}
                                    ${record.users?.full_name ? `Vet: ${record.users.full_name}` : ''}
                                </small>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-muted">No health records yet.</p>'}
            </div>
        </div>
    `;
}

function getAnimalIcon(type) {
    const icons = {
        'cow': 'cow',
        'chicken': 'drumstick-bite',
        'goat': 'horse',
        'sheep': 'horse',
        'pig': 'piggy-bank'
    };
    return icons[type.toLowerCase()] || 'paw';
}

function getHealthStatusColor(status) {
    const colors = {
        'healthy': 'success',
        'sick': 'danger',
        'under_treatment': 'warning',
        'deceased': 'dark'
    };
    return colors[status] || 'secondary';
}

function calculateAge(dob) {
    if (!dob) return 'Unknown';
    const birthDate = new Date(dob);
    const today = new Date();
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
    
    if (months < 12) {
        return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
        const years = Math.floor(months / 12);
        return `${years} year${years !== 1 ? 's' : ''}`;
    }
}

function addHealthRecordForAnimal(animalId) {
    // This will be implemented in health.js
    loadHealthRecordsPage(animalId);
}
