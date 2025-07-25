import express from 'express';
import { db } from '../database/init.js';
import { CreateCustomerSchema, UpdateCustomerSchema } from '../types/index.js';
import { generateId } from '../utils/helpers.js';

export const customerRoutes = express.Router();

// Get all customers
customerRoutes.get('/', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
customerRoutes.get('/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
customerRoutes.post('/', (req, res) => {
  try {
    const validatedData = CreateCustomerSchema.parse(req.body);
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO customers (id, name, phone, email, address, gst_number)
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
    
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({ error: 'Failed to create customer' });
  }
});

// Update customer
customerRoutes.put('/:id', (req, res) => {
  try {
    const validatedData = UpdateCustomerSchema.parse(req.body);
    
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
    
    const stmt = db.prepare(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
customerRoutes.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});