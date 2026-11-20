'use client'

import { useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import NewEnquiryModal from '@/components/layout/new-enquiry-modal'
import { useWorkspace } from '@/components/providers/workspace-provider'

export default function AppShell({ children }: { children: ReactNode }) {
  const { newEnquiryDraft, notice } = useWorkspace()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={() => setCollapsed(!collapsed)}
        onNavigate={() => setMobileOpen(false)}
      />
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <main className="main-area">
        <Topbar
          collapsed={collapsed}
          onOpenMenu={() => setMobileOpen(true)}
          onRestoreSidebar={() => setCollapsed(false)}
        />
        <div className="content-area">{children}</div>
      </main>
      {newEnquiryDraft && <NewEnquiryModal key={JSON.stringify(newEnquiryDraft)} initialDraft={newEnquiryDraft} />}
      {notice && <div className="toast"><Check size={17} />{notice}</div>}
    </div>
  )
}
