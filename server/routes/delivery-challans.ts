import express from 'express';
import { db } from '../database/init.js';
import { CreateDeliveryChallanSchema } from '../types/index.js';
import { generateId } from '../utils/helpers.js';

export const deliveryChallanRoutes = express.Router();

// Get all delivery challans
deliveryChallanRoutes.get('/', (req, res) => {
  try {
    const { vendorId } = req.query;
    let query = 'SELECT * FROM delivery_challans';
    const params = [];
    
    if (vendorId) {
      query += ' WHERE vendor_id = ?';
      params.push(vendorId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const challans = db.prepare(query).all(...params);
    
    // Parse cages JSON
    const parsedChallans = challans.map((challan: any) => ({
      ...challan,
      cages: JSON.parse(challan.cages)
    }));
    
    res.json(parsedChallans);
  } catch (error) {
    console.error('Error fetching delivery challans:', error);
    res.status(500).json({ error: 'Failed to fetch delivery challans' });
  }
});

// Get delivery challan by ID
deliveryChallanRoutes.get('/:id', (req, res) => {
  try {
    const challan = db.prepare('SELECT * FROM delivery_challans WHERE id = ?').get(req.params.id);
    if (!challan) {
      return res.status(404).json({ error: 'Delivery challan not found' });
    }
    
    // Parse cages JSON
    const parsedChallan = {
      ...challan,
      cages: JSON.parse((challan as any).cages)
    };
    
    res.json(parsedChallan);
  } catch (error) {
    console.error('Error fetching delivery challan:', error);
    res.status(500).json({ error: 'Failed to fetch delivery challan' });
  }
});

// Create delivery challan
deliveryChallanRoutes.post('/', (req, res) => {
  try {
    const validatedData = CreateDeliveryChallanSchema.parse(req.body);
    const id = generateId();
    
    let vendorId = validatedData.vendorId;
    
    // Auto-create vendor if vendorName is provided and vendorId is not
    if (!vendorId && validatedData.vendorName) {
      // Check if vendor exists
      const existingVendor = db.prepare('SELECT id FROM vendors WHERE name = ?').get(validatedData.vendorName);
      
      if (existingVendor) {
        vendorId = (existingVendor as any).id;
      } else {
        // Create new vendor
        vendorId = generateId();
        const createVendorStmt = db.prepare(`
          INSERT INTO vendors (id, name)
          VALUES (?, ?)
        `);
        createVendorStmt.run(vendorId, validatedData.vendorName);
      }
    }
    
    // Calculate total amount
    const totalAmount = validatedData.cages.reduce((sum, cage) => sum + cage.amount, 0);
    
    const stmt = db.prepare(`
      INSERT INTO delivery_challans (
        id, dc_number, vendor_id, date, total_birds, total_weight, 
        purchase_rate, total_amount, cages
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      validatedData.dcNumber,
      vendorId,
      validatedData.date,
      validatedData.totalBirds,
      validatedData.totalWeight,
      validatedData.purchaseRate,
      totalAmount,
      JSON.stringify(validatedData.cages)
    );
    
    // Create ledger entry
    const ledgerStmt = db.prepare(`
      INSERT INTO ledger_entries (
        id, related_id, type, vendor_id, description, amount, balance, date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    ledgerStmt.run(
      generateId(),
      id,
      'purchase',
      vendorId,
      `Purchase - DC ${validatedData.dcNumber}`,
      totalAmount,
      totalAmount,
      validatedData.date
    );
    
    const challan = db.prepare('SELECT * FROM delivery_challans WHERE id = ?').get(id);
    const parsedChallan = {
      ...challan,
      cages: JSON.parse((challan as any).cages)
    };
    
    res.status(201).json(parsedChallan);
  } catch (error) {
    console.error('Error creating delivery challan:', error);
    res.status(400).json({ error: 'Failed to create delivery challan' });
  }
});