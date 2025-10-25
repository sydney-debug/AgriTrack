const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

router.use(authenticateToken);

const listingSchema = Joi.object({
  product_name: Joi.string().required(),
  description: Joi.string().allow('', null),
  category: Joi.string().valid('feed', 'supplement', 'equipment', 'medication').allow(null),
  price: Joi.number().min(0).required(),
  discount_percentage: Joi.number().min(0).max(100).default(0),
  discount_fixed: Joi.number().min(0).default(0),
  stock_quantity: Joi.number().min(0).allow(null),
  unit: Joi.string().allow('', null),
  image_url: Joi.string().allow('', null),
  status: Joi.string().valid('active', 'sold_out', 'inactive').default('active')
});

const inquirySchema = Joi.object({
  listing_id: Joi.string().uuid().required(),
  message: Joi.string().required()
});

// Get all marketplace listings (public - all roles)
router.get('/listings', async (req, res) => {
  try {
    const { category, search, status = 'active' } = req.query;
    
    let query = supabase
      .from('marketplace_listings')
      .select('*, users(full_name, email)')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    let filteredData = data;

    // Search by product name or description
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = data.filter(listing => 
        listing.product_name.toLowerCase().includes(searchLower) ||
        (listing.description && listing.description.toLowerCase().includes(searchLower))
      );
    }

    // Calculate discounted prices
    const listingsWithDiscount = filteredData.map(listing => {
      let finalPrice = listing.price;
      if (listing.discount_percentage > 0) {
        finalPrice = listing.price * (1 - listing.discount_percentage / 100);
      }
      if (listing.discount_fixed > 0) {
        finalPrice = Math.max(0, finalPrice - listing.discount_fixed);
      }
      return {
        ...listing,
        final_price: parseFloat(finalPrice.toFixed(2))
      };
    });

    res.json({ listings: listingsWithDiscount });
  } catch (error) {
    console.error('Get marketplace listings error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get single listing
router.get('/listings/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*, users(full_name, email, phone)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment view count
    await supabase
      .from('marketplace_listings')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', req.params.id);

    // Calculate final price
    let finalPrice = data.price;
    if (data.discount_percentage > 0) {
      finalPrice = data.price * (1 - data.discount_percentage / 100);
    }
    if (data.discount_fixed > 0) {
      finalPrice = Math.max(0, finalPrice - data.discount_fixed);
    }

    res.json({ 
      listing: {
        ...data,
        final_price: parseFloat(finalPrice.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Get agrovets' own listings
router.get('/my-listings', requireRole('agrovets'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('agrovets_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ listings: data });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// Create listing (agrovets only)
router.post('/listings', requireRole('agrovets'), async (req, res) => {
  try {
    const { error: validationError } = listingSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const listingData = {
      ...req.body,
      agrovets_id: req.user.id
    };

    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert(listingData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Listing created successfully', listing: data });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Upload image for listing
router.post('/listings/:id/upload-image', requireRole('agrovets'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Verify listing ownership
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('agrovets_id')
      .eq('id', req.params.id)
      .single();

    if (!listing || listing.agrovets_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Upload to Supabase Storage
    const fileName = `${req.params.id}_${Date.now()}${path.extname(req.file.originalname)}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('marketplace-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('marketplace-images')
      .getPublicUrl(fileName);

    // Update listing with image URL
    const { data: updatedListing, error: updateError } = await supabase
      .from('marketplace_listings')
      .update({ image_url: urlData.publicUrl })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ 
      message: 'Image uploaded successfully', 
      image_url: urlData.publicUrl,
      listing: updatedListing
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Update listing (agrovets only)
router.put('/listings/:id', requireRole('agrovets'), async (req, res) => {
  try {
    const { error: validationError } = listingSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { data, error } = await supabase
      .from('marketplace_listings')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('agrovets_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Listing not found or access denied' });
    }

    res.json({ message: 'Listing updated successfully', listing: data });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing (agrovets only)
router.delete('/listings/:id', requireRole('agrovets'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', req.params.id)
      .eq('agrovets_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// ========== INQUIRIES ==========

// Create inquiry (farmers only)
router.post('/inquiries', requireRole('farmer'), async (req, res) => {
  try {
    const { error: validationError } = inquirySchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const inquiryData = {
      ...req.body,
      farmer_id: req.user.id
    };

    const { data, error } = await supabase
      .from('marketplace_inquiries')
      .insert(inquiryData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Inquiry sent successfully', inquiry: data });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ error: 'Failed to send inquiry' });
  }
});

// Get inquiries for agrovets
router.get('/inquiries', requireRole('agrovets'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('marketplace_inquiries')
      .select('*, marketplace_listings!inner(product_name, agrovets_id), users(full_name, email, phone)')
      .eq('marketplace_listings.agrovets_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ inquiries: data });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Get farmer's own inquiries
router.get('/my-inquiries', requireRole('farmer'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('marketplace_inquiries')
      .select('*, marketplace_listings(product_name, price, users(full_name))')
      .eq('farmer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ inquiries: data });
  } catch (error) {
    console.error('Get my inquiries error:', error);
    res.status(500).json({ error: 'Failed to fetch your inquiries' });
  }
});

// Update inquiry status (agrovets only)
router.put('/inquiries/:id', requireRole('agrovets'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'responded', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify the inquiry is for agrovets' listing
    const { data: inquiry } = await supabase
      .from('marketplace_inquiries')
      .select('*, marketplace_listings(agrovets_id)')
      .eq('id', req.params.id)
      .single();

    if (!inquiry || inquiry.marketplace_listings.agrovets_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('marketplace_inquiries')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Inquiry updated successfully', inquiry: data });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// Get analytics for agrovets
router.get('/analytics', requireRole('agrovets'), async (req, res) => {
  try {
    const { data: listings, error: listingsError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('agrovets_id', req.user.id);

    if (listingsError) throw listingsError;

    const { data: inquiries, error: inquiriesError } = await supabase
      .from('marketplace_inquiries')
      .select('*, marketplace_listings!inner(agrovets_id)')
      .eq('marketplace_listings.agrovets_id', req.user.id);

    if (inquiriesError) throw inquiriesError;

    const analytics = {
      total_listings: listings.length,
      active_listings: listings.filter(l => l.status === 'active').length,
      total_views: listings.reduce((sum, l) => sum + (l.views_count || 0), 0),
      total_inquiries: inquiries.length,
      open_inquiries: inquiries.filter(i => i.status === 'open').length,
      by_category: {}
    };

    // Group by category
    listings.forEach(listing => {
      const cat = listing.category || 'other';
      if (!analytics.by_category[cat]) {
        analytics.by_category[cat] = { count: 0, views: 0 };
      }
      analytics.by_category[cat].count++;
      analytics.by_category[cat].views += listing.views_count || 0;
    });

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
