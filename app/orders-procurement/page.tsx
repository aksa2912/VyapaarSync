'use client'

import { useState, useEffect, useRef } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import { useWorkspace } from '@/components/providers/workspace-provider'
import { money } from '@/lib/format'

export default function OrdersProcurementPage() {
  const { query, toast } = useWorkspace()
  const [orders, setOrders] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/purchase-orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("Failed to fetch POs", err))
  }, [])

  // Simple search across PO number, date, customer, and item descriptions
  const visible = orders.filter(order => {
    const searchString = `${order.po_number} ${order.po_date} ${order.customer_name} ${order.items?.map((i:any) => i.description).join(' ')}`.toLowerCase()
    return searchString.includes(query.toLowerCase())
  })

  const handleUploadPO = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    toast('AI is extracting data from PO...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('doc_type', 'purchase_order')

    try {
      const extractRes = await fetch('http://localhost:8000/api/extract-document', {
        method: 'POST',
        body: formData,
      })
      const extractData = await extractRes.json()

      if (extractData.status === 'success') {
        const data = extractData.data
        
        const saveRes = await fetch('http://localhost:8000/api/purchase-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        const savedPO = await saveRes.json()
        setOrders(prev => [savedPO, ...prev])
        toast('Purchase Order uploaded successfully!')
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast('Failed to process PO.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="page-stack">
      <div className="flex justify-between items-end mb-6">
        <SectionTitle
          eyebrow="RECORDS & LOGISTICS"
          title="Orders & procurement"
          description="Track customer orders and the items they contain."
        />
        
        <div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadPO} accept=".pdf,.jpg,.png" />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="bg-[#b85c38] hover:bg-[#a04e2f] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />} 
            Upload PO
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b-2 border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Purchase Orders</h2>
          <p className="text-slate-500 mt-1">{visible.length} orders</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">PO Date</th> {/* ADDED */}
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Item Description</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Quantity</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">UOM</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">PO Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No purchase orders yet. Click "Upload PO" to extract one via AI.
                  </td>
                </tr>
              ) : (
                visible.map(order => {
                  const itemsList = order.items && order.items.length > 0 ? order.items : [{description: "N/A", quantity: 0, uom: "-"}]
                  
                  return itemsList.map((item: any, index: number) => (
                    <tr key={`${order.id}-${index}`} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                      
                      {/* Only show main PO info on the first item row */}
                      {index === 0 && (
                        <>
                          <td rowSpan={itemsList.length} className="px-6 py-4 text-sm font-bold text-[#b85c38] align-top bg-white">{order.po_number}</td>
                          <td rowSpan={itemsList.length} className="px-6 py-4 text-sm text-slate-600 align-top bg-white">{order.po_date || 'N/A'}</td> {/* ADDED */}
                          <td rowSpan={itemsList.length} className="px-6 py-4 text-sm font-semibold text-slate-900 align-top bg-white">{order.customer_name}</td>
                        </>
                      )}
                      
                      <td className="px-6 py-4 text-sm text-slate-700">{item.description}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-right uppercase">{item.uom}</td>
                      
                      {index === 0 && (
                        <td rowSpan={itemsList.length} className="px-6 py-4 text-sm font-bold text-slate-900 text-right align-top bg-white">
                          {money(order.total_amount)}
                        </td>
                      )}
                    </tr>
                  ))
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}