'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import Field from '@/components/ui/Field'
import { useWorkspace, type EnquiryDraft } from '@/components/providers/workspace-provider'

export default function NewEnquiryModal({ initialDraft }: { initialDraft: Partial<EnquiryDraft> }) {
  const { createEnquiry, closeNewEnquiry } = useWorkspace()
  const [customer, setCustomer] = useState(initialDraft.customer ?? '')
  const [requirement, setRequirement] = useState(initialDraft.requirement ?? '')
  const [quantity, setQuantity] = useState(initialDraft.quantity ?? 1)

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && closeNewEnquiry()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head">
          <div>
            <span className="eyebrow">BUSINESS OPERATIONS</span>
            <h2 id="modal-title">Create new enquiry</h2>
            <p>Capture the customer requirement to start your workflow.</p>
          </div>
          <button className="icon-btn" onClick={closeNewEnquiry} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-fields">
          <Field label="CUSTOMER NAME">
            <input autoFocus placeholder="e.g. Shree Ganesh Retail" value={customer} onChange={e => setCustomer(e.target.value)} />
          </Field>
          <Field label="REQUIREMENT / ITEM DESCRIPTION">
            <input placeholder="What does the customer need?" value={requirement} onChange={e => setRequirement(e.target.value)} />
          </Field>
          <Field label="QUANTITY">
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(+e.target.value)} />
          </Field>
        </div>
        <div className="modal-actions">
          <button className="outline-btn" onClick={closeNewEnquiry}>Cancel</button>
          <button className="primary-btn" onClick={() => createEnquiry({ customer, requirement, quantity })}>
            <Check size={16} /> Save enquiry
          </button>
        </div>
      </section>
    </div>
  )
}
