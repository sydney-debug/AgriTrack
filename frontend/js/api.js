// API Module for making HTTP requests

const API = {
    // Generic request method
    async request(endpoint, options = {}) {
        const token = Auth.getToken();
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return { success: true, data };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    },

    // GET request
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    // POST request
    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // PUT request
    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    // DELETE request
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // Farms API
    farms: {
        getAll: () => API.get('/farms'),
        getById: (id) => API.get(`/farms/${id}`),
        create: (data) => API.post('/farms', data),
        update: (id, data) => API.put(`/farms/${id}`, data),
        delete: (id) => API.delete(`/farms/${id}`)
    },

    // Crops API
    crops: {
        getAll: (farmId) => API.get(`/crops${farmId ? `?farm_id=${farmId}` : ''}`),
        getById: (id) => API.get(`/crops/${id}`),
        create: (data) => API.post('/crops', data),
        update: (id, data) => API.put(`/crops/${id}`, data),
        delete: (id) => API.delete(`/crops/${id}`)
    },

    // Livestock API
    livestock: {
        getAll: (farmId) => API.get(`/livestock${farmId ? `?farm_id=${farmId}` : ''}`),
        getById: (id) => API.get(`/livestock/${id}`),
        create: (data) => API.post('/livestock', data),
        update: (id, data) => API.put(`/livestock/${id}`, data),
        delete: (id) => API.delete(`/livestock/${id}`)
    },

    // Health Records API
    healthRecords: {
        getAll: (animalId) => API.get(`/health-records${animalId ? `?animal_id=${animalId}` : ''}`),
        getById: (id) => API.get(`/health-records/${id}`),
        create: (data) => API.post('/health-records', data),
        update: (id, data) => API.put(`/health-records/${id}`, data),
        delete: (id) => API.delete(`/health-records/${id}`)
    },

    // Sales API
    sales: {
        getAll: (farmId) => API.get(`/sales${farmId ? `?farm_id=${farmId}` : ''}`),
        getById: (id) => API.get(`/sales/${id}`),
        create: (data) => API.post('/sales', data),
        update: (id, data) => API.put(`/sales/${id}`, data),
        delete: (id) => API.delete(`/sales/${id}`),
        getSummary: (params) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/sales/reports/summary?${query}`);
        }
    },

    // Inventory API
    inventory: {
        getAll: (farmId) => API.get(`/inventory${farmId ? `?farm_id=${farmId}` : ''}`),
        getById: (id) => API.get(`/inventory/${id}`),
        create: (data) => API.post('/inventory', data),
        update: (id, data) => API.put(`/inventory/${id}`, data),
        delete: (id) => API.delete(`/inventory/${id}`),
        logConsumption: (id, data) => API.post(`/inventory/${id}/consumption`, data)
    },

    // Pregnancies API
    pregnancies: {
        getAll: (farmId) => API.get(`/pregnancies${farmId ? `?farm_id=${farmId}` : ''}`),
        getById: (id) => API.get(`/pregnancies/${id}`),
        create: (data) => API.post('/pregnancies', data),
        update: (id, data) => API.put(`/pregnancies/${id}`, data),
        delete: (id) => API.delete(`/pregnancies/${id}`),
        getCalves: (farmId) => API.get(`/pregnancies/calves/all${farmId ? `?farm_id=${farmId}` : ''}`),
        createCalf: (data) => API.post('/pregnancies/calves', data)
    },

    // Vets Contacts API
    vetsContacts: {
        getAll: () => API.get('/vets-contacts'),
        getById: (id) => API.get(`/vets-contacts/${id}`),
        create: (data) => API.post('/vets-contacts', data),
        update: (id, data) => API.put(`/vets-contacts/${id}`, data),
        delete: (id) => API.delete(`/vets-contacts/${id}`)
    },

    // Notebook API
    notebook: {
        getAll: (farmId) => API.get(`/notebook${farmId ? `?farm_id=${farmId}` : ''}`),
        getById: (id) => API.get(`/notebook/${id}`),
        create: (data) => API.post('/notebook', data),
        update: (id, data) => API.put(`/notebook/${id}`, data),
        delete: (id) => API.delete(`/notebook/${id}`)
    },

    // Marketplace API
    marketplace: {
        getListings: (params) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/marketplace/listings?${query}`);
        },
        getListingById: (id) => API.get(`/marketplace/listings/${id}`),
        getMyListings: () => API.get('/marketplace/my-listings'),
        createListing: (data) => API.post('/marketplace/listings', data),
        updateListing: (id, data) => API.put(`/marketplace/listings/${id}`, data),
        deleteListing: (id) => API.delete(`/marketplace/listings/${id}`),
        createInquiry: (data) => API.post('/marketplace/inquiries', data),
        getInquiries: () => API.get('/marketplace/inquiries'),
        getMyInquiries: () => API.get('/marketplace/my-inquiries'),
        updateInquiry: (id, status) => API.put(`/marketplace/inquiries/${id}`, { status }),
        getAnalytics: () => API.get('/marketplace/analytics')
    },

    // Farm-Vet Associations API
    associations: {
        getAll: () => API.get('/farm-vet-associations'),
        getById: (id) => API.get(`/farm-vet-associations/${id}`),
        invite: (data) => API.post('/farm-vet-associations/invite', data),
        respond: (id, status) => API.put(`/farm-vet-associations/${id}/respond`, { invitation_status: status }),
        updateVisit: (id, data) => API.put(`/farm-vet-associations/${id}/visit`, data),
        delete: (id) => API.delete(`/farm-vet-associations/${id}`)
    }
};
