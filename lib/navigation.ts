import {
  BarChart3, Boxes, BriefcaseBusiness, Calculator, ClipboardList, FileSpreadsheet, FileText, LayoutDashboard,
  PackageSearch, ShoppingBag, Truck, Users, type LucideIcon,
} from 'lucide-react'

export type NavItem = { name: string; href: string; icon: LucideIcon }
export type NavGroup = { title: string; items: NavItem[] }

export const dashboardItem: NavItem = { name: 'Dashboard', href: '/', icon: LayoutDashboard }

export const navGroups: NavGroup[] = [
  {
    title: 'BUSINESS OPERATIONS',
    items: [
      { name: 'Enquiry Management', href: '/enquiries', icon: ClipboardList },
      { name: 'Product Discovery', href: '/product-discovery', icon: PackageSearch },
      { name: 'Supplier Comparison', href: '/supplier-comparison', icon: Users },
      { name: 'Cost Estimation', href: '/cost-estimation', icon: Calculator },
    ],
  },
  {
    title: 'RECORDS & LOGISTICS',
    items: [
      { name: 'Orders & Procurement', href: '/orders-procurement', icon: Truck },
      { name: 'Purchase Records', href: '/purchase-records', icon: FileText },
      { name: 'Sales Records', href: '/sales-records', icon: ShoppingBag },
      { name: 'Inventory & Stock', href: '/inventory-stock', icon: Boxes },
    ],
  },
  {
    title: 'BUSINESS INTELLIGENCE',
    items: [
      { name: 'Profit Analysis', href: '/profit-analysis', icon: BarChart3 },
      { name: 'Customer-wise Profit', href: '/customer-wise-profit', icon: BriefcaseBusiness },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [{ name: 'Financial Year Reports', href: '/financial-reports', icon: FileSpreadsheet }],
  },
]

export const allNavItems: NavItem[] = [dashboardItem, ...navGroups.flatMap(group => group.items)]
