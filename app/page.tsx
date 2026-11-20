'use client'

import Link from 'next/link'
import { ArrowRight, ClipboardList, Plus, ShoppingBag, Wallet } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import DataPanel from '@/components/ui/DataPanel'
import KpiCard from '@/components/ui/KpiCard'
import Table from '@/components/ui/Table'
import { useWorkspace } from '@/components/providers/workspace-provider'

export default function DashboardPage() {
  const { enquiries, openNewEnquiry } = useWorkspace()

  return (
    <div className="page-stack">
      <section className="welcome-banner">
        <div>
          <span className="eyebrow">GOOD MORNING, SHARMA TRADING</span>
          <h1>Your business at a glance</h1>
          <p>Track enquiries, pricing and fulfilment in one place.</p>
        </div>
        <button className="primary-btn" onClick={() => openNewEnquiry()}>
          <Plus size={16} /> New enquiry
        </button>
      </section>

      <section className="kpi-grid" aria-label="Key metrics">
        <KpiCard icon={ClipboardList} label="Open enquiries" value={String(enquiries.filter(e => e.status !== 'Closed').length)} change="+3" detail="vs last week" tone="tone-orange" />
        <KpiCard icon={ShoppingBag} label="Sales this month" value="₹2,54,998" change="+12.4%" detail="vs last month" tone="tone-green" />
        <KpiCard icon={Wallet} label="Net profit" value="₹38,230" change="+6.1%" detail="after landed costs" tone="tone-blue" />
      </section>

      <DataPanel title="Recent enquiries" sub="Latest customer requests across channels">
        <Table
          headings={['Enquiry', 'Customer', 'Requirement', 'Qty', 'Status']}
          rows={enquiries.slice(0, 4).map(item => [
            item.id,
            item.customer,
            item.requirement,
            String(item.qty),
            <Badge key={item.id}>{item.status}</Badge>,
          ])}
        />
        <Link href="/enquiries" className="text-action">View all enquiries <ArrowRight size={14} /></Link>
      </DataPanel>
    </div>
  )
}
