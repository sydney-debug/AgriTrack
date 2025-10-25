// Health Records Module

let currentHealthRecords = [];
let selectedAnimalForHealth = null;

async function loadHealthRecordsPage(animalId = null) {
    setActiveMenuItem('loadHealthRecordsPage');
    updatePageTitle('Health Records');
    
    selectedAnimalForHealth = animalId;
    const mainContent = document.getElementById('mainContent');
    
    showLoading();
    const [healthResult, livestockResult] = await Promise.all([
        API.healthRecords.getAll(animalId),
        API.livestock.getAll()
    ]);
    hideLoading();

    if (!healthResult.success) {
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading health records: ${healthResult.error}</div>`;
        return;
    }

    currentHealthRecords = healthResult.data.health_records;
    const livestock = livestockResult.success ? livestockResult.data.livestock : [];

    mainContent.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <button class="btn btn-success" onclick="showAddHealthRecordModal()">
                <i class="fas fa-plus"></i> Add Health Record
            </button>
            ${animalId ? `<button class="btn btn-secondary" onclick="loadHealthRecordsPage()"><i class="fas fa-list"></i> View All Records</button>` : ''}
        </div>

        ${currentHealthRecords.length > 0 ? `
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Animal</th>
                                    <th>Type</th>
                                    <th>Diagnosis</th>
                                    <th>Treatment</th>
                                    <th>Vet</th>
                                    <th>Next Visit</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currentHealthRecords.map(record => `
                                    <tr>
                                        <td>${formatDate(record.record_date)}</td>
                                        <td>${record.livestock?.name || record.livestock?.id_tag || 'N/A'}</td>
                                        <td><span class="badge bg-info">${record.record_type}</span></td>
                                        <td>${record.diagnosis || '-'}</td>
                                        <td>${record.treatment || '-'}</td>
                                        <td>${record.users?.full_name || '-'}</td>
                                        <td>${formatDate(record.next_visit_date)}</td>
                                        <td>
                                            <button class="btn btn-sm btn-warning" onclick="editHealthRecord('${record.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteHealthRecord('${record.id}')">
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
                <i class="fas fa-heartbeat"></i>
                <h3>No Health Records Yet</h3>
                <p>Start tracking animal health</p>
                <button class="btn btn-success" onclick="showAddHealthRecordModal()">
                    <i class="fas fa-plus"></i> Add Record
                </button>
            </div>
        `}

        <!-- Health Record Modal -->
        <div class="modal fade" id="healthRecordModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="healthRecordModalTitle">Add Health Record</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="healthRecordForm">
                            <input type="hidden" id="healthRecordId">
                            <div class="mb-3">
                                <label class="form-label">Animal *</label>
                                <select class="form-select" id="healthAnimalId" required>
                                    <option value="">Select Animal</option>
                                    ${livestock.map(animal => `
                                        <option value="${animal.id}">${animal.name || animal.id_tag || animal.animal_type} - ${animal.animal_type}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Record Type *</label>
                                    <select class="form-select" id="healthRecordType" required>
                                        <option value="vaccination">Vaccination</option>
                                        <option value="illness">Illness</option>
                                        <option value="treatment">Treatment</option>
                                        <option value="checkup">Checkup</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Date *</label>
                                    <input type="date" class="form-control" id="healthRecordDate" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Diagnosis</label>
                                <textarea class="form-control" id="healthDiagnosis" rows="2"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Treatment</label>
                                <textarea class="form-control" id="healthTreatment" rows="2"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Medications</label>
                                <input type="text" class="form-control" id="healthMedications" placeholder="e.g., Antibiotic X, 2 doses daily">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Next Visit Date</label>
                                <input type="date" class="form-control" id="healthNextVisit">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="healthNotes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveHealthRecord()">Save Record</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showAddHealthRecordModal() {
    document.getElementById('healthRecordModalTitle').textContent = 'Add Health Record';
    document.getElementById('healthRecordForm').reset();
    document.getElementById('healthRecordId').value = '';
    document.getElementById('healthRecordDate').valueAsDate = new Date();
    
    if (selectedAnimalForHealth) {
        document.getElementById('healthAnimalId').value = selectedAnimalForHealth;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('healthRecordModal'));
    modal.show();
}

async function editHealthRecord(recordId) {
    const record = currentHealthRecords.find(r => r.id === recordId);
    if (!record) return;

    document.getElementById('healthRecordModalTitle').textContent = 'Edit Health Record';
    document.getElementById('healthRecordId').value = record.id;
    document.getElementById('healthAnimalId').value = record.animal_id;
    document.getElementById('healthRecordType').value = record.record_type;
    document.getElementById('healthRecordDate').value = record.record_date;
    document.getElementById('healthDiagnosis').value = record.diagnosis || '';
    document.getElementById('healthTreatment').value = record.treatment || '';
    document.getElementById('healthMedications').value = record.medications || '';
    document.getElementById('healthNextVisit').value = record.next_visit_date || '';
    document.getElementById('healthNotes').value = record.notes || '';

    const modal = new bootstrap.Modal(document.getElementById('healthRecordModal'));
    modal.show();
}

async function saveHealthRecord() {
    const recordId = document.getElementById('healthRecordId').value;
    const animal_id = document.getElementById('healthAnimalId').value;
    const record_type = document.getElementById('healthRecordType').value;
    const record_date = document.getElementById('healthRecordDate').value;

    if (!animal_id || !record_type || !record_date) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    const recordData = {
        animal_id,
        record_type,
        record_date,
        diagnosis: document.getElementById('healthDiagnosis').value.trim(),
        treatment: document.getElementById('healthTreatment').value.trim(),
        medications: document.getElementById('healthMedications').value.trim(),
        next_visit_date: document.getElementById('healthNextVisit').value || null,
        notes: document.getElementById('healthNotes').value.trim()
    };

    showLoading();
    const result = recordId 
        ? await API.healthRecords.update(recordId, recordData)
        : await API.healthRecords.create(recordData);
    hideLoading();

    if (result.success) {
        showToast(`Health record ${recordId ? 'updated' : 'created'} successfully!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('healthRecordModal')).hide();
        loadHealthRecordsPage(selectedAnimalForHealth);
    } else {
        showToast(result.error, 'error');
    }
}

async function deleteHealthRecord(recordId) {
    if (!confirmDelete('Delete this health record?')) {
        return;
    }

    showLoading();
    const result = await API.healthRecords.delete(recordId);
    hideLoading();

    if (result.success) {
        showToast('Health record deleted successfully', 'success');
        loadHealthRecordsPage(selectedAnimalForHealth);
    } else {
        showToast(result.error, 'error');
    }
}
