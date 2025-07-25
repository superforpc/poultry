import express from 'express';
import { db } from '../database/init.js';

export const ledgerRoutes = express.Router();

// Get all ledger entries
ledgerRoutes.get('/', (req, res) => {
  try {
    const { customerId, vendorId } = req.query;
    let query = 'SELECT * FROM ledger_entries';
    const params = [];
    const conditions = [];
    
    if (customerId) {
      conditions.push('customer_id = ?');
      params.push(customerId);
    }
    
    if (vendorId) {
      conditions.push('vendor_id = ?');
      params.push(vendorId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const entries = db.prepare(query).all(...params);
    res.json(entries);
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    res.status(500).json({ error: 'Failed to fetch ledger entries' });
  }
});

// Get ledger entry by ID
ledgerRoutes.get('/:id', (req, res) => {
  try {
    const entry = db.prepare('SELECT * FROM ledger_entries WHERE id = ?').get(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Ledger entry not found' });
    }
    res.json(entry);
  } catch (error) {
    console.error('Error fetching ledger entry:', error);
    res.status(500).json({ error: 'Failed to fetch ledger entry' });
  }
});

// Update ledger entry (for payment tracking)
ledgerRoutes.patch('/:id', (req, res) => {
  try {
    const { paid } = req.body;
    
    if (typeof paid !== 'number' || paid < 0) {
      return res.status(400).json({ error: 'Invalid paid amount' });
    }
    
    const entry = db.prepare('SELECT * FROM ledger_entries WHERE id = ?').get(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Ledger entry not found' });
    }
    
    const newBalance = (entry as any).amount - paid;
    
    const stmt = db.prepare(`
      UPDATE ledger_entries 
      SET paid = ?, balance = ?
      WHERE id = ?
    `);
    
    stmt.run(paid, newBalance, req.params.id);
    
    const updatedEntry = db.prepare('SELECT * FROM ledger_entries WHERE id = ?').get(req.params.id);
    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating ledger entry:', error);
    res.status(400).json({ error: 'Failed to update ledger entry' });
  }
});