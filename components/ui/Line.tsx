export default function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`estimate-line ${strong ? 'line-strong' : ''}`}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  )
}
