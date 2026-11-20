'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Bell, ChevronRight, Menu, PanelLeftOpen, Search } from 'lucide-react'
import { allNavItems } from '@/lib/navigation'
import { useWorkspace } from '@/components/providers/workspace-provider'

type TopbarProps = {
  collapsed: boolean
  onOpenMenu: () => void
  onRestoreSidebar: () => void
}

export default function Topbar({ collapsed, onOpenMenu, onRestoreSidebar }: TopbarProps) {
  const pathname = usePathname()
  const { setQuery, toast } = useWorkspace()
  const [searchOpen, setSearchOpen] = useState(false)
  const currentPage = allNavItems.find(item => item.href === pathname)?.name ?? 'Dashboard'

  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu" aria-label="Open menu" onClick={onOpenMenu}><Menu size={19} /></button>
      {collapsed && (
        <button className="icon-btn sidebar-restore" aria-label="Expand navigation" title="Expand navigation" onClick={onRestoreSidebar}>
          <PanelLeftOpen size={18} />
        </button>
      )}
      <div className="breadcrumbs">Workspace <ChevronRight size={14} /><b>{currentPage}</b></div>
      <div className="top-actions">
        <button className="icon-btn search-toggle" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={18} /></button>
        <div className={`top-search ${searchOpen ? 'show-search' : ''}`}>
          <Search size={16} />
          <input aria-label="Search workspace" placeholder="Search anything..." onChange={e => setQuery(e.target.value)} />
          <kbd>⌘ K</kbd>
        </div>
        <button className="icon-btn notification" aria-label="Notifications" onClick={() => toast('You are all caught up.')}>
          <Bell size={18} />
          <i />
        </button>
        <div className="top-avatar">ST</div>
      </div>
    </header>
  )
}
