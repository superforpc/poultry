import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Truck, FileText, Receipt } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency } from '../lib/utils'

interface DashboardStats {
  customers: number
  vendors: number
  deliveryChallans: number
  invoices: number
  totalRevenue: number
  pendingPayments: number
}

export default function Dashboard() {
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(res => res.data)
  })

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get('/vendors').then(res => res.data)
  })

  const { data: deliveryChallans } = useQuery({
    queryKey: ['delivery-challans'],
    queryFn: () => api.get('/delivery-challans').then(res => res.data)
  })

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices').then(res => res.data)
  })

  const stats = React.useMemo(() => {
    const totalRevenue = invoices?.reduce((sum: number, invoice: any) => sum + invoice.total, 0) || 0
    const pendingPayments = invoices?.reduce((sum: number, invoice: any) => sum + invoice.due_amount, 0) || 0

    return {
      customers: customers?.length || 0,
      vendors: vendors?.length || 0,
      deliveryChallans: deliveryChallans?.length || 0,
      invoices: invoices?.length || 0,
      totalRevenue,
      pendingPayments
    }
  }, [customers, vendors, deliveryChallans, invoices])

  const cards = [
    {
      name: 'Total Customers',
      value: stats.customers,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Vendors',
      value: stats.vendors,
      icon: Truck,
      color: 'bg-green-500'
    },
    {
      name: 'Delivery Challans',
      value: stats.deliveryChallans,
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      name: 'Total Invoices',
      value: stats.invoices,
      icon: Receipt,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your ERP system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} p-3 rounded-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Payments</h3>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(stats.pendingPayments)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-sm text-gray-500">
            <p>• System initialized successfully</p>
            <p>• Database tables created</p>
            <p>• Ready to manage your ERP operations</p>
          </div>
        </div>
      </div>
    </div>
  )
}