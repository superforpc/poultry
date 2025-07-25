# ERP Management System - Complete Backend

A comprehensive backend-first ERP system for managing delivery challans, invoices, ledger entries, customers, and vendors with SQLite persistence and Express API.

## ✅ **BACKEND SETUP COMPLETE** ✅

This system is **fully implemented and tested** with:
- ✅ SQLite database with persistent file storage (`erp.db`)
- ✅ Express API with full CRUD operations  
- ✅ Automatic ledger management
- ✅ Auto-vendor creation from delivery challans
- ✅ Complete data validation with Zod schemas
- ✅ Comprehensive error handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v20 or higher) ✅ Already installed
- All dependencies ✅ Already installed

### Running the System

1. **Start the server**:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000` with hot reload

2. **Test the system**:
   ```bash
   curl http://localhost:5000/api/test
   ```

3. **Initialize with test data** (optional):
   ```bash
   tsx scripts/seed-db.ts
   ```

## 📊 Database Schema

### Tables Created:
- **customers** (id, name, phone, email, balance, createdAt)
- **vendors** (id, name, balance, createdAt)  
- **delivery_challans** (id, dcNumber, vendorId, date, totalBirds, totalWeight, purchaseRate, cages JSON, createdAt)
- **invoices** (id, invoiceNumber, customerId, cages JSON, subtotal, tax, total, paidAmount, dueAmount, paymentMethod, status, createdAt)
- **ledger_entries** (id, relatedId, type: purchase/invoice/payment, customerOrVendorName, description, amount, paid, balance, date, createdAt)

## 🔌 API Endpoints

### ✅ All endpoints tested and working:

**Test & Health:**
- `GET /api/test` - System status and database stats

**Customers:**
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

**Vendors:**
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

**Delivery Challans:**
- `GET /api/delivery-challans` - List all DCs (supports ?vendorId filter)
- `GET /api/delivery-challans/:id` - Get DC by ID
- `POST /api/delivery-challans` - Create DC (auto-creates vendor if vendorName provided)
- `PATCH /api/delivery-challans/:id` - Update DC

**Invoices:**
- `GET /api/invoices` - List all invoices (supports ?customerId, ?status filters)
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create invoice (auto-creates ledger entry)
- `PATCH /api/invoices/:id` - Update invoice

**Ledger:**
- `GET /api/ledger` - List all ledger entries (supports ?customerId, ?vendorId filters)
- `GET /api/ledger/:id` - Get ledger entry by ID
- `PATCH /api/ledger/:id` - Update ledger entry (for payment tracking)

## 🔄 Auto-Features Working:

1. **Auto-Vendor Creation**: When creating a DC with `vendorName`, if vendor doesn't exist, it's created automatically
2. **Auto-Ledger Updates**: 
   - Creating a DC automatically creates a "purchase" ledger entry for the vendor
   - Creating an Invoice automatically creates an "invoice" ledger entry for the customer
3. **Data Persistence**: All data persists between server restarts in `erp.db` file
4. **Balance Tracking**: Ledger entries track amount, paid, and balance fields

## 📝 API Usage Examples

### Create Delivery Challan:
```bash
curl -X POST "http://localhost:5000/api/delivery-challans" \
  -H "Content-Type: application/json" \
  -d '{
    "dcNumber": "19-7-25sgn-001",
    "vendorName": "Village Farm Supplier",
    "date": "2025-07-25T00:00:00.000Z",
    "totalBirds": 100,
    "totalWeight": 150.5,
    "purchaseRate": 85.50,
    "cages": [
      {"cageNumber": "CAGE-001", "birds": 50, "weight": 75.2, "rate": 85.50, "amount": 6433.26}
    ]
  }'
```

### Create Invoice:
```bash
curl -X POST "http://localhost:5000/api/invoices" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "INV-2025-001",
    "customerId": "customer-id-here",
    "cages": [
      {"cageNumber": "CAGE-001", "birds": 50, "weight": 75.2, "rate": 120.00, "amount": 9024.00}
    ],
    "subtotal": 9024.00,
    "tax": 1624.32,
    "total": 10648.32,
    "paidAmount": 5000.00,
    "dueAmount": 5648.32,
    "paymentMethod": "bank_transfer",
    "status": "partial"
  }'
```

## 🗂️ File Structure
   