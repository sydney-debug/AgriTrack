const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

router.use(authenticateToken);

const pregnancySchema = Joi.object({
  animal_id: Joi.string().uuid().required(),
  father_id: Joi.string().uuid().allow(null),
  breeding_date: Joi.date().allow(null),
  expected_due_date: Joi.date().required(),
  actual_birth_date: Joi.date().allow(null),
  status: Joi.string().valid('active', 'completed', 'failed').default('active'),
  complications: Joi.string().allow('', null),
  notes: Joi.string().allow('', null)
});

const calfSchema = Joi.object({
  pregnancy_id: Joi.string().uuid().allow(null),
  mother_id: Joi.string().uuid().required(),
  livestock_id: Joi.string().uuid().allow(null),
  birth_date: Joi.date().required(),
  gender: Joi.string().valid('male', 'female').allow(null),
  birth_weight: Joi.number().min(0).allow(null),
  health_status_at_birth: Joi.string().allow('', null),
  notes: Joi.string().allow('', null)
});

// Get all pregnancies
router.get('/', async (req, res) => {
  try {
    const { farm_id, status } = req.query;
    
    let query = supabase
      .from('pregnancies')
      .select('*, livestock!animal_id(*, farms(farmer_id)), livestock!father_id(*)')
      .order('expected_due_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter based on role
    let filteredData = data;
    if (req.user.role === 'farmer') {
      filteredData = data.filter(pregnancy => 
        pregnancy.livestock && pregnancy.livestock.farms && 
        pregnancy.livestock.farms.farmer_id === req.user.id
      );
    } else if (req.user.role === 'vet') {
      const { data: associations } = await supabase
        .from('farm_vet_associations')
        .select('farm_id')
        .eq('vet_id', req.user.id)
        .eq('invitation_status', 'accepted');

      const farmIds = associations.map(a => a.farm_id);
      filteredData = data.filter(pregnancy => 
        pregnancy.livestock && farmIds.includes(pregnancy.livestock.farm_id)
      );
    }

    if (farm_id) {
      filteredData = filteredData.filter(pregnancy => 
        pregnancy.livestock && pregnancy.livestock.farm_id === farm_id
      );
    }

    res.json({ pregnancies: filteredData });
  } catch (error) {
    console.error('Get pregnancies error:', error);
    res.status(500).json({ error: 'Failed to fetch pregnancies' });
  }
});

// Get single pregnancy
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pregnancies')
      .select('*, livestock(*, farms(farmer_id))')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Pregnancy record not found' });
    }

    // Check access
    if (req.user.role === 'farmer' && 
        data.livestock.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'vet') {
      const { data: association } = await supabase
        .from('farm_vet_associations')
        .select('*')
        .eq('farm_id', data.livestock.farm_id)
        .eq('vet_id', req.user.id)
        .eq('invitation_status', 'accepted')
        .single();

      if (!association) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ pregnancy: data });
  } catch (error) {
    console.error('Get pregnancy error:', error);
    res.status(500).json({ error: 'Failed to fetch pregnancy record' });
  }
});

// Create pregnancy (farmers only)
router.post('/', requireRole('farmer'), async (req, res) => {
  try {
    const { error: validationError } = pregnancySchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Verify animal ownership
    const { data: animal } = await supabase
      .from('livestock')
      .select('*, farms(farmer_id)')
      .eq('id', req.body.animal_id)
      .single();

    if (!animal || animal.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('pregnancies')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Pregnancy record created successfully', pregnancy: data });
  } catch (error) {
    console.error('Create pregnancy error:', error);
    res.status(500).json({ error: 'Failed to create pregnancy record' });
  }
});

// Update pregnancy
router.put('/:id', requireRole('farmer', 'vet'), async (req, res) => {
  try {
    const { error: validationError } = pregnancySchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { data: existing } = await supabase
      .from('pregnancies')
      .select('*, livestock(*, farms(farmer_id))')
      .eq('id', req.params.id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Pregnancy record not found' });
    }

    // Check permissions
    if (req.user.role === 'farmer' && 
        existing.livestock.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'vet') {
      const { data: association } = await supabase
        .from('farm_vet_associations')
        .select('*')
        .eq('farm_id', existing.livestock.farm_id)
        .eq('vet_id', req.user.id)
        .eq('invitation_status', 'accepted')
        .single();

      if (!association) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const { data, error } = await supabase
      .from('pregnancies')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Pregnancy record updated successfully', pregnancy: data });
  } catch (error) {
    console.error('Update pregnancy error:', error);
    res.status(500).json({ error: 'Failed to update pregnancy record' });
  }
});

// Delete pregnancy (farmers only)
router.delete('/:id', requireRole('farmer'), async (req, res) => {
  try {
    const { data: pregnancy } = await supabase
      .from('pregnancies')
      .select('*, livestock(*, farms(farmer_id))')
      .eq('id', req.params.id)
      .single();

    if (!pregnancy || pregnancy.livestock.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('pregnancies')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Pregnancy record deleted successfully' });
  } catch (error) {
    console.error('Delete pregnancy error:', error);
    res.status(500).json({ error: 'Failed to delete pregnancy record' });
  }
});

// ========== CALVES ROUTES ==========

// Get all calves
router.get('/calves/all', async (req, res) => {
  try {
    const { farm_id } = req.query;
    
    let query = supabase
      .from('calves')
      .select('*, livestock!mother_id(*, farms(farmer_id))')
      .order('birth_date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Filter based on role
    let filteredData = data;
    if (req.user.role === 'farmer') {
      filteredData = data.filter(calf => 
        calf.livestock && calf.livestock.farms && 
        calf.livestock.farms.farmer_id === req.user.id
      );
    }

    if (farm_id) {
      filteredData = filteredData.filter(calf => 
        calf.livestock && calf.livestock.farm_id === farm_id
      );
    }

    res.json({ calves: filteredData });
  } catch (error) {
    console.error('Get calves error:', error);
    res.status(500).json({ error: 'Failed to fetch calves' });
  }
});

// Create calf record (farmers only)
router.post('/calves', requireRole('farmer'), async (req, res) => {
  try {
    const { error: validationError } = calfSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Verify mother ownership
    const { data: mother } = await supabase
      .from('livestock')
      .select('*, farms(farmer_id)')
      .eq('id', req.body.mother_id)
      .single();

    if (!mother || mother.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('calves')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Calf record created successfully', calf: data });
  } catch (error) {
    console.error('Create calf error:', error);
    res.status(500).json({ error: 'Failed to create calf record' });
  }
});

module.exports = router;
