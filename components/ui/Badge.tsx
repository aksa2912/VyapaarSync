export default function Badge({ children }: { children: string }) {
  const state = children.toLowerCase()
  const tone = state.includes('progress') || state.includes('processing')
    ? 'badge-orange'
    : state.includes('open') || state.includes('pending') || state.includes('low')
      ? 'badge-yellow'
      : state.includes('closed') || state.includes('delivered') || state.includes('verified')
        ? 'badge-green'
        : 'badge-muted'
  return <span className={`badge ${tone}`}>{children}</span>
}
