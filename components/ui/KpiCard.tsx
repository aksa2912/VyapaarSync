import type { LucideIcon } from 'lucide-react'

export default function KpiCard({
  icon: Icon,
  label,
  value,
  change,
  detail,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string
  change: string
  detail: string
  tone: string
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span>{label}</span>
        <i className={`kpi-icon ${tone}`}><Icon size={18} /></i>
      </div>
      <strong>{value}</strong>
      <div className="kpi-bottom">
        <span className="kpi-change">{change}</span>
        <span>{detail}</span>
      </div>
    </div>
  )
}
