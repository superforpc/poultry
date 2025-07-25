import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Eye } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'

interface DeliveryChallan {
  id: string
  dc_number: string
  vendor_id: string
  date: string
  total_birds: number
  total_weight: number
  purchase_rate: number
  total_amount: number
  cages: Array<{
    cageNumber: string
    birds: number
    weight: number
    rate: number
    amount: number
  }>
  status: string
  created_at: string
}

export default function DeliveryChallans() {
  const [selectedChallan, setSelectedChallan] = React.useState<DeliveryChallan | null>(null)

  const { data: challans, isLoading } = useQuery({
    queryKey: ['delivery-challans'],
    queryFn: () => api.get('/delivery-challans').then(res => res.data)
  })

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get('/vendors').then(res => res.data)
  })

  const getVendorName = (vendorId: string) => {
    const vendor = vendors?.find((v: any) => v.id === vendorId)
    return vendor?.name || 'Unknown Vendor'
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Challans</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track all delivery challans and purchases
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create DC
          </button>
        </div>
      </div>

      {/* Delivery Challans Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DC Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Birds/Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {challans?.map((challan: DeliveryChallan) => (
              <tr key={challan.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{challan.dc_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getVendorName(challan.vendor_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(challan.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {challan.total_birds} birds / {challan.total_weight} kg
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(challan.purchase_rate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(challan.total_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedChallan(challan)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {challans?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No delivery challans found</p>
          </div>
        )}
      </div>

      {/* Challan Details Modal */}
      {selectedChallan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Delivery Challan Details - {selectedChallan.dc_number}
                </h3>
                <button
                  onClick={() => setSelectedChallan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Vendor</p>
                  <p className="text-sm text-gray-900">{getVendorName(selectedChallan.vendor_id)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedChallan.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Birds</p>
                  <p className="text-sm text-gray-900">{selectedChallan.total_birds}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Weight</p>
                  <p className="text-sm text-gray-900">{selectedChallan.total_weight} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Purchase Rate</p>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedChallan.purchase_rate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedChallan.total_amount)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Cage Details</h4>
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
                      {selectedChallan.cages.map((cage, index) => (
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