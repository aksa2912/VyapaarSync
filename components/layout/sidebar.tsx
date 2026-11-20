'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react'
import { dashboardItem, navGroups, type NavItem } from '@/lib/navigation'
import { useWorkspace } from '@/components/providers/workspace-provider'

type SidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapsed: () => void
  onNavigate: () => void
}

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { setQuery } = useWorkspace()
  const [openGroups, setOpenGroups] = useState<string[]>(navGroups.map(group => group.title))

  const toggleGroup = (title: string) =>
    setOpenGroups(groups => groups.includes(title) ? groups.filter(item => item !== title) : [...groups, title])

  const handleNavigate = () => {
    setQuery('')
    onNavigate()
  }

  const isActive = (item: NavItem) => pathname === item.href

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">V</div>
        {!collapsed && <div><b>Vyapaar<span>Sync</span></b><small>BUSINESS, IN SYNC</small></div>}
        <button
          className={`collapse-btn ${collapsed ? 'expand' : ''}`}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          onClick={onToggleCollapsed}
        >
          <ChevronLeft size={16} />
        </button>
      </div>
      <Link
        href={dashboardItem.href}
        className={`nav-dashboard ${isActive(dashboardItem) ? 'active' : ''}`}
        onClick={handleNavigate}
        aria-current={isActive(dashboardItem) ? 'page' : undefined}
      >
        <dashboardItem.icon size={18} />
        {!collapsed && dashboardItem.name}
      </Link>
      <div className="nav-groups">
        {navGroups.map(group => (
          <div className="nav-group" key={group.title}>
            <button className="group-heading" onClick={() => toggleGroup(group.title)}>
              {!collapsed && (
                <>
                  <span>{group.title}</span>
                  <ChevronDown className={openGroups.includes(group.title) ? '' : 'rotated'} size={13} />
                </>
              )}
            </button>
            {(collapsed || openGroups.includes(group.title)) && (
              <div className="group-links">
                {group.items.map(item => (
                  <Link
                    title={item.name}
                    key={item.name}
                    href={item.href}
                    onClick={handleNavigate}
                    aria-current={isActive(item) ? 'page' : undefined}
                    className={`nav-link ${isActive(item) ? 'active' : ''}`}
                  >
                    <item.icon size={17} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button className="nav-link"><Settings2 size={17} />{!collapsed && <span>Settings</span>}</button>
        <div className="profile">
          <div className="avatar">ST</div>
          {!collapsed && <div><b>Sharma Trading Co.</b><small>Business account</small></div>}
          <ChevronRight size={15} />
        </div>
      </div>
    </aside>
  )
}
