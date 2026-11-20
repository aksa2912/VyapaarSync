'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import SectionTitle from '@/components/ui/SectionTitle'
import { useWorkspace } from '@/components/providers/workspace-provider'

export default function FinancialReportsPage() {
  const { salesRecords, purchaseRecords, toast } = useWorkspace()
  const [selectedYear, setSelectedYear] = useState('2025-26')

  // 1. CALCULATE LIVE TOTALS FROM BACKEND DATA
  const totalSales = salesRecords.reduce((sum, record) => sum + (record.total_amount || 0), 0)
  const totalPurchases = purchaseRecords.reduce((sum, record) => sum + (record.total_amount || 0), 0)
  
  // Profit = Sales - Purchases
  const totalProfit = totalSales - totalPurchases

  // GST Calculation: (Total Amount - Taxable Amount)
  const salesGst = salesRecords.reduce((sum, record) => sum + ((record.total_amount || 0) - (record.taxable_amount || 0)), 0)
  const purchaseGst = purchaseRecords.reduce((sum, record) => sum + ((record.total_amount || 0) - (record.taxable_amount || 0)), 0)
  
  // Net GST Payable = Sales GST - Input GST Credit
  const netGst = salesGst - purchaseGst

  // 2. EXPORT TO EXCEL FUNCTION
  const exportWorkbook = () => {
    const summaryData = [
      ['VyapaarSync — Financial Year Report', `FY ${selectedYear}`],
      ['Particulars', 'Amount (INR)'],
      ['Total Sales', totalSales],
      ['Total Purchases', totalPurchases],
      ['Total Profit', totalProfit],
      ['Net GST Payable', netGst]
    ]

    const workbook = XLSX.utils.book_new()
    
    // Sheet 1: Summary
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Sheet 2: Sales Register
    const salesData = salesRecords.map(r => ({
      'PO Number': r.po_number,
      'Customer': r.customer_name,
      'Description': r.description,
      'Quantity': r.quantity,
      'UOM': r.uom,
      'Date': r.po_date,
      'Total Amount': r.total_amount
    }))
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(salesData), 'Sales Register')

    // Sheet 3: Purchase Register
    const purchaseData = purchaseRecords.map(r => ({
      'PO Number': r.po_number,
      'Supplier': r.supplier_name,
      'Description': r.description,
      'Quantity': r.quantity,
      'UOM': r.uom,
      'Date': r.po_date,
      'Total Amount': r.total_amount
    }))
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(purchaseData), 'Purchase Register')

    XLSX.writeFile(workbook, `vyapaarsync-fy-${selectedYear}.xlsx`)
    toast('Financial report exported to Excel.')
  }

  // Helper to format currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <SectionTitle
          eyebrow="MANAGEMENT"
          title="Financial year reports"
          description="Consolidated view of your business performance and GST liabilities."
        />
        <div className="flex items-center gap-3">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#b85c38]/20"
          >
            <option value="2025-26">FY 2025-26</option>
            <option value="2024-25">FY 2024-25</option>
            <option value="2023-24">FY 2023-24</option>
            <option value="2022-23">FY 2022-23</option>
          </select>
          <button 
            onClick={exportWorkbook} 
            className="bg-[#b85c38] hover:bg-[#a04e2f] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* KPI CARDS (LIVE MATH) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Report totals">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales</span>
          <strong className="block text-2xl font-bold text-slate-900 mt-2">{formatMoney(totalSales)}</strong>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Purchases</span>
          <strong className="block text-2xl font-bold text-slate-900 mt-2">{formatMoney(totalPurchases)}</strong>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Profit</span>
          <strong className={`block text-2xl font-bold mt-2 ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatMoney(totalProfit)}
          </strong>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net GST Payable</span>
          <strong className="block text-2xl font-bold text-slate-900 mt-2">{formatMoney(netGst)}</strong>
        </div>

      </section>

      {/* EXCEL-LIKE REPORT TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-[#b85c38]" size={20} />
            <h2 className="text-lg font-bold text-slate-900">Profit & Loss Statement</h2>
          </div>
          <span className="text-sm text-slate-500">FY {selectedYear}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Particulars</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {/* REVENUE */}
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">Total Sales (Revenue)</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{formatMoney(totalSales)}</td>
              </tr>
              
              {/* COGS */}
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">Total Purchases (COGS)</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">- {formatMoney(totalPurchases)}</td>
              </tr>

              {/* PROFIT */}
              <tr className="bg-slate-50/80">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">Gross Profit</td>
                <td className={`px-6 py-4 text-sm font-bold text-right ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatMoney(totalProfit)}
                </td>
              </tr>

              {/* GST BREAKDOWN */}
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-sm text-slate-600 pl-10">Output GST (Collected on Sales)</td>
                <td className="px-6 py-4 text-sm text-slate-900 text-right">{formatMoney(salesGst)}</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-sm text-slate-600 pl-10">Input GST Credit (Paid on Purchases)</td>
                <td className="px-6 py-4 text-sm text-slate-900 text-right">- {formatMoney(purchaseGst)}</td>
              </tr>

              {/* NET GST */}
              <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">Net GST Payable</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{formatMoney(netGst)}</td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        * This is a system-generated report based on the uploaded PO data. Please verify with your CA before filing.
      </p>

    </div>
  )
}