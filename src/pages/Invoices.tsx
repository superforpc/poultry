import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'

interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  date: string
  subtotal: number
  tax: number
  total: number
  paid_amount: number
  due_amount: number
  payment_method?: string
  status: string
  cages: Array<{
    cageNumber: string
    birds: number
    weight: number
    rate: number
    amount: number
  }>
  created_at: string
}

export default function Invoices() {
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [cages, setCages] = React.useState([{ cageNumber: '', birds: 0, weight: 0, rate: 0, amount: 0 }])
  const queryClient = useQueryClient()

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices').then(res => res.data)
  })

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(res => res.data)
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setShowForm(false)
      setCages([{ cageNumber: '', birds: 0, weight: 0, rate: 0, amount: 0 }])
    }
  })

  const addCage = () => {
    setCages([...cages, { cageNumber: '', birds: 0, weight: 0, rate: 0, amount: 0 }])
  }

  const removeCage = (index: number) => {
    setCages(cages.filter((_, i) => i !== index))
  }

  const updateCage = (index: number, field: string, value: any) => {
    const newCages = [...cages]
    newCages[index] = { ...newCages[index], [field]: value }
    
    // Calculate amount when weight or rate changes
    if (field === 'weight' || field === 'rate') {
      newCages[index].amount = newCages[index].weight * newCages[index].rate
    }
    
    setCages(newCages)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const subtotal = cages.reduce((sum, cage) => sum + cage.amount, 0)
    const taxRate = parseFloat(formData.get('taxRate') as string) || 18
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax
    const paidAmount = parseFloat(formData.get('paidAmount') as string) || 0
    
    const invoiceData = {
      invoice_number: formData.get('invoiceNumber'),
      customer_id: formData.get('customerId'),
      date: formData.get('date'),
      subtotal,
      tax,
      total,
      paid_amount: paidAmount,
      due_amount: total - paidAmount,
      payment_method: formData.get('paymentMethod') || null,
      status: paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partial' : 'pending',
      cages: cages.filter(cage => cage.cageNumber && cage.amount > 0)
    }
    
    createMutation.mutate(invoiceData)
  }

  const getCustomerName = (customerId: string) => {
    const customer = customers?.find((c: any) => c.id === customerId)
    return customer?.name || 'Unknown Customer'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage customer invoices and billing
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Invoice
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Invoice Number *</label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer *</label>
                    <select
                      name="customerId"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select Customer</option>
                      {customers?.map((customer: any) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date *</label>
                    <input
                      type="date"
                      name="date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                    <input
                      type="number"
                      name="taxRate"
                      step="0.01"
                      defaultValue="18"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Item Details</h4>
                  {cages.map((cage, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Item/Cage"
                        value={cage.cageNumber}
                        onChange={(e) => updateCage(index, 'cageNumber', e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={cage.birds}
                        onChange={(e) => updateCage(index, 'birds', parseInt(e.target.value) || 0)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Weight (kg)"
                        value={cage.weight}
                        onChange={(e) => updateCage(index, 'weight', parseFloat(e.target.value) || 0)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Rate"
                        value={cage.rate}
                        onChange={(e) => updateCage(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      <div className="flex items-center">
                        <span className="text-sm font-medium">₹{cage.amount.toFixed(2)}</span>
                        {cages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCage(index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCage}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                      name="paymentMethod"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                    <input
                      type="number"
                      name="paidAmount"
                      step="0.01"
                      defaultValue="0"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Subtotal: </span>
                      <span>₹{cages.reduce((sum, cage) => sum + cage.amount, 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Tax (18%): </span>
                      <span>₹{(cages.reduce((sum, cage) => sum + cage.amount, 0) * 0.18).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Total: </span>
                      <span>₹{(cages.reduce((sum, cage) => sum + cage.amount, 0) * 1.18).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setCages([{ cageNumber: '', birds: 0, weight: 0, rate: 0, amount: 0 }])
                    }}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                  >
                    Create Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices?.map((invoice: Invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getCustomerName(invoice.customer_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(invoice.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(invoice.paid_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(invoice.due_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedInvoice(invoice)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No invoices found</p>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Invoice Details - {selectedInvoice.invoice_number}
                </h3>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="text-sm text-gray-900">{getCustomerName(selectedInvoice.customer_id)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedInvoice.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Subtotal</p>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvoice.subtotal)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tax</p>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvoice.tax)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedInvoice.total)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvoice.paid_amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Amount</p>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvoice.due_amount)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Item Details</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cage</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Birds</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedInvoice.cages.map((cage, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{cage.cageNumber}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cage.birds}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cage.weight} kg</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(cage.rate)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(cage.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}