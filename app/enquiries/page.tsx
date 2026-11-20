'use client'

import { Plus, Loader2, Trash2, Filter, ChevronDown, ArrowRight, Activity } from 'lucide-react'
import { useWorkspace } from '@/components/providers/workspace-provider'
import { useState } from 'react'

const Badge = ({ children }: { children: string }) => {
  const state = children.toLowerCase()
  const classes = 
    state.includes('progress') ? 'bg-orange-100 text-orange-800' :
    state.includes('open') ? 'bg-yellow-100 text-yellow-800' :
    state.includes('closed') ? 'bg-green-100 text-green-800' :
    'bg-slate-100 text-slate-800';
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classes}`}>{children}</span>
}

export default function EnquiriesPage() {
  const { enquiries, query, setQuery, toggleEnquiryStatus, openNewEnquiry, fetchFromEmail, deleteEnquiry, deleteAllEnquiries } = useWorkspace()
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  
  const visible = enquiries.filter(item =>
    `${item.id} ${item.customer} ${item.requirement} ${item.status}`.toLowerCase().includes(query.toLowerCase()))

  const handleDeleteAll = async () => {
    await deleteAllEnquiries()
    setShowDeleteAllModal(false)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[#b85c38] text-xs font-bold tracking-wider mb-1">BUSINESS OPERATIONS</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Enquiry management</h1>
          <p className="text-slate-500">Keep every customer requirement moving forward.</p>
        </div>
        <button onClick={() => openNewEnquiry()} className="bg-[#b85c38] hover:bg-[#a04e2f] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> New Enquiry
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search enquiries..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b85c38]/20 focus:border-[#b85c38]"
          />
        </div>
        <button className="px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg flex items-center gap-2 hover:bg-slate-200 transition-colors">
          <Filter size={16} /> All statuses <ChevronDown size={14} />
        </button>
        <button onClick={fetchFromEmail} className="px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
          <Activity size={16} /> Scan Email
        </button>
      </div>

      {/* TABLE PANEL */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent enquiries</h2>
            <p className="text-sm text-slate-500 mt-1">{visible.length} enquiries in your pipeline</p>
          </div>
          {enquiries.length > 0 && (
             <button 
               onClick={() => setShowDeleteAllModal(true)}
               className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors px-3 py-1.5 rounded-md hover:bg-rose-50"
             >
               <Trash2 size={15} /> Delete All
             </button>
          )}
        </div>

        {enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500">
            <Loader2 className="animate-spin mb-4" size={28} />
            <p>Connecting to VyapaarSync database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Enquiry ID</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Requirement</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#b85c38]">{item.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.customer}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.requirement}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.qty} units</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.date}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleEnquiryStatus(item.id)}>
                        <Badge>{item.status}</Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => deleteEnquiry(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-md hover:bg-rose-50"
                          title="Delete enquiry"
                        >
                          <Trash2 size={17} />
                        </button>
                        <button className="text-slate-400 hover:text-slate-800 transition-colors">
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE ALL CONFIRMATION MODAL */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="text-rose-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Delete all enquiries?</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to permanently delete all <strong>{enquiries.length}</strong> enquiries from the database? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteAllModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAll}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Yes, delete all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}