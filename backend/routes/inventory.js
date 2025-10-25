const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

router.use(authenticateToken);
router.use(requireRole('farmer'));

const inventorySchema = Joi.object({
  farm_id: Joi.string().uuid().required(),
  item_type: Joi.string().valid('feed', 'supplement', 'medication').required(),
  item_name: Joi.string().required(),
  quantity: Joi.number().min(0).required(),
  unit: Joi.string().allow('', null),
  supplier: Joi.string().allow('', null),
  purchase_date: Joi.date().allow(null),
  cost: Joi.number().min(0).allow(null),
  consumption_log: Joi.array().default([]),
  reorder_level: Joi.number().min(0).allow(null),
  notes: Joi.string().allow('', null)
});

const consumptionSchema = Joi.object({
  date: Joi.date().required(),
  quantity: Joi.number().positive().required(),
  notes: Joi.string().allow('', null)
});

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const { farm_id, item_type, low_stock } = req.query;
    
    let query = supabase
      .from('inventory')
      .select('*, farms(name, farmer_id)')
      .order('created_at', { ascending: false });

    if (farm_id) {
      query = query.eq('farm_id', farm_id);
    }

    if (item_type) {
      query = query.eq('item_type', item_type);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter only user's farms
    let filteredData = data.filter(item => 
      item.farms && item.farms.farmer_id === req.user.id
    );

    // Filter low stock items if requested
    if (low_stock === 'true') {
      filteredData = filteredData.filter(item => 
        item.reorder_level && item.quantity <= item.reorder_level
      );
    }

    res.json({ inventory: filteredData });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get single inventory item
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    if (data.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ item: data });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// Create inventory item
router.post('/', async (req, res) => {
  try {
    const { error: validationError } = inventorySchema.validate(req.body);
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
      .from('inventory')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Inventory item added successfully', item: data });
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { error: validationError } = inventorySchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { data: existing } = await supabase
      .from('inventory')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (!existing || existing.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('inventory')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Inventory item updated successfully', item: data });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Log consumption
router.post('/:id/consumption', async (req, res) => {
  try {
    const { error: validationError } = consumptionSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Get current item
    const { data: item, error: fetchError } = await supabase
      .from('inventory')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    if (item.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add to consumption log and update quantity
    const newConsumptionLog = [...(item.consumption_log || []), req.body];
    const newQuantity = Math.max(0, item.quantity - req.body.quantity);

    const { data, error } = await supabase
      .from('inventory')
      .update({
        consumption_log: newConsumptionLog,
        quantity: newQuantity
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Consumption logged successfully', 
      item: data,
      warning: newQuantity <= (item.reorder_level || 0) ? 'Stock is low, consider reordering' : null
    });
  } catch (error) {
    console.error('Log consumption error:', error);
    res.status(500).json({ error: 'Failed to log consumption' });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { data: item } = await supabase
      .from('inventory')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (!item || item.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

module.exports = router;
