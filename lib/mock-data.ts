export type Enquiry = {
  id: string
  customer: string
  requirement: string
  qty: number
  date: string
  status: string
}

export type CostEstimate = {
  id: number
  savedAt: string
  supplier: string
  quantity: number
  unitPrice: number
  totalCost: number
  totalSales: number
  profit: number
  margin: number
}

export type SalesRecord = {
  invoice: string
  party: string
  item: string
  taxable: number
  total: number
}

export type CustomerProfitRecord = {
  id: string
  customer: string
  item: string
  profit: string
  orders: string
  trend: string
  positive: boolean
}

export type ProcurementOrder = {
  id: string
  customer: string
  date: string
  amount: string
  status: string
}

export type SupplierQuote = {
  name: string
  initials: string
  city: string
  unitPrice: number
  gst: number
  freight: number
  total: number
  deliveryDays: number
  reliability: number
  inStock: boolean
  history: number
}

export const initialEnquiries: Enquiry[] = [
  { id: 'ENQ-2025-084', customer: 'Shree Ganesh Retail', requirement: 'Cotton tote bags, natural', qty: 500, date: 'Today, 10:42 AM', status: 'In Progress' },
  { id: 'ENQ-2025-083', customer: 'Mehta Home Stores', requirement: 'Ceramic dinner set, 16 pc', qty: 120, date: 'Today, 9:18 AM', status: 'Open' },
  { id: 'ENQ-2025-082', customer: 'Kavya Lifestyle', requirement: 'Brass diya set, assorted', qty: 240, date: 'Yesterday', status: 'Open' },
  { id: 'ENQ-2025-081', customer: 'Aarav Traders', requirement: 'Jute storage baskets', qty: 80, date: '18 Nov, 2025', status: 'Closed' },
]

export const purchases: SalesRecord[] = [
  { invoice: 'PUR-25-118', party: 'Surya Textiles', item: 'Cotton tote bags', taxable: 42500, total: 50150 },
  { invoice: 'PUR-25-117', party: 'Jaipur Crafts Co.', item: 'Brass diya set', taxable: 31800, total: 37524 },
  { invoice: 'PUR-25-116', party: 'Kaveri Ceramics', item: 'Ceramic dinner set', taxable: 67200, total: 79296 },
]

export const sales: SalesRecord[] = [
  { invoice: 'SAL-25-204', party: 'Shree Ganesh Retail', item: 'Cotton tote bags', taxable: 68500, total: 80830 },
  { invoice: 'SAL-25-203', party: 'Mehta Home Stores', item: 'Dinner set, 16 pc', taxable: 95400, total: 112572 },
  { invoice: 'SAL-25-202', party: 'Kavya Lifestyle', item: 'Brass diya set', taxable: 52200, total: 61596 },
]

export const customerProfitRecords: CustomerProfitRecord[] = [
  { id: '01', customer: 'Shree Ganesh Retail', item: 'Cotton tote bags', profit: '₹18,350', orders: '12', trend: '14.2%', positive: true },
  { id: '02', customer: 'Mehta Home Stores', item: 'Ceramic dinner set', profit: '₹16,200', orders: '8', trend: '8.4%', positive: true },
  { id: '03', customer: 'Kavya Lifestyle', item: 'Brass diya set', profit: '₹12,480', orders: '6', trend: '3.1%', positive: true },
  { id: '04', customer: 'Aarav Traders', item: 'Jute storage baskets', profit: '−₹1,250', orders: '2', trend: '2.0%', positive: false },
]

export const procurementOrders: ProcurementOrder[] = [
  { id: 'PO-2025-042', customer: 'Shree Ganesh Retail', date: '18 Nov 2025', amount: '₹80,830', status: 'Processing' },
  { id: 'PO-2025-041', customer: 'Mehta Home Stores', date: '17 Nov 2025', amount: '₹1,12,572', status: 'Confirmed' },
  { id: 'PO-2025-040', customer: 'Kavya Lifestyle', date: '15 Nov 2025', amount: '₹61,596', status: 'Dispatched' },
]

export const supplierQuotes: SupplierQuote[] = [
  { name: 'PrimeCare Supplies', initials: 'PS', city: 'Delhi', unitPrice: 85, gst: 51000, freight: 2000, total: 478000, deliveryDays: 3, reliability: 98, inStock: true, history: 83 },
  { name: 'Medline Distributors', initials: 'MD', city: 'Chandigarh', unitPrice: 82, gst: 49200, freight: 3500, total: 462700, deliveryDays: 4, reliability: 96, inStock: true, history: 79 },
  { name: 'NorthStar Medical', initials: 'NM', city: 'Ludhiana', unitPrice: 78, gst: 46800, freight: 6000, total: 442800, deliveryDays: 7, reliability: 91, inStock: false, history: 76 },
  { name: 'HealthBridge Traders', initials: 'HT', city: 'Ambala', unitPrice: 80, gst: 48000, freight: 4500, total: 452500, deliveryDays: 5, reliability: 88, inStock: true, history: 81 },
]
