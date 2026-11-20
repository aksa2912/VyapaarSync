'use client'

import { useWorkspace } from '@/components/providers/workspace-provider'
import DataPanel from '@/components/ui/DataPanel'
import SectionTitle from '@/components/ui/SectionTitle'
import Table from '@/components/ui/Table'
import { money } from '@/lib/format'
import type { SalesRecord } from '@/lib/mock-data'

type RecordsViewProps = {
  title: string
  description: string
  partyLabel: string
  records: SalesRecord[]
}

export default function RecordsView({ title, description, partyLabel, records }: RecordsViewProps) {
  const { query } = useWorkspace()
  const visible = records.filter(record =>
    `${record.invoice} ${record.party} ${record.item}`.toLowerCase().includes(query.toLowerCase()))
  const totalValue = visible.reduce((sum, record) => sum + record.total, 0)

  return (
    <div className="page-stack">
      <SectionTitle eyebrow="RECORDS & LOGISTICS" title={title} description={description} />
      <DataPanel title={title} sub={`${visible.length} invoices · Total ${money(totalValue)}`}>
        <Table
          headings={['Invoice', partyLabel, 'Item', 'Taxable', 'Total']}
          rows={visible.map(record => [record.invoice, record.party, record.item, money(record.taxable), money(record.total)])}
        />
      </DataPanel>
    </div>
  )
}
