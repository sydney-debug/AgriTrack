const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

// All routes require authentication
router.use(authenticateToken);

// Validation schema
const farmSchema = Joi.object({
  name: Joi.string().required(),
  location_text: Joi.string().allow('', null),
  location_coords: Joi.object({
    lat: Joi.number(),
    lng: Joi.number()
  }).allow(null),
  description: Joi.string().allow('', null)
});

/**
 * GET /api/farms
 * Get all farms for the current user
 */
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('farms').select('*');

    if (req.user.role === 'farmer') {
      query = query.eq('farmer_id', req.user.id);
    } else if (req.user.role === 'vet') {
      // Vets see farms they're associated with
      const { data: associations } = await supabase
        .from('farm_vet_associations')
        .select('farm_id')
        .eq('vet_id', req.user.id)
        .eq('invitation_status', 'accepted');

      const farmIds = associations.map(a => a.farm_id);
      if (farmIds.length === 0) {
        return res.json({ farms: [] });
      }
      query = query.in('id', farmIds);
    } else {
      return res.status(403).json({ error: 'Agrovets cannot access farms' });
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ farms: data });
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({ error: 'Failed to fetch farms' });
  }
});

/**
 * GET /api/farms/:id
 * Get a specific farm
 */
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Check access permissions
    if (req.user.role === 'farmer' && data.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'vet') {
      const { data: association } = await supabase
        .from('farm_vet_associations')
        .select('*')
        .eq('farm_id', req.params.id)
        .eq('vet_id', req.user.id)
        .eq('invitation_status', 'accepted')
        .single();

      if (!association) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ farm: data });
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({ error: 'Failed to fetch farm' });
  }
});

/**
 * POST /api/farms
 * Create a new farm (farmers only)
 */
router.post('/', requireRole('farmer'), async (req, res) => {
  try {
    const { error: validationError } = farmSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const farmData = {
      ...req.body,
      farmer_id: req.user.id
    };

    const { data, error } = await supabase
      .from('farms')
      .insert(farmData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Farm created successfully', farm: data });
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({ error: 'Failed to create farm' });
  }
});

/**
 * PUT /api/farms/:id
 * Update a farm (farmers only)
 */
router.put('/:id', requireRole('farmer'), async (req, res) => {
  try {
    const { error: validationError } = farmSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { data, error } = await supabase
      .from('farms')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('farmer_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Farm not found or access denied' });
    }

    res.json({ message: 'Farm updated successfully', farm: data });
  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({ error: 'Failed to update farm' });
  }
});

/**
 * DELETE /api/farms/:id
 * Delete a farm (farmers only)
 */
router.delete('/:id', requireRole('farmer'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('farms')
      .delete()
      .eq('id', req.params.id)
      .eq('farmer_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Farm deleted successfully' });
  } catch (error) {
    console.error('Delete farm error:', error);
    res.status(500).json({ error: 'Failed to delete farm' });
  }
});

module.exports = router;
