import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'

interface LedgerEntry {
  id: string
  related_id: string
  type: 'purchase' | 'invoice' | 'payment'
  customer_id?: string
  vendor_id?: string
  description: string
  amount: number
  paid: number
  balance: number
  date: string
  created_at: string
}

export default function Ledger() {
  const { data: ledgerEntries, isLoading } = useQuery({
    queryKey: ['ledger'],
    queryFn: () => api.get('/ledger').then(res => res.data)
  })

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(res => res.data)
  })

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get('/vendors').then(res => res.data)
  })

  const getPartyName = (entry: LedgerEntry) => {
    if (entry.customer_id) {
      const customer = customers?.find((c: any) => c.id === entry.customer_id)
      return customer?.name || 'Unknown Customer'
    }
    if (entry.vendor_id) {
      const vendor = vendors?.find((v: any) => v.id === entry.vendor_id)
      return vendor?.name || 'Unknown Vendor'
    }
    return 'Unknown'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-100 text-blue-800'
      case 'invoice':
        return 'bg-green-100 text-green-800'
      case 'payment':
        return 'bg-purple-100 text-purple-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track all financial transactions and balances
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Entries
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {ledgerEntries?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-green-500 p-3 rounded-md">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Receivables
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      ledgerEntries?.reduce((sum: number, entry: LedgerEntry) => 
                        entry.type === 'invoice' ? sum + entry.balance : sum, 0
                      ) || 0
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-red-500 p-3 rounded-md">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Payables
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      ledgerEntries?.reduce((sum: number, entry: LedgerEntry) => 
                        entry.type === 'purchase' ? sum + entry.balance : sum, 0
                      ) || 0
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Party
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ledgerEntries?.map((entry: LedgerEntry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(entry.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(entry.type)}`}>
                    {entry.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getPartyName(entry)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(entry.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(entry.paid)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={entry.balance > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                    {formatCurrency(entry.balance)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ledgerEntries?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No ledger entries found</p>
          </div>
        )}
      </div>
    </div>
  )
}