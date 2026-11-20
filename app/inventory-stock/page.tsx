'use client'

import DataPanel from '@/components/ui/DataPanel'
import SectionTitle from '@/components/ui/SectionTitle'
import { useWorkspace } from '@/components/providers/workspace-provider'

const stockItems = [
  { item: 'Cotton tote bags, natural', location: 'Warehouse A', onHand: 420, reorderAt: 200 },
  { item: 'Brass diya set, assorted', location: 'Warehouse B', onHand: 90, reorderAt: 100 },
  { item: 'Ceramic dinner set, 16 pc', location: 'Warehouse A', onHand: 36, reorderAt: 40 },
]

export default function InventoryStockPage() {
  const { query } = useWorkspace()
  const visible = stockItems.filter(stock => `${stock.item} ${stock.location}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="page-stack max-w-7xl mx-auto p-8">
      <SectionTitle 
        eyebrow="RECORDS & LOGISTICS" 
        title="Inventory & stock" 
        description="On-hand quantities and reorder levels across locations." 
      />
      
      <DataPanel title="Stock levels" sub={`${visible.length} items`}>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">On hand</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Reorder at</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((stock, i) => {
                const isLow = stock.onHand < stock.reorderAt
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-base font-medium text-slate-900">{stock.item}</td>
                    <td className="px-6 py-4 text-base text-slate-600">{stock.location}</td>
                    <td className="px-6 py-4 text-base font-semibold text-slate-900 text-right">{stock.onHand}</td>
                    <td className="px-6 py-4 text-base text-slate-600 text-right">{stock.reorderAt}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        isLow 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isLow ? 'Low' : 'In stock'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  )
}