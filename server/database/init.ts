import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../erp.db');
export const db = new Database(dbPath);

export function initializeDatabase() {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  createTables();
  
  console.log('✅ Database initialized successfully');
}

function createTables() {
  // Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      gst_number TEXT,
      balance REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vendors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      gst_number TEXT,
      balance REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Delivery Challans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS delivery_challans (
      id TEXT PRIMARY KEY,
      dc_number TEXT UNIQUE NOT NULL,
      vendor_id TEXT NOT NULL,
      date DATE NOT NULL,
      total_birds INTEGER NOT NULL,
      total_weight REAL NOT NULL,
      purchase_rate REAL NOT NULL,
      total_amount REAL NOT NULL,
      cages TEXT NOT NULL, -- JSON string
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id)
    )
  `);

  // Invoices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      date DATE NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      due_amount REAL NOT NULL,
      payment_method TEXT,
      status TEXT DEFAULT 'pending',
      cages TEXT NOT NULL, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Ledger Entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      related_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'purchase', 'invoice', 'payment'
      customer_id TEXT,
      vendor_id TEXT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      paid REAL DEFAULT 0,
      balance REAL NOT NULL,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (vendor_id) REFERENCES vendors(id)
    )
  `);

  console.log('✅ Database tables created successfully');
}