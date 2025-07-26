import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './database/init.js';
import { customerRoutes } from './routes/customers.js';
import { vendorRoutes } from './routes/vendors.js';
import { deliveryChallanRoutes } from './routes/delivery-challans.js';
import { invoiceRoutes } from './routes/invoices.js';
import { ledgerRoutes } from './routes/ledger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initializeDatabase();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/delivery-challans', deliveryChallanRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/ledger', ledgerRoutes);

// Test endpoint with database stats
app.get('/api/test', (req, res) => {
  try {
    const { db } = require('./database/init.js');
    
    const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const vendorCount = db.prepare('SELECT COUNT(*) as count FROM vendors').get().count;
    const dcCount = db.prepare('SELECT COUNT(*) as count FROM delivery_challans').get().count;
    const invoiceCount = db.prepare('SELECT COUNT(*) as count FROM invoices').get().count;
    const ledgerCount = db.prepare('SELECT COUNT(*) as count FROM ledger_entries').get().count;
    
    res.json({ 
      status: 'OK',
      message: 'ERP System Backend is running successfully!',
      database: 'Connected',
      stats: {
        customers: customerCount,
        vendors: vendorCount,
        deliveryChallans: dcCount,
        invoices: invoiceCount,
        ledgerEntries: ledgerCount
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../../dist/client');
  app.use(express.static(clientPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});