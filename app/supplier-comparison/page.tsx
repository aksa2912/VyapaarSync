'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Building2, Check, ShieldCheck, Plus, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import SectionTitle from '@/components/ui/SectionTitle'
import { useWorkspace } from '@/components/providers/workspace-provider'
import { money } from '@/lib/format'

function SupplierComparisonContent() {
  const searchParams = useSearchParams()
  const productName = searchParams.get('product') || 'Cotton Tote Bags'
  const quantity = parseInt(searchParams.get('quantity') || '5000', 10)
    const { supplier, setSupplier, setUnitPrice, toast, saveSelectedSupplier } = useWorkspace()
  const [rankBy, setRankBy] = useState('Balanced recommendation')
  const [showAddModal, setShowAddModal] = useState(false)

  // State for manually adding a supplier
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    city: '',
    unitPrice: '',
    freight: '',
    deliveryDays: ''
  })

  // HARDCODED MOCK DATA
  const [baseQuotes, setBaseQuotes] = useState([
    { name: "NorthStar Supplies", initials: "NS", city: "Ludhiana", unitPrice: 78, freight: 6000, deliveryDays: 7, reliability: 91, history: 76, inStock: true },
    { name: "HealthBridge Traders", initials: "HT", city: "Ambala", unitPrice: 80, freight: 4500, deliveryDays: 5, reliability: 88, history: 81, inStock: true },
    { name: "Medline Distributors", initials: "MD", city: "Chandigarh", unitPrice: 82, freight: 3500, deliveryDays: 4, reliability: 96, history: 79, inStock: true },
    { name: "PrimeCare Suppliers", initials: "PS", city: "Delhi", unitPrice: 85, freight: 2000, deliveryDays: 3, reliability: 98, history: 83, inStock: true }
  ])

  // Calculate totals dynamically based on the quantity passed in the URL
  const quotes = baseQuotes.map(q => {
    const gst = Math.round(q.unitPrice * quantity * 0.12)
    const total = (q.unitPrice * quantity) + gst + q.freight
    return { ...q, gst, total }
  })

  const rankers: Record<string, (a: any, b: any) => number> = {
    'Balanced recommendation': (a, b) => a.total - b.total || b.reliability - a.reliability,
    'Lowest landed cost': (a, b) => a.total - b.total,
    'Fastest delivery': (a, b) => a.deliveryDays - b.deliveryDays,
    'Highest reliability': (a, b) => b.reliability - a.reliability,
  }

  const ranked = [...quotes].sort(rankers[rankBy])
  const bestMatch = ranked[0]

  const selectSupplier = (quote: any) => {
    setSupplier(quote.name)
    setUnitPrice(quote.unitPrice)
    toast(`${quote.name} selected for cost estimation.`)
  }

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSupplier.name || !newSupplier.unitPrice) {
      toast('Name and Unit Price are required.')
      return
    }

    const initials = newSupplier.name.substring(0, 2).toUpperCase()
    
    const newQuote = {
      name: newSupplier.name,
      initials: initials,
      city: newSupplier.city || 'Unknown',
      unitPrice: Number(newSupplier.unitPrice),
      freight: Number(newSupplier.freight) || 0,
      deliveryDays: Number(newSupplier.deliveryDays) || 5,
      reliability: 85, // Default for manually added
      history: Number(newSupplier.unitPrice),
      inStock: true
    }

    setBaseQuotes([...baseQuotes, newQuote])
    setShowAddModal(false)
    setNewSupplier({ name: '', city: '', unitPrice: '', freight: '', deliveryDays: '' })
    toast(`${newSupplier.name} added to comparison.`)
  }

  return (
    <div className="page-stack max-w-7xl mx-auto p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <SectionTitle
          eyebrow="BUSINESS OPERATIONS"
          title="Supplier comparison"
          description="Compare quotations, historical pricing and landed cost before you commit."
        />
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm"
        >
          <Plus size={18} /> Add Quotation
        </button>
      </div>
      
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center">
            <Building2 className="text-[#b85c38]" size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">REQUIREMENT · MOCK DATA</span>
            <h2 className="text-xl font-bold text-slate-900">{productName}</h2>
            <p className="text-sm text-slate-500">Pre-generated supplier comparison for demo</p>
          </div>
        </div>
        <div className="flex gap-8 mt-4 md:mt-0 text-sm">
          <div><span className="block text-slate-400 text-xs">Quantity</span><span className="font-semibold text-slate-900">{quantity.toLocaleString()} units</span></div>
          <div><span className="block text-slate-400 text-xs">Deliver to</span><span className="font-semibold text-slate-900">140401 · Punjab</span></div>
          <div><span className="block text-slate-400 text-xs">Required by</span><span className="font-semibold text-slate-900">25 Nov 2026</span></div>
        </div>
      </section>

      <div className="flex justify-between items-center bg-transparent py-2">
        <p className="text-sm text-slate-500">{quotes.length} quotations · All figures in INR · Mock Data</p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Rank by</span>
          <select 
            value={rankBy} 
            onChange={e => setRankBy(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-1.5 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#b85c38]"
          >
            {Object.keys(rankers).map(option => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ranked.map(quote => {
          const isSelected = quote.name === supplier
          const isBest = bestMatch && quote.name === bestMatch.name
          
          return (
            <article
              key={quote.name}
              className={`relative bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden transition-all ${
                isSelected ? 'border-[#b85c38] ring-1 ring-[#b85c38] shadow-md' : 
                isBest ? 'border-amber-300 shadow-md' : 
                'border-slate-200'
              }`}
            >
              {isBest && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-b-md flex items-center gap-1">
                  <ShieldCheck size={12} /> Best match
                </div>
              )}
              
              <div className={`p-5 flex-1 ${isSelected ? 'bg-orange-50/30' : ''}`}>
                <header className="flex items-center gap-3 mb-6 mt-2">
                  <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                    {quote.initials}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{quote.name}</h3>
                    <p className="text-xs text-slate-500">{quote.city}</p>
                  </div>
                </header>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Landed Cost</p>
                <strong className="text-2xl font-bold text-slate-900">{money(quote.total)}</strong>
                <p className="text-xs text-slate-500 mb-4">{money(Math.round(quote.total / quantity))} per unit · incl. GST</p>

                <div className="space-y-2.5 text-sm mb-4">
                  <div className="flex justify-between text-slate-600"><span>Unit price</span><span className="font-medium text-slate-900">{money(quote.unitPrice)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span className="font-medium text-slate-900">{money(quote.gst)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Freight</span><span className="font-medium text-slate-900">{money(quote.freight)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Delivery</span><span className="font-medium text-slate-900">{quote.deliveryDays} days</span></div>
                  <div className="flex justify-between text-slate-600"><span>Reliability</span><span className="font-medium text-slate-900">{quote.reliability}%</span></div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${quote.reliability}%` }} />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <Badge className={quote.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                    {quote.inStock ? 'In stock' : 'Limited stock'}
                  </Badge>
                  <span className="text-slate-400">History {money(quote.history)}</span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-white">
               <button 
  onClick={async () => {
    setSupplier(quote.name);
    setUnitPrice(quote.unitPrice);
    // 1. Save to database
    await saveSelectedSupplier(quote, quantity); 
    toast(`${quote.name} selected.`);
    // 2. Redirect and pass the quantity!
    window.location.href = `/cost-estimation?quantity=${quantity}`;
  }}
  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
    isSelected 
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
      : 'bg-[#b85c38] hover:bg-[#a04e2f] text-white'
  }`}
>
  {isSelected ? <><Check size={16} /> Selected supplier</> : <>Select supplier <ArrowRight size={16} /></>}
</button>
              </div>
            </article>
          )
        })}
      </div>

      <aside className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">Transparent tax treatment</strong> — Landed costs include 12% input GST for comparison. 
        </p>
        <Link href="/cost-estimation" className="text-sm font-semibold text-[#b85c38] hover:underline flex items-center gap-1">
          Continue to cost estimation <ArrowRight size={14} />
        </Link>
      </aside>

      {/* ADD SUPPLIER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Add New Supplier</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSupplier} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Supplier Name *</label>
                <input 
                  type="text" 
                  required
                  value={newSupplier.name}
                  onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                  placeholder="e.g. Apex Trading Co."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#b85c38] focus:ring-1 focus:ring-[#b85c38]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                  <input 
                    type="text" 
                    value={newSupplier.city}
                    onChange={e => setNewSupplier({...newSupplier, city: e.target.value})}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#b85c38] focus:ring-1 focus:ring-[#b85c38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unit Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={newSupplier.unitPrice}
                    onChange={e => setNewSupplier({...newSupplier, unitPrice: e.target.value})}
                    placeholder="e.g. 75"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#b85c38] focus:ring-1 focus:ring-[#b85c38]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Freight (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newSupplier.freight}
                    onChange={e => setNewSupplier({...newSupplier, freight: e.target.value})}
                    placeholder="e.g. 3000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#b85c38] focus:ring-1 focus:ring-[#b85c38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery (Days)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newSupplier.deliveryDays}
                    onChange={e => setNewSupplier({...newSupplier, deliveryDays: e.target.value})}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#b85c38] focus:ring-1 focus:ring-[#b85c38]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#b85c38] rounded-lg hover:bg-[#a04e2f] transition-colors"
                >
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SupplierComparisonPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading supplier data...</div>}>
      <SupplierComparisonContent />
    </Suspense>
  )
}