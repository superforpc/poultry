import { z } from 'zod';

// Cage schema
export const CageSchema = z.object({
  cageNumber: z.string(),
  birds: z.number().positive(),
  weight: z.number().positive(),
  rate: z.number().positive(),
  amount: z.number().positive()
});

// Customer schemas
export const CreateCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  gst_number: z.string().optional()
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

// Vendor schemas
export const CreateVendorSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  gst_number: z.string().optional()
});

export const UpdateVendorSchema = CreateVendorSchema.partial();

// Delivery Challan schemas
export const CreateDeliveryChallanSchema = z.object({
  dcNumber: z.string().min(1),
  vendorId: z.string().optional(),
  vendorName: z.string().optional(),
  date: z.string().datetime(),
  totalBirds: z.number().positive(),
  totalWeight: z.number().positive(),
  purchaseRate: z.number().positive(),
  cages: z.array(CageSchema)
}).refine(data => data.vendorId || data.vendorName, {
  message: "Either vendorId or vendorName must be provided"
});

// Invoice schemas
export const CreateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  customerId: z.string().min(1),
  date: z.string().datetime(),
  subtotal: z.number().positive(),
  tax: z.number().min(0).default(0),
  total: z.number().positive(),
  paidAmount: z.number().min(0).default(0),
  paymentMethod: z.string().optional(),
  cages: z.array(CageSchema)
});

// Types
export type Cage = z.infer<typeof CageSchema>;
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomer = z.infer<typeof UpdateCustomerSchema>;
export type CreateVendor = z.infer<typeof CreateVendorSchema>;
export type UpdateVendor = z.infer<typeof UpdateVendorSchema>;
export type CreateDeliveryChallan = z.infer<typeof CreateDeliveryChallanSchema>;
export type CreateInvoice = z.infer<typeof CreateInvoiceSchema>;

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gst_number?: string;
  balance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gst_number?: string;
  balance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryChallan {
  id: string;
  dc_number: string;
  vendor_id: string;
  date: string;
  total_birds: number;
  total_weight: number;
  purchase_rate: number;
  total_amount: number;
  cages: Cage[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
  paid_amount: number;
  due_amount: number;
  payment_method?: string;
  status: string;
  cages: Cage[];
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  related_id: string;
  type: 'purchase' | 'invoice' | 'payment';
  customer_id?: string;
  vendor_id?: string;
  description: string;
  amount: number;
  paid: number;
  balance: number;
  date: string;
  created_at: string;
}