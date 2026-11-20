'use client'

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { type CostEstimate, type Enquiry } from '@/lib/mock-data'

const NOTICE_DURATION_MS = 2800

export type EnquiryDraft = { customer: string; requirement: string; quantity: number }
export type EstimateInput = Omit<CostEstimate, 'id' | 'savedAt'>

type WorkspaceContextValue = {
  enquiries: Enquiry[]
  setEnquiries: Dispatch<SetStateAction<Enquiry[]>>
  toggleEnquiryStatus: (id: string) => void
  createEnquiry: (draft: EnquiryDraft) => Promise<boolean>
  deleteEnquiry: (id: string) => Promise<void>
  deleteAllEnquiries: () => Promise<void>
  query: string
  setQuery: (value: string) => void
  notice: string
  toast: (message: string) => void
  newEnquiryDraft: Partial<EnquiryDraft> | null
  openNewEnquiry: (draft?: Partial<EnquiryDraft>) => void
  closeNewEnquiry: () => void
  supplier: string
  setSupplier: (name: string) => void
  unitPrice: number
  setUnitPrice: (value: number) => void
  estimateHistory: CostEstimate[]
  saveEstimate: (estimate: EstimateInput) => void
  deleteEstimate: (id: number) => void
  deleteAllEstimates: () => void
  fetchFromEmail: () => Promise<void>
  purchaseRecords: any[]
  salesRecords: any[]
  discoverProducts: (query: string) => Promise<any[]>
  uploadSalesInvoice: (file: File) => Promise<void>       // NEW
  uploadPurchaseInvoice: (file: File) => Promise<void>    // NEW
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [newEnquiryDraft, setNewEnquiryDraft] = useState<Partial<EnquiryDraft> | null>(null)
  const [supplier, setSupplier] = useState('PrimeCare Supplies')
  const [unitPrice, setUnitPrice] = useState(85)
  const [estimateHistory, setEstimateHistory] = useState<CostEstimate[]>([])
  const [purchaseRecords, setPurchaseRecords] = useState<any[]>([])
  const [salesRecords, setSalesRecords] = useState<any[]>([])

  // Fetch Enquiries
  useEffect(() => {
    fetch('http://localhost:8000/api/enquiries')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((e: any) => ({
          id: `ENQ-2025-${String(e.id).padStart(3, '0')}`,
          customer: e.customer_name,
          requirement: e.requirement,
          qty: e.quantity,
          date: new Date(e.created_at).toLocaleDateString(),
          status: e.status
        }))
        setEnquiries(formatted)
      })
      .catch((err) => {
        console.error("Enquiries backend failed, using fallback", err)
        setEnquiries([
          { id: 'ENQ-2025-001', customer: 'Shree Ganesh Retail', requirement: 'Cotton tote bags', qty: 500, date: '18 Nov', status: 'Open' },
          { id: 'ENQ-2025-002', customer: 'Mehta Home Stores', requirement: 'Ceramic dinner set', qty: 120, date: '17 Nov', status: 'In Progress' }
        ])
      })
  }, [])

  // Fetch Purchase & Sales Records (with Fallbacks)
  useEffect(() => {
    fetch('http://localhost:8000/api/purchase-records')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setPurchaseRecords(data)
        else throw new Error("Empty")
      })
      .catch(() => {
        setPurchaseRecords([
          { invoice_no: 'PUR-25-118', supplier_name: 'Surya Textiles', description: 'Cotton tote bags', taxable_amount: 42500, total_amount: 50150 },
          { invoice_no: 'PUR-25-117', supplier_name: 'Jaipur Crafts Co.', description: 'Brass diya set', taxable_amount: 31800, total_amount: 37524 }
        ])
      })

    fetch('http://localhost:8000/api/sales-records')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setSalesRecords(data)
        else throw new Error("Empty")
      })
      .catch(() => {
        setSalesRecords([
          { invoice_no: 'SAL-25-204', customer_name: 'Shree Ganesh Retail', description: 'Cotton tote bags', taxable_amount: 68500, total_amount: 80830 },
          { invoice_no: 'SAL-25-203', customer_name: 'Mehta Home Stores', description: 'Dinner set, 16 pc', taxable_amount: 95400, total_amount: 112572 }
        ])
      })
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), NOTICE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [notice])

  const toast = (message: string) => setNotice(message)

  const toggleEnquiryStatus = (id: string) => {
    setEnquiries(items => items.map(item => item.id === id
      ? { ...item, status: item.status === 'Open' ? 'In Progress' : item.status === 'In Progress' ? 'Closed' : 'Open' }
      : item))
  }

  const createEnquiry = async ({ customer, requirement, quantity }: EnquiryDraft) => {
    if (!customer.trim() || !requirement.trim() || quantity < 1) {
      toast('Please complete all required fields.')
      return false
    }

    try {
      const response = await fetch('http://localhost:8000/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customer,
          requirement: requirement,
          quantity: quantity,
          status: "Open"
        })
      });

      const savedData = await response.json();

      setEnquiries(items => [
        { 
          id: `ENQ-2025-${String(savedData.id).padStart(3, '0')}`, 
          customer: savedData.customer_name, 
          requirement: savedData.requirement, 
          qty: savedData.quantity, 
          date: 'Just now', 
          status: savedData.status 
        },
        ...items,
      ])
      setNewEnquiryDraft(null)
      toast('Enquiry saved to database.')
      return true
    } catch (error) {
      console.error("Failed to save:", error)
      toast('Failed to connect to backend.')
      return false
    }
  }

  const deleteEnquiry = async (id: string) => {
    const numericId = parseInt(id.split('-').pop() || '0')
    try {
      await fetch(`http://localhost:8000/api/enquiries/${numericId}`, { method: 'DELETE' })
      setEnquiries(items => items.filter(item => item.id !== id))
      toast('Enquiry deleted.')
    } catch (error) {
      console.error("Failed to delete:", error)
      toast('Failed to delete enquiry.')
    }
  }

  const deleteAllEnquiries = async () => {
    try {
      await fetch('http://localhost:8000/api/enquiries', { method: 'DELETE' })
      setEnquiries([])
      toast('All enquiries deleted.')
    } catch (error) {
      console.error("Failed to delete all:", error)
      toast('Failed to delete all enquiries.')
    }
  }

  const fetchFromEmail = async () => {
    toast('Scanning Gmail inbox for invoices...')
    try {
      const response = await fetch('http://localhost:8000/api/scan-email')
      const result = await response.json()

      if (result.status === 'success' && result.extracted_data.length > 0) {
        const firstResult = result.extracted_data[0]
        setNewEnquiryDraft({
          customer: firstResult.customer_name,
          requirement: firstResult.description,
          quantity: 100
        })
        toast(`Extracted data from ${firstResult.source_file || 'email'}`)
      } else {
        toast('No invoice attachments found in your latest emails.')
      }
    } catch (error) {
      console.error(error)
      toast('Failed to connect to email server.')
    }
  }

  const discoverProducts = async (searchQuery: string) => {
    toast(`Searching market for "${searchQuery}"...`)
    try {
      const response = await fetch('http://localhost:8000/api/discover-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })
      const result = await response.json()
      if (result.status === 'success') {
        return result.products
      }
      return []
    } catch (error) {
      console.error("Discovery failed:", error)
      toast('Failed to connect to discovery engine.')
      return []
    }
  }

   const uploadSalesInvoice = async (file: File) => {
    toast('Extracting sales invoice data...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const extractRes = await fetch('http://localhost:8000/api/extract-document', { method: 'POST', body: formData })
      const extractData = await extractRes.json()

      if (extractData.status === 'success') {
        const data = extractData.data
        const saveRes = await fetch('http://localhost:8000/api/upload-sales-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            po_number: data.invoice_no || "PO-AUTO", // Fallback if AI misses it
            customer_name: data.customer_name,
            description: data.description,
            quantity: data.quantity || 1,
            uom: data.uom || "Units",
            po_date: data.po_date || new Date().toLocaleDateString(),
            total_amount: data.total_amount,
            taxable_amount: data.taxable_amount || data.total_amount
          })
        })
        const savedRecord = await saveRes.json()
        setSalesRecords(prev => [savedRecord, ...prev])
        toast('Sales invoice saved!')
      }
    } catch (error) {
      console.error(error)
      toast('Failed to upload sales invoice.')
    }
  }

  const uploadPurchaseInvoice = async (file: File) => {
    toast('Extracting purchase invoice data...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const extractRes = await fetch('http://localhost:8000/api/extract-document', { method: 'POST', body: formData })
      const extractData = await extractRes.json()

      if (extractData.status === 'success') {
        const data = extractData.data
        const saveRes = await fetch('http://localhost:8000/api/upload-purchase-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            po_number: data.invoice_no || "PO-AUTO",
            supplier_name: data.customer_name,
            description: data.description,
            quantity: data.quantity || 1,
            uom: data.uom || "Units",
            po_date: data.po_date || new Date().toLocaleDateString(),
            total_amount: data.total_amount,
            taxable_amount: data.taxable_amount || data.total_amount
          })
        })
        const savedRecord = await saveRes.json()
        setPurchaseRecords(prev => [savedRecord, ...prev])
        toast('Purchase invoice saved!')
      }
    } catch (error) {
      console.error(error)
      toast('Failed to upload purchase invoice.')
    }
  }
  
  const saveEstimate = (estimate: EstimateInput) => {
    const savedAt = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
    setEstimateHistory(history => [{ id: Date.now(), savedAt, ...estimate }, ...history])
    toast('Estimate saved to Cost Estimation History.')
  }

  const deleteEstimate = (id: number) => {
    setEstimateHistory(history => history.filter(estimate => estimate.id !== id))
    toast('Estimate removed from history.')
  }

  const deleteAllEstimates = () => {
    if (!estimateHistory.length || !window.confirm('Delete all saved cost estimates? This cannot be undone.')) return
    setEstimateHistory([])
    toast('All estimates removed from history.')
  }

  const value: WorkspaceContextValue = {
    enquiries,
    setEnquiries,
    toggleEnquiryStatus,
    createEnquiry,
    deleteEnquiry,
    deleteAllEnquiries,
    query,
    setQuery,
    notice,
    toast,
    newEnquiryDraft,
    openNewEnquiry: draft => setNewEnquiryDraft({ ...draft }),
    closeNewEnquiry: () => setNewEnquiryDraft(null),
    supplier,
    setSupplier,
    unitPrice,
    setUnitPrice,
    estimateHistory,
    saveEstimate,
    deleteEstimate,
    deleteAllEstimates,
    fetchFromEmail,
    purchaseRecords,
    salesRecords,
    discoverProducts,
    uploadSalesInvoice,
    uploadPurchaseInvoice,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return context
}