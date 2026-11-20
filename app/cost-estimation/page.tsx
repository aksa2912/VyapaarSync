'use client'

import { useEffect, useState } from 'react'
import { Save, Trash2, ShieldCheck, ArrowRight, ArrowUpRight } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import { useWorkspace } from '@/components/providers/workspace-provider'
import { money } from '@/lib/format'

export default function CostEstimationPage() {
  const { supplier, setSupplier, unitPrice, setUnitPrice, estimateHistory, saveEstimate, deleteEstimate, deleteAllEstimates, toast } = useWorkspace()
  
  const [quantity, setQuantity] = useState(500)
  const [sellPrice, setSellPrice] = useState(145)
  const [freight, setFreight] = useState(2500)
  const [otherCost, setOtherCost] = useState(1200)
  const [gst, setGst] = useState(12) // Defaulted to 12%
  const [customGst, setCustomGst] = useState(18)
  const [packaging, setPackaging] = useState(2)

  const [profitData, setProfitData] = useState({
    total_cost: 0,
    total_revenue: 0,
    profit: 0,
    profit_margin_percentage: 0
  })
  const [isCalculating, setIsCalculating] = useState(false)

  // FETCH SELECTED SUPPLIER FROM DATABASE ON LOAD
  useEffect(() => {
    async function fetchSelectedSupplier() {
      try {
        const response = await fetch('http://localhost:8000/api/selected-supplier')
        const result = await response.json()
        
        if (result.status === 'success') {
          const data = result.supplier
          setSupplier(data.name)
          setUnitPrice(data.unit_price)
          setFreight(data.freight)
          setGst(12) // Assuming 12% GST for the mock math
        }
      } catch (error) {
        console.error("Failed to fetch selected supplier", error)
      }
    }
    fetchSelectedSupplier()
  }, [setSupplier, setUnitPrice])

  // CONNECT TO PYTHON BACKEND FOR MATH
  useEffect(() => {
    const calculateOnBackend = async () => {
      setIsCalculating(true)
      try {
        const response = await fetch('http://localhost:8000/api/calculate-profit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supplier_price: unitPrice,
            quantity: quantity,
            selling_price: sellPrice,
            gst_percentage: gst === -1 ? customGst : gst,
            freight: freight,
            packaging_percentage: packaging,
            other_expenses: otherCost
          })
        })
        const data = await response.json()
        setProfitData(data)
      } catch (error) {
        console.error("Backend math failed:", error)
        toast('Failed to connect to math engine.')
      }
      setIsCalculating(false)
    }

    const timer = setTimeout(() => {
      calculateOnBackend()
    }, 300)

    return () => clearTimeout(timer)
  }, [unitPrice, quantity, sellPrice, gst, customGst, freight, packaging, otherCost, toast])

  const resetCalculator = () => {
    setUnitPrice(85)
    setQuantity(500)
    setSellPrice(145)
    setGst(12)
    setFreight(2500)
    setPackaging(2)
    setOtherCost(1200)
    toast('Calculator reset to defaults.')
  }

  const saveCurrentEstimate = () => {
    saveEstimate({
      supplier,
      quantity,
      unitPrice,
      totalCost: profitData.total_cost,
      totalSales: profitData.total_revenue,
      profit: profitData.profit,
      margin: profitData.profit_margin_percentage
    })
  }

  const effectiveGst = gst === -1 ? customGst : gst
  const base = unitPrice * quantity
  const gstAmount = base * effectiveGst / 100
  const packCost = base * packaging / 100

  return (
    <>
      <SectionTitle 
        eyebrow="BUSINESS OPERATIONS" 
        title="Cost estimation" 
        description="Model your landed cost and projected profit before you commit." 
        action={<button className="outline-btn" onClick={resetCalculator}>Reset calculator</button>} 
      />
      
      <div className="calc-top">
        <div className="connected-field"><span className="connection-dot"/> SUPPLIER <b>{supplier}</b></div>
        <div className="connected-field"><span className="connection-dot"/> FROM ENQUIRY <b>Cotton tote bags · {quantity} units</b></div>
      </div>

      <div className="calculator-layout">
        
        {/* LEFT PANEL: INPUTS */}
        <section className="calc-card">
          <h3>Estimate your order</h3>
          <p>Adjust the inputs to see your numbers update instantly.</p>
          
          <div className="form-grid">
            <label className="field"><span>SUPPLIER UNIT PRICE (₹)</span><input type="number" value={unitPrice} onChange={e => setUnitPrice(+e.target.value)}/></label>
            <label className="field"><span>QUANTITY</span><input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)}/></label>
            <label className="field"><span>SELLING PRICE / UNIT (₹)</span><input type="number" value={sellPrice} onChange={e => setSellPrice(+e.target.value)}/></label>
            
            <label className="field">
              <span>INPUT GST</span>
              <select value={gst} onChange={e => setGst(+e.target.value)}>
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
                <option value={-1}>Custom</option>
              </select>
            </label>

            {gst === -1 && (
              <label className="field">
                <span>CUSTOM GST (%)</span>
                <input type="number" min="0" max="100" value={customGst} onChange={e => setCustomGst(+e.target.value)}/>
              </label>
            )}

            <label className="field"><span>FREIGHT (₹)</span><input type="number" value={freight} onChange={e => setFreight(+e.target.value)}/></label>
            <label className="field"><span>PACKAGING & FORWARDING (%)</span><input type="number" value={packaging} onChange={e => setPackaging(+e.target.value)}/></label>
            <label className="field"><span>OTHER EXPENSES (₹)</span><input type="number" value={otherCost} onChange={e => setOtherCost(+e.target.value)}/></label>
          </div>

          <button className="primary-btn" onClick={saveCurrentEstimate} disabled={isCalculating} style={{ marginTop: '1.5rem' }}>
            Save estimate <ArrowRight size={16}/>
          </button>
        </section>

        {/* RIGHT PANEL: ESTIMATE (DARK CARD) */}
        <section className="estimate-card">
          <div className="estimate-head">
            <div>
              <span className="eyebrow">PROJECTED ORDER PROFIT</span>
              <div className={profitData.profit >= 0 ? 'profit-number' : 'profit-number negative'}>
                {isCalculating ? '...' : money(profitData.profit)}
              </div>
              <span className="margin-pill">{profitData.profit_margin_percentage}% profit margin</span>
            </div>
            <div className="profit-mark"><ArrowUpRight size={21}/></div>
          </div>
          
          <div className="estimate-lines">
            <div className="estimate-line"><span>Supplier base cost</span><b>{money(base)}</b></div>
            <div className="estimate-line"><span>Recoverable input GST ({effectiveGst}%) · excluded</span><b>{money(gstAmount)}</b></div>
            <div className="estimate-line"><span>Freight</span><b>{money(freight)}</b></div>
            <div className="estimate-line"><span>Packaging & forwarding</span><b>{money(packCost)}</b></div>
            <div className="estimate-line"><span>Other expenses</span><b>{money(otherCost)}</b></div>
            <div className="estimate-line line-strong"><span>Total estimated cost</span><b>{money(profitData.total_cost)}</b></div>
            <div className="estimate-line"><span>Total selling value</span><b>{money(profitData.total_revenue)}</b></div>
          </div>
          
          <div className="estimate-foot">
            <span>Estimate for {quantity.toLocaleString('en-IN')} units</span>
            <span>Updates live</span>
          </div>
        </section>
      </div>

      {/* HISTORY PANEL */}
      <section className="estimate-history">
        <div className="estimate-history-heading">
          <div>
            <span className="eyebrow">SAVED CALCULATIONS</span>
            <h2>Cost Estimation History</h2>
            <p>Saved estimates stay here while you work in this session.</p>
          </div>
          <div className="estimate-history-actions">
            <span className="history-count">{estimateHistory.length} estimates</span>
            <button type="button" className="history-delete-all" disabled={!estimateHistory.length} onClick={deleteAllEstimates}>
              <Trash2 size={15}/> Delete all records
            </button>
          </div>
        </div>
        
        {estimateHistory.length ? (
          <div className="estimate-history-scroll">
            <table className="estimate-history-table">
              <thead>
                <tr>
                  <th>SAVED ON</th><th>SUPPLIER</th><th>QUANTITY</th><th>UNIT PRICE</th>
                  <th>TOTAL ESTIMATED COST</th><th>SELLING VALUE</th><th>PROJECTED PROFIT</th><th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {estimateHistory.map(estimate => (
                  <tr key={estimate.id}>
                    <td>{estimate.savedAt}</td>
                    <td><b>{estimate.supplier}</b></td>
                    <td>{estimate.quantity} units</td>
                    <td>{money(estimate.unitPrice)}</td>
                    <td className="history-amount">{money(estimate.totalCost)}</td>
                    <td>{money(estimate.totalSales)}</td>
                    <td><b className={estimate.profit >= 0 ? 'history-profit' : 'history-loss'}>{money(estimate.profit)}<small>{estimate.margin.toFixed(1)}% margin</small></b></td>
                    <td>
                      <button type="button" className="history-delete-one" onClick={() => deleteEstimate(estimate.id)}>
                        <Trash2 size={17}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estimate-history-empty">
            <b>No saved estimates yet</b>
            <span>Complete the calculator above and select “Save estimate” to add the first row.</span>
          </div>
        )}
      </section>
    </>
  )
}