const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

router.use(authenticateToken);
router.use(requireRole('farmer'));

const saleSchema = Joi.object({
  farm_id: Joi.string().uuid().required(),
  product_name: Joi.string().required(),
  product_type: Joi.string().allow('', null),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().allow('', null),
  price_per_unit: Joi.number().min(0).required(),
  total_amount: Joi.number().min(0).required(),
  buyer_name: Joi.string().allow('', null),
  buyer_contact: Joi.string().allow('', null),
  sale_date: Joi.date().default(() => new Date()),
  payment_status: Joi.string().valid('pending', 'paid', 'partial').default('pending'),
  notes: Joi.string().allow('', null)
});

// Get all sales
router.get('/', async (req, res) => {
  try {
    const { farm_id, start_date, end_date } = req.query;
    
    let query = supabase
      .from('sales')
      .select('*, farms(name, farmer_id)')
      .order('sale_date', { ascending: false });

    if (farm_id) {
      query = query.eq('farm_id', farm_id);
    }

    if (start_date) {
      query = query.gte('sale_date', start_date);
    }

    if (end_date) {
      query = query.lte('sale_date', end_date);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter only user's farms
    const filteredData = data.filter(sale => 
      sale.farms && sale.farms.farmer_id === req.user.id
    );

    res.json({ sales: filteredData });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get single sale
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    if (data.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ sale: data });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

// Create sale
router.post('/', async (req, res) => {
  try {
    const { error: validationError } = saleSchema.validate(req.body);
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
      .from('sales')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Sale recorded successfully', sale: data });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// Update sale
router.put('/:id', async (req, res) => {
  try {
    const { error: validationError } = saleSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { data: existing } = await supabase
      .from('sales')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (!existing || existing.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('sales')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Sale updated successfully', sale: data });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ error: 'Failed to update sale' });
  }
});

// Delete sale
router.delete('/:id', async (req, res) => {
  try {
    const { data: sale } = await supabase
      .from('sales')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (!sale || sale.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: 'Failed to delete sale' });
  }
});

// Get sales report/summary
router.get('/reports/summary', async (req, res) => {
  try {
    const { farm_id, start_date, end_date } = req.query;

    let query = supabase
      .from('sales')
      .select('*, farms(farmer_id)');

    if (farm_id) {
      query = query.eq('farm_id', farm_id);
    }

    if (start_date) {
      query = query.gte('sale_date', start_date);
    }

    if (end_date) {
      query = query.lte('sale_date', end_date);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter and calculate
    const userSales = data.filter(sale => 
      sale.farms && sale.farms.farmer_id === req.user.id
    );

    const summary = {
      total_sales: userSales.length,
      total_revenue: userSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0),
      pending_payments: userSales.filter(s => s.payment_status === 'pending').length,
      by_product_type: {}
    };

    // Group by product type
    userSales.forEach(sale => {
      const type = sale.product_type || 'other';
      if (!summary.by_product_type[type]) {
        summary.by_product_type[type] = {
          count: 0,
          revenue: 0
        };
      }
      summary.by_product_type[type].count++;
      summary.by_product_type[type].revenue += parseFloat(sale.total_amount || 0);
    });

    res.json({ summary });
  } catch (error) {
    console.error('Get sales summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

module.exports = router;
