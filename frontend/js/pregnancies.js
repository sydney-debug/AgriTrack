// Pregnancies and Calves Management Module

let currentPregnancies = [];
let currentCalves = [];

async function loadPregnanciesPage() {
    setActiveMenuItem('loadPregnanciesPage');
    updatePageTitle('Pregnancies & Calves');
    
    const mainContent = document.getElementById('mainContent');
    
    showLoading();
    const [pregnanciesResult, calvesResult, livestockResult] = await Promise.all([
        API.pregnancies.getAll(),
        API.pregnancies.getCalves(),
        API.livestock.getAll()
    ]);
    hideLoading();

    if (!pregnanciesResult.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading data: ${pregnanciesResult.error}</div>`;
        return;
    }

    currentPregnancies = pregnanciesResult.data.pregnancies;
    currentCalves = calvesResult.success ? calvesResult.data.calves : [];
    const livestock = livestockResult.success ? livestockResult.data.livestock : [];

    const activePregnancies = currentPregnancies.filter(p => p.status === 'active');

    mainContent.innerHTML = `
        <ul class="nav nav-tabs mb-3" id="pregnancyTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="pregnancies-tab" data-bs-toggle="tab" data-bs-target="#pregnancies" type="button">
                    <i class="fas fa-baby"></i> Pregnancies (${activePregnancies.length})
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="calves-tab" data-bs-toggle="tab" data-bs-target="#calves" type="button">
                    <i class="fas fa-horse"></i> Calves (${currentCalves.length})
                </button>
            </li>
        </ul>

        <div class="tab-content" id="pregnancyTabContent">
            <!-- Pregnancies Tab -->
            <div class="tab-pane fade show active" id="pregnancies" role="tabpanel">
                <div class="mb-3">
                    <button class="btn btn-success" onclick="showAddPregnancyModal()">
                        <i class="fas fa-plus"></i> Record Pregnancy
                    </button>
                </div>

                ${currentPregnancies.length > 0 ? `
                    <div class="row">
                        ${currentPregnancies.map(pregnancy => {
                            const daysUntilDue = pregnancy.expected_due_date ? 
                                Math.ceil((new Date(pregnancy.expected_due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                            return `
                            <div class="col-md-6 col-lg-4 mb-4">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h5 class="card-title">
                                            <i class="fas fa-baby"></i> 
                                            ${pregnancy.livestock?.name || pregnancy.livestock?.id_tag || 'Animal'}
                                        </h5>
                                        <p class="card-text">
                                            <strong>Due Date:</strong> ${formatDate(pregnancy.expected_due_date)}<br>
                                            ${daysUntilDue !== null ? `<strong>Days Until Due:</strong> ${daysUntilDue > 0 ? daysUntilDue : 'Overdue'}<br>` : ''}
                                            <strong>Breeding Date:</strong> ${formatDate(pregnancy.breeding_date)}<br>
                                            <strong>Status:</strong> <span class="badge bg-${pregnancy.status === 'active' ? 'success' : pregnancy.status === 'completed' ? 'info' : 'danger'}">${pregnancy.status}</span>
                                        </p>
                                        ${pregnancy.notes ? `<p class="card-text"><small class="text-muted">${pregnancy.notes}</small></p>` : ''}
                                    </div>
                                    <div class="card-footer bg-transparent">
                                        <button class="btn btn-sm btn-warning" onclick="editPregnancy('${pregnancy.id}')">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deletePregnancy('${pregnancy.id}')">
                                            <i class="fas fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <i class="fas fa-baby"></i>
                        <h3>No Pregnancies Recorded</h3>
                        <p>Start tracking animal pregnancies</p>
                        <button class="btn btn-success" onclick="showAddPregnancyModal()">
                            <i class="fas fa-plus"></i> Record Pregnancy
                        </button>
                    </div>
                `}
            </div>

            <!-- Calves Tab -->
            <div class="tab-pane fade" id="calves" role="tabpanel">
                <div class="mb-3">
                    <button class="btn btn-success" onclick="showAddCalfModal()">
                        <i class="fas fa-plus"></i> Record Birth
                    </button>
                </div>

                ${currentCalves.length > 0 ? `
                    <div class="row">
                        ${currentCalves.map(calf => `
                            <div class="col-md-6 col-lg-4 mb-4">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h5 class="card-title">
                                            <i class="fas fa-horse"></i> Calf
                                        </h5>
                                        <p class="card-text">
                                            <strong>Mother:</strong> ${calf.livestock?.name || calf.livestock?.id_tag || 'N/A'}<br>
                                            <strong>Birth Date:</strong> ${formatDate(calf.birth_date)}<br>
                                            <strong>Gender:</strong> ${calf.gender || 'Unknown'}<br>
                                            <strong>Birth Weight:</strong> ${calf.birth_weight ? calf.birth_weight + ' kg' : 'N/A'}<br>
                                            <strong>Health at Birth:</strong> ${calf.health_status_at_birth || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <i class="fas fa-horse"></i>
                        <h3>No Calves Recorded</h3>
                        <p>Record calf births</p>
                        <button class="btn btn-success" onclick="showAddCalfModal()">
                            <i class="fas fa-plus"></i> Record Birth
                        </button>
                    </div>
                `}
            </div>
        </div>

        <!-- Pregnancy Modal -->
        <div class="modal fade" id="pregnancyModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="pregnancyModalTitle">Record Pregnancy</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="pregnancyForm">
                            <input type="hidden" id="pregnancyId">
                            <div class="mb-3">
                                <label class="form-label">Mother Animal *</label>
                                <select class="form-select" id="pregnancyAnimalId" required>
                                    <option value="">Select Animal</option>
                                    ${livestock.filter(a => a.gender === 'female').map(animal => `
                                        <option value="${animal.id}">${animal.name || animal.id_tag || animal.animal_type} - ${animal.animal_type}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Father Animal (Optional)</label>
                                <select class="form-select" id="pregnancyFatherId">
                                    <option value="">Select Animal</option>
                                    ${livestock.filter(a => a.gender === 'male').map(animal => `
                                        <option value="${animal.id}">${animal.name || animal.id_tag || animal.animal_type} - ${animal.animal_type}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Breeding Date</label>
                                    <input type="date" class="form-control" id="pregnancyBreedingDate">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Expected Due Date *</label>
                                    <input type="date" class="form-control" id="pregnancyDueDate" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Actual Birth Date</label>
                                    <input type="date" class="form-control" id="pregnancyBirthDate">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Status</label>
                                    <select class="form-select" id="pregnancyStatus">
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Complications</label>
                                <textarea class="form-control" id="pregnancyComplications" rows="2"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="pregnancyNotes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="savePregnancy()">Save</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Calf Modal -->
        <div class="modal fade" id="calfModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Record Calf Birth</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="calfForm">
                            <div class="mb-3">
                                <label class="form-label">Mother Animal *</label>
                                <select class="form-select" id="calfMotherId" required>
                                    <option value="">Select Animal</option>
                                    ${livestock.filter(a => a.gender === 'female').map(animal => `
                                        <option value="${animal.id}">${animal.name || animal.id_tag || animal.animal_type}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Birth Date *</label>
                                <input type="date" class="form-control" id="calfBirthDate" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Gender</label>
                                <select class="form-select" id="calfGender">
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Birth Weight (kg)</label>
                                <input type="number" step="0.01" class="form-control" id="calfBirthWeight">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Health Status at Birth</label>
                                <input type="text" class="form-control" id="calfHealthStatus" placeholder="e.g., Healthy, Weak">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="calfNotes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveCalf()">Save Calf</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showAddPregnancyModal() {
    document.getElementById('pregnancyModalTitle').textContent = 'Record Pregnancy';
    document.getElementById('pregnancyForm').reset();
    document.getElementById('pregnancyId').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('pregnancyModal'));
    modal.show();
}

async function editPregnancy(pregnancyId) {
    const pregnancy = currentPregnancies.find(p => p.id === pregnancyId);
    if (!pregnancy) return;

    document.getElementById('pregnancyModalTitle').textContent = 'Edit Pregnancy';
    document.getElementById('pregnancyId').value = pregnancy.id;
    document.getElementById('pregnancyAnimalId').value = pregnancy.animal_id;
    document.getElementById('pregnancyFatherId').value = pregnancy.father_id || '';
    document.getElementById('pregnancyBreedingDate').value = pregnancy.breeding_date || '';
    document.getElementById('pregnancyDueDate').value = pregnancy.expected_due_date;
    document.getElementById('pregnancyBirthDate').value = pregnancy.actual_birth_date || '';
    document.getElementById('pregnancyStatus').value = pregnancy.status;
    document.getElementById('pregnancyComplications').value = pregnancy.complications || '';
    document.getElementById('pregnancyNotes').value = pregnancy.notes || '';

    const modal = new bootstrap.Modal(document.getElementById('pregnancyModal'));
    modal.show();
}

async function savePregnancy() {
    const pregnancyId = document.getElementById('pregnancyId').value;
    const animal_id = document.getElementById('pregnancyAnimalId').value;
    const expected_due_date = document.getElementById('pregnancyDueDate').value;

    if (!animal_id || !expected_due_date) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    const pregnancyData = {
        animal_id,
        father_id: document.getElementById('pregnancyFatherId').value || null,
        breeding_date: document.getElementById('pregnancyBreedingDate').value || null,
        expected_due_date,
        actual_birth_date: document.getElementById('pregnancyBirthDate').value || null,
        status: document.getElementById('pregnancyStatus').value,
        complications: document.getElementById('pregnancyComplications').value.trim(),
        notes: document.getElementById('pregnancyNotes').value.trim()
    };

    showLoading();
    const result = pregnancyId 
        ? await API.pregnancies.update(pregnancyId, pregnancyData)
        : await API.pregnancies.create(pregnancyData);
    hideLoading();

    if (result.success) {
        showToast(`Pregnancy ${pregnancyId ? 'updated' : 'recorded'} successfully!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('pregnancyModal')).hide();
        loadPregnanciesPage();
    } else {
        showToast(result.error, 'error');
    }
}

async function deletePregnancy(pregnancyId) {
    if (!confirmDelete('Delete this pregnancy record?')) {
        return;
    }

    showLoading();
    const result = await API.pregnancies.delete(pregnancyId);
    hideLoading();

    if (result.success) {
        showToast('Pregnancy deleted successfully', 'success');
        loadPregnanciesPage();
    } else {
        showToast(result.error, 'error');
    }
}

function showAddCalfModal() {
    document.getElementById('calfForm').reset();
    document.getElementById('calfBirthDate').valueAsDate = new Date();
    
    const modal = new bootstrap.Modal(document.getElementById('calfModal'));
    modal.show();
}

async function saveCalf() {
    const mother_id = document.getElementById('calfMotherId').value;
    const birth_date = document.getElementById('calfBirthDate').value;

    if (!mother_id || !birth_date) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    const calfData = {
        mother_id,
        birth_date,
        gender: document.getElementById('calfGender').value || null,
        birth_weight: document.getElementById('calfBirthWeight').value || null,
        health_status_at_birth: document.getElementById('calfHealthStatus').value.trim(),
        notes: document.getElementById('calfNotes').value.trim()
    };

    showLoading();
    const result = await API.pregnancies.createCalf(calfData);
    hideLoading();

    if (result.success) {
        showToast('Calf birth recorded successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('calfModal')).hide();
        loadPregnanciesPage();
        // Switch to calves tab
        document.getElementById('calves-tab').click();
    } else {
        showToast(result.error, 'error');
    }
}
