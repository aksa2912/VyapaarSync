'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, Clock3, PackageSearch, Search, ShieldCheck, CheckCircle2, AlertCircle, Box, Store, ExternalLink } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import { useWorkspace } from '@/components/providers/workspace-provider'

export default function ProductDiscoveryPage() {
  const { openNewEnquiry, toast, discoverProducts } = useWorkspace()
  const [productQuery, setProductQuery] = useState('')
  const [quantity, setQuantity] = useState<number>(5000)
  const [searched, setSearched] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runSearch = async () => {
    if (!productQuery.trim()) return
    setSearched(false)
    setVerifying(true)
    
    const products = await discoverProducts(productQuery)
    
    setResults(products)
    setVerifying(false)
    setSearched(true)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <SectionTitle 
        eyebrow="BUSINESS OPERATIONS" 
        title="Product discovery" 
        description="Find the right products, validate key details and move from a customer need to a supplier quote." 
      />
      
      {/* SEARCH BAR */}
      <section className="discovery-hero bg-white border border-slate-200 rounded-xl p-8 shadow-sm" aria-label="Search products">
        <div className="discovery-hero-content max-w-3xl mx-auto text-center">
          <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <PackageSearch className="text-[#b85c38]" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">What are you looking to source?</h2>
          <p className="text-slate-500 mb-6">Our AI searches the market to find specifications and approximate wholesale pricing.</p>
          
          <form className="flex flex-col md:flex-row items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200" onSubmit={event => { event.preventDefault(); runSearch() }}>
            <div className="flex-1 flex items-center px-2 w-full">
              <Search className="text-slate-400 shrink-0" size={20} aria-hidden="true" />
              <input 
                className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 px-3 py-2"
                aria-label="Product to search" 
                placeholder="e.g. Nitrile gloves, brass diya set..." 
                value={productQuery} 
                onChange={event => { setProductQuery(event.target.value); setSearched(false) }} 
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto pr-2">
              <span className="text-sm text-slate-500 whitespace-nowrap">Qty:</span>
              <input 
                type="number"
                min="1"
                className="w-24 bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 outline-none focus:border-[#b85c38]"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
              />
              <button className="bg-[#b85c38] hover:bg-[#a04e2f] text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 w-full md:w-auto" type="submit" disabled={verifying}>
                {verifying ? 'Searching...' : <>Search <ArrowRight size={16} /></>}
              </button>
            </div>
          </form>
        </div>
      </section>

      {verifying && <p className="text-center text-slate-500 animate-pulse flex items-center justify-center gap-2"><Clock3 size={16} /> AI is searching the market...</p>}

      {/* RESULTS */}
      {searched && results.length > 0 && (
        <section className="space-y-6" aria-live="polite">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-xs font-bold text-[#b85c38] uppercase tracking-wider">AI DISCOVERY RESULTS</span>
              <h2 className="text-xl font-bold text-slate-900">Suggested product match</h2>
              <p className="text-sm text-slate-500">Results based on requirement specifications · Demo search result</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Reference checks complete
            </div>
          </div>

          <div className="space-y-6">
            {results.map((product, index) => (
              <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" key={index}>
                <div className="p-6 flex justify-between items-start border-b border-slate-100">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <Box className="text-slate-400" size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {product.brand} · DEMO SEARCH RESULT
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">{product.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{product.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-[3px] border-emerald-500 shrink-0 bg-emerald-50/30">
                    <span className="text-lg font-bold text-emerald-700 leading-none">{product.match_percentage || 92}%</span>
                    <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mt-0.5 text-center leading-tight">Spec<br/>match</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  {product.specs.map((spec: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <span className="w-1/3 text-sm text-slate-500">{spec.label}</span>
                      <span className="w-1/3 text-sm font-medium text-slate-900">{spec.value}</span>
                      <div className="w-1/3 flex justify-end">
                        {spec.match ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 size={16} className="text-emerald-600" /> Match
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                            <AlertCircle size={16} className="text-amber-500" /> Review
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Indicative Market Price</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">{product.price_range}</span>
                        <span className="text-sm text-slate-500">/ {product.unit || 'unit'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-md w-fit">
                      <Store size={14} className="text-[#b85c38]" />
                      <span className="font-medium">Source:</span>
                      <a href={product.source_url} target="_blank" rel="noopener noreferrer" className="text-[#b85c38] hover:underline flex items-center gap-1 truncate max-w-[200px]">
                        {product.source_url.replace('https://www.', '').split('/')[0]}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => { openNewEnquiry({ requirement: product.name }); toast('Product added to a new enquiry.') }}
                      className="flex-1 md:flex-none px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Use for enquiry
                    </button>
                    
                    {/* UPDATED LINK: Just redirects to supplier-comparison now */}
                    <Link 
                      href="/supplier-comparison"
                      className="flex-1 md:flex-none px-4 py-2 bg-[#b85c38] hover:bg-[#a04e2f] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      Compare suppliers <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex items-start gap-3 mt-6">
            <ShieldCheck className="text-[#b85c38] shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-[#a04e2f] leading-relaxed font-medium">
              Product details and market pricing are simulated reference data for this demo. No live internet or supplier verification is performed.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}