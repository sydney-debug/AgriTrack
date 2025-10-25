const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

router.use(authenticateToken);
router.use(requireRole('farmer'));

const vetContactSchema = Joi.object({
  vet_name: Joi.string().required(),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  specialty: Joi.string().allow('', null),
  address: Joi.string().allow('', null),
  notes: Joi.string().allow('', null)
});

// Get all vet contacts for farmer
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vets_contacts')
      .select('*')
      .eq('farmer_id', req.user.id)
      .order('vet_name', { ascending: true });

    if (error) throw error;

    res.json({ contacts: data });
  } catch (error) {
    console.error('Get vet contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch vet contacts' });
  }
});

// Get single vet contact
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vets_contacts')
      .select('*')
      .eq('id', req.params.id)
      .eq('farmer_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Vet contact not found' });
    }

    res.json({ contact: data });
  } catch (error) {
    console.error('Get vet contact error:', error);
    res.status(500).json({ error: 'Failed to fetch vet contact' });
  }
});

// Create vet contact
router.post('/', async (req, res) => {
  try {
    const { error: validationError } = vetContactSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const contactData = {
      ...req.body,
      farmer_id: req.user.id
    };

    const { data, error } = await supabase
      .from('vets_contacts')
      .insert(contactData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Vet contact added successfully', contact: data });
  } catch (error) {
    console.error('Create vet contact error:', error);
    res.status(500).json({ error: 'Failed to add vet contact' });
  }
});

// Update vet contact
router.put('/:id', async (req, res) => {
  try {
    const { error: validationError } = vetContactSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { data, error } = await supabase
      .from('vets_contacts')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('farmer_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Vet contact not found or access denied' });
    }

    res.json({ message: 'Vet contact updated successfully', contact: data });
  } catch (error) {
    console.error('Update vet contact error:', error);
    res.status(500).json({ error: 'Failed to update vet contact' });
  }
});

// Delete vet contact
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('vets_contacts')
      .delete()
      .eq('id', req.params.id)
      .eq('farmer_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Vet contact deleted successfully' });
  } catch (error) {
    console.error('Delete vet contact error:', error);
    res.status(500).json({ error: 'Failed to delete vet contact' });
  }
});

module.exports = router;
