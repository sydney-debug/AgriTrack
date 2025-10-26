// Supabase API Module for direct database operations

const API = {
    // Farms API
    farms: {
        getAll: async () => {
            try {
                const { data, error } = await supabase
                    .from('farms')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data: { farms: data || [] } };
            } catch (error) {
                console.error('Error fetching farms:', error);
                return { success: false, error: error.message };
            }
        },

        create: async (farmData) => {
            try {
                const user = Auth.getCurrentUser();
                const { data, error } = await supabase
                    .from('farms')
                    .insert({
                        farmer_id: user.id,
                        ...farmData
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: { farm: data } };
            } catch (error) {
                console.error('Error creating farm:', error);
                return { success: false, error: error.message };
            }
        },

        update: async (id, farmData) => {
            try {
                const { data, error } = await supabase
                    .from('farms')
                    .update(farmData)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: { farm: data } };
            } catch (error) {
                console.error('Error updating farm:', error);
                return { success: false, error: error.message };
            }
        },

        delete: async (id) => {
            try {
                const { error } = await supabase
                    .from('farms')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { success: true, data: {} };
            } catch (error) {
                console.error('Error deleting farm:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Livestock API
    livestock: {
        getAll: async () => {
            try {
                const { data, error } = await supabase
                    .from('livestock')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data: { livestock: data || [] } };
            } catch (error) {
                console.error('Error fetching livestock:', error);
                return { success: false, error: error.message };
            }
        },

        create: async (livestockData) => {
            try {
                const user = Auth.getCurrentUser();
                const profile = await Auth.getUserProfile(user.id);

                const { data, error } = await supabase
                    .from('livestock')
                    .insert({
                        farm_id: livestockData.farm_id,
                        ...livestockData
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: { livestock: data } };
            } catch (error) {
                console.error('Error creating livestock:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Health Records API
    healthRecords: {
        getAll: async () => {
            try {
                const { data, error } = await supabase
                    .from('health_records')
                    .select('*')
                    .order('record_date', { ascending: false });

                if (error) throw error;
                return { success: true, data: { health_records: data || [] } };
            } catch (error) {
                console.error('Error fetching health records:', error);
                return { success: false, error: error.message };
            }
        },

        create: async (recordData) => {
            try {
                const user = Auth.getCurrentUser();
                const profile = await Auth.getUserProfile(user.id);

                const { data, error } = await supabase
                    .from('health_records')
                    .insert({
                        vet_id: profile.role === 'vet' ? user.id : recordData.vet_id,
                        ...recordData
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: { health_record: data } };
            } catch (error) {
                console.error('Error creating health record:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Sales API
    sales: {
        getAll: async () => {
            try {
                const { data, error } = await supabase
                    .from('sales')
                    .select('*')
                    .order('sale_date', { ascending: false });

                if (error) throw error;
                return { success: true, data: { sales: data || [] } };
            } catch (error) {
                console.error('Error fetching sales:', error);
                return { success: false, error: error.message };
            }
        },

        create: async (saleData) => {
            try {
                const user = Auth.getCurrentUser();
                const { data, error } = await supabase
                    .from('sales')
                    .insert({
                        farm_id: saleData.farm_id,
                        ...saleData
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: { sale: data } };
            } catch (error) {
                console.error('Error creating sale:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Crops API
    crops: {
        getAll: async () => {
            try {
                const { data, error } = await supabase
                    .from('crops')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data: { crops: data || [] } };
            } catch (error) {
                console.error('Error fetching crops:', error);
                return { success: false, error: error.message };
            }
        },

        create: async (cropData) => {
            try {
                const user = Auth.getCurrentUser();
                const { data, error } = await supabase
                    .from('crops')
                    .insert({
                        farm_id: cropData.farm_id,
                        ...cropData
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: { crop: data } };
            } catch (error) {
                console.error('Error creating crop:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Inventory API
    inventory: {
        getAll: async () => {
            try {
                const { data, error } = await supabase
                    .from('inventory')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data: { inventory: data || [] } };
            } catch (error) {
                console.error('Error fetching inventory:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Marketplace API
    marketplace: {
        getMyListings: async () => {
            try {
                const user = Auth.getCurrentUser();
                const { data, error } = await supabase
                    .from('marketplace_listings')
                    .select('*')
                    .eq('agrovets_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data: { listings: data || [] } };
            } catch (error) {
                console.error('Error fetching listings:', error);
                return { success: false, error: error.message };
            }
        },

        getInquiries: async () => {
            try {
                const user = Auth.getCurrentUser();
                const profile = await Auth.getUserProfile(user.id);

                let query = supabase.from('marketplace_inquiries').select('*');

                if (profile.role === 'farmer') {
                    query = query.eq('farmer_id', user.id);
                } else if (profile.role === 'agrovets') {
                    // Get inquiries for agrovets' listings
                    const { data: listings } = await supabase
                        .from('marketplace_listings')
                        .select('id')
                        .eq('agrovets_id', user.id);

                    if (listings && listings.length > 0) {
                        const listingIds = listings.map(l => l.id);
                        query = query.in('listing_id', listingIds);
                    }
                }

                const { data, error } = await query.order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data: { inquiries: data || [] } };
            } catch (error) {
                console.error('Error fetching inquiries:', error);
                return { success: false, error: error.message };
            }
        },

        getAnalytics: async () => {
            try {
                const user = Auth.getCurrentUser();
                const { data, error } = await supabase
                    .from('marketplace_listings')
                    .select('category, views_count')
                    .eq('agrovets_id', user.id);

                if (error) throw error;

                // Calculate analytics
                const analytics = {
                    total_listings: data.length,
                    total_views: data.reduce((sum, item) => sum + (item.views_count || 0), 0),
                    by_category: {}
                };

                data.forEach(item => {
                    if (!analytics.by_category[item.category]) {
                        analytics.by_category[item.category] = { count: 0, views: 0 };
                    }
                    analytics.by_category[item.category].count++;
                    analytics.by_category[item.category].views += item.views_count || 0;
                });

                return { success: true, data: { analytics } };
            } catch (error) {
                console.error('Error fetching analytics:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Farm-Vet Associations API
    associations: {
        getAll: async () => {
            try {
                const user = Auth.getCurrentUser();
                const profile = await Auth.getUserProfile(user.id);

                let query = supabase.from('farm_vet_associations').select('*');

                if (profile.role === 'farmer') {
                    // Get farms for this farmer and their associations
                    const { data: farms } = await supabase
                        .from('farms')
                        .select('id')
                        .eq('farmer_id', user.id);

                    if (farms && farms.length > 0) {
                        const farmIds = farms.map(f => f.id);
                        query = query.in('farm_id', farmIds);
                    }
                } else if (profile.role === 'vet') {
                    query = query.eq('vet_id', user.id);
                }

                const { data, error } = await query.order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data: { associations: data || [] } };
            } catch (error) {
                console.error('Error fetching associations:', error);
                return { success: false, error: error.message };
            }
        }
    }
};
