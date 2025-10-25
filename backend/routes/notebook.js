const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');

router.use(authenticateToken);

const noteSchema = Joi.object({
  farm_id: Joi.string().uuid().allow(null),
  title: Joi.string().allow('', null),
  content: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).default([]),
  is_private: Joi.boolean().default(true)
});

// Get all notes for user
router.get('/', async (req, res) => {
  try {
    const { farm_id, tag } = req.query;
    
    let query = supabase
      .from('notebook')
      .select('*, farms(name)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (farm_id) {
      query = query.eq('farm_id', farm_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    let filteredData = data;

    // Filter by tag if specified
    if (tag) {
      filteredData = data.filter(note => 
        note.tags && note.tags.includes(tag)
      );
    }

    res.json({ notes: filteredData });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notebook')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note: data });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const { error: validationError } = noteSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // If farm_id is provided, verify access
    if (req.body.farm_id) {
      if (req.user.role === 'farmer') {
        const { data: farm } = await supabase
          .from('farms')
          .select('farmer_id')
          .eq('id', req.body.farm_id)
          .single();

        if (!farm || farm.farmer_id !== req.user.id) {
          return res.status(403).json({ error: 'Access denied to this farm' });
        }
      } else if (req.user.role === 'vet') {
        const { data: association } = await supabase
          .from('farm_vet_associations')
          .select('*')
          .eq('farm_id', req.body.farm_id)
          .eq('vet_id', req.user.id)
          .eq('invitation_status', 'accepted')
          .single();

        if (!association) {
          return res.status(403).json({ error: 'Access denied to this farm' });
        }
      }
    }

    const noteData = {
      ...req.body,
      user_id: req.user.id
    };

    const { data, error } = await supabase
      .from('notebook')
      .insert(noteData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Note created successfully', note: data });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { error: validationError } = noteSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { data, error } = await supabase
      .from('notebook')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Note not found or access denied' });
    }

    res.json({ message: 'Note updated successfully', note: data });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('notebook')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
