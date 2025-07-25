import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Vendors from './pages/Vendors'
import DeliveryChallans from './pages/DeliveryChallans'
import Invoices from './pages/Invoices'
import Ledger from './pages/Ledger'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/delivery-challans" element={<DeliveryChallans />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/ledger" element={<Ledger />} />
      </Routes>
    </Layout>
  )
}

export default App