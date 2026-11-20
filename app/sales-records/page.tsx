'use client'

import { useRef, useState } from 'react'
import { useWorkspace } from '@/components/providers/workspace-provider'
import { UploadCloud, Loader2 } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'

export default function SalesRecordsPage() {
  const { salesRecords, uploadSalesInvoice } = useWorkspace()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    await uploadSalesInvoice(file)
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <SectionTitle 
          title="Sales records" 
          description="Customer invoices with PO details." 
          eyebrow="RECORDS & LOGISTICS" 
        />
        <div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.png" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-[#b85c38] hover:bg-[#a04e2f] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
            {isUploading ? 'Uploading...' : 'Upload Invoice'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">PO Number</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Description</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Qty</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">UOM</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">PO Date</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesRecords.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No sales records yet. Upload an invoice.</td></tr>
              ) : (
                salesRecords.map((record, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-semibold text-[#b85c38]">{record.po_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{record.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.description}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-right">{record.quantity}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 uppercase">{record.uom}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.po_date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">₹{record.total_amount?.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}