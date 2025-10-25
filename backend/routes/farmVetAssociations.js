const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

router.use(authenticateToken);

const invitationSchema = Joi.object({
  farm_id: Joi.string().uuid().required(),
  vet_email: Joi.string().email().required()
});

const associationUpdateSchema = Joi.object({
  invitation_status: Joi.string().valid('accepted', 'rejected').required()
});

const visitUpdateSchema = Joi.object({
  last_visit_date: Joi.date().required(),
  notes: Joi.string().allow('', null)
});

// Get all associations for current user
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('farm_vet_associations')
      .select('*, farms(name, location_text, farmer_id), users!vet_id(full_name, email, phone)');

    if (req.user.role === 'farmer') {
      // Get associations for farmer's farms
      query = query.eq('farms.farmer_id', req.user.id);
    } else if (req.user.role === 'vet') {
      // Get vet's associations
      query = query.eq('vet_id', req.user.id);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.json({ associations: data });
  } catch (error) {
    console.error('Get associations error:', error);
    res.status(500).json({ error: 'Failed to fetch associations' });
  }
});

// Get single association
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('farm_vet_associations')
      .select('*, farms(name, location_text, farmer_id), users!vet_id(full_name, email, phone)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Association not found' });
    }

    // Check access
    if (req.user.role === 'farmer' && data.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'vet' && data.vet_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ association: data });
  } catch (error) {
    console.error('Get association error:', error);
    res.status(500).json({ error: 'Failed to fetch association' });
  }
});

// Invite vet to farm (farmers only)
router.post('/invite', requireRole('farmer'), async (req, res) => {
  try {
    const { error: validationError } = invitationSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { farm_id, vet_email } = req.body;

    // Verify farm ownership
    const { data: farm } = await supabase
      .from('farms')
      .select('farmer_id')
      .eq('id', farm_id)
      .single();

    if (!farm || farm.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Find vet by email
    const { data: vet } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', vet_email)
      .single();

    if (!vet) {
      return res.status(404).json({ error: 'Vet not found with this email' });
    }

    if (vet.role !== 'vet') {
      return res.status(400).json({ error: 'User is not a vet' });
    }

    // Check if association already exists
    const { data: existing } = await supabase
      .from('farm_vet_associations')
      .select('*')
      .eq('farm_id', farm_id)
      .eq('vet_id', vet.id)
      .single();

    if (existing) {
      return res.status(400).json({ 
        error: 'Association already exists', 
        status: existing.invitation_status 
      });
    }

    // Create invitation
    const { data, error } = await supabase
      .from('farm_vet_associations')
      .insert({
        farm_id,
        vet_id: vet.id,
        invited_by: req.user.id,
        invitation_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Vet invitation sent successfully', 
      association: data 
    });
  } catch (error) {
    console.error('Invite vet error:', error);
    res.status(500).json({ error: 'Failed to invite vet' });
  }
});

// Accept or reject invitation (vets only)
router.put('/:id/respond', requireRole('vet'), async (req, res) => {
  try {
    const { error: validationError } = associationUpdateSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { invitation_status } = req.body;

    // Verify this is the vet's invitation
    const { data: existing } = await supabase
      .from('farm_vet_associations')
      .select('*')
      .eq('id', req.params.id)
      .eq('vet_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (existing.invitation_status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already responded to' });
    }

    const { data, error } = await supabase
      .from('farm_vet_associations')
      .update({ invitation_status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: `Invitation ${invitation_status}`, 
      association: data 
    });
  } catch (error) {
    console.error('Respond to invitation error:', error);
    res.status(500).json({ error: 'Failed to respond to invitation' });
  }
});

// Update visit information (vets only)
router.put('/:id/visit', requireRole('vet'), async (req, res) => {
  try {
    const { error: validationError } = visitUpdateSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Verify association
    const { data: association } = await supabase
      .from('farm_vet_associations')
      .select('*')
      .eq('id', req.params.id)
      .eq('vet_id', req.user.id)
      .eq('invitation_status', 'accepted')
      .single();

    if (!association) {
      return res.status(404).json({ error: 'Association not found or not accepted' });
    }

    const { data, error } = await supabase
      .from('farm_vet_associations')
      .update({
        last_visit_date: req.body.last_visit_date,
        notes: req.body.notes || association.notes
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Visit information updated', 
      association: data 
    });
  } catch (error) {
    console.error('Update visit error:', error);
    res.status(500).json({ error: 'Failed to update visit information' });
  }
});

// Delete association (farmers only)
router.delete('/:id', requireRole('farmer'), async (req, res) => {
  try {
    // Verify farm ownership
    const { data: association } = await supabase
      .from('farm_vet_associations')
      .select('*, farms(farmer_id)')
      .eq('id', req.params.id)
      .single();

    if (!association || association.farms.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('farm_vet_associations')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Association removed successfully' });
  } catch (error) {
    console.error('Delete association error:', error);
    res.status(500).json({ error: 'Failed to remove association' });
  }
});

module.exports = router;
