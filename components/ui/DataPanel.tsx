export default function DataPanel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="panel data-panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{sub}</p>
        </div>
        <button className="more-btn" aria-label="More options">···</button>
      </div>
      {children}
    </section>
  )
}
