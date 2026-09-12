import React, { useState, useContext } from 'react';
import {
  History, ShieldCheck, Clock, User, ArrowRight,
  Filter, Search, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCAuditVersions() {
  const { auditLogs, pricingVersions, bookings } = useContext(PassengerCarContext);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'versions'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log =>
    (log.admin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.field || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.versionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Sub-Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
            Pricing Version Control & Audit Trail (Sections 23 & 24)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Permanent immutability records. Every pricing rule change is cryptographically tracked with author and before/after values.
          </p>
        </div>

        <div className="tab-group" style={{ margin: 0 }}>
          <button
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Log ({auditLogs.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'versions' ? 'active' : ''}`}
            onClick={() => setActiveTab('versions')}
          >
            Pricing Versions ({pricingVersions.length})
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        /* Section 24: Pricing Audit Log */
        <div className="table-container">
          <div className="table-header-controls">
            <div className="search-input-wrapper">
              <Search className="header-search-icon" size={14} />
              <input
                type="text"
                placeholder="Search audit logs by admin, field, version ID, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin Author</th>
                <th>Pricing Version</th>
                <th>Target Field</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Notes / Justification</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <User size={14} color="var(--primary)" />
                        {log.admin}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1E40AF' }}>
                        {log.versionId}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{log.field}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        fontWeight: '600',
                        fontSize: '12px'
                      }}>
                        {log.oldValue}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#D1FAE5',
                        color: '#047857',
                        fontWeight: '700',
                        fontSize: '12px'
                      }}>
                        {log.newValue}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {log.notes || 'Routine rate revision'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Section 23: Pricing Version History */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pricingVersions.map((ver, index) => {
            const verBookings = bookings.filter(b => b.pricingSnapshot?.pricingVersion === ver.versionId);

            return (
              <div
                key={ver.versionId}
                className="card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: `4px solid ${ver.status === 'active' ? '#10B981' : '#94A3B8'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'monospace', color: '#1E40AF' }}>
                      {ver.versionId}
                    </span>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: ver.status === 'active' ? '#D1FAE5' : '#E2E8F0',
                      color: ver.status === 'active' ? '#047857' : '#475569'
                    }}>
                      {ver.status.toUpperCase()}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '6px 0 0' }}>
                    {ver.notes} • Created by <strong>{ver.createdBy}</strong>
                  </p>

                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Effective From: {new Date(ver.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    Bookings Locked on this Snapshot:
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
                    {verBookings.length} Trips
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
