import express from 'express';
import { db } from '../database/init.js';
import { CreateVendorSchema, UpdateVendorSchema } from '../types/index.js';
import { generateId } from '../utils/helpers.js';

export const vendorRoutes = express.Router();

// Get all vendors
vendorRoutes.get('/', (req, res) => {
  try {
    const vendors = db.prepare('SELECT * FROM vendors ORDER BY created_at DESC').all();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Get vendor by ID
vendorRoutes.get('/:id', (req, res) => {
  try {
    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// Create vendor
vendorRoutes.post('/', (req, res) => {
  try {
    const validatedData = CreateVendorSchema.parse(req.body);
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO vendors (id, name, phone, email, address, gst_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      validatedData.name,
      validatedData.phone || null,
      validatedData.email || null,
      validatedData.address || null,
      validatedData.gst_number || null
    );
    
    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(400).json({ error: 'Failed to create vendor' });
  }
});

// Update vendor
vendorRoutes.put('/:id', (req, res) => {
  try {
    const validatedData = UpdateVendorSchema.parse(req.body);
    
    const updates = [];
    const values = [];
    
    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);
    
    const stmt = db.prepare(`UPDATE vendors SET ${updates.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(400).json({ error: 'Failed to update vendor' });
  }
});

// Delete vendor
vendorRoutes.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM vendors WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});