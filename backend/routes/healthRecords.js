const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

router.use(authenticateToken);

const healthRecordSchema = Joi.object({
  animal_id: Joi.string().uuid().required(),
  vet_id: Joi.string().uuid().allow(null),
  record_date: Joi.date().default(() => new Date()),
  record_type: Joi.string().valid('vaccination', 'illness', 'treatment', 'checkup').required(),
  diagnosis: Joi.string().allow('', null),
  treatment: Joi.string().allow('', null),
  medications: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
  next_visit_date: Joi.date().allow(null)
});

// Get health records
router.get('/', async (req, res) => {
  try {
    const { animal_id, farm_id } = req.query;
    
    let query = supabase
      .from('health_records')
      .select('*, livestock(*, farms(farmer_id)), users(full_name)')
      .order('record_date', { ascending: false });

    if (animal_id) {
      query = query.eq('animal_id', animal_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter based on role
    let filteredData = data;
    if (req.user.role === 'farmer') {
      filteredData = data.filter(record => 
        record.livestock && record.livestock.farms && 
        record.livestock.farms.farmer_id === req.user.id
      );
    } else if (req.user.role === 'vet') {
      // Get vet's associated farms
      const { data: associations } = await supabase
        .from('farm_vet_associations')
        .select('farm_id')
        .eq('vet_id', req.user.id)
        .eq('invitation_status', 'accepted');

      const farmIds = associations.map(a => a.farm_id);
      filteredData = data.filter(record => 
        record.livestock && farmIds.includes(record.livestock.farm_id)
      );
    }

    if (farm_id) {
      filteredData = filteredData.filter(record => 
        record.livestock && record.livestock.farm_id === farm_id
      );
    }

    res.json({ health_records: filteredData });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

// Get single health record
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('health_records')
      .select('*, livestock(*, farms(farmer_id))')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Health record not found' });
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

    res.json({ health_record: data });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({ error: 'Failed to fetch health record' });
  }
});

// Create health record
router.post('/', requireRole('farmer', 'vet'), async (req, res) => {
  try {
    const { error: validationError } = healthRecordSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Get animal and verify access
    const { data: animal } = await supabase
      .from('livestock')
      .select('*, farms(farmer_id)')
      .eq('id', req.body.animal_id)
      .single();

    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Check permissions
    if (req.user.role === 'farmer' && animal.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'vet') {
      const { data: association } = await supabase
        .from('farm_vet_associations')
        .select('*')
        .eq('farm_id', animal.farm_id)
        .eq('vet_id', req.user.id)
        .eq('invitation_status', 'accepted')
        .single();

      if (!association) {
        return res.status(403).json({ error: 'Access denied to this farm' });
      }
    }

    // Add vet_id if the user is a vet
    const recordData = {
      ...req.body,
      vet_id: req.user.role === 'vet' ? req.user.id : req.body.vet_id
    };

    const { data, error } = await supabase
      .from('health_records')
      .insert(recordData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Health record created successfully', health_record: data });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({ error: 'Failed to create health record' });
  }
});

// Update health record
router.put('/:id', requireRole('farmer', 'vet'), async (req, res) => {
  try {
    const { error: validationError } = healthRecordSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Check existing record
    const { data: existing } = await supabase
      .from('health_records')
      .select('*, livestock(*, farms(farmer_id))')
      .eq('id', req.params.id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Health record not found' });
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
      .from('health_records')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Health record updated successfully', health_record: data });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({ error: 'Failed to update health record' });
  }
});

// Delete health record
router.delete('/:id', requireRole('farmer', 'vet'), async (req, res) => {
  try {
    const { data: record } = await supabase
      .from('health_records')
      .select('*, livestock(*, farms(farmer_id))')
      .eq('id', req.params.id)
      .single();

    if (!record) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    // Check permissions
    if (req.user.role === 'farmer' && 
        record.livestock.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'vet' && record.vet_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own records' });
    }

    const { error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({ error: 'Failed to delete health record' });
  }
});

module.exports = router;
