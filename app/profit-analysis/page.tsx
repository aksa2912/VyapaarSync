'use client'

import { ArrowUpRight, BarChart3, Receipt, TrendingUp, Wallet } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import { useWorkspace } from '@/components/providers/workspace-provider'

export default function ProfitAnalysisPage() {
  const { salesRecords, purchaseRecords } = useWorkspace()

  // Live Math
  const totalRevenue = salesRecords.reduce((sum, record) => sum + record.total_amount, 0)
  const totalCost = purchaseRecords.reduce((sum, record) => sum + record.total_amount, 0)
  const netProfit = totalRevenue - totalCost
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0'

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <SectionTitle
        eyebrow="BUSINESS INTELLIGENCE"
        title="Profit analysis"
        description="Track revenue, costs and profitability to understand what is driving your business."
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            <BarChart3 size={16} /> Last 6 months
          </button>
        }
      />

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase">Revenue</span>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center"><Wallet className="text-[#b85c38]" size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-sm text-slate-500 mt-1">+12.4% vs last month</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase">Landed cost</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><Receipt className="text-blue-600" size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₹{totalCost.toLocaleString('en-IN')}</div>
          <div className="text-sm text-slate-500 mt-1">+9.8% vs last month</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase">Gross margin</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center"><TrendingUp className="text-emerald-600" size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{margin}%</div>
          <div className="text-sm text-slate-500 mt-1">+2.1 pts vs last month</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase">Net profit</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center"><BarChart3 className="text-emerald-600" size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">₹{netProfit.toLocaleString('en-IN')}</div>
          <div className="text-sm text-slate-500 mt-1">+6.1% after expenses</div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BAR CHART */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Revenue vs. purchases</h3>
          <p className="text-sm text-slate-500 mb-6">Monthly totals · ₹ lakh</p>
          
          <div className="flex items-end justify-between h-48 gap-4 mt-8">
            {[
              { label: 'Jun', rev: 60, pur: 40 }, { label: 'Jul', rev: 75, pur: 50 },
              { label: 'Aug', rev: 65, pur: 45 }, { label: 'Sep', rev: 85, pur: 60 },
              { label: 'Oct', rev: 90, pur: 70 }, { label: 'Nov', rev: 100, pur: 65 }
            ].map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center gap-1 h-40 items-end">
                  <div className="w-2/5 bg-[#b85c38] rounded-t-sm" style={{ height: `${item.rev}%` }}></div>
                  <div className="w-2/5 bg-[#e9d5b5] rounded-t-sm" style={{ height: `${item.pur}%` }}></div>
                </div>
                <span className="text-xs font-medium text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LIST CHART */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Expense breakdown</h3>
          <p className="text-sm text-slate-500 mb-6">Operating expenses this month</p>
          
          <div className="space-y-5">
            {[
              { label: 'Freight & logistics', amount: '₹12,400', pct: 29, color: 'bg-[#b85c38]' },
              { label: 'Warehouse rent', amount: '₹9,000', pct: 21, color: 'bg-[#d58a60]' },
              { label: 'Packaging', amount: '₹6,850', pct: 16, color: 'bg-[#e9d5b5]' },
              { label: 'Staff & admin', amount: '₹14,500', pct: 34, color: 'bg-slate-300' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.amount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FIXED TREND CHART */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Profit trend</h3>
            <p className="text-sm text-slate-500">Monthly net profit trend</p>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            <ArrowUpRight size={16} /> 6.1% vs last month
          </span>
        </div>
        
        {/* Fixed height container */}
        <div className="flex items-end justify-between gap-4 h-[200px] border-b border-slate-100 pb-2">
           {[36, 48, 44, 63, 58, 78].map((val, i) => {
             const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
             return (
             <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                {/* Bar Container */}
                <div className="w-full relative flex items-end justify-center h-full">
                   {/* The actual bar */}
                   <div className="w-full max-w-[40px] bg-gradient-to-t from-[#b85c38] to-[#d58a60] rounded-t-sm" style={{ height: `${val}%` }}></div>
                </div>
                <span className="text-xs font-medium text-slate-400">{months[i]}</span>
             </div>
           )})}
        </div>
      </div>
    </div>
  )
}