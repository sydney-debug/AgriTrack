const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

router.use(authenticateToken);

const livestockSchema = Joi.object({
  farm_id: Joi.string().uuid().required(),
  animal_type: Joi.string().required(),
  id_tag: Joi.string().allow('', null),
  name: Joi.string().allow('', null),
  breed: Joi.string().allow('', null),
  date_of_birth: Joi.date().allow(null),
  gender: Joi.string().valid('male', 'female').allow(null),
  location_on_farm: Joi.string().allow('', null),
  health_status: Joi.string().default('healthy'),
  notes: Joi.string().allow('', null)
});

// Get all livestock
router.get('/', async (req, res) => {
  try {
    const { farm_id } = req.query;
    
    let query = supabase
      .from('livestock')
      .select('*, farms(name, farmer_id)')
      .order('created_at', { ascending: false });

    if (farm_id) {
      query = query.eq('farm_id', farm_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter based on role
    let filteredData = data;
    if (req.user.role === 'farmer') {
      filteredData = data.filter(animal => animal.farms.farmer_id === req.user.id);
    } else if (req.user.role === 'vet') {
      // Get vet's associated farms
      const { data: associations } = await supabase
        .from('farm_vet_associations')
        .select('farm_id')
        .eq('vet_id', req.user.id)
        .eq('invitation_status', 'accepted');

      const farmIds = associations.map(a => a.farm_id);
      filteredData = data.filter(animal => farmIds.includes(animal.farm_id));
    }

    res.json({ livestock: filteredData });
  } catch (error) {
    console.error('Get livestock error:', error);
    res.status(500).json({ error: 'Failed to fetch livestock' });
  }
});

// Get single animal
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('livestock')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Check access
    if (req.user.role === 'farmer' && data.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'vet') {
      const { data: association } = await supabase
        .from('farm_vet_associations')
        .select('*')
        .eq('farm_id', data.farm_id)
        .eq('vet_id', req.user.id)
        .eq('invitation_status', 'accepted')
        .single();

      if (!association) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ animal: data });
  } catch (error) {
    console.error('Get animal error:', error);
    res.status(500).json({ error: 'Failed to fetch animal' });
  }
});

// Create livestock (farmers only)
router.post('/', requireRole('farmer'), async (req, res) => {
  try {
    const { error: validationError } = livestockSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Verify farm ownership
    const { data: farm } = await supabase
      .from('farms')
      .select('farmer_id')
      .eq('id', req.body.farm_id)
      .single();

    if (!farm || farm.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('livestock')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Animal added successfully', animal: data });
  } catch (error) {
    console.error('Create livestock error:', error);
    res.status(500).json({ error: 'Failed to add animal' });
  }
});

// Update livestock
router.put('/:id', async (req, res) => {
  try {
    const { error: validationError } = livestockSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Check permissions
    const { data: existing } = await supabase
      .from('livestock')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    if (req.user.role === 'farmer' && existing.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('livestock')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Animal updated successfully', animal: data });
  } catch (error) {
    console.error('Update livestock error:', error);
    res.status(500).json({ error: 'Failed to update animal' });
  }
});

// Delete livestock (farmers only)
router.delete('/:id', requireRole('farmer'), async (req, res) => {
  try {
    const { data: animal } = await supabase
      .from('livestock')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (!animal || animal.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('livestock')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Animal deleted successfully' });
  } catch (error) {
    console.error('Delete livestock error:', error);
    res.status(500).json({ error: 'Failed to delete animal' });
  }
});

module.exports = router;
