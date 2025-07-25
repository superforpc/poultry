import express from 'express';
import { db } from '../database/init.js';
import { CreateInvoiceSchema } from '../types/index.js';
import { generateId } from '../utils/helpers.js';

export const invoiceRoutes = express.Router();

// Get all invoices
invoiceRoutes.get('/', (req, res) => {
  try {
    const { customerId, status } = req.query;
    let query = 'SELECT * FROM invoices';
    const params = [];
    const conditions = [];
    
    if (customerId) {
      conditions.push('customer_id = ?');
      params.push(customerId);
    }
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const invoices = db.prepare(query).all(...params);
    
    // Parse cages JSON
    const parsedInvoices = invoices.map((invoice: any) => ({
      ...invoice,
      cages: JSON.parse(invoice.cages)
    }));
    
    res.json(parsedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice by ID
invoiceRoutes.get('/:id', (req, res) => {
  try {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Parse cages JSON
    const parsedInvoice = {
      ...invoice,
      cages: JSON.parse((invoice as any).cages)
    };
    
    res.json(parsedInvoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create invoice
invoiceRoutes.post('/', (req, res) => {
  try {
    const validatedData = CreateInvoiceSchema.parse(req.body);
    const id = generateId();
    
    const dueAmount = validatedData.total - validatedData.paidAmount;
    const status = dueAmount === 0 ? 'paid' : validatedData.paidAmount > 0 ? 'partial' : 'pending';
    
    const stmt = db.prepare(`
      INSERT INTO invoices (
        id, invoice_number, customer_id, date, subtotal, tax, total,
        paid_amount, due_amount, payment_method, status, cages
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      validatedData.invoiceNumber,
      validatedData.customerId,
      validatedData.date,
      validatedData.subtotal,
      validatedData.tax,
      validatedData.total,
      validatedData.paidAmount,
      dueAmount,
      validatedData.paymentMethod || null,
      status,
      JSON.stringify(validatedData.cages)
    );
    
    // Create ledger entry
    const ledgerStmt = db.prepare(`
      INSERT INTO ledger_entries (
        id, related_id, type, customer_id, description, amount, paid, balance, date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    ledgerStmt.run(
      generateId(),
      id,
      'invoice',
      validatedData.customerId,
      `Invoice - ${validatedData.invoiceNumber}`,
      validatedData.total,
      validatedData.paidAmount,
      dueAmount,
      validatedData.date
    );
    
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    const parsedInvoice = {
      ...invoice,
      cages: JSON.parse((invoice as any).cages)
    };
    
    res.status(201).json(parsedInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(400).json({ error: 'Failed to create invoice' });
  }
});