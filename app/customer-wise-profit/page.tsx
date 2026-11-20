'use client'

import Badge from '@/components/ui/Badge'
import DataPanel from '@/components/ui/DataPanel'
import SectionTitle from '@/components/ui/SectionTitle'
import Table from '@/components/ui/Table'
import { useWorkspace } from '@/components/providers/workspace-provider'
import { customerProfitRecords } from '@/lib/mock-data'

export default function CustomerWiseProfitPage() {
  const { query } = useWorkspace()
  const visible = customerProfitRecords.filter(record =>
    `${record.customer} ${record.item}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="page-stack">
      <SectionTitle eyebrow="BUSINESS INTELLIGENCE" title="Customer-wise profit" description="Which customers and products drive your margin." />
      <DataPanel title="Profit by customer" sub={`${visible.length} customers`}>
        <Table
          headings={['#', 'Customer', 'Item', 'Profit', 'Orders', 'Trend']}
          rows={visible.map(record => [
            record.id,
            record.customer,
            record.item,
            record.profit,
            record.orders,
            <Badge key={record.id}>{record.positive ? `▲ ${record.trend}` : `▼ ${record.trend}`}</Badge>,
          ])}
        />
      </DataPanel>
    </div>
  )
}
