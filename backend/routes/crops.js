const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

router.use(authenticateToken);
router.use(requireRole('farmer'));

const cropSchema = Joi.object({
  farm_id: Joi.string().uuid().required(),
  crop_type: Joi.string().required(),
  variety: Joi.string().allow('', null),
  planting_date: Joi.date().allow(null),
  harvest_date: Joi.date().allow(null),
  expected_yield: Joi.number().allow(null),
  actual_yield: Joi.number().allow(null),
  field_location: Joi.string().allow('', null),
  field_coords: Joi.object().allow(null),
  notes: Joi.string().allow('', null),
  status: Joi.string().valid('active', 'harvested', 'failed').default('active')
});

// Get all crops for user's farms
router.get('/', async (req, res) => {
  try {
    const { farm_id } = req.query;
    
    let query = supabase
      .from('crops')
      .select('*, farms(name)')
      .order('created_at', { ascending: false });

    if (farm_id) {
      query = query.eq('farm_id', farm_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter only user's farms
    const userCrops = data.filter(crop => 
      crop.farms && crop.farms.farmer_id === req.user.id
    );

    res.json({ crops: data });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

// Get single crop
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('crops')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    if (data.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ crop: data });
  } catch (error) {
    console.error('Get crop error:', error);
    res.status(500).json({ error: 'Failed to fetch crop' });
  }
});

// Create crop
router.post('/', async (req, res) => {
  try {
    const { error: validationError } = cropSchema.validate(req.body);
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
      .from('crops')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Crop created successfully', crop: data });
  } catch (error) {
    console.error('Create crop error:', error);
    res.status(500).json({ error: 'Failed to create crop' });
  }
});

// Update crop
router.put('/:id', async (req, res) => {
  try {
    const { error: validationError } = cropSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { data, error } = await supabase
      .from('crops')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*, farms(farmer_id)')
      .single();

    if (error || !data || data.farms.farmer_id !== req.user.id) {
      return res.status(404).json({ error: 'Crop not found or access denied' });
    }

    res.json({ message: 'Crop updated successfully', crop: data });
  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({ error: 'Failed to update crop' });
  }
});

// Delete crop
router.delete('/:id', async (req, res) => {
  try {
    const { data: crop } = await supabase
      .from('crops')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (!crop || crop.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Crop deleted successfully' });
  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({ error: 'Failed to delete crop' });
  }
});

module.exports = router;
